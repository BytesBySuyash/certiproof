import 'server-only';
import { randomBytes,randomUUID } from 'node:crypto';
import type { Prisma } from '@prisma/client';
import { db } from './db';
import { HttpError,type Actor } from './auth';
import { origin } from './config';
import { renderPdf } from './pdf';
import { readObject,putObject,deleteObject } from './storage';
import { issueInput,payloadSchema,ZERO_HASH,type Payload,type EventBody } from '@/lib/contracts';
import { proofBytes,sha256,makeManifest,signValue } from '@/lib/proof';
type Tx=Prisma.TransactionClient;
async function authority(tx:Tx,a:Actor,admin=false){const m=await tx.membership.findUnique({where:{userId_issuerId:{userId:a.userId,issuerId:a.issuerId}},include:{issuer:true}});if(!m?.enabled||!m.issuer.enabled||m.issuer.status==='SUSPENDED'||!['STAFF','ADMIN','PLATFORM_ADMIN'].includes(m.role)||admin&&m.role==='STAFF')throw new HttpError(403,'This action is not permitted.');return m.issuer;}
export async function appendEvent(tx:Tx,issuerId:string,certificateId:string,manifestHash:string,type:EventBody['type'],reasonCode:EventBody['reasonCode']){
 await tx.$queryRaw`SELECT "issuerId" FROM certiproof."LedgerHead" WHERE "issuerId"=${issuerId} FOR UPDATE`;
 const head=await tx.ledgerHead.findUniqueOrThrow({where:{issuerId}});const sequence=head.sequence+1n;
 const body:EventBody={version:1,ledgerId:issuerId,sequence:sequence.toString(),type,certificateId,manifestHash,occurredAt:new Date().toISOString(),previousHash:head.hash,reasonCode,keyId:process.env.SIGNING_KEY_ID!};
 const hash=sha256(proofBytes('EVENT',body));await tx.ledgerEvent.create({data:{ledgerId:issuerId,sequence,certificateId,type,body,hash,signature:signValue('EVENT',body)}});await tx.ledgerHead.update({where:{issuerId},data:{sequence,hash}});
}
export async function issue(a:Actor,inputValue:unknown,idempotencyKey:string,seed?:{issuedAt:string}){
 const input=issueInput.parse(inputValue);if(!seed&&input.completionDate>new Date().toISOString().slice(0,10))throw new HttpError(400,'Completion date cannot be in the future.');
 const requestHash=sha256(proofBytes('INPUT',input));const reserved=await db.$transaction(async tx=>{
  const issuer=await authority(tx,a);const existing=await tx.issuanceRequest.findUnique({where:{issuerId_idempotencyKey:{issuerId:a.issuerId,idempotencyKey}}});if(existing)return existing;
  const certificateId='cp_'+randomBytes(16).toString('base64url');const payload:Payload={version:1,certificateId,issuerId:a.issuerId,issuerNameSnapshot:issuer.name,...input,issuedAt:seed?.issuedAt||new Date().toISOString(),expiresAt:input.expiresAt?`${input.expiresAt}T23:59:59.999Z`:null,nonce:randomBytes(32).toString('base64url')};
  return tx.issuanceRequest.create({data:{issuerId:a.issuerId,actorId:a.userId,idempotencyKey,inputHash:requestHash,certificateId,payload,objectKey:`requests/${a.issuerId}/${certificateId}.pdf`}});
 }).catch(async error=>{if(error?.code==='P2002'){const found=await db.issuanceRequest.findUnique({where:{issuerId_idempotencyKey:{issuerId:a.issuerId,idempotencyKey}}});if(found)return found;}throw error;});
 if(reserved.inputHash!==requestHash)throw new HttpError(409,'This retry key was already used with different certificate details.');
 if(reserved.state==='COMMITTED'){const c=await db.certificate.findUniqueOrThrow({where:{id:reserved.certificateId},include:{artifact:true}});if(!c.artifact||c.privateState!=='AVAILABLE')throw new HttpError(409,'The private original is unavailable.');const original=await readObject(c.artifact.objectKey);if(sha256(original)!==c.pdfHash)throw new HttpError(503,'Stored original failed its integrity check.');return {id:c.id,state:'COMMITTED'};}
 const processingToken=randomUUID();const lease=await db.issuanceRequest.updateMany({where:{id:reserved.id,state:{in:['RESERVED','PROCESSING']},OR:[{leaseUntil:null},{leaseUntil:{lt:new Date()}}]},data:{state:'PROCESSING',processingToken,leaseUntil:new Date(Date.now()+120000)}});
 if(!lease.count)return {id:reserved.certificateId,state:'PROCESSING'};
 try{
  const payload=payloadSchema.parse(reserved.payload);let bytes:Buffer;
  const current=await db.issuanceRequest.findUniqueOrThrow({where:{id:reserved.id}});
  if(current.stagedHash){bytes=await readObject(reserved.objectKey);if(sha256(bytes)!==current.stagedHash)throw Error('Staged artifact fingerprint changed');}
  else {const rendered=await renderPdf(payload,origin());try{await putObject(reserved.objectKey,rendered);}catch{ /* Recover an immutable object left by a previous attempt. */ }bytes=await readObject(reserved.objectKey);if(sha256(bytes)!==sha256(rendered))throw Error('Existing staged PDF does not match reserved rendering');const chosen=await db.issuanceRequest.updateMany({where:{id:reserved.id,processingToken,state:'PROCESSING'},data:{stagedHash:sha256(bytes)}});if(!chosen.count)throw Error('Processing lease superseded');}
  const manifest=makeManifest(payload,bytes,origin());const manifestHash=sha256(proofBytes('MANIFEST',manifest));const signature=signValue('MANIFEST',manifest);
  await db.$transaction(async tx=>{
   await tx.$queryRaw`SELECT id FROM certiproof."IssuanceRequest" WHERE id=${reserved.id} FOR UPDATE`;
   const request=await tx.issuanceRequest.findUniqueOrThrow({where:{id:reserved.id}});if(request.state==='COMMITTED')return;
   await authority(tx,a);if(request.processingToken!==processingToken||!request.leaseUntil||request.leaseUntil.getTime()<Date.now())throw new HttpError(409,'Issuance lease expired; retry this request.');
   await tx.certificate.create({data:{id:payload.certificateId,issuerId:a.issuerId,manifest,manifestHash,signature,pdfHash:manifest.pdfHash,privateData:{create:{payload}},artifact:{create:{objectKey:reserved.objectKey,byteLength:bytes.length}}}});
   await appendEvent(tx,a.issuerId,payload.certificateId,manifestHash,'ISSUE','ISSUED');
   await tx.issuanceRequest.update({where:{id:reserved.id},data:{state:'COMMITTED',payload:undefined,leaseUntil:null,processingToken:null}});
   await tx.$executeRaw`UPDATE certiproof."IssuanceRequest" SET payload=NULL WHERE id=${reserved.id}`;
  },{maxWait:30000,timeout:60000});return {id:payload.certificateId,state:'COMMITTED'};
 }catch(error){await db.issuanceRequest.updateMany({where:{id:reserved.id,state:'PROCESSING',processingToken},data:{leaseUntil:new Date(0),processingToken:null}}).catch(()=>{});throw error;}
}
export async function revoke(a:Actor,id:string,reasonCode:'CORRECTION'|'WITHDRAWN'){
 return db.$transaction(async tx=>{await authority(tx,a,true);await tx.$queryRaw`SELECT id FROM certiproof."Certificate" WHERE id=${id} FOR UPDATE`;const c=await tx.certificate.findUnique({where:{id}});if(!c||c.issuerId!==a.issuerId)throw new HttpError(404,'Certificate not found.');if(c.status==='REVOKED')return {state:'REVOKED'};await appendEvent(tx,a.issuerId,id,c.manifestHash,'REVOKE',reasonCode);await tx.certificate.update({where:{id},data:{status:'REVOKED'}});await tx.privateActionDetail.create({data:{certificateId:id,actorId:a.userId,reason:reasonCode}});return {state:'REVOKED'};});
}
export async function purge(a:Actor,ticketId:string,id:string){
 await db.$transaction(async tx=>{await authority(tx,a,true);const c=await tx.certificate.findUnique({where:{id}});const ticket=await tx.privacyRequest.findUnique({where:{id:ticketId}});if(!c||c.issuerId!==a.issuerId||!ticket||ticket.certificateId!==id||ticket.kind!=='DELETION')throw new HttpError(403,'The verified request does not match this certificate.');await tx.certificate.update({where:{id},data:{privateState:c.privateState==='PURGED'?'PURGED':'PURGE_PENDING'}});await tx.privacyRequest.update({where:{id:ticketId},data:{issuerId:a.issuerId,state:'PURGE_PENDING',decision:'Authority verified by issuer admin; removal approved.'}});});
 const artifact=await db.certificateArtifact.findUnique({where:{certificateId:id}});if(artifact)await deleteObject(artifact.objectKey);
 return db.$transaction(async tx=>{await authority(tx,a,true);await tx.$queryRaw`SELECT id FROM certiproof."Certificate" WHERE id=${id} FOR UPDATE`;const c=await tx.certificate.findUniqueOrThrow({where:{id}});if(c.privateState!=='PURGED'){
  await tx.certificatePrivateData.deleteMany({where:{certificateId:id}});await tx.certificateArtifact.deleteMany({where:{certificateId:id}});await tx.issuanceRequest.deleteMany({where:{certificateId:id}});await tx.privateActionDetail.deleteMany({where:{certificateId:id}});await appendEvent(tx,a.issuerId,id,c.manifestHash,'PII_PURGED','PRIVACY');await tx.certificate.update({where:{id},data:{privateState:'PURGED'}});
 }await tx.privacyRequest.update({where:{id:ticketId},data:{state:'COMPLETED',message:'Private payload and original removed. Signed status/fingerprint evidence retained.',decision:'Approved; private payload and original removed. Backups expire separately.'}});return {state:'COMPLETED'};});
}
export async function ensureIssuer(id:string,name:string){await db.issuer.upsert({where:{id},create:{id,name,head:{create:{hash:ZERO_HASH}}},update:{}});}
export const freshRetryKey=()=>randomUUID();

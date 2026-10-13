import 'server-only';
import { db } from './db';
import { manifestSchema,payloadSchema,type Verification,type SignedEvent,type Checkpoint } from '@/lib/contracts';
import { auditLedger,proofBytes,payloadHash,sha256,verifyValue,signValue } from '@/lib/proof';
import { verifyInput } from '@/lib/contracts';
export async function verifyCertificate(value:unknown):Promise<Verification>{
 const input=verifyInput.parse(value);const checkedAt=new Date().toISOString();const base:Verification={recordStatus:'NOT_FOUND',documentCheck:input.kind==='IMAGE'?'NOT_APPLICABLE':'NOT_CHECKED',issuerStatus:'UNKNOWN',signatureStatus:'UNAVAILABLE',privateDataAvailability:'UNKNOWN',checkedAt,identificationMethod:input.method};
 try{return await db.$transaction(async tx=>{
  const times=await tx.$queryRaw<{checkedAt:Date}[]>`SELECT statement_timestamp() AS "checkedAt"`;const checkedAt=times[0].checkedAt.toISOString();base.checkedAt=checkedAt;
  const byDigest=input.kind==='PDF'&&input.digest?await tx.certificate.findUnique({where:{pdfHash:input.digest}}):null;
  if(byDigest&&input.id&&byDigest.id!==input.id)return {...base,conflict:true};
  const c=await tx.certificate.findUnique({where:byDigest?{id:byDigest.id}:input.id?{id:input.id}:{pdfHash:input.digest!},include:{issuer:true,privateData:true,artifact:true}});if(!c)return base;
  const bad={...base,recordStatus:'INTEGRITY_ERROR' as const,signatureStatus:'FAILED' as const};
  const parsed=manifestSchema.safeParse(c.manifest);if(!parsed.success)return bad;const m=parsed.data;
  if(m.certificateId!==c.id||m.issuerId!==c.issuerId||m.pdfHash!==c.pdfHash||sha256(proofBytes('MANIFEST',m))!==c.manifestHash||!verifyValue('MANIFEST',m,c.signature,m.keyId))return bad;
  const raw=await tx.ledgerEvent.findMany({where:{ledgerId:c.issuerId},orderBy:{sequence:'asc'},take:10001});if(raw.length>10000)return {...base,recordStatus:'UNAVAILABLE'};
  const head=await tx.ledgerHead.findUnique({where:{issuerId:c.issuerId}});if(!head)return bad;
  const audit=auditLedger(raw.map(e=>({body:e.body,hash:e.hash,signature:e.signature})) as unknown as SignedEvent[],{sequence:head.sequence.toString(),hash:head.hash});
  const state=audit.states.get(c.id);if(!audit.ok||!state||state.manifestHash!==c.manifestHash||state.revoked!==(c.status==='REVOKED')||state.purged!==(c.privateState==='PURGED'))return bad;
  if(c.privateState!=='PURGED'){const p=payloadSchema.safeParse(c.privateData?.payload);if(!p.success||payloadHash(p.data)!==m.payloadHash||c.privateState==='AVAILABLE'&&!c.artifact)return bad;}
  else if(c.privateData||c.artifact)return bad;
  const expired=m.expiresAt!==null&&Date.parse(m.expiresAt)<=Date.parse(checkedAt);
  return {...base,recordStatus:state.revoked?'REVOKED':expired?'EXPIRED':'ACTIVE',documentCheck:input.kind==='IMAGE'?'NOT_APPLICABLE':input.kind==='PDF'&&input.digest?(input.digest===m.pdfHash?'MATCH':'MISMATCH'):'NOT_CHECKED',issuerStatus:!c.issuer.enabled?'SUSPENDED':c.issuer.status as Verification['issuerStatus'],signatureStatus:'VERIFIED',privateDataAvailability:c.privateState==='PURGED'?'PURGED':'AVAILABLE',certificateId:c.id,issuerName:m.issuerNameSnapshot,course:m.courseTitle,issuedAt:m.issuedAt,completionDate:m.completionDate,expiresAt:m.expiresAt};
 },{isolationLevel:'RepeatableRead',timeout:15000});}catch{return {...base,recordStatus:'UNAVAILABLE'};}
}
export async function exportLedger(issuerId:string){return db.$transaction(async tx=>{const head=await tx.ledgerHead.findUniqueOrThrow({where:{issuerId}});const raw=await tx.ledgerEvent.findMany({where:{ledgerId:issuerId},orderBy:{sequence:'asc'},take:10001});if(raw.length>10000)throw Error('Export limit reached');const body:Checkpoint['body']={version:1,ledgerId:issuerId,sequence:head.sequence.toString(),headHash:head.hash,timestamp:new Date().toISOString(),keyId:process.env.SIGNING_KEY_ID!};return {events:raw.map(e=>({body:e.body,hash:e.hash,signature:e.signature})) as unknown as SignedEvent[],head:{sequence:head.sequence.toString(),hash:head.hash},checkpoint:{body,signature:signValue('CHECKPOINT',body)},keys:JSON.parse(process.env.TRUSTED_PUBLIC_KEYS_JSON||'{}')};},{isolationLevel:'RepeatableRead'});}

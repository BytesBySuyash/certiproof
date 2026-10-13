import canonicalize from 'canonicalize';
import { createHash,createPrivateKey,createPublicKey,sign,verify } from 'node:crypto';
import { eventSchema,manifestSchema,ZERO_HASH,type Manifest,type Payload,type SignedEvent,type Checkpoint } from './contracts';
export const sha256=(data:string|Uint8Array)=>createHash('sha256').update(data).digest('hex');
export function proofBytes(domain:string,value:unknown) { const json=canonicalize(value); if(!json) throw Error('Invalid canonical value'); return Buffer.from(`CP_${domain}_V1\n${json}`,'utf8'); }
export const payloadHash=(payload:Payload)=>sha256(proofBytes('PAYLOAD',payload));
export function keyRing():Record<string,string> { const parsed:unknown=JSON.parse(process.env.TRUSTED_PUBLIC_KEYS_JSON||'{}'); if(!parsed || typeof parsed!=='object'||Array.isArray(parsed)) throw Error('Invalid key ring'); return parsed as Record<string,string>; }
export function signValue(domain:string,value:unknown) { const key=createPrivateKey({key:Buffer.from(process.env.CERTIFICATE_SIGNING_PRIVATE_KEY_B64||'','base64'),format:'der',type:'pkcs8'}); return sign(null,proofBytes(domain,value),key).toString('base64url'); }
export function verifyValue(domain:string,value:unknown,signature:string,keyId:string,keys=keyRing()) { try { if(!/^[A-Za-z0-9_-]{86}$/.test(signature))return false;const encoded=keys[keyId]; if(!encoded)return false; const key=createPublicKey({key:Buffer.from(encoded,'base64'),format:'der',type:'spki'}); return verify(null,proofBytes(domain,value),key,Buffer.from(signature,'base64url')); }catch{return false;} }
export function makeManifest(payload:Payload,pdf:Uint8Array,origin:string):Manifest { return manifestSchema.parse({...(({subjectName:_s,nonce:_n,...rest})=>rest)(payload),verificationOrigin:origin,payloadHash:payloadHash(payload),pdfHash:sha256(pdf),keyId:process.env.SIGNING_KEY_ID}); }
export function auditLedger(events:SignedEvent[],head:{sequence:string;hash:string},checkpoint?:Checkpoint,keys=keyRing()) {
 const errors:string[]=[]; let previous=ZERO_HASH; let sequence=0n; const states=new Map<string,{revoked:boolean;purged:boolean;manifestHash:string}>(); let witnessed= !checkpoint || checkpoint.body.sequence==='0' && checkpoint.body.headHash===ZERO_HASH;
 const ledgerId=events[0]?.body.ledgerId;
 if(checkpoint && (checkpoint.body.version!==1 || !/^\d+$/.test(checkpoint.body.sequence) || !verifyValue('CHECKPOINT',checkpoint.body,checkpoint.signature,checkpoint.body.keyId,keys)))errors.push('Checkpoint signature failed');
 for(const entry of events) {
  const parsed=eventSchema.safeParse(entry.body); if(!parsed.success){errors.push('Invalid event schema');continue;}
  const b=parsed.data; sequence++;
  if(BigInt(b.sequence)!==sequence)errors.push('Sequence discontinuity');
  if(b.ledgerId!==ledgerId)errors.push('Ledger identity changed');
  if(b.previousHash!==previous)errors.push('Previous hash mismatch');
  if(entry.hash!==sha256(proofBytes('EVENT',b)))errors.push('Event hash mismatch');
  if(!verifyValue('EVENT',b,entry.signature,b.keyId,keys))errors.push('Event signature failed');
  const state=states.get(b.certificateId);
  if(b.type==='ISSUE') {if(state)errors.push('Duplicate issuance');states.set(b.certificateId,{revoked:false,purged:false,manifestHash:b.manifestHash});}
  else if(!state || state.manifestHash!==b.manifestHash)errors.push('Missing issuance or changed manifest');
  else if(b.type==='REVOKE'){if(state.revoked)errors.push('Duplicate revocation');state.revoked=true;}
  else {if(state.purged)errors.push('Duplicate purge');state.purged=true;}
  previous=entry.hash;
  if(checkpoint && b.ledgerId===checkpoint.body.ledgerId && b.sequence===checkpoint.body.sequence && entry.hash===checkpoint.body.headHash)witnessed=true;
 }
 if(sequence.toString()!==head.sequence||previous!==head.hash)errors.push('Ledger head disagreement');
 if(checkpoint && (!witnessed || ledgerId && checkpoint.body.ledgerId!==ledgerId))errors.push('Remembered checkpoint missing: rollback or substitution');
 return {ok:errors.length===0,errors,states};
}

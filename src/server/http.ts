import 'server-only';
import { NextResponse } from 'next/server';
import { createHmac } from 'node:crypto';
import { z } from 'zod';
import { db } from './db';
import { HttpError } from './auth';
import { origin,required } from './config';
export function json(data:unknown,status=200){return NextResponse.json(data,{status,headers:{'Cache-Control':'no-store, max-age=0'}});}
export async function body(req:Request){if(!req.headers.get('content-type')?.startsWith('application/json'))throw new HttpError(415,'Send JSON only.');const reader=req.body?.getReader();if(!reader)throw new HttpError(400,'Missing request.');let total=0;const parts:Uint8Array[]=[];while(true){const {done,value}=await reader.read();if(done)break;total+=value.length;if(total>8192){await reader.cancel();throw new HttpError(413,'Request is too large.');}parts.push(value);}try{return JSON.parse(Buffer.concat(parts).toString('utf8'));}catch{throw new HttpError(400,'Invalid JSON.');}}
export function sameOrigin(req:Request){if(req.headers.get('origin')!==origin())throw new HttpError(403,'Use the application page to perform this action.');}
export async function rate(req:Request,scope:string,limit=60){const ip=req.headers.get('x-vercel-forwarded-for')?.split(',')[0]||req.headers.get('x-forwarded-for')?.split(',')[0]||'local';const window=Math.floor(Date.now()/60000);const key=createHmac('sha256',required('ABUSE_HASH_SECRET')).update(`${scope}:${ip}:${window}`).digest('hex');const rows=await db.$queryRaw<{count:number}[]>`INSERT INTO certiproof."AbuseCounter" (key,count,"expiresAt") VALUES (${key},1,${new Date(Date.now()+3600000)}) ON CONFLICT (key) DO UPDATE SET count=certiproof."AbuseCounter".count+1 RETURNING count`;if(rows[0].count>limit)throw new HttpError(429,'Too many attempts. Wait a minute and retry.');}
export async function handle(work:()=>Promise<unknown>){try{return json(await work());}catch(e){if(e instanceof HttpError)return json({error:e.message},e.status);if(e instanceof z.ZodError)return json({error:e.issues[0]?.message||'Check your input.'},400);return json({error:'Cannot check right now. Please retry later.'},503);}}

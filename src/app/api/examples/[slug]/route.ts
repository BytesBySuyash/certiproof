import { db } from '@/server/db';
import { readObject } from '@/server/storage';
import { json,rate } from '@/server/http';
import { HttpError } from '@/server/auth';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function GET(req:Request,{params}:{params:Promise<{slug:string}>}){try{const {slug}=await params;if(!/^[a-z0-9-]{1,64}$/.test(slug))return json({error:'Example not found.'},404);await rate(req,'example-download',30);const asset=await db.demoAsset.findUnique({where:{slug}});if(!asset)return json({error:'Example not found.'},404);const bytes=await readObject(asset.objectKey);return new Response(bytes,{headers:{'Content-Type':asset.mime,'Content-Disposition':`attachment; filename="fictional-${asset.slug}.${asset.mime==='application/pdf'?'pdf':'png'}"`,'Cache-Control':'no-store'}});}catch(e){return json({error:e instanceof HttpError?e.message:'Examples unavailable; retry later.'},e instanceof HttpError?e.status:503);}}

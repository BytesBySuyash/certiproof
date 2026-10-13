import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { db } from './db';
import { required } from './config';
export class HttpError extends Error {constructor(public status:number,message:string){super(message);}}
export async function authClient(){const jar=await cookies();return createServerClient(required('NEXT_PUBLIC_SUPABASE_URL'),required('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'),{cookies:{getAll:()=>jar.getAll(),setAll:entries=>{for(const {name,value,options} of entries)jar.set(name,value,{...options,sameSite:'lax',secure:!!process.env.VERCEL,httpOnly:true});}}});}
export type Actor={userId:string;issuerId:string;role:string};
export async function actor(issuerId:string,admin=false):Promise<Actor>{const client=await authClient();const {data,error}=await client.auth.getUser();if(error||!data.user)throw new HttpError(401,'Sign in to continue.');return authorize(data.user.id,issuerId,admin);}
export async function authorize(userId:string,issuerId:string,admin=false,client=db):Promise<Actor>{const membership=await client.membership.findUnique({where:{userId_issuerId:{userId,issuerId}},include:{issuer:true}});if(!membership?.enabled||!membership.issuer.enabled||membership.issuer.status==='SUSPENDED'||!['STAFF','ADMIN','PLATFORM_ADMIN'].includes(membership.role)||admin&&membership.role==='STAFF')throw new HttpError(403,'This action is not permitted.');return {userId,issuerId,role:membership.role};}

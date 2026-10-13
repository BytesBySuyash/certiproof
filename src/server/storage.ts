import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { required } from './config';
export const BUCKET='certificate-originals';
export function storageClient(){return createClient(required('NEXT_PUBLIC_SUPABASE_URL'),required('SUPABASE_SECRET_KEY'),{auth:{persistSession:false,autoRefreshToken:false}});}
export async function readObject(key:string){const {data,error}=await storageClient().storage.from(BUCKET).download(key);if(error||!data)throw Error('Stored artifact unavailable');return Buffer.from(await data.arrayBuffer());}
export async function putObject(key:string,bytes:Uint8Array,mime='application/pdf'){const {error}=await storageClient().storage.from(BUCKET).upload(key,bytes,{contentType:mime,upsert:false});if(error)throw Error('Artifact upload failed');}
export async function deleteObject(key:string){const {error}=await storageClient().storage.from(BUCKET).remove([key]);if(error)throw Error('Artifact deletion failed');}

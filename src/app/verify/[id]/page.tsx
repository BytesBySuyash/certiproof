import { Verifier } from '@/components/verify';
import { certificateId } from '@/lib/contracts';
import { notFound } from 'next/navigation';
export const metadata={title:'Verify a certificate record'};
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;if(!certificateId.safeParse(id).success)notFound();return <div className="page narrow"><div className="eyebrow">LIVE RECORD CHECK</div><h1>Check this certificate.</h1><p>The ID locates a record. Choose the original PDF to also compare file bytes.</p><Verifier initialId={id}/></div>;}

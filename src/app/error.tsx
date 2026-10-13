'use client';
import Link from 'next/link';
export default function ErrorPage({reset}:{reset:()=>void}){return <div className="page narrow"><h1>Cannot load this page right now.</h1><p>No certificate verdict has been made. Retry, or return to verification.</p><button onClick={reset}>Retry</button><Link href="/">Public verification</Link></div>;}

import { Verifier } from '@/components/verify';
export const metadata={title:'Try fictional examples'};
export default function Examples(){return <div className="page narrow"><div className="eyebrow">JUDGE PLAYGROUND</div><h1>Try it. Change it. Check it.</h1><p>These allowlisted fictional examples use the real signing, issuance and verification flow. Their labels never decide a verdict.</p><Verifier exampleMode/></div>;}

import type { Metadata } from 'next';
import { Chrome,Footer } from '@/components/chrome';
import './globals.css';
export const metadata:Metadata={title:{default:'CertiProof — clear certificate evidence',template:'%s | CertiProof'},description:'Verify fictional certificate records, compare original PDFs and understand tamper-evident evidence without exposing recipient information.'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body><a href="#main" className="skip-link">Skip to content</a><Chrome/><main id="main" tabIndex={-1}>{children}</main><Footer/></body></html>;}

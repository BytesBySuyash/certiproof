import 'server-only';
import 'regenerator-runtime/runtime';
import { PDFDocument,rgb,type PDFFont } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import QRCode from 'qrcode';
import type { Payload } from '@/lib/contracts';
import { HttpError } from './auth';
export async function renderPdf(payload:Payload,origin:string){
 const doc=await PDFDocument.create();doc.registerFontkit(fontkit);
 const latin=await doc.embedFont(await readFile(path.join(process.cwd(),'public/fonts/noto-sans-latin-400-normal.woff')),{subset:true});
 const hindi=await doc.embedFont(await readFile(path.join(process.cwd(),'public/fonts/noto-sans-devanagari-devanagari-400-normal.woff')),{subset:true});
 const page=doc.addPage([842,595]);page.drawRectangle({x:24,y:24,width:794,height:547,borderWidth:2,borderColor:rgb(.1,.4,.35)});
 function draw(text:string,y:number,size:number,maxX=765){let x=65;let lineY=y;let run='';let last:PDFFont|undefined;const flush=()=>{if(run&&last){const width=last.widthOfTextAtSize(run,size);page.drawText(run,{x,y:lineY,size,font:last,color:rgb(.08,.15,.2)});x+=width;run='';}};for(const char of text){const cp=char.codePointAt(0)!;const font=latin.getCharacterSet().includes(cp)?latin:hindi.getCharacterSet().includes(cp)?hindi:null;if(!font)throw new HttpError(400,'Unsupported character in certificate. Use Latin or Devanagari characters.');if(last!==font){flush();last=font;}if(x+font.widthOfTextAtSize(run+char,size)>maxX){flush();x=65;lineY-=size*1.5;}run+=char;}flush();return lineY;}
 draw('CERTIPROOF / CERTIFICATE OF COMPLETION',525,16);draw(payload.issuerNameSnapshot,481,payload.issuerNameSnapshot.length>60?12:19);
 draw('Demonstration â€” fictional certificate',449,12);draw('Presented to',400,12);const end=draw(payload.subjectName,366,payload.subjectName.length>55?16:24,590);
 const courseEnd=draw(payload.courseTitle,Math.min(end-40,316),payload.courseTitle.length>80?12:17,590);
 const datesY=Math.min(courseEnd-30,230);draw(`Completed ${payload.completionDate}`,datesY,11,590);draw(`Issued ${payload.issuedAt.slice(0,10)}  â€¢  Expires ${payload.expiresAt?.slice(0,10)||'never'}`,datesY-20,10,590);
 draw(payload.certificateId,155,13);draw('Verify the record and compare the original PDF at:',126,10);draw(`${origin}/verify/${payload.certificateId}`,107,9);
 draw('This PDF uses a detached application proof, not an embedded Adobe/PAdES signature.',63,8);
 const qr=await doc.embedPng(await QRCode.toBuffer(`${origin}/verify/${payload.certificateId}`,{width:180,margin:2,errorCorrectionLevel:'M'}));page.drawImage(qr,{x:648,y:165,width:124,height:124});
 doc.setTitle('Fictional demonstration certificate');doc.setAuthor('CertiProof demonstration');doc.setCreationDate(new Date(payload.issuedAt));doc.setModificationDate(new Date(payload.issuedAt));
 return Buffer.from(await doc.save());
}


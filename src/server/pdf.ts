import 'server-only';
import 'regenerator-runtime/runtime';
import { PDFDocument,rgb,type PDFFont,type RGB } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import QRCode from 'qrcode';
import type { Payload } from '@/lib/contracts';
import { HttpError } from './auth';

const ink=rgb(.055,.13,.12);
const green=rgb(.055,.35,.29);
const pale=rgb(.955,.965,.925);
const gold=rgb(.72,.53,.19);
const muted=rgb(.34,.42,.39);

export async function renderPdf(payload:Payload,origin:string){
 const doc=await PDFDocument.create();doc.registerFontkit(fontkit);
 const latin=await doc.embedFont(await readFile(path.join(process.cwd(),'public/fonts/noto-sans-latin-400-normal.woff')),{subset:true});
 const hindi=await doc.embedFont(await readFile(path.join(process.cwd(),'public/fonts/noto-sans-devanagari-devanagari-400-normal.woff')),{subset:true});
 const page=doc.addPage([842,595]);
 const fontFor=(char:string)=>{const cp=char.codePointAt(0)!;if(latin.getCharacterSet().includes(cp))return latin;if(hindi.getCharacterSet().includes(cp))return hindi;throw new HttpError(400,'Unsupported character in certificate. Use Latin or Devanagari characters.');};
 const width=(text:string,size:number)=>[...text].reduce((total,char)=>total+fontFor(char).widthOfTextAtSize(char,size),0);
 const line=(text:string,x:number,y:number,size:number,color:RGB=ink)=>{let cursor=x;let run='';let active:PDFFont|undefined;const flush=()=>{if(!run||!active)return;page.drawText(run,{x:cursor,y,size,font:active,color});cursor+=active.widthOfTextAtSize(run,size);run='';};for(const char of text){const next=fontFor(char);if(active!==next){flush();active=next;}run+=char;}flush();};
 const centered=(text:string,y:number,size:number,color:RGB=ink)=>line(text,(842-width(text,size))/2,y,size,color);
 const fit=(text:string,size:number,maxWidth:number,min=10)=>{let chosen=size;while(chosen>min&&width(text,chosen)>maxWidth)chosen-=.5;return chosen;};

 page.drawRectangle({x:0,y:0,width:842,height:595,color:rgb(.992,.985,.955)});
 page.drawRectangle({x:20,y:20,width:802,height:555,borderWidth:2,borderColor:green});
 page.drawRectangle({x:28,y:28,width:786,height:539,borderWidth:.7,borderColor:gold});
 page.drawRectangle({x:38,y:38,width:766,height:519,borderWidth:.35,borderColor:rgb(.78,.76,.65)});
 for(const [x,y] of [[38,557],[804,557],[38,38],[804,38]] as const){
  page.drawLine({start:{x:x+(x<400?0:-30),y},end:{x:x+(x<400?30:0),y},thickness:3,color:gold});
  page.drawLine({start:{x,y:y+(y<300?0:-30)},end:{x,y:y+(y<300?30:0)},thickness:3,color:gold});
 }

 page.drawCircle({x:421,y:526,size:17,color:green});
 page.drawCircle({x:421,y:526,size:11,borderWidth:1,borderColor:rgb(1,1,1)});
 page.drawLine({start:{x:415,y:526},end:{x:420,y:521},thickness:2,color:rgb(1,1,1)});
 page.drawLine({start:{x:420,y:521},end:{x:428,y:532},thickness:2,color:rgb(1,1,1)});
 centered('CERTIPROOF',493,10,green);
 centered('CERTIFICATE OF COMPLETION',454,27,ink);
 centered('FICTIONAL DEMONSTRATION CERTIFICATE',432,8.5,gold);
 page.drawLine({start:{x:286,y:418},end:{x:556,y:418},thickness:.7,color:gold});

 centered('PRESENTED TO',389,8,muted);
 const subjectSize=fit(payload.subjectName,29,650,16);centered(payload.subjectName,351,subjectSize,green);
 page.drawLine({start:{x:190,y:338},end:{x:652,y:338},thickness:.5,color:rgb(.72,.74,.67)});
 centered('for successfully completing',314,10,muted);
 const courseSize=fit(payload.courseTitle,18,620,11);centered(payload.courseTitle,282,courseSize,ink);
 const issuerLabel='Issued by '+payload.issuerNameSnapshot;
 centered(issuerLabel,252,fit(issuerLabel,11,580,8),green);

 page.drawRectangle({x:96,y:178,width:178,height:48,color:pale,borderWidth:.5,borderColor:rgb(.75,.78,.68)});
 page.drawRectangle({x:294,y:178,width:178,height:48,color:pale,borderWidth:.5,borderColor:rgb(.75,.78,.68)});
 page.drawRectangle({x:492,y:178,width:178,height:48,color:pale,borderWidth:.5,borderColor:rgb(.75,.78,.68)});
 line('COMPLETED',111,206,7.5,muted);line(payload.completionDate,111,188,11,ink);
 line('ISSUED',309,206,7.5,muted);line(payload.issuedAt.slice(0,10),309,188,11,ink);
 line('EXPIRES',507,206,7.5,muted);line(payload.expiresAt?.slice(0,10)||'No expiry',507,188,11,ink);

 const verifyUrl=origin+'/verify/'+payload.certificateId;
 page.drawRectangle({x:92,y:76,width:550,height:73,color:rgb(.975,.97,.94),borderWidth:.5,borderColor:rgb(.78,.76,.66)});
 line('VERIFY THIS CERTIFICATE',108,127,8,green);
 line(payload.certificateId,108,105,10,ink);
 line(verifyUrl,108,87,fit(verifyUrl,7.5,510,6),muted);
 const qr=await doc.embedPng(await QRCode.toBuffer(verifyUrl,{width:180,margin:2,errorCorrectionLevel:'M'}));
 page.drawRectangle({x:668,y:70,width:96,height:96,color:rgb(1,1,1),borderWidth:.7,borderColor:gold});
 page.drawImage(qr,{x:674,y:76,width:84,height:84});
 centered('Exact PDF fingerprint + signed issuer record + live status',52,7.5,muted);

 doc.setTitle('Fictional demonstration certificate');doc.setAuthor('CertiProof demonstration');doc.setCreationDate(new Date(payload.issuedAt));doc.setModificationDate(new Date(payload.issuedAt));
 return Buffer.from(await doc.save());
}

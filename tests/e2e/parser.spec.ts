import { expect,test } from '@playwright/test';
import { PDFDocument } from 'pdf-lib';
import QRCode from 'qrcode';
const id='cp_'+'C'.repeat(22);
const missing={recordStatus:'NOT_FOUND',documentCheck:'NOT_CHECKED',issuerStatus:'UNKNOWN',signatureStatus:'UNAVAILABLE',privateDataAvailability:'UNKNOWN',checkedAt:new Date().toISOString(),identificationMethod:'FINGERPRINT'};
test('actual local PDF text/QR worker runs with external requests blocked',async({page,baseURL})=>{
 const sent:Record<string,unknown>[]=[];const remote:string[]=[];const errors:string[]=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',async route=>{if(new URL(route.request().url()).origin!==new URL(baseURL!).origin){remote.push(route.request().url());return route.abort();}if(route.request().url().includes('/api/verify')){sent.push(route.request().postDataJSON());return route.fulfill({json:missing});}return route.continue();});
 const pdf=await PDFDocument.create();pdf.addPage().drawText(`Synthetic parser fixture ${id}`,{x:40,y:700,size:15});const bytes=await pdf.save();
 await page.goto('/');await page.getByRole('button',{name:'Keep optional counts off'}).click();await page.getByLabel('Choose certificate file').setInputFiles({name:'private-name-parser-fixture.pdf',mimeType:'application/pdf',buffer:Buffer.from(bytes)});
 await expect(page.getByLabel('Verification ID',{exact:true})).toHaveValue(id,{timeout:25000});expect(sent).toHaveLength(2);expect(sent[1].id).toBe(id);expect(JSON.stringify(sent)).not.toContain('private-name');expect(JSON.stringify(sent)).not.toContain('Synthetic parser fixture');expect(remote).toEqual([]);expect(errors).toEqual([]);
});
test('actual image QR extraction reports record-only and bounds image processing',async({page,baseURL})=>{
 const sent:Record<string,unknown>[]=[];await page.route('**/api/verify',route=>{sent.push(route.request().postDataJSON());return route.fulfill({json:{...missing,recordStatus:'ACTIVE',documentCheck:'NOT_APPLICABLE',issuerStatus:'DEMO',signatureStatus:'VERIFIED',privateDataAvailability:'AVAILABLE',certificateId:id,issuerName:'Synthetic mocked UI fixture',course:'QR parsing test',identificationMethod:'QR'}});});
 const png=await QRCode.toBuffer(`${baseURL}/verify/${id}`,{width:500,margin:4});await page.goto('/');await page.getByRole('button',{name:'Keep optional counts off'}).click();await page.getByLabel('Choose certificate file').setInputFiles({name:'copied-qr-test.png',mimeType:'image/png',buffer:png});await expect(page.getByRole('region',{name:'Verification result'})).toContainText('image contents have not been authenticated',{timeout:25000});expect(sent[0].kind).toBe('IMAGE');expect(sent[0].id).toBe(id);expect(JSON.stringify(sent)).not.toContain('copied-qr');
});
test('multiple locally extracted IDs require an explicit reference choice',async({page})=>{await page.route('**/api/verify',route=>route.fulfill({json:missing}));const pdf=await PDFDocument.create();pdf.addPage().drawText(`Synthetic parser fixture ${id}\ncp_${'D'.repeat(22)}`,{x:40,y:700,size:14});await page.goto('/');await page.getByRole('button',{name:'Keep optional counts off'}).click();await page.getByLabel('Choose certificate file').setInputFiles({name:'multiple-reference-test.pdf',mimeType:'application/pdf',buffer:Buffer.from(await pdf.save())});await expect(page.getByRole('group',{name:'Choose a reference'})).toBeVisible({timeout:25000});await expect(page.getByRole('region',{name:'Verification result'})).toHaveCount(0);});

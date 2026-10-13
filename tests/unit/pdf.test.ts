import { expect,it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { renderPdf } from '../../src/server/pdf';
import { sha256 } from '../../src/lib/proof';
import type { Payload } from '../../src/lib/contracts';
const p:Payload={version:1,certificateId:'cp_BBBBBBBBBBBBBBBBBBBBBB',issuerId:'fictional',issuerNameSnapshot:'Aurora Lab (fictional)',subjectName:'Alex Example',courseTitle:'Digital Trust',completionDate:'2020-01-01',issuedAt:'2020-01-02T12:00:00.000Z',expiresAt:null,nonce:'A'.repeat(43)};
it('renders compact immutable PDF bytes with bundled fonts/QR',async()=>{const original=await renderPdf(p,'https://example.org');expect(original.length).toBeLessThan(2*1024*1024);const doc=await PDFDocument.load(original);expect(doc.getPageCount()).toBe(1);doc.getPage(0).drawText('Changed content',{x:40,y:40});const altered=await doc.save();expect(sha256(original)).not.toBe(sha256(altered));});
it('renders Devanagari and rejects unsupported glyphs explicitly',async()=>{expect((await renderPdf({...p,subjectName:'आरव उदाहरण'},'https://example.org')).length).toBeGreaterThan(1000);await expect(renderPdf({...p,subjectName:'Name 😀'},'https://example.org')).rejects.toThrow('Unsupported character');});
it('reserved values render identically for recoverable immutable-upload retries',async()=>{const a=await renderPdf(p,'https://example.org');const b=await renderPdf(p,'https://example.org');expect(sha256(a)).toBe(sha256(b));});

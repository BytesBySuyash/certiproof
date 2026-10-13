# Browser/server network inventory

| Component | Runs where | Network/data |
|---|---|---|
| Next.js/React | Browser + Vercel | Same-origin navigation/assets/API; Vercel request metadata |
| PDF.js/jsQR/Web Crypto | Browser and owned native parser/QR workers | Local bytes; bounded canvas rendering; bundled worker/fonts/CMaps/WASM; no document URL fetch or scripting |
| Supabase SSR/Auth | Server | Supabase identity/password/session; browser cookies HTTP-only |
| Prisma | Server | Private PostgreSQL schema over restricted pooler TLS; no anonymous Data API tables |
| Supabase Storage SDK | Server | Generated originals in private bucket; authorised 60s download URL; allowlisted synthetic examples |
| pdf-lib/fontkit/QRCode | Server | Local licensed fonts and generated PDF/QR; no external document content service |
| Optional campaign counter | Browser + server | Consent required, allowlisted labels only; durable 30-day aggregates |
| Abuse counters | Server | Salted minute-specific network hashes; 1h expiration; daily cleanup |
| GitHub | Owner/deploy | Private source, no runtime document data |
| Vitest/Playwright/axe | Development | Local/disposable testing; private traces may contain test sessions |

No LLM, cloud OCR, SMTP, SMS, camera permission, payment, advertising or remote analytics SDK. Telemetry during framework/tool installation/build is provider tooling rather than product tracking; set NEXT_TELEMETRY_DISABLED=1 for framework commands if desired. Optional tracking withdrawal prevents future browser campaign calls.

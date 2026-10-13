# Services, cost and eligibility

Verified against official pages on **13 October 2026**. Owner account eligibility and actual selected plans are still pending; no account, trial, upgrade, payment card or deployed URL has been created by this implementation.

| Service | Required plan/use | Observed limits and operation | Official source |
|---|---|---|---|
| GitHub | Free personal private source repository | Private source is supported. No paid team seats/add-ons needed. Owner must connect only this repo to deployment. | https://github.com/pricing |
| Vercel | Hobby, eligible personal noncommercial student demo | Monthly 100 GB fast transfer, 1 million function invocations, 4 CPU hours, 360 GB-hours provisioned memory; exhaustion can require waiting for allowance reset. Free domain; no purchased domain needed. | https://vercel.com/docs/plans/hobby |
| Vercel Functions | Full-stack Node runtime | Request/response payload limit 4.5 MB. Verification sends bounded JSON, never a selected 10 MB file. Originals use private signed Storage downloads. Our function bound is 60s. | https://vercel.com/docs/functions/limitations |
| Supabase | Free PostgreSQL/Auth/private Storage | 500 MB database, 1 GB file storage, 5 GB egress and 5 GB cached egress, 50,000 monthly active users; two active Free projects. Project may pause after one week inactive. Automatic backups not included. Use second project for disposable testing, not extra accounts or quota evasion. | https://supabase.com/pricing |
| Supabase pooler | Included connection method | Restricted runtime role on transaction pooler 6543 with pgbouncer=true, connection_limit=2 and short transactions; owner migrations use session/direct connection 5432. Verify actual host/region in Connect. | https://supabase.com/docs/guides/database/prisma |
| Supabase Auth | Included private provisioned accounts | Supported Admin API account creation with confirmed demo email; no delivery dependency. Password login via SSR getUser. Owner-assisted reset and refresh-session revocation; configure/test token expiry. | https://supabase.com/docs/guides/auth/server-side/creating-a-client and https://supabase.com/docs/guides/auth/auth-smtp |
| Supabase Storage | Included private bucket | No anonymous/read/list policies. Only authorised server access; 60-second signed private download. Explicit fictional examples are separately allowlisted. | https://supabase.com/docs/guides/storage/security/access-control |

Runtime, operator maintenance and local app using hosted Supabase all require internet. No permanent unlimited hosting or uptime promise. Check quotas/project readiness 24 hours before judging and on the day. Resume a paused project normally through the owner dashboard and rehearse; no artificial keepalive traffic.

No paid API, AI, OCR, SMTP, SMS, wallet/RPC, subscription analytics, monitoring, Docker/WSL service or microservice is required. Existing coding-assistant access is separate from app hosting.

Dependencies are open source, pinned in package.json/package-lock.json. Their installed licenses and source metadata are in THIRD_PARTY_NOTICES.md and SDK_INVENTORY.md. Stable Prisma 6.19.3 is intentionally retained with its matching datasource/directUrl configuration and generated client; no Prisma 7/8 config is mixed in. deepmerge-ts development-only override 8.0.2 addresses its advisory and Prisma generation is rechecked. The Next lint preset was replaced with maintained TypeScript/hooks/accessibility plugins to remove its unpatched development glob chain. No release dependency requires payment.

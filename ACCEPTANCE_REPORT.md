# Actual evidence — release still pending

Environment: Windows/PowerShell, workspace Node **24.21.0**, Next **16.4.0**, React **19.3.0**, Prisma **6.19.3**, Vitest **5.0.4**, Playwright **1.64.0**, Chromium **156**. Date: 13 October 2026 (Asia/Calcutta).

## Completed observed checks

- Production build completed successfully after integration: `node_modules/node/bin/node.exe node_modules/next/dist/bin/next build`.
- TypeScript and lint passed: local Node running TypeScript/eslint executables.
- Unit checks: **21 passed**, three files, approximately **2.42 seconds**. Canonical RFC8785 examples, SHA256 known-answer, domain-separated Ed25519 signatures, changed manifests/keys/signatures/events, sequence/head/history changes, remembered-checkpoint rollback, file signature sniffing, pre-decode dimension limits, strict input minimisation, compact generated PDF, real altered bytes, deterministic reserved PDF rendering and Devanagari/unsupported glyph handling.
- Persistent key generated privately; re-generation on startup/build is absent. Doctor reports provider settings missing, without printing secrets.
- npm audit after tooling fixes: **zero reported vulnerabilities**, including development dependencies. Production parsers are pinned. No vulnerable Vercel CLI is bundled.
- First Chromium run: **4 passed, 1 failed** due to a test locator matching Next’s empty route announcer as well as the app error. Corrected by scoping alerts to main; parser checks added. Final rerun results recorded below when observed.
- Local navigation/mobile widths 320/375/768/1024/1440 and automated light/dark axe checks passed in that first run. Campaign consent/withdrawal, stale-result clearing on an unavailable response, keyboard skip link/menu/help checks passed. Mocked responses in these UI tests are explicitly isolated test fixtures, not hosted verification evidence.
- Hosted integration availability: **8 skipped**, no configured disposable database. **2 hosted browser tests skipped** without operator/service credentials. Skipped tests are not passes.
- Chromium full local suite: **9 passed, 2 hosted skipped**, approximately **26.3 seconds**. Real PDF/image parsers successfully extracted references, multiple IDs required selection, and third-party requests were blocked. All public/policy/login routes passed narrow-screen axe checks in both themes. Mocked verification responses test client behavior only; they do not prove a hosted lifecycle.
- Visual review found the footer before main content; corrected the DOM component placement. Source was then rebuilt/rechecked through the release runner.
- Clean npm lockfile install and Prisma/assets generation completed, audit zero. First install used host npm/Node 23; a second clean install explicitly used an independent workspace Node 24.21.0 executable under .tools. No paid installer or system-wide runtime change.

## Gate status

| Gate | Actual status | Evidence / what remains |
|---|---|---|
| T01 | Partial | Install/client/migrations/build exist; fresh checkout and real setup rerun await DB |
| T02 | Partial | Official plan/limits checked in FREE_SERVICES.md; owner account eligibility/plan pending |
| T03 | Not run hosted | SSR getUser, membership checks, hidden reset implemented; real sessions/recovery pending |
| T04 | Not run hosted | Private schema/restricted role/storage policies and isolation tests prepared |
| T05 | Partial | PDF rendered and compact; real production issuer/QR/storage journey pending |
| T06 | Partial | Unit-generated altered PDF bytes differ; original/renamed hosted comparisons pending |
| T07 | Partial | Separate record/document result model; actual browser QR extraction tests in rerun; copied QR hosted check pending |
| T08 | Not run hosted | Real revocation/expiry services and fixtures prepared |
| T09 | Partial | Signature/size/strict input checks and bounded parser; browser parser coverage being completed |
| T10 | Partial | Browser payload network assertions; selected bytes never sent by app; hosted inspection pending |
| T11 | Partial | Public projection/client/server module separation, ignored secrets; production bundle/Git scan pending final |
| T12 | Pass unit; hosted pending | Altered proof/signature/key/events/head detected by real auditor unit tests |
| T13 | Pass unit; retained owner checkpoint pending | Rollback accepted without witness and rejected with retained signed checkpoint |
| T14 | Not run hosted | Disposable twenty-duplicate/distinct concurrency tests prepared |
| T15 | Not run hosted | Fenced recoverable lease/staging/atomic DB commit; injected failures require disposable target |
| T16 | Not run hosted | Repeatable-read snapshot and no-store implemented; real revoke race pending |
| T17 | Partial | Abort/generation guards and worker teardown implemented; stale-result UI check passed |
| T18 | Not run hosted | Durable token-hash tickets and recoverable authorised purge implemented |
| T19 | Pass local routes; full operator pending | Public links/routes/assets and HTTP404 checked; browser console/parser rerun pending |
| T20 | Partial | Widths/theme axe/keyboard/consent checked; manual screen reader, zoom/print/complete private routes pending |
| T21 | Not run | Production redeploy and disposable DB/Storage restore need provider configuration |
| T22 | Partial | Lab changes in-memory exported copies only; production unchanged assertions pending live records |
| T23 | Not run | Two production rehearsals pending |
| T24 | Not run production | Local logged-out routes checked; actual HTTPS domain not yet available |
| T25 | Owner pending | Physical phone/network/browser check requires deployed domain |
| T26 | Partial | Mocked unavailable response clears prior result; actual paused/outage hosted rehearsal pending |
| T27 | Not run production | QR derives only APP_ORIGIN; stable deployed domain required before production fixture generation |

Payments, marketing unsubscribe and absent phone/email are scoped not applicable. Public deployment, privacy, lifecycle and persistence are required and **not** marked not applicable.

## Release decision

**Not complete / not ready for judging.** Missing Supabase/GitHub/Vercel owner setup prevents hosted gates. The app never returns hardcoded backend success when configuration is absent. No production URL, deployed commit or backup/restore outcome is invented. Continue from CHECKPOINT.md after owner config.

# Requirements to implementation and evidence

Codes come from PROJECT_SPEC.md. Implementation does not imply an acceptance pass; see ACCEPTANCE_REPORT.md for observed status.

| Capability | Code/routes | Tests/evidence |
|---|---|---|
| PS1 unique IDs/QR issuance | lifecycle.ts, pdf.ts, /issuer | unit PDF; hosted lifecycle pending |
| PS2 minimal public verification | verification.ts explicit public projection, /api/verify | input privacy tests; browser payload assertions; hosted pending |
| PS3 alteration detection | proof.ts, original digest comparison, local worker | real altered PDF, changed manifest/event/key tests |
| PS4 issuance/revocation history | atomic ISSUE/REVOKE, Prisma unique lifecycle/sequence | concurrency/role integration tests pending DB |
| PS5 hash-linked audit trail | proof.ts, /api/audit, /api/lab, audit:checkpoint | chain/tamper/rollback unit checks |

| Code | Implementation | Evidence |
|---|---|---|
| W01 | Responsive grids/min-width/wrapping, globals.css | Chromium width checks |
| W02 | Main/footer route links | Public navigation test |
| W03 | Accessible mobile toggle | Keyboard/mobile test |
| W04 | app/icon.svg | Route/browser |
| W05 | layout and route metadata | Browser routes |
| W06 | Generic description, no recipient metadata | Server projection/source |
| W07 | Policy/help/support footer | Navigation test |
| W08 | notFound custom page | HTTP404 test |
| W09 | Runtime current year | Chrome component |
| W10 | Vector icon, local fonts, compact previews | No external assets required |
| W11 | Forms/menu/theme/copy/download/revoke/audit | Public browser; operator pending |
| W12 | Success after actual commit/request save | Hosted pending |
| W13 | Explicit validation/retry/unavailable messages | Input/outage tests |
| W14 | Real explanatory content and fictional labels | Routes reviewed |
| W15 | Only working required nav | Public routes |
| W16 | Long values wrap; no overflow hiding | Width checks; private long-content pending |
| W17 | Linked brand | Chrome component |
| W18 | No phone supplied | Not applicable |
| W19 | No public email supplied; queue instead | Not applicable email; support queue pending hosted |
| W20 | Shared responsive styles | Public width tests; private pending |
| P01 | /privacy matches providers/browser/server processing | SDK_INVENTORY.md |
| P02 | /terms | Navigation test |
| P03 | /refunds, no payment collection | Scoped free demo |
| P04 | /cookies | Storage policy |
| P05 | Shared necessary/optional notice | Consent browser test |
| P06 | Support/issuance purposes, tracking opt-in | UI and strict server schemas |
| P07 | No real identifiers/minors; public projection | Privacy/input tests |
| P08 | SDK inventory, pinned deps/audit | npm audit and THIRD_PARTY_NOTICES.md |
| P09 | Equal opt-in/reject, no forced tracking | Consent browser test |
| P10 | No fees | /refunds |
| P11 | No reviews | Public content |
| P12 | Honest trust boundaries/no official claims | /help, ARCHITECTURE.md |
| P13 | Decorative SVG icons hidden/labeled controls | axe tests |
| P14 | Light/dark tokens | axe contrast checks |
| P15 | Skip link, focus styles, Radix modals | Keyboard test; private modal pending |
| P16 | /support durable private queue | Hosted pending |
| P17 | Fictional adult-only instructions, no fake age box | Issue form/PDF label |
| P18 | No marketing email | Not applicable unsubscribe |
| P19 | Bundled software/font licenses | public/licenses and notices |
| P20 | Request token, authority confirmation, pending purge | Hosted fault/privacy tests pending |
| U01 | System/light/dark saved theme | Theme browser test |
| U02 | Same P05 notice | Consent browser test |
| U03 | Local help search, scoped private search | Help browser test; private pending |
| U04 | Back-to-top control | Chrome component |
| U05 | Same W03 mobile menu | Keyboard browser test |
| U06 | Busy text/cancel, reduced-motion styles | File/outage browser tests |
| U07 | Hover/focus styles | axe/keyboard |
| U08 | Decorative reading progress | Help/policy component |
| U09 | Copy ID/link with manual fallback | Verdict component; hosted pending |
| U10 | Print stylesheet and report | Manual print pending |
| U11 | Sticky header and focus/scroll offsets | Keyboard/mobile checks |
| U12 | Skip-to-content | Keyboard check |
| U13 | Password visibility toggle | Issuer login; private browser pending |
| U14 | Opt-in allowlisted aggregate counts, durable expiry | Consent browser; DB pending |
| U15 | Persistent issue/request/decision result state | Hosted pending |
| U16 | Safe preserved inputs/error text | Input browser tests |
| U17 | Radix confirmation focus/escape/return | Hosted modal check pending |
| U18 | Content revision and checkedAt | Policy/verification response |
| U19 | Expandable searchable FAQ | Help test |
| U20 | Floating support control, mobile spacing | Width checks |

| Tests | Code/checks |
|---|---|
| T01–T05 | setup/doctor, role/migration/storage configuration, hosted.spec.ts and integration lifecycle tests |
| T06–T11 | unit input/PDF; parser/public browser tests; hosted real examples; public projection and no-cache |
| T12–T13 | proof unit corruption and remembered-checkpoint tests; owner exported checkpoint comparison |
| T14–T16 | disposable integration concurrency/failure tests; lease fencing/short transactions/repeatable-read |
| T17 | generation guards/abort/worker cleanup and public browser stale result |
| T18 | /support and admin purge; disposable failure tests |
| T19–T20 | public.spec.ts navigation/axe/mobile/consent; manual and private checks pending |
| T21–T22 | backup/restore:check, redeployment rehearsal, isolated lab proof comparison |
| T23–T27 | DEMO_RUNBOOK.md, deploy:check/demo:check, production/physical device evidence required |

Each T01–T27 has its individual status in ACCEPTANCE_REPORT.md. Code paths are relative to src/server or src/lib unless a route/script is specified.

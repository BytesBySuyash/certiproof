# External setup

Never put passwords, tokens or keys in chat. Use gitignored .env.local and provider settings.

| Step | Service | Why | Exact owner action | Configuration names | Status | Next |
|---|---|---|---|---|---|---|
| 1 | GitHub Free | Private source and deployment integration | Existing BytesBySuyash Git Credential Manager login is reusable; no new login needed | Repository URL | Authentication verified; intended certiproof repository absent before creation | Push tested source after local commit |
| 2 | Supabase Free | Durable DB/Auth/private files | Create one Free project, no trial/card; dashboard Connect: obtain runtime/session connections and API keys | NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, SUPABASE_SECRET_KEY, DATABASE_URL, DIRECT_URL | Pending | Run reviewed setup/migrations, provision operator |
| 3 | Vercel Hobby | Public full-stack HTTPS | Sign into Hobby and connect only intended repo, or run CLI login | APP_ORIGIN, server environment entries from .env.local | Pending; no CLI credentials found | Deploy and test actual domain |
| 4 | Local key custody | Stable signatures | Keys already generated once in .env.local; privately back up that file/key configuration | CERTIFICATE_SIGNING_PRIVATE_KEY_B64, SIGNING_KEY_ID, TRUSTED_PUBLIC_KEYS_JSON, ABUSE_HASH_SECRET | Generated locally; owner backup/provider entry pending | Validate pinned public ring after deployment |
| 5 | Operator | Private issuance | Set OPERATOR_EMAIL locally; setup asks for password without echo | OPERATOR_EMAIL | Pending | Create two fictional issuers/memberships |
| 6 | Independent phone/network | Physical deployment check | Open actual URL on phone/mobile data and test downloaded original, altered sample and QR | None | Pending | Record browser/network/results |

Workspace-local Node 24.21.0 and Git repository are available; GitHub login was found and verified without displaying its credential. Vercel/Supabase are not connected. The smallest next owner action is: create the Supabase Free project; in a local PowerShell terminal run `npm run configure` with Node 24 on PATH (or `& '.\.tools\node24\node.exe' --import tsx scripts/configure.ts`). Enter the project's public URL/publishable key, operator email and hidden server key/session-pooler connection locally. Leave APP_ORIGIN at localhost until the stable production domain is known. No secrets belong in chat. Then notify the assistant that local configuration is ready; setup and deployment work can resume.

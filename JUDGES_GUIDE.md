# What to try

Open the production verification URL (pending deployment), choose a PDF, or type its full cp_ ID. No account is needed. Try the real fictional examples or your own supported document.

1. Original PDF: bytes match and status is active. Renaming does not change the fingerprint.
2. Altered PDF with same ID/QR: record located; file differs. This does not automatically mean fraud.
3. Revoked original: bytes still match, but the issuer withdrew it.
4. Expired original: bytes match, expiry comes from the signed timestamp.
5. Image carrying QR: record-only; image contents are not authenticated.
6. Unrelated document: cannot authenticate it in this registry.

Your selected file, filename and extracted text stay on your device. Only IDs/digests are sent to our server. Public results exclude recipient names. Private issuance requires a real provisioned login.

An **issuer** creates a record. A **hash** is a fingerprint, not encryption. A **signature** links a record to a trusted signing key. A **ledger** is an ordered signed event history whose events link to earlier hashes. **Revoked** means withdrawn; the original issuance stays recorded.

The problem statement accepts a hash-linked ledger, so no cryptocurrency wallet/fee is needed. Platform signatures are on behalf of fictional issuers; no independent real-university key custody is claimed. QR alone is a pointer and can be copied. Separately retained checkpoints reveal rollback before the checkpoint; full signing-server compromise and deletions after the last checkpoint remain limits. See /help for the presenter FAQ.

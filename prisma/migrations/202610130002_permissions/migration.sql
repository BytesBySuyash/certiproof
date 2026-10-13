-- Application schema is never exposed to anonymous/authenticated Supabase Data API roles.
REVOKE ALL ON SCHEMA certiproof FROM PUBLIC, anon, authenticated;
REVOKE ALL ON ALL TABLES IN SCHEMA certiproof FROM PUBLIC, anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA certiproof REVOKE ALL ON TABLES FROM PUBLIC, anon, authenticated;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='certiproof_runtime') THEN
    CREATE ROLE certiproof_runtime LOGIN NOINHERIT;
  END IF;
END $$;
GRANT USAGE ON SCHEMA certiproof TO certiproof_runtime;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA certiproof TO certiproof_runtime;
REVOKE UPDATE, DELETE, TRUNCATE ON certiproof."LedgerEvent" FROM certiproof_runtime;
REVOKE DELETE, TRUNCATE ON certiproof."LedgerHead" FROM certiproof_runtime;
ALTER TABLE certiproof."LedgerEvent" ADD CONSTRAINT event_issuer_fk FOREIGN KEY ("ledgerId") REFERENCES certiproof."Issuer"(id);
ALTER TABLE certiproof."LedgerEvent" ADD CONSTRAINT event_certificate_fk FOREIGN KEY ("certificateId") REFERENCES certiproof."Certificate"(id);
ALTER TABLE certiproof."Membership" ADD CONSTRAINT membership_role_check CHECK (role IN ('STAFF','ADMIN','PLATFORM_ADMIN'));
ALTER TABLE certiproof."Issuer" ADD CONSTRAINT issuer_status_check CHECK (status IN ('DEMO','APPROVED','SUSPENDED'));
ALTER TABLE certiproof."Certificate" ADD CONSTRAINT certificate_status_check CHECK (status IN ('ACTIVE','REVOKED'));
ALTER TABLE certiproof."Certificate" ADD CONSTRAINT private_state_check CHECK ("privateState" IN ('AVAILABLE','PURGE_PENDING','PURGED'));
ALTER TABLE certiproof."LedgerEvent" ADD CONSTRAINT event_type_check CHECK (type IN ('ISSUE','REVOKE','PII_PURGED'));
-- No storage.objects policy is granted to anon/authenticated for certificate-originals.
-- Only server-side Storage credentials can access that private bucket.

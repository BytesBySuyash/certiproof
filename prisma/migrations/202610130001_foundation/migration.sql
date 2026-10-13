-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "certiproof";

-- CreateTable
CREATE TABLE "certiproof"."Issuer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DEMO',
    "enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Issuer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certiproof"."Membership" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "issuerId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Membership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certiproof"."IssuanceRequest" (
    "id" TEXT NOT NULL,
    "issuerId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "inputHash" TEXT NOT NULL,
    "certificateId" TEXT NOT NULL,
    "payload" JSONB,
    "objectKey" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'RESERVED',
    "leaseUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IssuanceRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certiproof"."Certificate" (
    "id" TEXT NOT NULL,
    "issuerId" TEXT NOT NULL,
    "manifest" JSONB NOT NULL,
    "manifestHash" TEXT NOT NULL,
    "signature" TEXT NOT NULL,
    "pdfHash" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "privateState" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certiproof"."CertificatePrivateData" (
    "certificateId" TEXT NOT NULL,
    "payload" JSONB NOT NULL,

    CONSTRAINT "CertificatePrivateData_pkey" PRIMARY KEY ("certificateId")
);

-- CreateTable
CREATE TABLE "certiproof"."CertificateArtifact" (
    "certificateId" TEXT NOT NULL,
    "objectKey" TEXT NOT NULL,
    "byteLength" INTEGER NOT NULL,

    CONSTRAINT "CertificateArtifact_pkey" PRIMARY KEY ("certificateId")
);

-- CreateTable
CREATE TABLE "certiproof"."LedgerHead" (
    "issuerId" TEXT NOT NULL,
    "sequence" BIGINT NOT NULL DEFAULT 0,
    "hash" TEXT NOT NULL,

    CONSTRAINT "LedgerHead_pkey" PRIMARY KEY ("issuerId")
);

-- CreateTable
CREATE TABLE "certiproof"."LedgerEvent" (
    "id" TEXT NOT NULL,
    "ledgerId" TEXT NOT NULL,
    "sequence" BIGINT NOT NULL,
    "certificateId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "body" JSONB NOT NULL,
    "hash" TEXT NOT NULL,
    "signature" TEXT NOT NULL,

    CONSTRAINT "LedgerEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certiproof"."PrivateActionDetail" (
    "id" TEXT NOT NULL,
    "certificateId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrivateActionDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certiproof"."PrivacyRequest" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "certificateId" TEXT,
    "issuerId" TEXT,
    "state" TEXT NOT NULL DEFAULT 'OPEN',
    "decision" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrivacyRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certiproof"."AbuseCounter" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AbuseCounter_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "certiproof"."CampaignCount" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampaignCount_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "certiproof"."DemoAsset" (
    "slug" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "objectKey" TEXT NOT NULL,
    "mime" TEXT NOT NULL,
    "certificateId" TEXT,

    CONSTRAINT "DemoAsset_pkey" PRIMARY KEY ("slug")
);

-- CreateIndex
CREATE UNIQUE INDEX "Membership_userId_issuerId_key" ON "certiproof"."Membership"("userId", "issuerId");

-- CreateIndex
CREATE UNIQUE INDEX "IssuanceRequest_certificateId_key" ON "certiproof"."IssuanceRequest"("certificateId");

-- CreateIndex
CREATE UNIQUE INDEX "IssuanceRequest_objectKey_key" ON "certiproof"."IssuanceRequest"("objectKey");

-- CreateIndex
CREATE UNIQUE INDEX "IssuanceRequest_issuerId_idempotencyKey_key" ON "certiproof"."IssuanceRequest"("issuerId", "idempotencyKey");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_manifestHash_key" ON "certiproof"."Certificate"("manifestHash");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_pdfHash_key" ON "certiproof"."Certificate"("pdfHash");

-- CreateIndex
CREATE UNIQUE INDEX "CertificateArtifact_objectKey_key" ON "certiproof"."CertificateArtifact"("objectKey");

-- CreateIndex
CREATE UNIQUE INDEX "LedgerEvent_ledgerId_sequence_key" ON "certiproof"."LedgerEvent"("ledgerId", "sequence");

-- CreateIndex
CREATE UNIQUE INDEX "LedgerEvent_certificateId_type_key" ON "certiproof"."LedgerEvent"("certificateId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "PrivacyRequest_tokenHash_key" ON "certiproof"."PrivacyRequest"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "DemoAsset_objectKey_key" ON "certiproof"."DemoAsset"("objectKey");

-- AddForeignKey
ALTER TABLE "certiproof"."Membership" ADD CONSTRAINT "Membership_issuerId_fkey" FOREIGN KEY ("issuerId") REFERENCES "certiproof"."Issuer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certiproof"."IssuanceRequest" ADD CONSTRAINT "IssuanceRequest_issuerId_fkey" FOREIGN KEY ("issuerId") REFERENCES "certiproof"."Issuer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certiproof"."Certificate" ADD CONSTRAINT "Certificate_issuerId_fkey" FOREIGN KEY ("issuerId") REFERENCES "certiproof"."Issuer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certiproof"."CertificatePrivateData" ADD CONSTRAINT "CertificatePrivateData_certificateId_fkey" FOREIGN KEY ("certificateId") REFERENCES "certiproof"."Certificate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certiproof"."CertificateArtifact" ADD CONSTRAINT "CertificateArtifact_certificateId_fkey" FOREIGN KEY ("certificateId") REFERENCES "certiproof"."Certificate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certiproof"."LedgerHead" ADD CONSTRAINT "LedgerHead_issuerId_fkey" FOREIGN KEY ("issuerId") REFERENCES "certiproof"."Issuer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "AuthUser"
ADD COLUMN "publicId" TEXT;

UPDATE "AuthUser"
SET "publicId" = 'usr_' || ROW_NUMBER() OVER (ORDER BY "createdAt");

ALTER TABLE "AuthUser"
ALTER COLUMN "publicId" SET NOT NULL;

CREATE UNIQUE INDEX "AuthUser_publicId_key" ON "AuthUser"("publicId");

ALTER TABLE "ManagedUser"
ADD COLUMN "publicId" TEXT;

UPDATE "ManagedUser"
SET "publicId" = 'usr_' || ROW_NUMBER() OVER (ORDER BY "createdAt");

ALTER TABLE "ManagedUser"
ALTER COLUMN "publicId" SET NOT NULL;

CREATE UNIQUE INDEX "ManagedUser_publicId_key" ON "ManagedUser"("publicId");
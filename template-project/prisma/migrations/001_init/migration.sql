-- Initial migration for template-project real API
-- Generated: 2026-06-12
-- Apply with: npx prisma migrate deploy
--             or: npx prisma migrate dev --name init (dev)

-- Auth Users
CREATE TABLE "AuthUser" (
    "id"        TEXT NOT NULL,
    "email"     TEXT NOT NULL,
    "password"  TEXT NOT NULL,
    "locked"    BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuthUser_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AuthUser_email_key" ON "AuthUser"("email");

-- Sessions
CREATE TABLE "Session" (
    "id"        TEXT NOT NULL,
    "token"     TEXT NOT NULL,
    "active"    BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "userId"    TEXT NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "AuthUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Managed Users
CREATE TABLE "ManagedUser" (
    "id"        TEXT NOT NULL,
    "email"     TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName"  TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ManagedUser_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ManagedUser_email_key" ON "ManagedUser"("email");

-- Order Status Enum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'FAILED');

-- Orders
CREATE TABLE "Order" (
    "id"           TEXT NOT NULL,
    "reference"    TEXT NOT NULL,
    "status"       "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "paymentToken" TEXT NOT NULL,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3) NOT NULL,
    "userId"       TEXT NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Order_reference_key" ON "Order"("reference");

ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "AuthUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Order Items
CREATE TABLE "OrderItem" (
    "id"       TEXT NOT NULL,
    "sku"      TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "orderId"  TEXT NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey"
    FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Shipping Addresses
CREATE TABLE "ShippingAddress" (
    "id"         TEXT NOT NULL,
    "line1"      TEXT NOT NULL,
    "city"       TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "country"    TEXT NOT NULL,
    "orderId"    TEXT NOT NULL,

    CONSTRAINT "ShippingAddress_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ShippingAddress_orderId_key" ON "ShippingAddress"("orderId");

ALTER TABLE "ShippingAddress" ADD CONSTRAINT "ShippingAddress_orderId_fkey"
    FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

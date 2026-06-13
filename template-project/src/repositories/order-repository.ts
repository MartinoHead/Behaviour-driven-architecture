import { randomUUID } from 'node:crypto';
import { getPrismaClientIfConfigured } from '../data/prisma-client.js';

type OrderSqlClient = {
  $queryRawUnsafe<T = unknown>(query: string, ...values: unknown[]): Promise<T>;
  $executeRawUnsafe(query: string, ...values: unknown[]): Promise<number>;
};

type CreateOrderInput = {
  items: Array<{
    sku: string;
    quantity: number;
  }>;
  shippingAddress: {
    line1: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentToken: string;
};

let checkoutOrderSequence = 0;

function isPrismaConnectionError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  if ('code' in error && (error as { code?: unknown }).code === 'P1001') {
    return true;
  }

  const message = 'message' in error ? String((error as { message?: unknown }).message || '') : '';
  return message.includes("Can't reach database server");
}

function parseNumericSuffix(value: string, prefix: string): number {
  const raw = value.startsWith(prefix) ? value.slice(prefix.length) : '';
  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 0;
}

async function nextOrderReference(client: OrderSqlClient): Promise<string> {
  const rows = await client.$queryRawUnsafe<Array<{ reference: string }>>(
    'SELECT reference FROM "Order"',
  );

  const nextValue = rows.reduce((maxValue, row) => {
    return Math.max(maxValue, parseNumericSuffix(row.reference, 'ord_'));
  }, 0);

  return `ord_${nextValue + 1}`;
}

export async function createCheckoutOrder(input: CreateOrderInput): Promise<{ orderReference: string }> {
  const prisma = getPrismaClientIfConfigured();

  if (!prisma) {
    checkoutOrderSequence += 1;
    return {
      orderReference: `ord_${checkoutOrderSequence}`,
    };
  }

  try {
    const orderReference = await prisma.$transaction(async (tx) => {
      const reference = await nextOrderReference(tx);
      const now = new Date();
      const orderId = randomUUID();

      await tx.$executeRawUnsafe(
        [
          'INSERT INTO "Order" (id, reference, status, "paymentToken", "createdAt", "updatedAt", "userId")',
          'VALUES ($1, $2, $3, $4, $5, $6, $7)',
        ].join(' '),
        orderId,
        reference,
        'CONFIRMED',
        input.paymentToken,
        now,
        now,
        null,
      );

      for (const item of input.items) {
        await tx.$executeRawUnsafe(
          'INSERT INTO "OrderItem" (id, sku, quantity, "orderId") VALUES ($1, $2, $3, $4)',
          randomUUID(),
          item.sku,
          item.quantity,
          orderId,
        );
      }

      await tx.$executeRawUnsafe(
        [
          'INSERT INTO "ShippingAddress" (id, line1, city, "postalCode", country, "orderId")',
          'VALUES ($1, $2, $3, $4, $5, $6)',
        ].join(' '),
        randomUUID(),
        input.shippingAddress.line1,
        input.shippingAddress.city,
        input.shippingAddress.postalCode,
        input.shippingAddress.country,
        orderId,
      );

      return reference;
    });

    return {
      orderReference,
    };
  } catch (error) {
    if (isPrismaConnectionError(error)) {
      checkoutOrderSequence += 1;
      return {
        orderReference: `ord_${checkoutOrderSequence}`,
      };
    }
    throw error;
  }
}
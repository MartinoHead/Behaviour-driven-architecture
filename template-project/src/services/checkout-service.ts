import { createCheckoutOrder } from '../repositories/order-repository.js';

type CheckoutRequest = {
  items?: Array<{
    sku?: unknown;
    quantity?: unknown;
  }>;
  shippingAddress?: {
    line1?: unknown;
    city?: unknown;
    postalCode?: unknown;
    country?: unknown;
  };
  paymentToken?: unknown;
};

type CheckoutResult =
  | { status: 400; body: { error: 'empty_cart' | 'invalid_shipping_address'; message: string } }
  | { status: 402; body: { error: 'payment_not_authorized'; message: string } }
  | {
      status: 201;
      body: {
        orderReference: string;
        paymentAuthorized: true;
        confirmation: 'Checkout completed successfully.';
      };
    };

export async function submitCheckout(input: CheckoutRequest): Promise<CheckoutResult> {
  const items = Array.isArray(input.items) ? input.items : [];

  if (items.length < 1) {
    return {
      status: 400,
      body: {
        error: 'empty_cart',
        message: 'Checkout requires at least one cart item.',
      },
    };
  }

  const shippingAddress = input.shippingAddress || {};
  const normalizedShippingAddress = {
    line1: String(shippingAddress.line1 || '').trim(),
    city: String(shippingAddress.city || '').trim(),
    postalCode: String(shippingAddress.postalCode || '').trim(),
    country: String(shippingAddress.country || '').trim(),
  };

  if (
    !normalizedShippingAddress.line1 ||
    !normalizedShippingAddress.city ||
    !normalizedShippingAddress.postalCode ||
    !normalizedShippingAddress.country
  ) {
    return {
      status: 400,
      body: {
        error: 'invalid_shipping_address',
        message: 'Shipping address fields are mandatory.',
      },
    };
  }

  const paymentToken = String(input.paymentToken || '').trim();

  if (!paymentToken.startsWith('pay_')) {
    return {
      status: 402,
      body: {
        error: 'payment_not_authorized',
        message: 'Payment authorization is required before order creation.',
      },
    };
  }

  const order = await createCheckoutOrder({
    items: items.map((item) => ({
      sku: String(item.sku || '').trim(),
      quantity: Number(item.quantity || 0),
    })),
    shippingAddress: normalizedShippingAddress,
    paymentToken,
  });

  return {
    status: 201,
    body: {
      orderReference: order.orderReference,
      paymentAuthorized: true,
      confirmation: 'Checkout completed successfully.',
    },
  };
}
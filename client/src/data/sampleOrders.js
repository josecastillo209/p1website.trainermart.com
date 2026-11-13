export const sampleOrders = [
  {
    orderId: 'ORD-1001',
    orderDate: '11/10/2026, 3:15:00 PM',
    customer: {
      firstName: 'Jose',
      lastName: 'Castillo',
      email: 'jose@example.com',
    },
    shipping: {
      street: '123 Trail Ave',
      city: 'Stockton',
      state: 'CA',
      zip: '95202',
    },
    billing: {
      street: '123 Trail Ave',
      city: 'Stockton',
      state: 'CA',
      zip: '95202',
    },
    payment: {
      cardType: 'Visa',
      last4: '4242',
    },
    items: [
      {
        id: 1,
        name: 'Route Walker X',
        size: '10',
        color: 'Black Tech',
        quantity: 1,
        price: 159,
      },
    ],
    totals: {
      subtotal: 159,
      tax: 12.72,
      shipping: 5,
      total: 176.72,
      taxRate: 0.08,
    },
  },
  {
    orderId: 'ORD-1002',
    orderDate: '11/11/2026, 1:02:00 PM',
    customer: {
      firstName: 'Jose',
      lastName: 'Castillo',
      email: 'jose@example.com',
    },
    shipping: {
      street: '123 Trail Ave',
      city: 'Stockton',
      state: 'CA',
      zip: '95202',
    },
    billing: {
      street: '123 Trail Ave',
      city: 'Stockton',
      state: 'CA',
      zip: '95202',
    },
    payment: {
      cardType: 'Mastercard',
      last4: '1111',
    },
    items: [
      {
        id: 4,
        name: 'Meadow Runner Lite',
        size: '8',
        color: 'Light Blue',
        quantity: 2,
        price: 120,
      },
    ],
    totals: {
      subtotal: 240,
      tax: 19.2,
      shipping: 0,
      total: 259.2,
      taxRate: 0.08,
    },
  },
]
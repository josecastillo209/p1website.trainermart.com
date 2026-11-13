import { ObjectId } from 'mongodb';

const TAX_RATE = 0.08;
const SHIPPING_FLAT = 5;
const FREE_SHIPPING_AT = 75;

function text(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function validateAddress(address, prefix, errors) {
  const fields = ['street', 'city', 'state', 'zip'];

  if (!address || typeof address !== 'object' || Array.isArray(address)) {
    errors[prefix] = 'Enter a valid address.';
    return null;
  }

  const clean = {};
  for (const field of fields) {
    const value = text(address[field]);
    if (!value || value.length > 200) {
      errors[`${prefix}.${field}`] = 'Required; maximum 200 characters.';
    }
    clean[field] = value;
  }

  if (clean.zip && !/^\d{5}(-\d{4})?$/.test(clean.zip)) {
    errors[`${prefix}.zip`] = 'Enter a valid ZIP code.';
  }

  return clean;
}

function requireUser(req, res) {
  const userId = req.session.userId;
  if (!userId || !ObjectId.isValid(userId)) {
    res.status(401).json({ message: 'Please log in to continue.' });
    return null;
  }
  return userId;
}

export async function createOrder(req, res, next) {
  try {
    const userId = requireUser(req, res);
    if (!userId) return;

    const cart = Array.isArray(req.session.cart) ? req.session.cart : [];
    if (cart.length === 0) {
      return res.status(400).json({ message: 'Your cart is empty.' });
    }

    const body = req.body ?? {};
    const errors = {};

    const firstName = text(body.firstName ?? body.customer?.firstName);
    const lastName = text(body.lastName ?? body.customer?.lastName);
    const email = text(body.email ?? body.customer?.email).toLowerCase();

    if (!firstName || firstName.length > 100) {
      errors.firstName = 'First name is required.';
    }
    if (!lastName || lastName.length > 100) {
      errors.lastName = 'Last name is required.';
    }
    if (
      !email ||
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      errors.email = 'Enter a valid email address.';
    }

    const shipping = validateAddress(body.shipping, 'shipping', errors);
    const billingSource = body.sameAsShipping ? body.shipping : body.billing;
    const billing = validateAddress(billingSource, 'billing', errors);

    const cardType = text(body.cardType ?? body.payment?.cardType);
    const last4 = text(body.last4 ?? body.payment?.last4);
    const allowedCards = ['Visa', 'Mastercard', 'Amex', 'Discover'];

    if (!allowedCards.includes(cardType)) {
      errors.cardType = 'Select a valid card type.';
    }
    if (!/^\d{4}$/.test(last4)) {
      errors.last4 = 'Enter exactly 4 digits.';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        message: 'Please correct the highlighted fields.',
        errors,
      });
    }

    const db = req.app.locals.db;
    const products = db.collection('products');
    const lineItems = [];

    for (const item of cart) {
      const productId = item.productId ?? item.id;
      if (!productId) {
        return res.status(400).json({ message: 'Cart item is missing a product id.' });
      }

      let product = null;
      if (ObjectId.isValid(String(productId))) {
        product = await products.findOne({ _id: new ObjectId(String(productId)) });
      }
      if (!product && item.id !== undefined) {
        product = await products.findOne({ id: Number(item.id) });
      }

      if (!product) {
        return res.status(400).json({
          message: `Product not found for cart item (${item.name || productId}).`,
        });
      }

      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({ message: 'Quantity must be a positive integer.' });
      }

      // Server price only — never trust a price sent by the client.
      const unitPrice = Number(product.price);
      const lineTotal = Math.round(unitPrice * quantity * 100) / 100;

      lineItems.push({
        productId: product._id ?? product.id,
        name: product.name,
        image: product.image || item.image || '',
        size: text(item.size),
        color: text(item.color),
        quantity,
        unitPrice,
        lineTotal,
      });
    }

    const subtotal = Math.round(
      lineItems.reduce((sum, line) => sum + line.lineTotal, 0) * 100
    ) / 100;
    const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
    const shippingCost = subtotal >= FREE_SHIPPING_AT ? 0 : SHIPPING_FLAT;
    const total = Math.round((subtotal + tax + shippingCost) * 100) / 100;

    const order = {
      userId: new ObjectId(userId),
      createdAt: new Date(),
      customer: { firstName, lastName, email },
      shipping,
      billing,
      payment: { cardType, last4 },
      items: lineItems,
      totals: {
        subtotal,
        tax,
        shipping: shippingCost,
        total,
        taxRate: TAX_RATE,
      },
    };

    const result = await db.collection('orders').insertOne(order);

    req.session.cart = [];
    await new Promise((resolve, reject) => {
      req.session.save((error) => (error ? reject(error) : resolve()));
    });

    return res.status(201).json({
      message: 'Order placed successfully.',
      order: {
        ...order,
        _id: result.insertedId,
        orderId: result.insertedId.toString(),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getOrders(req, res, next) {
  try {
    const userId = requireUser(req, res);
    if (!userId) return;

    const orders = await req.app.locals.db
      .collection('orders')
      .find({ userId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .toArray();

    res.json({ orders });
  } catch (error) {
    next(error);
  }
}

export async function getOrderById(req, res, next) {
  try {
    const userId = requireUser(req, res);
    if (!userId) return;

    if (!ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    const order = await req.app.locals.db.collection('orders').findOne({
      _id: new ObjectId(req.params.id),
      userId: new ObjectId(userId),
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    res.json({ order });
  } catch (error) {
    next(error);
  }
}
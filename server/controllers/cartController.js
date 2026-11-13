function getCart(req) {
  if (!Array.isArray(req.session.cart)) {
    req.session.cart = [];
  }
  return req.session.cart;
}

function saveSession(req) {
  return new Promise((resolve, reject) => {
    req.session.save((error) => (error ? reject(error) : resolve()));
  });
}

function sameLine(item, productId, size, color) {
  return (
    String(item.productId ?? item.id) === String(productId) &&
    item.size === size &&
    item.color === color
  );
}

export async function getSessionCart(req, res, next) {
  try {
    res.json({ cart: getCart(req) });
  } catch (error) {
    next(error);
  }
}

export async function addToSessionCart(req, res, next) {
  try {
    const body = req.body ?? {};
    const productId = body.productId ?? body.id;
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const size = typeof body.size === 'string' ? body.size.trim() : '';
    const color = typeof body.color === 'string' ? body.color.trim() : '';
    const quantity = Number(body.quantity);
    const image = typeof body.image === 'string' ? body.image : '';
    const price = Number(body.price);

    if (!productId || !name || !size || !color) {
      return res.status(400).json({
        message: 'Product, size, and color are required.',
      });
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        message: 'Quantity must be a positive integer.',
      });
    }

    const cart = getCart(req);
    const existing = cart.find((item) => sameLine(item, productId, size, color));

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({
        itemId: `${productId}-${size}-${color}`,
        productId,
        id: productId,
        name,
        image,
        size,
        color,
        quantity,
        price,
      });
    }

    await saveSession(req);
    res.json({ cart });
  } catch (error) {
    next(error);
  }
}

export async function updateSessionCartItem(req, res, next) {
  try {
    const { itemId } = req.params;
    const quantity = Number(req.body?.quantity);
    const cart = getCart(req);
    const item = cart.find((entry) => entry.itemId === itemId);

    if (!item) {
      return res.status(404).json({ message: 'Cart item not found.' });
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        message: 'Quantity must be a positive integer.',
      });
    }

    item.quantity = quantity;
    await saveSession(req);
    res.json({ cart });
  } catch (error) {
    next(error);
  }
}

export async function removeSessionCartItem(req, res, next) {
  try {
    const { itemId } = req.params;
    const cart = getCart(req);
    const nextCart = cart.filter((entry) => entry.itemId !== itemId);
    req.session.cart = nextCart;
    await saveSession(req);
    res.json({ cart: nextCart });
  } catch (error) {
    next(error);
  }
}
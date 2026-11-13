function cartItems(req) {
    return Array.isArray(req.session.cart) ? req.session.cart : [];
}

function itemKey(id, size, color) {
    return `${id}:${encodeURIComponent(size)}:${encodeURIComponent(color)}`;
}

function validQuantity(quantity) {
    return Number.isSafeInteger(quantity) && quantity >= 1;
}

function responseCart(req, res) {
    res.json({ cart: cartItems(req) });
}

export function getCart(req, res) {
    responseCart(req, res);
}

export async function addCartItem(req, res, next) {
    try {
        const { productId, size, color, quantity } = req.body ?? {};
        const id = Number(productId);

        if (!Number.isSafeInteger(id) || id < 1 || typeof size !== 'string' ||
            typeof color !== 'string' || !validQuantity(quantity)) {
            return res.status(400).json({ 
                message: 'Invalid product, options, or quantity.' 
            });
        }

        const product = await req.app.locals.db.collection('products').findOne({ id });

        if (!product) return res.status(404).json({ 
            message: 'Product not found.' 
        });

        if (product.inStock === false) {
            return res.status(400).json({ 
                message: 'Product is out of stock.'
            });
        }

        // Compare as strings because HTML select values are strings.
        if (!Array.isArray(product.sizes) || !product.sizes.some(v => String(v) === size) ||
            !Array.isArray(product.colors) || !product.colors.some(v => String(v) === color)) {
            return res.status(400).json({ 
                message: 'Choose a valid size and color.' 
            });
        }

        const price = product.sizePrices?.[size] ?? product.price;

        if (typeof price !== 'number' || !Number.isFinite(price) || price < 0) {
            return res.status(500).json({ 
                message: 'Product price is unavailable.' 
            });
        }

        const key = itemKey(id, size, color);
        const cart = cartItems(req);
        const existing = cart.find(item => item.itemId === key);

        // Calculate the total quantity of this product in the cart.
        const totalInCart = cart
        .filter(item => item.id === id)
        .reduce((total, item) => total + item.quantity, 0);

        const requestedTotal = totalInCart + quantity;

        if (!Number.isSafeInteger(requestedTotal)) {
            return res.status(400).json({ 
                message: 'Invalid total quantity.' 
            });
        }

        // Check stock if a stock quantity exists in MongoDB.
        if (product.quantityInStock !== undefined) {
            if (!Number.isSafeInteger(product.quantityInStock) ||
                product.quantityInStock < 0) {
                return res.status(500).json({ 
                    message: 'Invalid product stock.' 
                });
            }

            if (requestedTotal > product.quantityInStock) {
                return res.status(400).json({
                    message: `Only ${product.quantityInStock} items are available.`
                });
            }
        }

        if (existing) {
            if (!validQuantity(existing.quantity + quantity)) {
                return res.status(400).json({ 
                    message: 'Invalid total quantity.' 
                });
            }

            existing.quantity += quantity;

            // Refresh display data from the database.
            existing.price = price;
            existing.name = product.name;
            existing.image = product.colorImages?.[color] ?? product.image;
        } else {
            cart.push({
                itemId: key, id, name: product.name,
                image: product.colorImages?.[color] ?? product.image,
                size, color, quantity, price,
            });
        }

        req.session.cart = cart;
        responseCart(req, res);

    } catch (error) {
        next(error);
    }
}

export async function updateCartItem(req, res, next) {
    try {
        const { quantity } = req.body ?? {};

        if (!validQuantity(quantity)) {
            return res.status(400).json({
                message: 'Quantity must be a positive whole number.'
            });
        }

        const cart = cartItems(req);
        const item = cart.find(entry => entry.itemId === req.params.itemId);

        if (!item) return res.status(404).json({ 
            message: 'Cart item not found.' 
        });

        // Retrieve product stock from MongoDB.
        const product = await req.app.locals.db.collection('products').findOne({ id: item.id });

        if (!product) return res.status(404).json({ message: 'Product not found.' });

        if (product.inStock === false) {
        return res.status(400).json({ message: 'Product is out of stock.' });
        }

        // Count other sizes and colors of the same product.
        const otherQuantity = cart
        .filter(entry => entry.id === item.id && entry.itemId !== item.itemId)
        .reduce((total, entry) => total + entry.quantity, 0);

        const requestedTotal = otherQuantity + quantity;

        if (!Number.isSafeInteger(requestedTotal)) {
            return res.status(400).json({ 
                message: 'Invalid total quantity.' 
            });
        }

        // Check stock if a stock quantity exists in MongoDB.
        if (product.quantityInStock !== undefined) {
            if (!Number.isSafeInteger(product.quantityInStock) ||
                product.quantityInStock < 0) {
                return res.status(500).json({ 
                    message: 'Invalid product stock.' 
                });
        }

            if (requestedTotal > product.quantityInStock) {
                return res.status(400).json({
                    message: `Only ${product.quantityInStock} items are available.`
                });
            }
        }

        item.quantity = quantity;
        req.session.cart = cart;
        responseCart(req, res);

    } catch (error) {
        next(error);
    }
}

export function deleteCartItem(req, res) {
    const cart = cartItems(req);

    // Check if the item exists in the cart before attempting to delete it.
    if (!cart.some(item => item.itemId === req.params.itemId)) {
        return res.status(404).json({ 
            message: 'Cart item not found.' 
        });
    }

    req.session.cart = cart.filter(item => item.itemId !== req.params.itemId);
    responseCart(req, res);
}

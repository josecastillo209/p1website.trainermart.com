// Product data comes from MongoDB.
export async function getProducts(req, res, next) {
    try {
        const products = await req.app.locals.db.collection('products')
            .find({}, { projection: { _id: 0 } })
            .sort({id: 1}).toArray()
        res.json(products);
    } catch (error) { 
        next (error);
    }
 }

 export async function getProduct(req, res, next) {
    try { 
        const id = Number(req.params.id);
        if (!Number.isSafeInteger(id) || id < 1) {
            return res.status(400).json({
                message: 'Invalid product ID'
            });
        }
        const product = await req.app.locals.db.collection('products') 
            .findOne({id }, { projection: { _id: 0 } });
        if (!product) {
            return res.status(404).json({ 
                message: 'Product not found' 
            });
        }
        res.json(product);
    } catch (error) { 
        next(error);
    }
}
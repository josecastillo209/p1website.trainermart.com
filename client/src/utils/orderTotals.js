export function calculateOrderTotals(items, options = {}) {
  const taxRate = options.taxRate ?? 0.08
  const shippingFlat = options.shippingFlat ?? 5
  const freeShippingAt = options.freeShippingAt ?? 75

  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0
  )
  const tax = Math.round(subtotal * taxRate * 100) / 100
  const shipping = subtotal >= freeShippingAt ? 0 : shippingFlat
  const total = Math.round((subtotal + tax + shipping) * 100) / 100

  return { subtotal, tax, shipping, total, taxRate }
}
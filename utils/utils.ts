/**
 * Get the actual price for a product
 * Uses sale_cost if available, otherwise uses cost
 */
export function getActualPrice(product: { cost: number; sale_cost?: number | null }): number {
  return product.sale_cost && product.sale_cost > 0 ? product.sale_cost : product.cost;
}

/**
 * Get the display price for a product with formatting
 * Returns the actual price with currency symbol
 */
export function getDisplayPrice(product: { cost: number; sale_cost?: number | null }): string {
  const actualPrice = getActualPrice(product);
  return `£${actualPrice.toFixed(2)}`;
}

/**
 * Check if a product has a sale price
 */
export function hasSalePrice(product: { cost: number; sale_cost?: number | null }): boolean {
  return !!(product.sale_cost && product.sale_cost > 0 && product.sale_cost < product.cost);
} 
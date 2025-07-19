-- Add cost and sale_cost columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS cost DECIMAL(10,2) NOT NULL DEFAULT 0.00;
ALTER TABLE products ADD COLUMN IF NOT EXISTS sale_cost DECIMAL(10,2) NULL;

-- Migrate existing price data to cost column
UPDATE products SET cost = price WHERE cost = 0.00 AND price IS NOT NULL;

-- The price column can be dropped if no longer needed, but keeping it for compatibility
-- DROP COLUMN IF EXISTS price;
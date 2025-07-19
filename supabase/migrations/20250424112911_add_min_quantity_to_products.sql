-- Add min_quantity column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS min_quantity INTEGER NOT NULL DEFAULT 1;

-- Update existing products to have a default minimum quantity of 1
UPDATE products SET min_quantity = 1 WHERE min_quantity IS NULL;

-- Add index on min_quantity for filtering/sorting
CREATE INDEX IF NOT EXISTS idx_products_min_quantity ON products(min_quantity);
-- Add quantity column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS quantity INTEGER NOT NULL DEFAULT 1;

-- Add status column to products table for inventory management
ALTER TABLE products ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'in_stock';

-- Update existing products to have a default quantity
UPDATE products SET quantity = 1 WHERE quantity IS NULL;
UPDATE products SET status = 'in_stock' WHERE status IS NULL;

-- Add index on status for filtering
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
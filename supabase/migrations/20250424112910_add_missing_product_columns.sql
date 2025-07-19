-- Add missing columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS size VARCHAR(10) NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS color VARCHAR(50) NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS user_id UUID NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id UUID NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_custom BOOLEAN DEFAULT FALSE;

-- Add foreign key constraint for category_id if categories table exists
-- ALTER TABLE products ADD CONSTRAINT fk_products_category 
-- FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;

-- Add foreign key constraint for user_id if users table exists  
-- ALTER TABLE products ADD CONSTRAINT fk_products_user 
-- FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- Add indices for better query performance
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_is_custom ON products(is_custom);
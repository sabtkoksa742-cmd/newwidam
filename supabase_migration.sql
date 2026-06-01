-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL DEFAULT 'Product',
    description TEXT DEFAULT '',
    price DECIMAL(10,2) DEFAULT 0,
    previous_price DECIMAL(10,2) DEFAULT 0,
    discount DECIMAL(10,2) DEFAULT 0,
    category TEXT DEFAULT '',
    image_url TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON products FOR SELECT USING (true);

-- Allow authenticated insert
CREATE POLICY "Allow authenticated insert" ON products FOR INSERT WITH CHECK (true);

-- Allow authenticated update
CREATE POLICY "Allow authenticated update" ON products FOR UPDATE USING (true);

-- Allow authenticated delete
CREATE POLICY "Allow authenticated delete" ON products FOR DELETE USING (true);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

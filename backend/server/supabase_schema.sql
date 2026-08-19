-- Schema PostgreSQL pour Fatima's Fragrance
-- A coller dans Supabase > SQL Editor > New query

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    initial_stock INTEGER NOT NULL DEFAULT 0,
    purchase_price DOUBLE PRECISION NOT NULL DEFAULT 0,
    sale_price DOUBLE PRECISION NOT NULL DEFAULT 0,
    sold INTEGER NOT NULL DEFAULT 0,
    remaining_stock INTEGER NOT NULL DEFAULT 0,
    next_order_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(50) NOT NULL UNIQUE,
    value VARCHAR(200) NOT NULL,
    description VARCHAR(200),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sales (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL,
    amount DOUBLE PRECISION NOT NULL,
    expense DOUBLE PRECISION NOT NULL DEFAULT 0,
    net_amount DOUBLE PRECISION NOT NULL,
    sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS credit_sales (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id),
    customer_name VARCHAR(120) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DOUBLE PRECISION NOT NULL,
    total_amount DOUBLE PRECISION NOT NULL,
    credit_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,
    description VARCHAR(200) NOT NULL,
    amount DOUBLE PRECISION NOT NULL,
    expense_date DATE NOT NULL,
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER,
    unit_price DOUBLE PRECISION,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sales_product_id ON sales(product_id);
CREATE INDEX IF NOT EXISTS idx_credit_sales_product_id ON credit_sales(product_id);
CREATE INDEX IF NOT EXISTS idx_expenses_product_id ON expenses(product_id);

INSERT INTO settings (key, value, description)
VALUES
    ('start_capital', '100000', 'Capital de départ en CFA'),
    ('profit_margin', '30', 'Marge bénéficiaire en %'),
    ('business_name', 'Fatima''s Fragrance', 'Nom de l''entreprise')
ON CONFLICT (key) DO NOTHING;

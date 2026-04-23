-- SICO DATABASE SCHEMA v5.1
CREATE TABLE IF NOT EXISTS companies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL, 
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS measurement_units (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    abbreviation TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS providers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nit TEXT UNIQUE NOT NULL, 
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS supplies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    base_unit_id INTEGER NOT NULL,
    is_active INTEGER DEFAULT 0, 
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (base_unit_id) REFERENCES measurement_units(id)
);


CREATE TABLE IF NOT EXISTS provider_supplies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    supply_id INTEGER NOT NULL,
    provider_id INTEGER NOT NULL,
    provider_item_code TEXT NOT NULL,
    purchase_unit_id INTEGER NOT NULL, 
    conversion_factor DECIMAL(10, 3) DEFAULT 1.000, 
    current_stock DECIMAL(10, 3) DEFAULT 0.00,
    min_stock DECIMAL(10, 3) DEFAULT 0.00,
    last_price DECIMAL(10, 4) NOT NULL,
    last_purchase_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supply_id) REFERENCES supplies(id) ON DELETE CASCADE,
    FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE,
    FOREIGN KEY (purchase_unit_id) REFERENCES measurement_units(id),
    UNIQUE(provider_id, provider_item_code)
);

CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL,
    barcode TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    sale_price DECIMAL(10, 2) NOT NULL,
    is_active INTEGER DEFAULT 1,
    FOREIGN KEY (company_id) REFERENCES companies(id)
);

CREATE TABLE IF NOT EXISTS product_supplies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    supply_id INTEGER NOT NULL,
    unit_id INTEGER NOT NULL,
    base_quantity DECIMAL(10, 3) NOT NULL, 
    waste_factor DECIMAL(5, 2) DEFAULT 1.00,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (supply_id) REFERENCES supplies(id) ON DELETE CASCADE,
    FOREIGN KEY (unit_id) REFERENCES measurement_units(id)
);

CREATE TABLE IF NOT EXISTS movements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT CHECK(type IN ('SALE', 'PROVIDER_ENTRY', 'DAMAGE_WASTE', 'CASH_OPEN', 'CASH_CLOSE')) NOT NULL,
    payment_method TEXT CHECK(payment_method IN ('CASH', 'TRANSFER', 'CARD', 'N/A')),
    total_amount DECIMAL(10, 2) DEFAULT 0.00,
    reference_doc TEXT, 
    description TEXT,
    responsible_id TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS supplies_movements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    movement_id INTEGER NOT NULL,
    provider_supply_id INTEGER NOT NULL,
    quantity DECIMAL(10, 3) NOT NULL, 
    unit_cost_at_time DECIMAL(10, 4) NOT NULL,
    FOREIGN KEY (movement_id) REFERENCES movements(id) ON DELETE CASCADE,
    FOREIGN KEY (provider_supply_id) REFERENCES provider_supplies(id)
);
-- ONI Generated Migration — Cycle 3
-- Generated: 2026-04-05T03:48:04.054Z

-- Schema for: Inventory & Ingredient Tracking
CREATE TABLE IF NOT EXISTS locations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(255) NOT NULL,
    address text,
    phone varchar(50),
    email varchar(255),
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ingredient_categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(255) NOT NULL,
    description text,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS units_of_measure (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(100) NOT NULL,
    abbreviation varchar(20) NOT NULL,
    unit_type varchar(50) NOT NULL,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ingredients (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(255) NOT NULL,
    description text,
    category_id uuid REFERENCES ingredient_categories(id) ON DELETE SET NULL,
    base_unit_id uuid NOT NULL REFERENCES units_of_measure(id) ON DELETE RESTRICT,
    sku varchar(100),
    barcode varchar(100),
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS location_inventory (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id uuid NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    ingredient_id uuid NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
    current_stock numeric(12, 4) NOT NULL DEFAULT 0,
    reorder_threshold numeric(12, 4) NOT NULL DEFAULT 0,
    critical_threshold numeric(12, 4) NOT NULL DEFAULT 0,
    max_stock_level numeric(12, 4),
    unit_id uuid NOT NULL REFERENCES units_of_measure(id) ON DELETE RESTRICT,
    average_cost_per_unit numeric(12, 4),
    last_restocked_at timestamptz,
    last_counted_at timestamptz,
    created_at timestamptz DEFAULT now(),
    UNIQUE (location_id, ingredient_id)
);

CREATE TABLE IF NOT EXISTS suppliers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(255) NOT NULL,
    contact_name varchar(255),
    phone varchar(50),
    email varchar(255),
    address text,
    payment_terms varchar(100),
    lead_time_days int,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ingredient_suppliers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ingredient_id uuid NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
    supplier_id uuid NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    supplier_sku varchar(100),
    unit_cost numeric(12, 4),
    unit_id uuid NOT NULL REFERENCES units_of_measure(id) ON DELETE RESTRICT,
    minimum_order_quantity numeric(12, 4),
    is_preferred boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    UNIQUE (ingredient_id, supplier_id)
);

CREATE TABLE IF NOT EXISTS stock_adjustments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id uuid NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    ingredient_id uuid NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
    unit_id uuid NOT NULL REFERENCES units_of_measure(id) ON DELETE RESTRICT,
    adjustment_type varchar(50) NOT NULL,
    quantity numeric(12, 4) NOT NULL,
    quantity_before numeric(12, 4) NOT NULL,
    quantity_after numeric(12, 4) NOT NULL,
    cost_per_unit numeric(12, 4),
    total_cost numeric(12, 4),
    reason text,
    reference_id uuid,
    reference_type varchar(100),
    performed_by uuid,
    notes text,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS purchase_orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id uuid NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    supplier_id uuid NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
    status varchar(50) NOT NULL DEFAULT 'draft',
    order_date timestamptz,
    expected_delivery_date timestamptz,
    actual_delivery_date timestamptz,
    total_amount numeric(12, 2),
    notes text,
    created_by uuid,
    approved_by uuid,
    approved_at timestamptz,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS purchase_order_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id uuid NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    ingredient_id uuid NOT NULL REFERENCES ingredients(id) ON DELETE RESTRICT,
    unit_id uuid NOT NULL REFERENCES units_of_measure(id) ON DELETE RESTRICT,
    ordered_quantity numeric(12, 4) NOT NULL,
    received_quantity numeric(12, 4) DEFAULT 0,
    unit_cost numeric(12, 4) NOT NULL,
    total_cost numeric(12, 4) GENERATED ALWAYS AS (ordered_quantity * unit_cost) STORED,
    notes text,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS menu_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id uuid NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    name varchar(255) NOT NULL,
    description text,
    category varchar(100),
    selling_price numeric(10, 2),
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS menu_item_ingredients (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_item_id uuid NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    ingredient_id uuid NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
    unit_id uuid NOT NULL REFERENCES units_of_measure(id) ON DELETE RESTRICT,
    quantity_required numeric(12, 4) NOT NULL,
    is_optional boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    UNIQUE (menu_item_id, ingredient_id)
);

CREATE TABLE IF NOT EXISTS orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id uuid NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    order_number varchar(100) NOT NULL,
    status varchar(50) NOT NULL DEFAULT 'pending',
    total_amount numeric(12, 2),
    placed_at timestamptz DEFAULT now(),
    completed_at timestamptz,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id uuid NOT NULL REFERENCES menu_items(id) ON DELETE RESTRICT,
    quantity int NOT NULL DEFAULT 1,
    unit_price numeric(10, 2),
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inventory_usage_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id uuid NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    ingredient_id uuid NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
    order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
    order_item_id uuid REFERENCES order_items(id) ON DELETE SET NULL,
    unit_id uuid NOT NULL REFERENCES units_of_measure(id) ON DELETE RESTRICT,
    expected_quantity numeric(12, 4) NOT NULL,
    actual_quantity numeric(12, 4),
    waste_quantity numeric(12, 4) GENERATED ALWAYS AS (
        CASE WHEN actual_quantity IS NOT NULL THEN actual_quantity - expected_quantity ELSE 0 END
    ) STORED,
    cost_per_unit numeric(12, 4),
    waste_cost numeric(12, 4),
    logged_at timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS low_stock_alerts (
    id uuid PRIMARY KEY DEFAULT gen_random_
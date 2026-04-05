-- ONI Generated Migration — Cycle 5
-- Generated: 2026-04-05T11:16:17.614Z

-- Schema for: Inventory and Ingredient Tracking
CREATE TABLE IF NOT EXISTS locations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(255) NOT NULL,
    address text,
    phone varchar(50),
    email varchar(255),
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ingredient_categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(255) NOT NULL,
    description text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS units_of_measure (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(100) NOT NULL,
    abbreviation varchar(20) NOT NULL,
    unit_type varchar(50) NOT NULL CHECK (unit_type IN ('weight', 'volume', 'count', 'length')),
    base_conversion_factor numeric(18, 8) NOT NULL DEFAULT 1,
    base_unit_id uuid REFERENCES units_of_measure(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ingredients (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(255) NOT NULL,
    sku varchar(100) UNIQUE,
    category_id uuid REFERENCES ingredient_categories(id) ON DELETE SET NULL,
    unit_id uuid NOT NULL REFERENCES units_of_measure(id) ON DELETE RESTRICT,
    description text,
    is_allergen boolean DEFAULT false,
    allergen_notes text,
    is_perishable boolean DEFAULT false,
    shelf_life_days integer,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inventory_stock (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id uuid NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    ingredient_id uuid NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
    quantity_on_hand numeric(18, 4) NOT NULL DEFAULT 0,
    quantity_reserved numeric(18, 4) NOT NULL DEFAULT 0,
    quantity_available numeric(18, 4) GENERATED ALWAYS AS (quantity_on_hand - quantity_reserved) STORED,
    reorder_threshold numeric(18, 4) NOT NULL DEFAULT 0,
    critical_threshold numeric(18, 4) NOT NULL DEFAULT 0,
    max_stock_level numeric(18, 4),
    unit_cost numeric(12, 4),
    last_restocked_at timestamptz,
    last_counted_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE (location_id, ingredient_id)
);

CREATE TABLE IF NOT EXISTS stock_alerts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id uuid NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    ingredient_id uuid NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
    alert_type varchar(50) NOT NULL CHECK (alert_type IN ('low_stock', 'critical_stock', 'out_of_stock', 'overstock', 'expiry_warning')),
    alert_status varchar(50) NOT NULL DEFAULT 'active' CHECK (alert_status IN ('active', 'acknowledged', 'resolved', 'snoozed')),
    triggered_at timestamptz NOT NULL DEFAULT now(),
    acknowledged_at timestamptz,
    acknowledged_by uuid,
    resolved_at timestamptz,
    snoozed_until timestamptz,
    quantity_at_trigger numeric(18, 4),
    threshold_at_trigger numeric(18, 4),
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS alert_notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_id uuid NOT NULL REFERENCES stock_alerts(id) ON DELETE CASCADE,
    channel varchar(50) NOT NULL CHECK (channel IN ('email', 'sms', 'push', 'in_app')),
    recipient_identifier varchar(255) NOT NULL,
    sent_at timestamptz,
    delivery_status varchar(50) DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'sent', 'delivered', 'failed')),
    failure_reason text,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS suppliers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(255) NOT NULL,
    contact_name varchar(255),
    phone varchar(50),
    email varchar(255),
    address text,
    payment_terms varchar(100),
    lead_time_days integer,
    is_active boolean DEFAULT true,
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS supplier_ingredients (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id uuid NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    ingredient_id uuid NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
    supplier_sku varchar(100),
    unit_cost numeric(12, 4) NOT NULL,
    minimum_order_quantity numeric(18, 4),
    lead_time_days integer,
    is_preferred boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE (supplier_id, ingredient_id)
);

CREATE TABLE IF NOT EXISTS purchase_orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id uuid NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
    supplier_id uuid NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
    order_number varchar(100) UNIQUE NOT NULL,
    status varchar(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'confirmed', 'partially_received', 'received', 'cancelled')),
    ordered_at timestamptz,
    expected_delivery_at timestamptz,
    received_at timestamptz,
    total_cost numeric(14, 4),
    notes text,
    created_by uuid,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS purchase_order_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id uuid NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    ingredient_id uuid NOT NULL REFERENCES ingredients(id) ON DELETE RESTRICT,
    quantity_ordered numeric(18, 4) NOT NULL,
    quantity_received numeric(18, 4) NOT NULL DEFAULT 0,
    unit_cost numeric(12, 4) NOT NULL,
    total_cost numeric(14, 4) GENERATED ALWAYS AS (quantity_ordered * unit_cost) STORED,
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stock_transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id uuid NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    ingredient_id uuid NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
    transaction_type varchar(50) NOT NULL CHECK (transaction_type IN ('purchase_receipt', 'order_usage', 'manual_adjustment', 'waste', 'transfer_in', 'transfer_out', 'stock_count', 'expiry_disposal', 'return_to_supplier')),
    quantity_change numeric(18, 4) NOT NULL,
    quantity_before numeric(18, 4) NOT NULL,
    quantity_after numeric(18, 4) NOT NULL,
    unit_cost numeric(12, 4),
    reference_id uuid,
    reference_type varchar(100),
    performed_by uuid,
    notes text,
    transaction_date timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS menu_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id uuid REFERENCES locations(id) ON DELETE SET NULL,
    name varchar(255) NOT NULL,
    description text,
    category varchar(100),
    price numeric(10, 2)

-- Schema for: Order Management POS Interface Improvements
CREATE TABLE IF NOT EXISTS locations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(255) NOT NULL,
    slug varchar(100) NOT NULL UNIQUE,
    type varchar(50) NOT NULL CHECK (type IN ('dine_in', 'pickup', 'hybrid')),
    address text,
    phone varchar(50),
    email varchar(255),
    timezone varchar(100) NOT NULL DEFAULT 'UTC',
    is_active boolean NOT NULL DEFAULT true,
    settings jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_locations_slug ON locations(slug);
CREATE INDEX IF NOT EXISTS idx_locations_type ON locations(type);
CREATE INDEX IF NOT EXISTS idx_locations_is_active ON locations(is_active);

CREATE TABLE IF NOT EXISTS location_menus (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id uuid NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    name varchar(255) NOT NULL,
    description text,
    is_active boolean NOT NULL DEFAULT true,
    available_from time,
    available_until time,
    available_days integer[] DEFAULT '{0,1,2,3,4,5,6}',
    display_order integer NOT NULL DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_location_menus_location_id ON location_menus(location_id);
CREATE INDEX IF NOT EXISTS idx_location_menus_is_active ON location_menus(is_active);

CREATE TABLE IF NOT EXISTS menu_categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    location_menu_id uuid NOT NULL REFERENCES location_menus(id) ON DELETE CASCADE,
    name varchar(255) NOT NULL,
    description text,
    image_url text,
    display_order integer NOT NULL DEFAULT 0,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_menu_categories_location_menu_id ON menu_categories(location_menu_id);
CREATE INDEX IF NOT EXISTS idx_menu_categories_is_active ON menu_categories(is_active);

CREATE TABLE IF NOT EXISTS menu_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id uuid NOT NULL REFERENCES menu_categories(id) ON DELETE CASCADE,
    location_id uuid NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    name varchar(255) NOT NULL,
    description text,
    sku varchar(100),
    base_price numeric(10,2) NOT NULL DEFAULT 0.00,
    tax_rate numeric(5,4) NOT NULL DEFAULT 0.0000,
    image_url text,
    is_available boolean NOT NULL DEFAULT true,
    is_featured boolean NOT NULL DEFAULT false,
    prep_time_minutes integer NOT NULL DEFAULT 0,
    calories integer,
    allergens text[],
    tags text[],
    display_order integer NOT NULL DEFAULT 0,
    metadata jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_menu_items_category_id ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_location_id ON menu_items(location_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_is_available ON menu_items(is_available);
CREATE INDEX IF NOT EXISTS idx_menu_items_sku ON menu_items(sku);

CREATE TABLE IF NOT EXISTS menu_item_modifiers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_item_id uuid NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    name varchar(255) NOT NULL,
    type varchar(50) NOT NULL CHECK (type IN ('single', 'multiple', 'text')),
    is_required boolean NOT NULL DEFAULT false,
    min_selections integer NOT NULL DEFAULT 0,
    max_selections integer,
    display_order integer NOT NULL DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_menu_item_modifiers_menu_item_id ON menu_item_modifiers(menu_item_id);

CREATE TABLE IF NOT EXISTS modifier_options (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    modifier_id uuid NOT NULL REFERENCES menu_item_modifiers(id) ON DELETE CASCADE,
    name varchar(255) NOT NULL,
    price_adjustment numeric(10,2) NOT NULL DEFAULT 0.00,
    is_available boolean NOT NULL DEFAULT true,
    display_order integer NOT NULL DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_modifier_options_modifier_id ON modifier_options(modifier_id);

CREATE TABLE IF NOT EXISTS floor_plans (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id uuid NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    name varchar(255) NOT NULL,
    description text,
    width_units integer NOT NULL DEFAULT 100,
    height_units integer NOT NULL DEFAULT 100,
    background_image_url text,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_floor_plans_location_id ON floor_plans(location_id);
CREATE INDEX IF NOT EXISTS idx_floor_plans_is_active ON floor_plans(is_active);

CREATE TABLE IF NOT EXISTS tables (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    floor_plan_id uuid NOT NULL REFERENCES floor_plans(id) ON DELETE CASCADE,
    location_id uuid NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    table_number varchar(50) NOT NULL,
    label varchar(100),
    capacity integer NOT NULL DEFAULT 4,
    shape varchar(50) NOT NULL DEFAULT 'rectangle' CHECK (shape IN ('rectangle', 'circle', 'square', 'custom')),
    pos_x numeric(10,2) NOT NULL DEFAULT 0,
    pos_y numeric(10,2) NOT NULL DEFAULT 0,
    width numeric(10,2) NOT NULL DEFAULT 10,
    height numeric(10,2) NOT NULL DEFAULT 10,
    rotation_degrees integer NOT NULL DEFAULT 0,
    status varchar(50) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved', 'cleaning', 'inactive')),
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE (location_id, table_number)
);

CREATE INDEX IF NOT EXISTS idx_tables_floor_plan_id ON tables(floor_plan_id);
CREATE INDEX IF NOT EXISTS idx_tables_location_id ON tables(location_id);
CREATE INDEX IF NOT EXISTS idx_tables_status ON tables(status);

CREATE TABLE IF NOT EXISTS table_reservations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    table_id uuid NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
    location_id uuid NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    customer_name varchar(255) NOT NULL,
    customer_phone varchar(50),
    customer_email varchar(255),
    party_size integer NOT NULL,
    reserved_at timestamptz NOT NULL,
    reserved_until timestamptz,
    notes text,
    status varchar(50) NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no_show')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_table_reservations_table_id ON table_reservations(table_id);
CREATE INDEX IF NOT EXISTS idx_table_reservations_location_id ON table_reservations(location_id);
CREATE INDEX IF NOT EXISTS idx_table_reservations_reserved_at ON table_reservations(reserved_at);
CREATE INDEX IF NOT EXISTS idx_table_reservations_status ON table_reservations(status);

CREATE TABLE IF NOT EXISTS pickup_queues (
    id uuid PRIMARY KEY DEFAULT gen_random_
-- ONI Generated Migration — Cycle 4
-- Generated: 2026-04-05T11:11:03.067Z

-- Schema for: Multi-Location Dashboard
CREATE TABLE IF NOT EXISTS locations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(255) NOT NULL,
    slug varchar(100) NOT NULL UNIQUE,
    description text,
    address_line1 varchar(255),
    address_line2 varchar(255),
    city varchar(100),
    state varchar(100),
    postal_code varchar(20),
    country varchar(100) DEFAULT 'US',
    phone varchar(30),
    email varchar(255),
    timezone varchar(100) DEFAULT 'UTC',
    currency_code varchar(10) DEFAULT 'USD',
    is_active boolean DEFAULT true,
    opens_at time,
    closes_at time,
    logo_url text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_locations_slug ON locations(slug);
CREATE INDEX IF NOT EXISTS idx_locations_is_active ON locations(is_active);

CREATE TABLE IF NOT EXISTS location_operating_hours (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id uuid NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    day_of_week smallint NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    opens_at time NOT NULL,
    closes_at time NOT NULL,
    is_closed boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE (location_id, day_of_week)
);

CREATE INDEX IF NOT EXISTS idx_location_operating_hours_location_id ON location_operating_hours(location_id);

CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email varchar(255) NOT NULL UNIQUE,
    full_name varchar(255),
    password_hash text,
    role varchar(50) NOT NULL DEFAULT 'staff' CHECK (role IN ('super_admin', 'admin', 'manager', 'staff', 'viewer')),
    is_active boolean DEFAULT true,
    last_login_at timestamptz,
    avatar_url text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE TABLE IF NOT EXISTS user_location_access (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    location_id uuid NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    role varchar(50) NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'manager', 'staff', 'viewer')),
    is_active boolean DEFAULT true,
    granted_at timestamptz DEFAULT now(),
    granted_by uuid REFERENCES users(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE (user_id, location_id)
);

CREATE INDEX IF NOT EXISTS idx_user_location_access_user_id ON user_location_access(user_id);
CREATE INDEX IF NOT EXISTS idx_user_location_access_location_id ON user_location_access(location_id);

CREATE TABLE IF NOT EXISTS user_dashboard_preferences (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    default_location_id uuid REFERENCES locations(id) ON DELETE SET NULL,
    default_view varchar(50) DEFAULT 'combined' CHECK (default_view IN ('combined', 'single')),
    last_selected_location_id uuid REFERENCES locations(id) ON DELETE SET NULL,
    pinned_metrics jsonb DEFAULT '[]',
    layout_config jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_dashboard_preferences_user_id ON user_dashboard_preferences(user_id);

CREATE TABLE IF NOT EXISTS categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id uuid NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    name varchar(255) NOT NULL,
    slug varchar(100) NOT NULL,
    description text,
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE (location_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_categories_location_id ON categories(location_id);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);

CREATE TABLE IF NOT EXISTS menu_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id uuid NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
    name varchar(255) NOT NULL,
    description text,
    sku varchar(100),
    price numeric(10, 2) NOT NULL DEFAULT 0.00,
    cost_price numeric(10, 2),
    image_url text,
    is_available boolean DEFAULT true,
    is_active boolean DEFAULT true,
    preparation_time_minutes integer,
    tags text[],
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_menu_items_location_id ON menu_items(location_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category_id ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_is_available ON menu_items(is_available);
CREATE INDEX IF NOT EXISTS idx_menu_items_is_active ON menu_items(is_active);

CREATE TABLE IF NOT EXISTS inventory_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id uuid NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    name varchar(255) NOT NULL,
    sku varchar(100),
    unit varchar(50) NOT NULL DEFAULT 'unit',
    current_stock numeric(12, 3) NOT NULL DEFAULT 0,
    minimum_stock_threshold numeric(12, 3) NOT NULL DEFAULT 0,
    reorder_quantity numeric(12, 3),
    unit_cost numeric(10, 2),
    supplier_name varchar(255),
    supplier_contact varchar(255),
    is_active boolean DEFAULT true,
    last_restocked_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE (location_id, sku)
);

CREATE INDEX IF NOT EXISTS idx_inventory_items_location_id ON inventory_items(location_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_is_active ON inventory_items(is_active);
CREATE INDEX IF NOT EXISTS idx_inventory_items_current_stock ON inventory_items(current_stock);

CREATE TABLE IF NOT EXISTS low_stock_alerts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id uuid NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    inventory_item_id uuid NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    current_stock numeric(12, 3) NOT NULL,
    minimum_stock_threshold numeric(12, 3) NOT NULL,
    alert_level varchar(50) NOT NULL DEFAULT 'low' CHECK (alert_level IN ('low', 'critical', 'out_of_stock')),
    is_resolved boolean DEFAULT false,
    resolved_at timestamptz,
    resolved_by uuid REFERENCES users(id) ON DELETE SET NULL,
    notified_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_low_stock_alerts_location_id ON low_stock_alerts(location_id);
CREATE INDEX IF NOT EXISTS idx_low_stock_alerts_inventory_item_id ON low_stock_alerts(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_low_stock_alerts_is_resolved ON low_stock_alerts(is_resolved);
CREATE INDEX IF NOT EXISTS idx_low_stock_alerts_alert_level ON low_stock_alerts(alert_level);
CREATE INDEX IF NOT EXISTS idx_low_stock_alerts_created_at ON low_stock_alerts(created_

-- Schema for: Order Management & POS Interface
CREATE TABLE IF NOT EXISTS locations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(255) NOT NULL,
    address text,
    phone varchar(50),
    email varchar(255),
    is_active boolean DEFAULT true,
    timezone varchar(100) DEFAULT 'UTC',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS menu_categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id uuid REFERENCES locations(id) ON DELETE CASCADE,
    name varchar(255) NOT NULL,
    description text,
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS menu_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id uuid NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    category_id uuid REFERENCES menu_categories(id) ON DELETE SET NULL,
    name varchar(255) NOT NULL,
    description text,
    sku varchar(100),
    base_price numeric(10, 2) NOT NULL DEFAULT 0.00,
    tax_rate numeric(5, 4) DEFAULT 0.0000,
    image_url text,
    is_available boolean DEFAULT true,
    is_active boolean DEFAULT true,
    display_order integer DEFAULT 0,
    preparation_time_minutes integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS menu_item_modifiers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_item_id uuid NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    name varchar(255) NOT NULL,
    price_adjustment numeric(10, 2) DEFAULT 0.00,
    is_required boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS menu_item_modifier_options (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    modifier_id uuid NOT NULL REFERENCES menu_item_modifiers(id) ON DELETE CASCADE,
    label varchar(255) NOT NULL,
    price_adjustment numeric(10, 2) DEFAULT 0.00,
    is_default boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id uuid NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
    order_number varchar(50) NOT NULL,
    order_type varchar(20) NOT NULL CHECK (order_type IN ('dine_in', 'takeaway')),
    status varchar(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'completed', 'cancelled')),
    table_number varchar(50),
    customer_name varchar(255),
    customer_phone varchar(50),
    customer_email varchar(255),
    subtotal numeric(10, 2) NOT NULL DEFAULT 0.00,
    tax_total numeric(10, 2) NOT NULL DEFAULT 0.00,
    discount_total numeric(10, 2) NOT NULL DEFAULT 0.00,
    grand_total numeric(10, 2) NOT NULL DEFAULT 0.00,
    notes text,
    placed_at timestamptz DEFAULT now(),
    preparing_at timestamptz,
    ready_at timestamptz,
    completed_at timestamptz,
    cancelled_at timestamptz,
    cancellation_reason text,
    created_by uuid,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT order_number_location_unique UNIQUE (location_id, order_number)
);

CREATE TABLE IF NOT EXISTS order_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id uuid NOT NULL REFERENCES menu_items(id) ON DELETE RESTRICT,
    menu_item_name varchar(255) NOT NULL,
    quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price numeric(10, 2) NOT NULL,
    tax_rate numeric(5, 4) DEFAULT 0.0000,
    tax_amount numeric(10, 2) DEFAULT 0.00,
    discount_amount numeric(10, 2) DEFAULT 0.00,
    line_total numeric(10, 2) NOT NULL,
    special_instructions text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_item_modifier_selections (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_item_id uuid NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
    modifier_id uuid REFERENCES menu_item_modifiers(id) ON DELETE SET NULL,
    modifier_option_id uuid REFERENCES menu_item_modifier_options(id) ON DELETE SET NULL,
    modifier_name varchar(255) NOT NULL,
    option_label varchar(255) NOT NULL,
    price_adjustment numeric(10, 2) DEFAULT 0.00,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_status_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    previous_status varchar(20),
    new_status varchar(20) NOT NULL,
    changed_by uuid,
    notes text,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS receipts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    location_id uuid NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
    receipt_number varchar(100) NOT NULL UNIQUE,
    subtotal numeric(10, 2) NOT NULL,
    tax_total numeric(10, 2) NOT NULL,
    discount_total numeric(10, 2) NOT NULL DEFAULT 0.00,
    grand_total numeric(10, 2) NOT NULL,
    payment_method varchar(50),
    payment_reference varchar(255),
    payment_status varchar(20) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded', 'partially_refunded')),
    amount_paid numeric(10, 2) DEFAULT 0.00,
    change_given numeric(10, 2) DEFAULT 0.00,
    issued_at timestamptz DEFAULT now(),
    voided_at timestamptz,
    void_reason text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS receipt_line_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_id uuid NOT NULL REFERENCES receipts(id) ON DELETE CASCADE,
    description text NOT NULL,
    quantity integer NOT NULL,
    unit_price numeric(10, 2) NOT NULL,
    line_total numeric(10, 2) NOT NULL,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS discounts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id uuid REFERENCES locations(id) ON DELETE CASCADE,
    name varchar(255) NOT NULL,
    code varchar(100),
    discount_type varchar(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
    discount_value numeric(10, 2) NOT NULL,
    min_order_amount numeric(10, 2) DEFAULT 0.00,
    is_active boolean DEFAULT true,
    valid_from timestamptz,
    valid_until timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_discounts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    discount_id uuid REFERENCES discounts(id) ON DELETE SET NULL,
    discount_name varchar(255) NOT NULL,
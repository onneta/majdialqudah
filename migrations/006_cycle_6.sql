-- ONI Generated Migration — Cycle 6
-- Generated: 2026-04-05T11:21:15.533Z

-- Schema for: Real-Time Inventory Alerts & Low Stock Notifications
CREATE TABLE IF NOT EXISTS locations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(255) NOT NULL,
    address text,
    phone varchar(50),
    email varchar(255),
    is_active boolean NOT NULL DEFAULT true,
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
    unit_type varchar(50) NOT NULL,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ingredients (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(255) NOT NULL,
    description text,
    category_id uuid REFERENCES ingredient_categories(id) ON DELETE SET NULL,
    unit_of_measure_id uuid NOT NULL REFERENCES units_of_measure(id) ON DELETE RESTRICT,
    sku varchar(100),
    barcode varchar(100),
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inventory_stock (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ingredient_id uuid NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
    location_id uuid NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    current_quantity numeric(12, 4) NOT NULL DEFAULT 0,
    reserved_quantity numeric(12, 4) NOT NULL DEFAULT 0,
    available_quantity numeric(12, 4) GENERATED ALWAYS AS (current_quantity - reserved_quantity) STORED,
    last_counted_at timestamptz,
    last_restocked_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT uq_ingredient_location UNIQUE (ingredient_id, location_id),
    CONSTRAINT chk_current_quantity_non_negative CHECK (current_quantity >= 0),
    CONSTRAINT chk_reserved_quantity_non_negative CHECK (reserved_quantity >= 0)
);

CREATE TABLE IF NOT EXISTS stock_thresholds (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ingredient_id uuid NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
    location_id uuid NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    low_stock_threshold numeric(12, 4) NOT NULL,
    critical_stock_threshold numeric(12, 4) NOT NULL,
    reorder_point numeric(12, 4) NOT NULL,
    reorder_quantity numeric(12, 4) NOT NULL,
    max_stock_level numeric(12, 4),
    lead_time_days integer NOT NULL DEFAULT 1,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT uq_threshold_ingredient_location UNIQUE (ingredient_id, location_id),
    CONSTRAINT chk_critical_lte_low CHECK (critical_stock_threshold <= low_stock_threshold),
    CONSTRAINT chk_reorder_point_positive CHECK (reorder_point > 0),
    CONSTRAINT chk_reorder_quantity_positive CHECK (reorder_quantity > 0),
    CONSTRAINT chk_lead_time_positive CHECK (lead_time_days > 0)
);

CREATE TABLE IF NOT EXISTS alert_severity_levels (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(50) NOT NULL UNIQUE,
    display_label varchar(100) NOT NULL,
    color_hex varchar(7),
    priority_order integer NOT NULL,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS alert_types (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code varchar(100) NOT NULL UNIQUE,
    name varchar(255) NOT NULL,
    description text,
    default_severity_id uuid REFERENCES alert_severity_levels(id) ON DELETE SET NULL,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inventory_alerts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ingredient_id uuid NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
    location_id uuid NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    alert_type_id uuid NOT NULL REFERENCES alert_types(id) ON DELETE RESTRICT,
    severity_id uuid NOT NULL REFERENCES alert_severity_levels(id) ON DELETE RESTRICT,
    stock_quantity_at_alert numeric(12, 4) NOT NULL,
    threshold_value numeric(12, 4),
    message text NOT NULL,
    is_active boolean NOT NULL DEFAULT true,
    is_acknowledged boolean NOT NULL DEFAULT false,
    acknowledged_by uuid,
    acknowledged_at timestamptz,
    acknowledgement_note text,
    resolved_at timestamptz,
    resolved_by uuid,
    resolution_note text,
    auto_resolved boolean NOT NULL DEFAULT false,
    triggered_at timestamptz NOT NULL DEFAULT now(),
    expires_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reorder_suggestions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_alert_id uuid REFERENCES inventory_alerts(id) ON DELETE SET NULL,
    ingredient_id uuid NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
    location_id uuid NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    suggested_quantity numeric(12, 4) NOT NULL,
    current_stock numeric(12, 4) NOT NULL,
    reorder_point numeric(12, 4) NOT NULL,
    estimated_days_until_stockout integer,
    average_daily_usage numeric(12, 4),
    status varchar(50) NOT NULL DEFAULT 'pending',
    approved_by uuid,
    approved_at timestamptz,
    rejected_by uuid,
    rejected_at timestamptz,
    rejection_reason text,
    ordered_at timestamptz,
    order_reference varchar(255),
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT chk_reorder_status CHECK (status IN ('pending', 'approved', 'rejected', 'ordered', 'fulfilled', 'cancelled'))
);

CREATE TABLE IF NOT EXISTS notification_channels (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(100) NOT NULL UNIQUE,
    channel_type varchar(50) NOT NULL,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz DEFAULT now(),
    CONSTRAINT chk_channel_type CHECK (channel_type IN ('email', 'sms', 'push', 'in_app', 'webhook', 'slack'))
);

CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name varchar(255) NOT NULL,
    email varchar(255) NOT NULL UNIQUE,
    phone varchar(50),
    role varchar(100) NOT NULL,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_location_assignments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    location_id uuid NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    CONSTRAINT uq_user_location UNIQUE (user_id, location_id)
);

CREATE TABLE IF NOT EXISTS notification_subscriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    location_id uuid REFERENCES locations(id) ON DELETE CASCADE,
    alert_type_id uuid REFERENCES alert_types(id) ON DELETE CASCADE,
    severity_id uuid REFERENCES alert_severity_levels(id) ON DELETE CASCADE,
    channel_id uuid NOT NULL REFERENCES notification
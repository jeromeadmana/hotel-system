-- Hotel Management System Database Schema (UUID v2 with Room Templates)
-- Implements Room Template architecture for scalable room management

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS email_notifications;
DROP TABLE IF EXISTS check_in_out_logs;
DROP TABLE IF EXISTS housekeeping_tasks;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS room_rates;
DROP TABLE IF EXISTS rooms;
DROP TABLE IF EXISTS room_templates;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS locations;

-- ============================================================================
-- LOCATIONS TABLE
-- ============================================================================
CREATE TABLE locations (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100),
  country VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20),
  phone VARCHAR(20),
  email VARCHAR(255),
  timezone VARCHAR(50) DEFAULT 'UTC',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_city (city),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- USERS TABLE (with dual ID system)
-- ============================================================================
CREATE TABLE users (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_code VARCHAR(30) UNIQUE NOT NULL COMMENT 'User-friendly display ID',
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  role ENUM('super_admin', 'admin', 'staff', 'customer') NOT NULL,
  location_id CHAR(36) NULL COMMENT 'NULL for super_admin and customers',
  is_active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL,
  FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL,
  INDEX idx_user_code (user_code),
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_location_id (location_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- ROOM_TEMPLATES TABLE (Internal blueprints - Admin only)
-- ============================================================================
CREATE TABLE room_templates (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  template_code VARCHAR(30) UNIQUE NOT NULL COMMENT 'Template display code (e.g., TMPL-DELUXE-NY)',
  location_id CHAR(36) NOT NULL,
  template_name VARCHAR(200) NOT NULL COMMENT 'Internal name (e.g., "Deluxe Ocean View Template")',
  public_name VARCHAR(200) NOT NULL COMMENT 'Public display name (e.g., "Deluxe Ocean View Suite")',
  room_type ENUM('single', 'double', 'suite', 'deluxe', 'family', 'executive', 'penthouse') NOT NULL,
  description TEXT,
  long_description TEXT COMMENT 'Detailed room description',
  max_occupancy INT NOT NULL,
  bed_type VARCHAR(100) COMMENT 'e.g., "1 King Bed" or "2 Queen Beds"',
  size_sqft INT,
  amenities JSON COMMENT 'Array of amenities: ["WiFi", "Smart TV", "Mini Bar", etc.]',
  images JSON COMMENT 'Array of image objects: [{"url": "...", "caption": "...", "order": 1}]',
  policies JSON COMMENT 'Room policies: {"check_in": "15:00", "check_out": "11:00", "smoking": false}',
  base_price DECIMAL(10, 2) COMMENT 'Default base price for rooms created from this template',
  is_active BOOLEAN DEFAULT TRUE,
  created_by CHAR(36) NOT NULL COMMENT 'User who created the template',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_template_code (template_code),
  INDEX idx_location_id (location_id),
  INDEX idx_room_type (room_type),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- ROOMS TABLE (Public bookable rooms created from templates)
-- ============================================================================
CREATE TABLE rooms (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  room_code VARCHAR(30) UNIQUE NOT NULL COMMENT 'Room display code (e.g., ROOM-405-NY)',
  template_id CHAR(36) NULL COMMENT 'Source template - NULL if custom room',
  location_id CHAR(36) NOT NULL,
  room_number VARCHAR(50) NOT NULL COMMENT 'Physical room number (e.g., 405)',
  public_name VARCHAR(200) NOT NULL COMMENT 'Public-facing name (e.g., "Jupiter Room - 4th Floor")',
  floor_number INT,

  -- Room Type (inherited from template, can be overridden)
  room_type ENUM('single', 'double', 'suite', 'deluxe', 'family', 'executive', 'penthouse') NOT NULL,

  -- Capacity & Bed Info (inherited from template, can be overridden)
  max_occupancy INT NOT NULL,
  bed_type VARCHAR(100),
  size_sqft INT,

  -- Content (inherited from template, can be overridden)
  description TEXT,
  long_description TEXT,
  amenities JSON COMMENT 'Room-specific amenities - inherits from template if NULL',
  images JSON COMMENT 'Room-specific images - inherits from template if NULL',
  policies JSON COMMENT 'Room-specific policies - inherits from template if NULL',

  -- Override flags (track which fields are customized)
  override_flags JSON COMMENT '{"description": true, "amenities": false, "images": true, ...}',

  -- Operational Status
  status ENUM('available', 'occupied', 'maintenance', 'cleaning', 'reserved', 'out_of_service') DEFAULT 'available',
  is_active BOOLEAN DEFAULT TRUE,
  is_public BOOLEAN DEFAULT TRUE COMMENT 'If false, room is hidden from public listings',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (template_id) REFERENCES room_templates(id) ON DELETE SET NULL,
  FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
  UNIQUE KEY unique_room_per_location (location_id, room_number),
  INDEX idx_room_code (room_code),
  INDEX idx_template_id (template_id),
  INDEX idx_location_id (location_id),
  INDEX idx_room_type (room_type),
  INDEX idx_status (status),
  INDEX idx_is_public (is_public)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- ROOM_RATES TABLE (Pricing for bookable rooms)
-- ============================================================================
CREATE TABLE room_rates (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  room_id CHAR(36) NOT NULL,
  rate_type ENUM('base', 'weekend', 'holiday', 'seasonal', 'promotional') DEFAULT 'base',
  price DECIMAL(10, 2) NOT NULL,
  valid_from DATE NULL,
  valid_to DATE NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  INDEX idx_room_id (room_id),
  INDEX idx_rate_type (rate_type),
  INDEX idx_validity (valid_from, valid_to)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- BOOKINGS TABLE
-- ============================================================================
CREATE TABLE bookings (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  booking_reference VARCHAR(30) UNIQUE NOT NULL,
  room_id CHAR(36) NOT NULL,
  user_id CHAR(36) NULL COMMENT 'NULL for guest bookings',
  guest_name VARCHAR(200) NULL,
  guest_email VARCHAR(255) NULL,
  guest_phone VARCHAR(20) NULL,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  num_guests INT NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  downpayment_amount DECIMAL(10, 2) NOT NULL,
  balance_amount DECIMAL(10, 2) NOT NULL,
  special_requests TEXT,
  status ENUM('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled') DEFAULT 'pending',
  booked_by CHAR(36) NULL,
  is_cross_location BOOLEAN DEFAULT FALSE,
  cross_location_fee DECIMAL(10, 2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (booked_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_booking_reference (booking_reference),
  INDEX idx_room_id (room_id),
  INDEX idx_user_id (user_id),
  INDEX idx_guest_email (guest_email),
  INDEX idx_check_in_date (check_in_date),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- PAYMENTS TABLE
-- ============================================================================
CREATE TABLE payments (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  payment_reference VARCHAR(30) UNIQUE NOT NULL,
  booking_id CHAR(36) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method ENUM('credit_card', 'debit_card', 'cash', 'bank_transfer', 'stripe') NOT NULL,
  payment_type ENUM('downpayment', 'full_payment', 'partial_payment', 'balance') NOT NULL,
  stripe_payment_intent_id VARCHAR(255) NULL,
  stripe_charge_id VARCHAR(255) NULL,
  status ENUM('pending', 'processing', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  INDEX idx_payment_reference (payment_reference),
  INDEX idx_booking_id (booking_id),
  INDEX idx_status (status),
  INDEX idx_transaction_date (transaction_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- HOUSEKEEPING_TASKS TABLE
-- ============================================================================
CREATE TABLE housekeeping_tasks (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  task_code VARCHAR(30) UNIQUE NOT NULL,
  room_id CHAR(36) NOT NULL,
  assigned_to CHAR(36) NULL,
  task_type ENUM('cleaning', 'maintenance', 'inspection', 'setup') NOT NULL,
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  description TEXT,
  status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
  scheduled_date DATE,
  completed_at TIMESTAMP NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_task_code (task_code),
  INDEX idx_room_id (room_id),
  INDEX idx_assigned_to (assigned_to),
  INDEX idx_status (status),
  INDEX idx_scheduled_date (scheduled_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- CHECK_IN_OUT_LOGS TABLE
-- ============================================================================
CREATE TABLE check_in_out_logs (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  booking_id CHAR(36) NOT NULL,
  action ENUM('check_in', 'check_out') NOT NULL,
  performed_by CHAR(36) NOT NULL,
  action_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (performed_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_booking_id (booking_id),
  INDEX idx_action (action),
  INDEX idx_action_time (action_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- EMAIL_NOTIFICATIONS TABLE
-- ============================================================================
CREATE TABLE email_notifications (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  recipient_email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  email_type ENUM('booking_confirmation', 'payment_confirmation', 'check_in_reminder', 'check_out_reminder', 'password_reset', 'account_verification') NOT NULL,
  related_booking_id CHAR(36) NULL,
  status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
  sent_at TIMESTAMP NULL,
  error_message TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (related_booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
  INDEX idx_recipient_email (recipient_email),
  INDEX idx_email_type (email_type),
  INDEX idx_status (status),
  INDEX idx_sent_at (sent_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- AUDIT_LOGS TABLE
-- ============================================================================
CREATE TABLE audit_logs (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id CHAR(36) NULL,
  old_values JSON NULL,
  new_values JSON NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_action (action),
  INDEX idx_entity_type (entity_type),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

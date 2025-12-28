-- Hotel Management System Database Schema (UUID Version)
-- MySQL Database Schema with UUID primary keys and user-friendly display IDs

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS email_notifications;
DROP TABLE IF EXISTS check_in_out_logs;
DROP TABLE IF EXISTS housekeeping_tasks;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS room_rates;
DROP TABLE IF EXISTS rooms;
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
  user_code VARCHAR(30) UNIQUE NOT NULL COMMENT 'User-friendly display ID (e.g., CUST-A7F2, STAFF-B3K9)',
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
-- ROOMS TABLE
-- ============================================================================
CREATE TABLE rooms (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  room_code VARCHAR(30) UNIQUE NOT NULL COMMENT 'Room display code (e.g., ROOM-101-NY)',
  location_id CHAR(36) NOT NULL,
  room_number VARCHAR(50) NOT NULL,
  room_type ENUM('single', 'double', 'suite', 'deluxe', 'family', 'executive') NOT NULL,
  floor_number INT,
  max_occupancy INT NOT NULL,
  bed_type VARCHAR(50),
  size_sqft INT,
  description TEXT,
  amenities JSON COMMENT 'Array of amenities: ["wifi", "tv", "minibar", "balcony"]',
  images JSON COMMENT 'Array of image URLs: ["url1", "url2"]',
  status ENUM('available', 'occupied', 'maintenance', 'cleaning', 'reserved') DEFAULT 'available',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
  UNIQUE KEY unique_room_per_location (location_id, room_number),
  INDEX idx_room_code (room_code),
  INDEX idx_location_id (location_id),
  INDEX idx_room_type (room_type),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- ROOM_RATES TABLE
-- ============================================================================
CREATE TABLE room_rates (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  room_id CHAR(36) NOT NULL,
  rate_type ENUM('base', 'weekend', 'holiday', 'seasonal') DEFAULT 'base',
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
  booking_reference VARCHAR(30) UNIQUE NOT NULL COMMENT 'User-friendly booking reference (e.g., BK20250128-A7F2)',
  room_id CHAR(36) NOT NULL,
  user_id CHAR(36) NULL COMMENT 'NULL for guest bookings',
  guest_name VARCHAR(200) NULL COMMENT 'Required for guest bookings',
  guest_email VARCHAR(255) NULL COMMENT 'Required for guest bookings',
  guest_phone VARCHAR(20) NULL COMMENT 'Required for guest bookings',
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  num_guests INT NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  downpayment_amount DECIMAL(10, 2) NOT NULL,
  balance_amount DECIMAL(10, 2) NOT NULL,
  special_requests TEXT,
  status ENUM('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled') DEFAULT 'pending',
  booked_by CHAR(36) NULL COMMENT 'Staff user who created the booking (for staff-assisted bookings)',
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
  payment_reference VARCHAR(30) UNIQUE NOT NULL COMMENT 'User-friendly payment reference (e.g., PAY20250128-XYZ9)',
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
  task_code VARCHAR(30) UNIQUE NOT NULL COMMENT 'Task display code',
  room_id CHAR(36) NOT NULL,
  assigned_to CHAR(36) NULL COMMENT 'Staff user assigned to the task',
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
  performed_by CHAR(36) NOT NULL COMMENT 'Staff user who performed the action',
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
  user_id CHAR(36) NULL COMMENT 'NULL for system actions',
  action VARCHAR(100) NOT NULL COMMENT 'e.g., CREATE_BOOKING, UPDATE_ROOM, DELETE_USER',
  entity_type VARCHAR(50) NOT NULL COMMENT 'e.g., booking, room, user',
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

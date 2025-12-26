-- Hotel Management System Database Schema
-- MySQL Database Schema for Multi-Location Hotel Management

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
  id INT PRIMARY KEY AUTO_INCREMENT,
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
-- USERS TABLE
-- ============================================================================
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  role ENUM('super_admin', 'admin', 'staff', 'customer') NOT NULL,
  location_id INT NULL COMMENT 'NULL for super_admin and customers',
  is_active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL,
  FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL,
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_location_id (location_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- ROOMS TABLE
-- ============================================================================
CREATE TABLE rooms (
  id INT PRIMARY KEY AUTO_INCREMENT,
  location_id INT NOT NULL,
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
  INDEX idx_location_id (location_id),
  INDEX idx_status (status),
  INDEX idx_room_type (room_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- ROOM RATES TABLE
-- ============================================================================
CREATE TABLE room_rates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  room_id INT NOT NULL,
  rate_type ENUM('base', 'weekend', 'seasonal', 'special') DEFAULT 'base',
  price DECIMAL(10, 2) NOT NULL,
  start_date DATE NULL COMMENT 'NULL for base rates',
  end_date DATE NULL COMMENT 'NULL for base rates',
  is_active BOOLEAN DEFAULT TRUE,
  created_by INT NOT NULL COMMENT 'User ID who created the rate',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX idx_room_id (room_id),
  INDEX idx_dates (start_date, end_date),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- BOOKINGS TABLE
-- ============================================================================
CREATE TABLE bookings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  booking_reference VARCHAR(50) UNIQUE NOT NULL COMMENT 'Format: BK20250127-ABCD',
  room_id INT NOT NULL,
  location_id INT NOT NULL COMMENT 'Denormalized for quick queries',
  user_id INT NULL COMMENT 'NULL for guest bookings',
  guest_email VARCHAR(255) NOT NULL,
  guest_first_name VARCHAR(100) NOT NULL,
  guest_last_name VARCHAR(100) NOT NULL,
  guest_phone VARCHAR(20),
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  number_of_guests INT NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  downpayment_amount DECIMAL(10, 2) NOT NULL,
  downpayment_percentage INT NOT NULL COMMENT '20 or 50',
  remaining_amount DECIMAL(10, 2) NOT NULL,
  reservation_fee DECIMAL(10, 2) DEFAULT 0 COMMENT 'For cross-location bookings',
  booking_type ENUM('registered_user', 'guest', 'staff_assisted', 'super_admin_reserved') NOT NULL,
  booking_status ENUM('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show') DEFAULT 'pending',
  special_requests TEXT,
  created_by_staff_id INT NULL COMMENT 'For staff-assisted bookings',
  is_cross_location BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  cancelled_at TIMESTAMP NULL,
  FOREIGN KEY (room_id) REFERENCES rooms(id),
  FOREIGN KEY (location_id) REFERENCES locations(id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by_staff_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_booking_reference (booking_reference),
  INDEX idx_room_id (room_id),
  INDEX idx_location_id (location_id),
  INDEX idx_user_id (user_id),
  INDEX idx_guest_email (guest_email),
  INDEX idx_dates (check_in_date, check_out_date),
  INDEX idx_status (booking_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- PAYMENTS TABLE
-- ============================================================================
CREATE TABLE payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  booking_id INT NOT NULL,
  payment_type ENUM('downpayment', 'remaining', 'full', 'refund', 'reservation_fee') NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  payment_method ENUM('stripe', 'cash', 'bank_transfer', 'other') NOT NULL,
  stripe_payment_intent_id VARCHAR(255),
  stripe_charge_id VARCHAR(255),
  payment_status ENUM('pending', 'processing', 'succeeded', 'failed', 'refunded') DEFAULT 'pending',
  transaction_reference VARCHAR(255),
  paid_at TIMESTAMP NULL,
  refunded_at TIMESTAMP NULL,
  refund_amount DECIMAL(10, 2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  INDEX idx_booking_id (booking_id),
  INDEX idx_payment_status (payment_status),
  INDEX idx_stripe_payment_intent_id (stripe_payment_intent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- HOUSEKEEPING TASKS TABLE
-- ============================================================================
CREATE TABLE housekeeping_tasks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  room_id INT NOT NULL,
  location_id INT NOT NULL,
  task_type ENUM('daily_cleaning', 'checkout_cleaning', 'deep_cleaning', 'maintenance', 'inspection') NOT NULL,
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  assigned_to_user_id INT NULL,
  status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
  description TEXT,
  notes TEXT,
  scheduled_date DATE NOT NULL,
  started_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  created_by_user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to_user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by_user_id) REFERENCES users(id),
  INDEX idx_room_id (room_id),
  INDEX idx_location_id (location_id),
  INDEX idx_assigned_to (assigned_to_user_id),
  INDEX idx_status (status),
  INDEX idx_scheduled_date (scheduled_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- CHECK-IN/CHECK-OUT LOGS TABLE
-- ============================================================================
CREATE TABLE check_in_out_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  booking_id INT NOT NULL,
  action_type ENUM('check_in', 'check_out') NOT NULL,
  performed_by_user_id INT NOT NULL,
  action_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  guest_signature TEXT COMMENT 'Base64 encoded signature or path',
  id_verification_type VARCHAR(50),
  id_verification_number VARCHAR(100),
  deposit_collected DECIMAL(10, 2),
  keys_issued INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (performed_by_user_id) REFERENCES users(id),
  INDEX idx_booking_id (booking_id),
  INDEX idx_action_type (action_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- EMAIL NOTIFICATIONS LOG TABLE
-- ============================================================================
CREATE TABLE email_notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  booking_id INT NULL,
  user_id INT NULL,
  recipient_email VARCHAR(255) NOT NULL,
  email_type ENUM('booking_confirmation', 'payment_confirmation', 'check_in_reminder',
                  'check_out_reminder', 'booking_cancellation', 'password_reset', 'welcome') NOT NULL,
  subject VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
  sent_at TIMESTAMP NULL,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_booking_id (booking_id),
  INDEX idx_recipient_email (recipient_email),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- AUDIT LOGS TABLE
-- ============================================================================
CREATE TABLE audit_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL COMMENT 'booking, room, user, etc.',
  entity_id INT NOT NULL,
  old_values JSON,
  new_values JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- SEED DATA FOR DEVELOPMENT
-- ============================================================================

-- Insert sample location
INSERT INTO locations (name, address, city, state, country, postal_code, phone, email, timezone)
VALUES
  ('Grand Hotel Downtown', '123 Main Street', 'New York', 'NY', 'USA', '10001', '+1-212-555-0100', 'downtown@grandhotel.com', 'America/New_York'),
  ('Grand Hotel Paris', '456 Champs-Élysées', 'Paris', 'Île-de-France', 'France', '75008', '+33-1-2345-6789', 'paris@grandhotel.com', 'Europe/Paris');

-- Note: Password for all users is 'password123' (hashed with bcrypt)
-- Hash: $2a$10$rYqE8K5XqJ9YqZ9YqZ9YqO7xK5XqJ9YqZ9YqZ9YqZ9YqZ9YqZ9Yq (example, will need actual hash)

-- Insert super admin (password will be 'password123')
-- Note: You'll need to generate actual bcrypt hash when implementing
INSERT INTO users (email, password_hash, first_name, last_name, phone, role, location_id, email_verified)
VALUES
  ('superadmin@hotel.com', '$2a$10$placeholder', 'Super', 'Admin', '+1-555-0001', 'super_admin', NULL, TRUE);

-- Insert admin for New York location
INSERT INTO users (email, password_hash, first_name, last_name, phone, role, location_id, email_verified)
VALUES
  ('admin.ny@hotel.com', '$2a$10$placeholder', 'John', 'Admin', '+1-555-0002', 'admin', 1, TRUE);

-- Insert staff for New York location
INSERT INTO users (email, password_hash, first_name, last_name, phone, role, location_id, email_verified)
VALUES
  ('staff.ny@hotel.com', '$2a$10$placeholder', 'Jane', 'Staff', '+1-555-0003', 'staff', 1, TRUE);

-- Insert sample customer
INSERT INTO users (email, password_hash, first_name, last_name, phone, role, location_id, email_verified)
VALUES
  ('customer@example.com', '$2a$10$placeholder', 'Bob', 'Customer', '+1-555-0004', 'customer', NULL, TRUE);

-- Insert sample rooms for New York location
INSERT INTO rooms (location_id, room_number, room_type, floor_number, max_occupancy, bed_type, size_sqft, description, amenities, status)
VALUES
  (1, '101', 'single', 1, 1, 'Twin', 250, 'Cozy single room with city view', '["wifi", "tv", "air_conditioning"]', 'available'),
  (1, '102', 'double', 1, 2, 'Queen', 350, 'Comfortable double room', '["wifi", "tv", "air_conditioning", "minibar"]', 'available'),
  (1, '201', 'suite', 2, 4, 'King', 600, 'Luxury suite with separate living area', '["wifi", "tv", "air_conditioning", "minibar", "balcony", "jacuzzi"]', 'available'),
  (1, '202', 'deluxe', 2, 2, 'King', 450, 'Deluxe room with premium amenities', '["wifi", "tv", "air_conditioning", "minibar", "balcony"]', 'available'),
  (1, '301', 'family', 3, 5, 'Multiple', 550, 'Family room with two bedrooms', '["wifi", "tv", "air_conditioning", "minibar", "kitchenette"]', 'available');

-- Insert sample rooms for Paris location
INSERT INTO rooms (location_id, room_number, room_type, floor_number, max_occupancy, bed_type, size_sqft, description, amenities, status)
VALUES
  (2, '101', 'single', 1, 1, 'Twin', 220, 'Charming single room with Parisian style', '["wifi", "tv", "air_conditioning"]', 'available'),
  (2, '201', 'suite', 2, 4, 'King', 700, 'Luxury suite with Eiffel Tower view', '["wifi", "tv", "air_conditioning", "minibar", "balcony", "jacuzzi"]', 'available');

-- Insert base rates for rooms (created by admin user ID 2)
INSERT INTO room_rates (room_id, rate_type, price, created_by)
VALUES
  (1, 'base', 99.99, 2),
  (2, 'base', 149.99, 2),
  (3, 'base', 299.99, 2),
  (4, 'base', 199.99, 2),
  (5, 'base', 249.99, 2),
  (6, 'base', 89.99, 1),
  (7, 'base', 399.99, 1);

-- Insert a sample booking
INSERT INTO bookings (
  booking_reference, room_id, location_id, user_id, guest_email, guest_first_name,
  guest_last_name, guest_phone, check_in_date, check_out_date, number_of_guests,
  total_amount, downpayment_amount, downpayment_percentage, remaining_amount,
  booking_type, booking_status
) VALUES (
  'BK20250127-ABC1', 2, 1, 4, 'customer@example.com', 'Bob', 'Customer',
  '+1-555-0004', '2025-02-01', '2025-02-03', 2, 299.98, 59.99, 20, 239.99,
  'registered_user', 'pending'
);

-- ============================================================================
-- NOTES
-- ============================================================================
-- 1. Remember to update password hashes with actual bcrypt hashes during implementation
-- 2. The placeholders '$2a$10$placeholder' need to be replaced with real hashes
-- 3. To generate hash in Node.js: const bcrypt = require('bcryptjs'); bcrypt.hash('password123', 10)
-- 4. JSON fields (amenities, images) are stored as JSON strings in MySQL
-- 5. All foreign keys have appropriate ON DELETE actions (CASCADE or SET NULL)
-- 6. Indexes are added for frequently queried columns to improve performance

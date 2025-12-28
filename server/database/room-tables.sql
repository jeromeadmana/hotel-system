-- Room Management Tables SQL
-- Run this script directly on your Aiven MySQL database

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id INT PRIMARY KEY AUTO_INCREMENT,
  location_id INT NOT NULL,
  room_number VARCHAR(50) NOT NULL,
  room_type ENUM('single', 'double', 'suite', 'deluxe', 'family', 'executive') NOT NULL,
  floor_number INT,
  max_occupancy INT NOT NULL,
  bed_type VARCHAR(50),
  size_sqft INT,
  description TEXT,
  amenities JSON,
  images JSON,
  status ENUM('available', 'occupied', 'maintenance', 'cleaning', 'reserved') DEFAULT 'available',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
  UNIQUE KEY unique_room_per_location (location_id, room_number),
  INDEX idx_location_id (location_id),
  INDEX idx_status (status),
  INDEX idx_room_type (room_type)
);

-- Create room_rates table
CREATE TABLE IF NOT EXISTS room_rates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  room_id INT NOT NULL,
  rate_type ENUM('base', 'weekend', 'seasonal', 'special') DEFAULT 'base',
  price DECIMAL(10, 2) NOT NULL,
  start_date DATE NULL,
  end_date DATE NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX idx_room_id (room_id),
  INDEX idx_dates (start_date, end_date),
  INDEX idx_is_active (is_active)
);

-- Insert sample rooms
INSERT INTO rooms (location_id, room_number, room_type, floor_number, max_occupancy, bed_type, size_sqft, description, amenities, status)
VALUES
  (1, '101', 'single', 1, 1, 'Twin', 250, 'Cozy single room with city view', '["wifi", "tv", "air_conditioning"]', 'available'),
  (1, '102', 'double', 1, 2, 'Queen', 350, 'Comfortable double room', '["wifi", "tv", "air_conditioning", "minibar"]', 'available'),
  (1, '201', 'suite', 2, 4, 'King', 600, 'Luxury suite with separate living area', '["wifi", "tv", "air_conditioning", "minibar", "balcony", "jacuzzi"]', 'available'),
  (1, '202', 'deluxe', 2, 2, 'King', 450, 'Deluxe room with premium amenities', '["wifi", "tv", "air_conditioning", "minibar", "balcony"]', 'available'),
  (1, '301', 'family', 3, 5, 'Multiple', 550, 'Family room with two bedrooms', '["wifi", "tv", "air_conditioning", "minibar", "kitchenette"]', 'available');

-- Insert base rates (created by admin user ID 2)
INSERT INTO room_rates (room_id, rate_type, price, created_by)
VALUES
  (1, 'base', 99.99, 2),
  (2, 'base', 149.99, 2),
  (3, 'base', 299.99, 2),
  (4, 'base', 199.99, 2),
  (5, 'base', 249.99, 2);

-- Verify rooms created
SELECT room_number, room_type, status FROM rooms;

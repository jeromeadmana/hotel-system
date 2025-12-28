const db = require('../config/db');
require('dotenv').config();

async function createBookingTables() {
  try {
    console.log('🔄 Creating booking and payment tables...\n');

    // Create bookings table
    console.log('Creating bookings table...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        booking_reference VARCHAR(50) UNIQUE NOT NULL,
        room_id INT NOT NULL,
        user_id INT NULL,
        guest_name VARCHAR(255) NULL,
        guest_email VARCHAR(255) NULL,
        guest_phone VARCHAR(20) NULL,
        check_in_date DATE NOT NULL,
        check_out_date DATE NOT NULL,
        num_guests INT NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        downpayment_amount DECIMAL(10, 2) NOT NULL,
        downpayment_percentage INT NOT NULL,
        balance_amount DECIMAL(10, 2) NOT NULL,
        cross_location_fee DECIMAL(10, 2) DEFAULT 0.00,
        status ENUM('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled') DEFAULT 'pending',
        payment_status ENUM('pending', 'partial', 'paid', 'refunded') DEFAULT 'pending',
        booking_type ENUM('guest', 'registered', 'staff_assisted', 'reserved') NOT NULL,
        created_by INT NULL,
        special_requests TEXT,
        cancellation_reason TEXT,
        cancelled_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (room_id) REFERENCES rooms(id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (created_by) REFERENCES users(id),
        INDEX idx_booking_reference (booking_reference),
        INDEX idx_room_id (room_id),
        INDEX idx_user_id (user_id),
        INDEX idx_dates (check_in_date, check_out_date),
        INDEX idx_status (status),
        INDEX idx_payment_status (payment_status)
      )
    `);
    console.log('✅ Bookings table created\n');

    // Create payments table
    console.log('Creating payments table...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        booking_id INT NOT NULL,
        payment_reference VARCHAR(100) UNIQUE NOT NULL,
        stripe_payment_intent_id VARCHAR(255) NULL,
        amount DECIMAL(10, 2) NOT NULL,
        payment_type ENUM('downpayment', 'balance', 'full', 'refund') NOT NULL,
        payment_method ENUM('stripe', 'cash', 'bank_transfer') DEFAULT 'stripe',
        status ENUM('pending', 'processing', 'completed', 'failed', 'refunded') DEFAULT 'pending',
        stripe_charge_id VARCHAR(255) NULL,
        refund_amount DECIMAL(10, 2) NULL,
        refund_reason TEXT,
        processed_by INT NULL,
        metadata JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
        FOREIGN KEY (processed_by) REFERENCES users(id),
        INDEX idx_booking_id (booking_id),
        INDEX idx_payment_reference (payment_reference),
        INDEX idx_stripe_payment_intent (stripe_payment_intent_id),
        INDEX idx_status (status)
      )
    `);
    console.log('✅ Payments table created\n');

    console.log('🎉 Booking and payment tables ready!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

createBookingTables();

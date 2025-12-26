const db = require('../config/db');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function quickInit() {
  try {
    console.log('🔄 Quick database initialization...\n');

    const hash = await bcrypt.hash('password123', 10);

    // Create locations table
    console.log('Creating locations...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS locations (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        address TEXT NOT NULL,
        city VARCHAR(100) NOT NULL,
        country VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.query(`
      INSERT INTO locations (name, address, city, country, phone)
      VALUES ('Grand Hotel Downtown', '123 Main Street', 'New York', 'USA', '+1-212-555-0100')
    `);
    console.log('✅ Locations created\n');

    // Create users table
    console.log('Creating users...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        role ENUM('super_admin', 'admin', 'staff', 'customer') NOT NULL,
        location_id INT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        email_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        last_login TIMESTAMP NULL,
        FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL
      )
    `);

    await db.query(`
      INSERT INTO users (email, password_hash, first_name, last_name, role, email_verified)
      VALUES
        ('superadmin@hotel.com', ?, 'Super', 'Admin', 'super_admin', TRUE),
        ('admin.ny@hotel.com', ?, 'John', 'Admin', 'admin', TRUE),
        ('staff.ny@hotel.com', ?, 'Jane', 'Staff', 'staff', TRUE),
        ('customer@example.com', ?, 'Bob', 'Customer', 'customer', TRUE)
    `, [hash, hash, hash, hash]);

    console.log('✅ Users created\n');

    const [users] = await db.query('SELECT email, role FROM users');
    console.log('📊 Test accounts created:');
    users.forEach(u => console.log(`   ${u.role.padEnd(15)} ${u.email.padEnd(30)} password123`));

    console.log('\n🎉 Database ready!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

quickInit();

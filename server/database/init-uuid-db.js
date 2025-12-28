const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const { generateUserCode, generateRoomCode, generateBookingReference } = require('../utils/codeGenerator');
require('dotenv').config();

const initializeDatabase = async () => {
  try {
    console.log('🔄 Connecting to MySQL database...');

    // Parse DATABASE_URL if it exists, otherwise use individual variables
    let connectionConfig;
    if (process.env.DATABASE_URL) {
      // Parse DATABASE_URL: mysql://user:password@host:port/database?ssl-mode=REQUIRED
      const url = new URL(process.env.DATABASE_URL);
      connectionConfig = {
        host: url.hostname,
        user: url.username,
        password: url.password,
        database: url.pathname.substring(1), // Remove leading slash
        port: url.port || 3306,
        ssl: url.searchParams.get('ssl-mode') === 'REQUIRED' ? { rejectUnauthorized: false } : undefined,
        multipleStatements: true
      };
    } else {
      connectionConfig = {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
        multipleStatements: true
      };
    }

    const connection = await mysql.createConnection(connectionConfig);

    console.log('✅ Connected to MySQL database');

    // Read and execute schema
    const fs = require('fs');
    const path = require('path');
    const schemaPath = path.join(__dirname, 'schema-uuid.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('🔄 Creating tables with UUID schema...');
    await connection.query(schema);
    console.log('✅ Tables created successfully');

    // Insert locations
    console.log('🔄 Inserting locations...');
    const [nyLocation] = await connection.execute(`
      INSERT INTO locations (id, name, address, city, state, country, postal_code, phone, email)
      VALUES (UUID(), 'Grand Hotel New York', '123 Broadway Ave', 'New York', 'NY', 'USA', '10001', '+1-212-555-0100', 'ny@grandhotel.com')
    `);

    const [laLocation] = await connection.execute(`
      INSERT INTO locations (id, name, address, city, state, country, postal_code, phone, email)
      VALUES (UUID(), 'Grand Hotel Los Angeles', '456 Sunset Blvd', 'Los Angeles', 'CA', 'USA', '90028', '+1-323-555-0200', 'la@grandhotel.com')
    `);

    // Get location IDs
    const [locations] = await connection.execute('SELECT id, city FROM locations');
    const nyLocationId = locations.find(l => l.city === 'New York').id;
    const laLocationId = locations.find(l => l.city === 'Los Angeles').id;

    console.log('✅ Locations created');

    // Hash password for all test users
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Insert users with display codes
    console.log('🔄 Creating test users...');

    const users = [
      {
        user_code: generateUserCode('super_admin'),
        email: 'superadmin@hotel.com',
        first_name: 'Super',
        last_name: 'Admin',
        phone: '+1-555-0001',
        role: 'super_admin',
        location_id: null
      },
      {
        user_code: generateUserCode('admin'),
        email: 'admin.ny@hotel.com',
        first_name: 'Admin',
        last_name: 'NewYork',
        phone: '+1-555-0002',
        role: 'admin',
        location_id: nyLocationId
      },
      {
        user_code: generateUserCode('admin'),
        email: 'admin.la@hotel.com',
        first_name: 'Admin',
        last_name: 'LosAngeles',
        phone: '+1-555-0003',
        role: 'admin',
        location_id: laLocationId
      },
      {
        user_code: generateUserCode('staff'),
        email: 'staff.ny@hotel.com',
        first_name: 'Staff',
        last_name: 'NewYork',
        phone: '+1-555-0004',
        role: 'staff',
        location_id: nyLocationId
      },
      {
        user_code: generateUserCode('staff'),
        email: 'staff.la@hotel.com',
        first_name: 'Staff',
        last_name: 'LosAngeles',
        phone: '+1-555-0005',
        role: 'staff',
        location_id: laLocationId
      },
      {
        user_code: generateUserCode('customer'),
        email: 'customer@example.com',
        first_name: 'John',
        last_name: 'Customer',
        phone: '+1-555-0006',
        role: 'customer',
        location_id: null
      }
    ];

    for (const user of users) {
      await connection.execute(
        `INSERT INTO users (id, user_code, email, password_hash, first_name, last_name, phone, role, location_id)
         VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?)`,
        [user.user_code, user.email, hashedPassword, user.first_name, user.last_name, user.phone, user.role, user.location_id]
      );
      console.log(`  ✅ Created ${user.role}: ${user.email} (Code: ${user.user_code})`);
    }

    // Insert sample rooms
    console.log('🔄 Creating sample rooms...');

    const rooms = [
      {
        room_code: generateRoomCode('101', 'NY'),
        location_id: nyLocationId,
        room_number: '101',
        room_type: 'single',
        floor_number: 1,
        max_occupancy: 1,
        bed_type: 'Single',
        size_sqft: 250,
        description: 'Cozy single room with city view',
        amenities: JSON.stringify(['WiFi', 'TV', 'Air Conditioning', 'Mini Fridge']),
        status: 'available',
        base_price: 99.99
      },
      {
        room_code: generateRoomCode('102', 'NY'),
        location_id: nyLocationId,
        room_number: '102',
        room_type: 'double',
        floor_number: 1,
        max_occupancy: 2,
        bed_type: 'Queen',
        size_sqft: 350,
        description: 'Comfortable double room with modern amenities',
        amenities: JSON.stringify(['WiFi', 'TV', 'Air Conditioning', 'Mini Fridge', 'Coffee Maker']),
        status: 'available',
        base_price: 149.99
      },
      {
        room_code: generateRoomCode('201', 'NY'),
        location_id: nyLocationId,
        room_number: '201',
        room_type: 'suite',
        floor_number: 2,
        max_occupancy: 3,
        bed_type: 'King',
        size_sqft: 550,
        description: 'Luxurious suite with separate living area',
        amenities: JSON.stringify(['WiFi', 'Smart TV', 'Air Conditioning', 'Mini Bar', 'Coffee Maker', 'Balcony']),
        status: 'available',
        base_price: 249.99
      },
      {
        room_code: generateRoomCode('101', 'LA'),
        location_id: laLocationId,
        room_number: '101',
        room_type: 'deluxe',
        floor_number: 1,
        max_occupancy: 2,
        bed_type: 'King',
        size_sqft: 450,
        description: 'Deluxe room with ocean view',
        amenities: JSON.stringify(['WiFi', 'Smart TV', 'Air Conditioning', 'Mini Bar', 'Balcony', 'Ocean View']),
        status: 'available',
        base_price: 199.99
      },
      {
        room_code: generateRoomCode('201', 'LA'),
        location_id: laLocationId,
        room_number: '201',
        room_type: 'family',
        floor_number: 2,
        max_occupancy: 4,
        bed_type: 'Two Queens',
        size_sqft: 600,
        description: 'Spacious family room perfect for groups',
        amenities: JSON.stringify(['WiFi', 'Smart TV', 'Air Conditioning', 'Mini Bar', 'Coffee Maker', 'Kitchenette']),
        status: 'available',
        base_price: 299.99
      }
    ];

    for (const room of rooms) {
      const [result] = await connection.execute(
        `INSERT INTO rooms (id, room_code, location_id, room_number, room_type, floor_number, max_occupancy, bed_type, size_sqft, description, amenities, status)
         VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [room.room_code, room.location_id, room.room_number, room.room_type, room.floor_number, room.max_occupancy, room.bed_type, room.size_sqft, room.description, room.amenities, room.status]
      );

      // Get the inserted room ID
      const [insertedRoom] = await connection.execute('SELECT id FROM rooms WHERE room_code = ?', [room.room_code]);
      const roomId = insertedRoom[0].id;

      // Insert base rate for the room
      await connection.execute(
        `INSERT INTO room_rates (id, room_id, rate_type, price, is_active)
         VALUES (UUID(), ?, 'base', ?, TRUE)`,
        [roomId, room.base_price]
      );

      console.log(`  ✅ Created room: ${room.room_code} - ${room.room_type} ($${room.base_price}/night)`);
    }

    console.log('\n✅ Database initialized successfully with UUID schema!');
    console.log('\n📋 Test Accounts:');
    console.log('┌─────────────────────────────────────────────────────────┐');
    console.log('│ Super Admin: superadmin@hotel.com / password123        │');
    console.log('│ Admin (NY):  admin.ny@hotel.com / password123          │');
    console.log('│ Admin (LA):  admin.la@hotel.com / password123          │');
    console.log('│ Staff (NY):  staff.ny@hotel.com / password123          │');
    console.log('│ Staff (LA):  staff.la@hotel.com / password123          │');
    console.log('│ Customer:    customer@example.com / password123        │');
    console.log('└─────────────────────────────────────────────────────────┘');

    await connection.end();
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    console.error(error);
    process.exit(1);
  }
};

// Run if executed directly
if (require.main === module) {
  initializeDatabase();
}

module.exports = initializeDatabase;

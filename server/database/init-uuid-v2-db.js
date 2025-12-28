const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const { generateUserCode, generateRoomCode, generateBookingReference, generateTemplateCode } = require('../utils/codeGenerator');
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
    const schemaPath = path.join(__dirname, 'schema-uuid-v2.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('🔄 Creating tables with UUID v2 schema (Room Templates)...');
    await connection.query(schema);
    console.log('✅ Tables created successfully');

    // Insert locations
    console.log('🔄 Inserting locations...');
    await connection.execute(`
      INSERT INTO locations (id, name, address, city, state, country, postal_code, phone, email)
      VALUES (UUID(), 'Grand Hotel New York', '123 Broadway Ave', 'New York', 'NY', 'USA', '10001', '+1-212-555-0100', 'ny@grandhotel.com')
    `);

    await connection.execute(`
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

    const userIds = {};
    for (const user of users) {
      const [result] = await connection.execute(
        `INSERT INTO users (id, user_code, email, password_hash, first_name, last_name, phone, role, location_id)
         VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?)`,
        [user.user_code, user.email, hashedPassword, user.first_name, user.last_name, user.phone, user.role, user.location_id]
      );

      // Get the inserted user ID
      const [insertedUser] = await connection.execute('SELECT id FROM users WHERE user_code = ?', [user.user_code]);
      userIds[user.role + '_' + (user.location_id || 'global')] = insertedUser[0].id;

      console.log(`  ✅ Created ${user.role}: ${user.email} (Code: ${user.user_code})`);
    }

    // Insert room templates
    console.log('🔄 Creating room templates...');

    const templates = [
      {
        template_code: generateTemplateCode('DELUXE', 'NY'),
        location_id: nyLocationId,
        template_name: 'Deluxe City View Template',
        public_name: 'Deluxe City View Suite',
        room_type: 'deluxe',
        description: 'Luxurious suite with stunning city views',
        long_description: 'Experience the ultimate in urban luxury with our Deluxe City View Suite. Floor-to-ceiling windows showcase breathtaking Manhattan skyline views, while premium amenities ensure an unforgettable stay.',
        max_occupancy: 2,
        bed_type: 'King',
        size_sqft: 450,
        amenities: JSON.stringify(['WiFi', 'Smart TV', 'Air Conditioning', 'Mini Bar', 'Coffee Maker', 'City View', 'Work Desk', 'Safe']),
        images: JSON.stringify([
          { url: '/images/deluxe-ny-1.jpg', caption: 'City View', order: 1 },
          { url: '/images/deluxe-ny-2.jpg', caption: 'King Bed', order: 2 }
        ]),
        policies: JSON.stringify({ check_in: '15:00', check_out: '11:00', smoking: false, pets: false }),
        base_price: 249.99,
        created_by: userIds['admin_' + nyLocationId]
      },
      {
        template_code: generateTemplateCode('SUITE', 'NY'),
        location_id: nyLocationId,
        template_name: 'Executive Suite Template',
        public_name: 'Executive Suite',
        room_type: 'suite',
        description: 'Spacious executive suite with separate living area',
        long_description: 'Perfect for extended stays or business travelers, our Executive Suite features a separate living room, work area, and premium amenities for maximum comfort and productivity.',
        max_occupancy: 3,
        bed_type: 'King + Sofa Bed',
        size_sqft: 600,
        amenities: JSON.stringify(['WiFi', 'Smart TV', 'Air Conditioning', 'Mini Bar', 'Coffee Maker', 'Living Area', 'Work Desk', 'Safe', 'Kitchenette']),
        images: JSON.stringify([
          { url: '/images/suite-ny-1.jpg', caption: 'Living Area', order: 1 },
          { url: '/images/suite-ny-2.jpg', caption: 'Bedroom', order: 2 }
        ]),
        policies: JSON.stringify({ check_in: '15:00', check_out: '11:00', smoking: false, pets: false }),
        base_price: 349.99,
        created_by: userIds['admin_' + nyLocationId]
      },
      {
        template_code: generateTemplateCode('OCEAN', 'LA'),
        location_id: laLocationId,
        template_name: 'Ocean View Deluxe Template',
        public_name: 'Deluxe Ocean View',
        room_type: 'deluxe',
        description: 'Premium room with breathtaking ocean views',
        long_description: 'Wake up to the sound of waves and panoramic Pacific Ocean views. Our Deluxe Ocean View rooms feature private balconies and luxurious amenities for the ultimate coastal getaway.',
        max_occupancy: 2,
        bed_type: 'King',
        size_sqft: 500,
        amenities: JSON.stringify(['WiFi', 'Smart TV', 'Air Conditioning', 'Mini Bar', 'Coffee Maker', 'Ocean View', 'Balcony', 'Safe']),
        images: JSON.stringify([
          { url: '/images/ocean-la-1.jpg', caption: 'Ocean View', order: 1 },
          { url: '/images/ocean-la-2.jpg', caption: 'Balcony', order: 2 }
        ]),
        policies: JSON.stringify({ check_in: '15:00', check_out: '11:00', smoking: false, pets: true }),
        base_price: 299.99,
        created_by: userIds['admin_' + laLocationId]
      },
      {
        template_code: generateTemplateCode('FAMILY', 'LA'),
        location_id: laLocationId,
        template_name: 'Family Suite Template',
        public_name: 'Family Suite',
        room_type: 'family',
        description: 'Spacious family room perfect for groups',
        long_description: 'Designed with families in mind, our Family Suite offers ample space for everyone with two queen beds, a kitchenette, and entertainment options to keep everyone happy.',
        max_occupancy: 4,
        bed_type: 'Two Queens',
        size_sqft: 650,
        amenities: JSON.stringify(['WiFi', 'Smart TV', 'Air Conditioning', 'Mini Bar', 'Coffee Maker', 'Kitchenette', 'Safe', 'Gaming Console']),
        images: JSON.stringify([
          { url: '/images/family-la-1.jpg', caption: 'Main Room', order: 1 },
          { url: '/images/family-la-2.jpg', caption: 'Kitchenette', order: 2 }
        ]),
        policies: JSON.stringify({ check_in: '15:00', check_out: '11:00', smoking: false, pets: true }),
        base_price: 349.99,
        created_by: userIds['admin_' + laLocationId]
      }
    ];

    const templateIds = {};
    for (const template of templates) {
      const [result] = await connection.execute(
        `INSERT INTO room_templates (id, template_code, location_id, template_name, public_name, room_type, description, long_description, max_occupancy, bed_type, size_sqft, amenities, images, policies, base_price, created_by)
         VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [template.template_code, template.location_id, template.template_name, template.public_name, template.room_type, template.description, template.long_description, template.max_occupancy, template.bed_type, template.size_sqft, template.amenities, template.images, template.policies, template.base_price, template.created_by]
      );

      // Get the inserted template ID
      const [insertedTemplate] = await connection.execute('SELECT id FROM room_templates WHERE template_code = ?', [template.template_code]);
      templateIds[template.template_code] = insertedTemplate[0].id;

      console.log(`  ✅ Created template: ${template.template_code} - ${template.public_name}`);
    }

    // Insert bookable rooms created from templates
    console.log('🔄 Creating bookable rooms from templates...');

    const rooms = [
      // NY Deluxe rooms from template
      {
        room_code: generateRoomCode('405', 'NY'),
        template_id: templateIds[generateTemplateCode('DELUXE', 'NY')],
        location_id: nyLocationId,
        room_number: '405',
        public_name: 'Jupiter Room - 4th Floor',
        floor_number: 4,
        status: 'available'
      },
      {
        room_code: generateRoomCode('406', 'NY'),
        template_id: templateIds[generateTemplateCode('DELUXE', 'NY')],
        location_id: nyLocationId,
        room_number: '406',
        public_name: 'Mars Room - 4th Floor',
        floor_number: 4,
        status: 'available'
      },
      // NY Suite from template
      {
        room_code: generateRoomCode('501', 'NY'),
        template_id: templateIds[generateTemplateCode('SUITE', 'NY')],
        location_id: nyLocationId,
        room_number: '501',
        public_name: 'Penthouse Suite - 5th Floor',
        floor_number: 5,
        status: 'available'
      },
      // LA Ocean View rooms from template
      {
        room_code: generateRoomCode('301', 'LA'),
        template_id: templateIds[generateTemplateCode('OCEAN', 'LA')],
        location_id: laLocationId,
        room_number: '301',
        public_name: 'Pacific Suite - 3rd Floor',
        floor_number: 3,
        status: 'available'
      },
      {
        room_code: generateRoomCode('302', 'LA'),
        template_id: templateIds[generateTemplateCode('OCEAN', 'LA')],
        location_id: laLocationId,
        room_number: '302',
        public_name: 'Sunset Suite - 3rd Floor',
        floor_number: 3,
        status: 'available'
      },
      // LA Family Suite from template
      {
        room_code: generateRoomCode('401', 'LA'),
        template_id: templateIds[generateTemplateCode('FAMILY', 'LA')],
        location_id: laLocationId,
        room_number: '401',
        public_name: 'Family Haven - 4th Floor',
        floor_number: 4,
        status: 'available'
      }
    ];

    for (const room of rooms) {
      // Get template data to inherit
      const [templateData] = await connection.execute(
        'SELECT room_type, max_occupancy, bed_type, size_sqft, description, long_description, amenities, images, policies FROM room_templates WHERE id = ?',
        [room.template_id]
      );
      const template = templateData[0];

      // Insert room with inherited data
      const [result] = await connection.execute(
        `INSERT INTO rooms (id, room_code, template_id, location_id, room_number, public_name, floor_number, room_type, max_occupancy, bed_type, size_sqft, description, long_description, amenities, images, policies, status, is_public)
         VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
        [room.room_code, room.template_id, room.location_id, room.room_number, room.public_name, room.floor_number, template.room_type, template.max_occupancy, template.bed_type, template.size_sqft, template.description, template.long_description, template.amenities, template.images, template.policies, room.status]
      );

      // Get the inserted room ID
      const [insertedRoom] = await connection.execute('SELECT id FROM rooms WHERE room_code = ?', [room.room_code]);
      const roomId = insertedRoom[0].id;

      // Get base price from template
      const [templatePrice] = await connection.execute('SELECT base_price FROM room_templates WHERE id = ?', [room.template_id]);
      const basePrice = templatePrice[0].base_price;

      // Insert base rate for the room
      await connection.execute(
        `INSERT INTO room_rates (id, room_id, rate_type, price, is_active)
         VALUES (UUID(), ?, 'base', ?, TRUE)`,
        [roomId, basePrice]
      );

      console.log(`  ✅ Created room: ${room.room_code} - ${room.public_name} ($${basePrice}/night)`);
    }

    console.log('\n✅ Database initialized successfully with UUID v2 schema (Room Templates)!');
    console.log('\n📋 Test Accounts:');
    console.log('┌─────────────────────────────────────────────────────────┐');
    console.log('│ Super Admin: superadmin@hotel.com / password123        │');
    console.log('│ Admin (NY):  admin.ny@hotel.com / password123          │');
    console.log('│ Admin (LA):  admin.la@hotel.com / password123          │');
    console.log('│ Staff (NY):  staff.ny@hotel.com / password123          │');
    console.log('│ Staff (LA):  staff.la@hotel.com / password123          │');
    console.log('│ Customer:    customer@example.com / password123        │');
    console.log('└─────────────────────────────────────────────────────────┘');
    console.log('\n📦 Room Templates Created:');
    console.log(`  • ${templates.length} templates (admin-only)`);
    console.log(`  • ${rooms.length} bookable rooms (public)`);

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

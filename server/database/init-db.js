const bcrypt = require('bcryptjs');
const fs = require('fs');
const db = require('../config/db');
require('dotenv').config();

async function initializeDatabase() {
  try {
    console.log('🔄 Initializing database...\n');

    // Generate password hash for 'password123'
    const passwordHash = await bcrypt.hash('password123', 10);
    console.log('✅ Password hash generated\n');

    // Read and execute schema
    const schema = fs.readFileSync(__dirname + '/schema.sql', 'utf8');

    // Split by semicolons but keep multi-line statements together
    const statements = schema.split(';').filter(s => {
      const trimmed = s.trim();
      return trimmed.length > 0 &&
             !trimmed.startsWith('--') &&
             !trimmed.startsWith('bcrypt') &&
             trimmed !== 'JSON strings in MySQL';
    });

    console.log(`📝 Executing ${statements.length} SQL statements...\n`);

    let executed = 0;
    for (const statement of statements) {
      const trimmed = statement.trim();
      if (trimmed) {
        // Replace password placeholders
        const finalStatement = trimmed.replace(/\$2a\$10\$placeholder/g, passwordHash);

        try {
          await db.query(finalStatement);
          executed++;
          if (executed % 5 === 0) {
            console.log(`   ✓ Executed ${executed}/${statements.length} statements`);
          }
        } catch (error) {
          // Only show non-DROP TABLE errors
          if (!trimmed.includes('DROP TABLE')) {
            console.error(`   ⚠️  Warning on statement ${executed}:`, error.message.substring(0, 100));
          }
        }
      }
    }

    console.log(`\n✅ Database initialized successfully! (${executed} statements executed)\n`);

    // Verify users were created
    const [users] = await db.query('SELECT email, role FROM users ORDER BY id');

    console.log('📊 Test accounts created:');
    users.forEach(user => {
      console.log(`   ${user.role.padEnd(15)} ${user.email.padEnd(30)} password123`);
    });

    console.log('\n🎉 Database is ready to use!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Database initialization failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

initializeDatabase();

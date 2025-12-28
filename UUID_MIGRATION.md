# UUID Migration Guide

## Overview

This guide covers the migration from auto-incrementing integer IDs to UUIDs with user-friendly display codes.

---

## What Changed?

### Old System (INT IDs)
- **User ID**: 1, 2, 3, 4...
- **Room ID**: 1, 2, 3, 4...
- **Booking ID**: 1, 2, 3, 4...
- Sequential, predictable, not secure

### New System (UUID + Display Codes)
- **Internal ID**: `550e8400-e29b-41d4-a716-446655440000` (UUID)
- **Display Code**:
  - Users: `CUST-A7F2K9M3`, `STAFF-B3K9P5R7`
  - Rooms: `ROOM-101-NY`, `ROOM-201-LA`
  - Bookings: `BK20250128-A7F2K9M3`
  - Payments: `PAY20250128-XYZ9W8V7`

---

## Benefits

### 1. Security
- **Non-Sequential**: No one can guess the next ID
- **Non-Enumerable**: Can't iterate through all users/bookings
- **Globally Unique**: Safe for distributed systems

### 2. Professional Display
- **User-Friendly Codes**: `CUST-A7F2K9M3` instead of `4`
- **Context-Aware**: Role prefix shows user type at a glance
- **Memorable**: Easier to communicate over phone/email

### 3. Scale
- **500+ Billion Unique Codes**: ~29^8 = 500,866,689,041 combinations
- **Zero Collision Risk**: Practically impossible to generate duplicates
- **Future-Proof**: Works for enterprise-scale deployments

### 4. Multi-Location Support
- **Room Codes**: `ROOM-101-NY` vs `ROOM-101-LA` - clearly shows location
- **Audit Trail**: Display codes make logs human-readable

---

## Display Code Formats

### Users
| Role | Format | Example | Count |
|------|--------|---------|-------|
| Super Admin | `SADM-XXXXXXXX` | `SADM-A7F2K9M3` | 500B+ |
| Admin | `ADM-XXXXXXXX` | `ADM-B3K9P5R7` | 500B+ |
| Staff | `STF-XXXXXXXX` | `STF-C5M2W8X4` | 500B+ |
| Customer | `CUST-XXXXXXXX` | `CUST-D7P4Q6N2` | 500B+ |

### Bookings
- **Format**: `BKYYYYMMDD-XXXXXXXX`
- **Example**: `BK20250128-A7F2K9M3`
- **Benefits**: Date-sortable, easy to find bookings by day

### Payments
- **Format**: `PAYYYYYMMDD-XXXXXXXX`
- **Example**: `PAY20250128-XYZ9W8V7`
- **Benefits**: Matches booking date, easy reconciliation

### Rooms
- **Format**: `ROOM-{NUMBER}-{LOC}`
- **Example**: `ROOM-101-NY`, `ROOM-201-LA`
- **Benefits**: Shows room and location immediately

### Tasks
- **Format**: `TASK-XXXXXXXX`
- **Example**: `TASK-A7F2K9M3`

---

## Character Set

**Characters Used**: `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (29 chars)

**Excluded Characters** (to avoid confusion):
- `0` (zero) - looks like `O`
- `O` (letter O) - looks like `0`
- `I` (letter I) - looks like `1` and `l`
- `l` (lowercase L) - looks like `1` and `I`
- `1` (one) - looks like `I` and `l`

This prevents human errors when reading/typing codes.

---

## Migration Steps

### Step 1: Backup Current Database
```bash
# Export your current database
mysqldump -u your_user -p your_database > backup.sql
```

### Step 2: Run UUID Initialization
```bash
npm run init-db-uuid
```

This will:
1. Drop all existing tables
2. Create new tables with UUID schema
3. Insert test data with display codes
4. Show generated user codes in console

### Step 3: Update Environment Variables (No Changes Needed)
Your `.env` file remains the same - only the database schema changed.

### Step 4: Restart Services
```bash
npm run dev
```

---

## Important Notes

### ⚠️ Breaking Changes
- **All existing data will be lost** when you run `init-db-uuid`
- **API responses will change**: IDs are now UUIDs instead of integers
- **Frontend must handle UUIDs**: Update any code expecting numeric IDs

### Database Size
- **UUID Storage**: Each UUID takes 36 bytes (CHAR(36))
- **Old INT Storage**: Each INT took 4 bytes
- **Impact**: ~9x larger primary keys, but negligible for most hotels
- **Indexes**: Properly indexed for performance

### Performance
- **UUID Generation**: Happens in MySQL using `UUID()` function
- **Display Code Generation**: Happens in Node.js using crypto-random values
- **Query Speed**: Identical to INT with proper indexing
- **Join Speed**: Slightly slower but imperceptible for typical queries

---

## Testing the Migration

### 1. Check Test Accounts
After running `init-db-uuid`, you'll see:
```
✅ Created super_admin: superadmin@hotel.com (Code: SADM-A7F2K9M3)
✅ Created admin: admin.ny@hotel.com (Code: ADM-B3K9P5R7)
✅ Created staff: staff.ny@hotel.com (Code: STF-C5M2W8X4)
✅ Created customer: customer@example.com (Code: CUST-D7P4Q6N2)
```

### 2. Login and Verify
1. Go to http://localhost:3000/login
2. Login with: `customer@example.com / password123`
3. Open browser DevTools → Network tab
4. Check `/api/auth/me` response - should show UUID and user_code

### 3. Create a Booking
1. Browse rooms
2. Create a test booking
3. Note the booking reference (e.g., `BK20250128-A7F2K9M3`)
4. Verify you can lookup booking by reference

---

## Code Examples

### Backend: Generate User Code
```javascript
const { generateUserCode } = require('./utils/codeGenerator');

// When creating a new user
const userCode = generateUserCode('customer');
// Returns: 'CUST-A7F2K9M3'
```

### Backend: Generate Booking Reference
```javascript
const { generateBookingReference } = require('./utils/codeGenerator');

const bookingRef = generateBookingReference();
// Returns: 'BK20250128-A7F2K9M3'
```

### Frontend: Display User Code
```jsx
// Instead of showing numeric ID
<p>User ID: {user.id}</p> // Old: "User ID: 4"

// Show friendly code
<p>Customer Code: {user.user_code}</p> // New: "Customer Code: CUST-D7P4Q6N2"
```

---

## Rollback Plan

If you need to rollback to INT IDs:

### Step 1: Backup UUID Database
```bash
mysqldump -u your_user -p your_database > uuid_backup.sql
```

### Step 2: Restore Old Schema
```bash
npm run init-db
```

This will restore the original INT-based schema.

---

## Future Enhancements

### Possible Improvements
1. **QR Codes**: Generate QR codes from booking references
2. **Short URLs**: Create shortened URLs using display codes
3. **Mobile App**: Display codes work great for mobile check-in
4. **Email Templates**: Use display codes in customer communications
5. **Analytics**: Track bookings by code prefix patterns

---

## FAQ

### Q: Why not just use UUIDs everywhere without display codes?
**A**: UUIDs like `550e8400-e29b-41d4-a716-446655440000` are hard for humans to read/type. Display codes like `CUST-D7P4Q6N2` are much more user-friendly while still being secure.

### Q: What if two codes collide?
**A**: With 500+ billion possible codes and database UNIQUE constraints, the chance is mathematically negligible. If it happens (won't), the database will reject the duplicate and generate a new one.

### Q: Can customers request specific codes?
**A**: No, codes are randomly generated for security. Custom codes would defeat the purpose.

### Q: How do I search by display code?
**A**: The database has indexes on all display code columns for fast lookups.

### Q: What about existing bookings in production?
**A**: For production, you'd need a proper migration script that:
1. Adds UUID columns
2. Generates UUIDs for existing rows
3. Generates display codes
4. Updates foreign keys
5. Removes old INT columns

This migration guide is for development - production requires zero-downtime migration.

---

**Migration Date**: December 28, 2025
**Database Version**: 2.0 (UUID Schema)
**Backward Compatible**: No

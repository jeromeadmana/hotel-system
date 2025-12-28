# User Roles Explained

## Overview
The hotel management system has 4 distinct user roles, each with specific permissions and access levels.

---

## 🔴 Super Admin
**Location Access**: ALL LOCATIONS (unrestricted)

**Key Characteristics**:
- `location_id` is NULL in database (not tied to any specific location)
- Has complete access to the entire system across all hotel locations
- The highest level of authority in the system

**Permissions**:
- ✅ View/manage ALL locations
- ✅ Create/edit/delete rooms at ANY location
- ✅ View ALL bookings system-wide
- ✅ Create bookings without payment (reserved status)
- ✅ Access cross-location reports and analytics
- ✅ Manage users at all locations
- ✅ Create/delete other admins and staff
- ✅ Access all administrative features

**Use Case**: Corporate management, system owners, IT administrators

---

## 🟠 Admin
**Location Access**: SINGLE LOCATION ONLY (location-specific)

**Key Characteristics**:
- `location_id` is assigned to a specific hotel location (e.g., New York, Los Angeles)
- Has full administrative control but ONLY within their assigned location
- Cannot see or manage other locations

**Permissions**:
- ✅ View/manage rooms at THEIR location only
- ✅ View bookings for THEIR location only
- ✅ Create/edit/delete rooms at their location
- ✅ Manage staff at their location
- ✅ Access location-specific reports
- ✅ Handle check-ins/check-outs at their location
- ❌ Cannot access other locations
- ❌ Cannot create bookings without payment (unlike super_admin)
- ❌ Cannot view system-wide analytics

**Use Case**: Hotel managers, location directors, property managers

---

## 🟡 Staff
**Location Access**: SINGLE LOCATION ONLY (location-specific)

**Key Characteristics**:
- `location_id` is assigned to a specific hotel location
- Limited permissions focused on day-to-day operations
- Cannot create or delete rooms

**Permissions**:
- ✅ View rooms at THEIR location
- ✅ View bookings at THEIR location
- ✅ Create bookings for customers (staff-assisted booking)
- ✅ Handle check-ins/check-outs
- ✅ Manage housekeeping tasks
- ✅ Update room status (cleaning, maintenance, etc.)
- ❌ Cannot create/delete rooms (only admins can)
- ❌ Cannot manage other users
- ❌ Cannot access other locations

**Use Case**: Front desk staff, concierge, housekeeping managers, reception

---

## 🟢 Customer
**Location Access**: N/A (public user)

**Key Characteristics**:
- `location_id` is NULL (not tied to any location)
- Registered users who can book rooms
- Gets better rates than guests (20% downpayment vs 50%)

**Permissions**:
- ✅ Browse available rooms across all locations
- ✅ Create bookings with 20% downpayment
- ✅ View their own bookings
- ✅ Cancel their own bookings
- ✅ Update their profile
- ❌ Cannot access staff portal
- ❌ Cannot view other customers' bookings

**Use Case**: Registered hotel guests, frequent travelers

---

## 🔵 Guest (Not a database role)
**Special Case**: Guests are NOT stored in the users table. They book without creating an account.

**Key Characteristics**:
- No user account required
- Higher downpayment requirement (50% vs 20% for registered users)
- Limited to single booking - cannot view booking history

**Permissions**:
- ✅ Browse available rooms
- ✅ Create one-time booking with 50% downpayment
- ✅ Look up booking by reference number
- ❌ Cannot access dashboard
- ❌ Cannot view booking history

**Use Case**: One-time visitors, walk-in customers

---

## Key Differences Summary

| Feature | Super Admin | Admin | Staff | Customer | Guest |
|---------|-------------|-------|-------|----------|-------|
| Location Access | All | Single | Single | N/A | N/A |
| Create Rooms | ✅ All | ✅ Own | ❌ | ❌ | ❌ |
| Delete Rooms | ✅ All | ✅ Own | ❌ | ❌ | ❌ |
| View All Bookings | ✅ All | ✅ Own Location | ✅ Own Location | ❌ Own Only | ❌ |
| Book Without Payment | ✅ | ❌ | ❌ | ❌ | ❌ |
| Downpayment | 0% (reserved) | N/A | N/A | 20% | 50% |
| Manage Users | ✅ All | ✅ Own Location | ❌ | ❌ | ❌ |
| Cross-Location Reports | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## Database Schema

```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  role ENUM('super_admin', 'admin', 'staff', 'customer') NOT NULL,
  location_id INT NULL COMMENT 'NULL for super_admin and customers',
  -- ... other fields
);
```

**Important Notes**:
- `super_admin` and `customer` roles have `location_id = NULL`
- `admin` and `staff` roles MUST have a valid `location_id`
- This design enforces location-based access control at the database level

---

## Test Accounts

```
Super Admin:
  Email: superadmin@hotel.com
  Password: password123
  Can access: ALL locations

Admin (New York):
  Email: admin.ny@hotel.com
  Password: password123
  Can access: New York location only

Staff (New York):
  Email: staff.ny@hotel.com
  Password: password123
  Can access: New York location only

Customer:
  Email: customer@example.com
  Password: password123
  Can access: Customer dashboard, create bookings
```

---

**Last Updated**: December 28, 2025

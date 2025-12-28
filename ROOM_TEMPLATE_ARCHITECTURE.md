# Room Template Architecture

## Overview

The Room Template Architecture implements a scalable, enterprise-grade room management system where administrators create internal blueprints (templates) that serve as the foundation for bookable rooms.

---

## Core Concepts

### 1. Room Templates (Internal / Admin-Only)

**Purpose**: Internal blueprints that define room characteristics

**Access**: Super Admin and Admin only

**Visibility**: NOT visible to public or guests

**Fields**:
- `template_code`: Display code (e.g., `TMPL-DELUXE-NY`)
- `template_name`: Internal name (e.g., "Deluxe City View Template")
- `public_name`: Public-facing name (e.g., "Deluxe City View Suite")
- `room_type`: Category (single, double, suite, deluxe, family, executive, penthouse)
- `description`: Short description
- `long_description`: Detailed marketing description
- `max_occupancy`: Maximum guests
- `bed_type`: Bed configuration (e.g., "King", "Two Queens")
- `size_sqft`: Room size
- `amenities`: JSON array of amenities
- `images`: JSON array of image objects with captions
- `policies`: JSON object with check-in/out times, smoking, pets, etc.
- `base_price`: Default price for rooms created from this template

**Example Template Code**: `TMPL-DELUXE-NY`, `TMPL-OCEAN-LA`

### 2. Bookable Rooms (Public & Guest-Facing)

**Purpose**: Actual rooms that guests can book

**Access**: Public (everyone can view)

**Created From**: Room Templates (admins select a template when creating a room)

**Unique Identity**:
- `room_code`: Display code (e.g., `ROOM-405-NY`)
- `room_number`: Physical room number (e.g., "405")
- `public_name`: Guest-facing name (e.g., "Jupiter Room - 4th Floor")
- `floor_number`: Physical floor location

**Inherited Data** (from template):
- Room type, occupancy, bed type, size
- Description, long description
- Amenities, images, policies

**Override System**:
- `override_flags`: JSON object tracking which fields are customized
- Admins can override any inherited field
- Template updates respect overrides (won't overwrite customized fields)

**Public Visibility**:
- `is_public = TRUE`: Shown in public listings
- `is_public = FALSE`: Hidden (templates never have is_public = TRUE)

---

## Database Schema v2

### room_templates Table

```sql
CREATE TABLE room_templates (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  template_code VARCHAR(30) UNIQUE NOT NULL,
  location_id CHAR(36) NOT NULL,
  template_name VARCHAR(200) NOT NULL,
  public_name VARCHAR(200) NOT NULL,
  room_type ENUM('single', 'double', 'suite', 'deluxe', 'family', 'executive', 'penthouse'),
  description TEXT,
  long_description TEXT,
  max_occupancy INT NOT NULL,
  bed_type VARCHAR(100),
  size_sqft INT,
  amenities JSON,
  images JSON,
  policies JSON,
  base_price DECIMAL(10, 2),
  is_active BOOLEAN DEFAULT TRUE,
  created_by CHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
);
```

### rooms Table (Updated)

```sql
CREATE TABLE rooms (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  room_code VARCHAR(30) UNIQUE NOT NULL,
  template_id CHAR(36) NULL,  -- NULL if custom room
  location_id CHAR(36) NOT NULL,
  room_number VARCHAR(50) NOT NULL,
  public_name VARCHAR(200) NOT NULL,
  floor_number INT,

  -- Inherited fields (can be overridden)
  room_type ENUM(...),
  max_occupancy INT NOT NULL,
  bed_type VARCHAR(100),
  size_sqft INT,
  description TEXT,
  long_description TEXT,
  amenities JSON,
  images JSON,
  policies JSON,

  -- Override tracking
  override_flags JSON,  -- {"description": true, "amenities": false, ...}

  -- Operational status
  status ENUM('available', 'occupied', 'maintenance', 'cleaning', 'reserved', 'out_of_service'),
  is_active BOOLEAN DEFAULT TRUE,
  is_public BOOLEAN DEFAULT TRUE,  -- Templates are NEVER public

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (template_id) REFERENCES room_templates(id) ON DELETE SET NULL,
  FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
);
```

---

## API Endpoints

### Room Templates (Admin-Only)

All template endpoints require authentication and admin/super_admin role.

#### GET /api/room-templates
Get all templates (filtered by location for admins)
```json
Response: {
  "success": true,
  "data": {
    "templates": [...]
  }
}
```

#### GET /api/room-templates/:id
Get template by ID

#### POST /api/room-templates
Create new template
```json
Request Body: {
  "location_id": "uuid",
  "template_name": "Deluxe City View Template",
  "public_name": "Deluxe City View Suite",
  "room_type": "deluxe",
  "max_occupancy": 2,
  "bed_type": "King",
  "size_sqft": 450,
  "description": "Luxurious suite...",
  "amenities": ["WiFi", "Smart TV", ...],
  "images": [{url: "...", caption: "..."}],
  "policies": {check_in: "15:00", ...},
  "base_price": 249.99
}
```

#### PUT /api/room-templates/:id?apply_to_rooms=true
Update template
- Query param `apply_to_rooms=true`: Sync changes to existing rooms
- Query param omitted or `false`: Update template only

#### POST /api/room-templates/:id/sync
Manually sync template changes to all linked rooms

#### DELETE /api/room-templates/:id
Delete template (only if no rooms are using it)

#### GET /api/room-templates/:id/rooms
Get all rooms created from this template

---

## Template-to-Room Workflow

### Creating a Room from a Template

1. Admin selects a template
2. System copies all template data to the new room
3. Admin provides unique room details:
   - Room number (e.g., "405")
   - Public name (e.g., "Jupiter Room - 4th Floor")
   - Floor number
4. Room inherits:
   - Room type, occupancy, bed type, size
   - Description, amenities, images, policies
5. Room is created with `is_public = TRUE`

### Updating a Template

Admins have two options:

#### Option 1: Update Template Only
- Changes affect new rooms created from template
- Existing rooms are NOT updated
- Use case: Template improvements without disrupting current inventory

#### Option 2: Update Template + Sync to Rooms
- Changes affect the template AND existing rooms
- Only updates fields that haven't been overridden
- Use case: Mass updates (e.g., adding a new amenity to all deluxe rooms)

### Override System

When an admin customizes a room field:
1. System sets `override_flags.field_name = true`
2. Future template syncs skip that field
3. Admins can clear overrides to re-inherit from template

Example `override_flags`:
```json
{
  "description": true,     // Customized description won't be updated
  "amenities": false,      // Will receive template updates
  "images": true,          // Custom images won't be replaced
  "policies": false        // Will receive template updates
}
```

---

## Public Access Rules

### Non-Authenticated Users (Guests)
- Can browse bookable rooms (is_public = TRUE)
- Can view amenities, images, description
- Can see availability
- Can create bookings
- **CANNOT** see room templates
- **CANNOT** see room numbers until after booking

### Authenticated Customers
- Same as guests, plus:
- Can view assigned room number after booking
- Can access enhanced location details
- Can view booking history

### Staff
- Can view all bookable rooms
- Can see room templates (read-only)
- Can assist with bookings

### Admin (Location-Specific)
- Can manage templates for their location
- Can create/edit/delete rooms for their location
- Can sync templates to rooms
- Can view all rooms created from templates

### Super Admin
- Can manage templates across all locations
- Full access to all rooms and templates
- Can create rooms at any location

---

## Benefits

### 1. Standardization
- Consistent room descriptions across locations
- Uniform amenity listings
- Professional presentation

### 2. Scalability
- Add 100 rooms from a template in minutes
- Bulk updates via template sync
- Easy to expand to new locations

### 3. Flexibility
- Room-specific customization (override system)
- Custom rooms without templates
- Mix of templated and custom inventory

### 4. Future-Proof
- OTA integrations can map to templates
- PMS integrations simplified
- Analytics by template type

### 5. Operational Efficiency
- Update 50 rooms by updating 1 template
- No need to manually update each room
- Clear inheritance model

---

## Migration from v1 to v2

### Running the Migration

```bash
npm run init-db-v2
```

This will:
1. Drop all existing tables
2. Create UUID v2 schema with room_templates
3. Create 4 sample templates
4. Create 6 bookable rooms from templates
5. Set up test users and locations

### What Changed

**Old System (v1)**:
- Rooms created manually
- No template relationship
- INT IDs

**New System (v2)**:
- Rooms created from templates
- Template inheritance and override system
- UUID IDs with display codes
- Public/private visibility control

---

## Code Generator

### Template Code Generation

```javascript
const { generateTemplateCode } = require('./utils/codeGenerator');

const code = generateTemplateCode('DELUXE', 'NY');
// Returns: "TMPL-DELUXE-NY"
```

Format: `TMPL-{TYPE}-{LOCATION_CODE}`

Examples:
- `TMPL-DELUXE-NY` - Deluxe template in New York
- `TMPL-OCEAN-LA` - Ocean View template in Los Angeles
- `TMPL-SUITE-NY` - Suite template in New York
- `TMPL-FAMILY-LA` - Family template in Los Angeles

---

## Sample Data

The v2 initialization script creates:

### Templates Created
1. **TMPL-DELUXE-NY** - Deluxe City View Template (NY)
2. **TMPL-SUITE-NY** - Executive Suite Template (NY)
3. **TMPL-OCEAN-LA** - Ocean View Deluxe Template (LA)
4. **TMPL-FAMILY-LA** - Family Suite Template (LA)

### Bookable Rooms Created
1. **ROOM-405-NY** - Jupiter Room (from TMPL-DELUXE-NY)
2. **ROOM-406-NY** - Mars Room (from TMPL-DELUXE-NY)
3. **ROOM-501-NY** - Penthouse Suite (from TMPL-SUITE-NY)
4. **ROOM-301-LA** - Pacific Suite (from TMPL-OCEAN-LA)
5. **ROOM-302-LA** - Sunset Suite (from TMPL-OCEAN-LA)
6. **ROOM-401-LA** - Family Haven (from TMPL-FAMILY-LA)

---

## Next Steps

### Backend (Complete)
- ✅ Database schema v2 with templates
- ✅ Room template service layer
- ✅ Room template controller
- ✅ API routes with validation
- ✅ Template sync mechanism
- ✅ Override tracking

### Frontend (Pending)
- [ ] Template management page (admin UI)
- [ ] Create template form
- [ ] Edit template form with sync options
- [ ] Template list with filters
- [ ] Room creation with template selection
- [ ] Override management UI
- [ ] Sync confirmation modal

---

**Architecture Date**: December 28, 2025
**Schema Version**: v2 (UUID with Room Templates)
**Backward Compatible**: No - requires database migration

/**
 * Code Generator Utility
 * Generates user-friendly display codes for various entities
 */

/**
 * Generate a random alphanumeric code (excludes confusing characters like 0, O, I, l)
 * @param {number} length - Length of the code
 * @returns {string} Random code
 */
const generateRandomCode = (length = 8) => {
  // Exclude confusing characters: 0, O, I, l, 1
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

/**
 * Generate user code based on role
 * Formats:
 * - SADM-A7F2K9M3 (Super Admin)
 * - ADM-B3K9P5R7 (Admin)
 * - STF-C5M2W8X4 (Staff)
 * - CUST-D7P4Q6N2 (Customer)
 * @param {string} role - User role
 * @returns {string} User code
 */
const generateUserCode = (role) => {
  const prefixMap = {
    'super_admin': 'SADM',
    'admin': 'ADM',
    'staff': 'STF',
    'customer': 'CUST'
  };

  const prefix = prefixMap[role] || 'USER';
  const randomPart = generateRandomCode(8);

  return `${prefix}-${randomPart}`;
};

/**
 * Generate room code
 * Format: ROOM-101-NY or ROOM-201-LA
 * @param {string} roomNumber - Room number
 * @param {string} locationCode - Location code (first 2-3 letters of city)
 * @returns {string} Room code
 */
const generateRoomCode = (roomNumber, locationCode) => {
  const locCode = locationCode.substring(0, 3).toUpperCase();
  return `ROOM-${roomNumber}-${locCode}`;
};

/**
 * Generate booking reference
 * Format: BK20250128-A7F2K9M3
 * @returns {string} Booking reference
 */
const generateBookingReference = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const randomPart = generateRandomCode(8);

  return `BK${year}${month}${day}-${randomPart}`;
};

/**
 * Generate payment reference
 * Format: PAY20250128-XYZ9W8V7
 * @returns {string} Payment reference
 */
const generatePaymentReference = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const randomPart = generateRandomCode(8);

  return `PAY${year}${month}${day}-${randomPart}`;
};

/**
 * Generate task code
 * Format: TASK-A7F2K9M3
 * @returns {string} Task code
 */
const generateTaskCode = () => {
  const randomPart = generateRandomCode(8);
  return `TASK-${randomPart}`;
};

module.exports = {
  generateRandomCode,
  generateUserCode,
  generateRoomCode,
  generateBookingReference,
  generatePaymentReference,
  generateTaskCode
};

/**
 * Generate a unique booking reference
 * Format: BK20250128-ABC1
 * BK = Booking
 * 20250128 = YYYYMMDD
 * ABC1 = Random 4 character alphanumeric
 */
const generateBookingReference = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  const dateStr = `${year}${month}${day}`;

  // Generate random 4 character alphanumeric code
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomCode = '';
  for (let i = 0; i < 4; i++) {
    randomCode += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return `BK${dateStr}-${randomCode}`;
};

/**
 * Generate a unique payment reference
 * Format: PAY20250128-XYZ9
 */
const generatePaymentReference = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  const dateStr = `${year}${month}${day}`;

  // Generate random 4 character alphanumeric code
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomCode = '';
  for (let i = 0; i < 4; i++) {
    randomCode += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return `PAY${dateStr}-${randomCode}`;
};

module.exports = {
  generateBookingReference,
  generatePaymentReference
};

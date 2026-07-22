const { parsePhoneNumberWithError } = require('libphonenumber-js');

/**
 * Validates if a string is a valid UK phone number.
 * We strictly check for 'GB' region.
 * @param {string} phoneNumber - The phone number to validate.
 * @returns {boolean} - True if it's a valid UK phone number.
 */
const isValidUKPhoneNumber = (phoneNumber) => {
  try {
    const phoneNumberObject = parsePhoneNumberWithError(phoneNumber, 'GB');
    // It must be a valid number and it must belong to the GB country code
    return phoneNumberObject.isValid() && phoneNumberObject.country === 'GB';
  } catch (error) {
    return false;
  }
};

module.exports = {
  isValidUKPhoneNumber,
};

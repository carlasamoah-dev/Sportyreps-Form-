const { isValidPhoneNumber } = require('libphonenumber-js');

/**
 * Validates if a string is a valid international phone number.
 * Accepts any country — the client sends the full E.164 number
 * (e.g. +447700900000, +13105551234) via the phone flag picker.
 * @param {string} phoneNumber - The phone number to validate.
 * @returns {boolean}
 */
const isValidInternationalPhoneNumber = (phoneNumber) => {
  try {
    return isValidPhoneNumber(phoneNumber);
  } catch (error) {
    return false;
  }
};

module.exports = {
  isValidInternationalPhoneNumber,
};

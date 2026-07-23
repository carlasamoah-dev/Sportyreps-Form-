const rateLimit = require('express-rate-limit');

const submissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 submissions per `window` (accommodates schools/academies)
  message: 'Too many submissions from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  submissionLimiter,
};

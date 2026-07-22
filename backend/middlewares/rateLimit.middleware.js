const rateLimit = require('express-rate-limit');

const submissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 submissions per `window` (here, per 15 minutes)
  message: 'Too many submissions from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  submissionLimiter,
};

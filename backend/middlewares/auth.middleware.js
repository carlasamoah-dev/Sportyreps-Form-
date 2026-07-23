const supabase = require('../config/supabase');
const logger = require('../utils/logger');

/**
 * requireAuth middleware
 * 
 * Protects routes that the Admin Panel calls.
 * Expects: Authorization: Bearer <supabase_access_token>
 * 
 * The token is the JWT issued by Supabase Auth when the admin logs in.
 * We validate it by calling supabase.auth.getUser(token) — Supabase
 * verifies the signature and expiry server-side.
 */
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        code: 401,
        message: 'Unauthorized. Please log in to the admin panel.'
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify the token against Supabase Auth
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      logger.warn(`Auth failed: ${error?.message || 'No user returned'}`);
      return res.status(401).json({
        code: 401,
        message: 'Invalid or expired session. Please log in again.'
      });
    }

    // Attach user to request for use in controllers if needed
    req.user = user;
    next();
  } catch (err) {
    logger.error(`Auth middleware error: ${err.message}`);
    return res.status(500).json({ code: 500, message: 'Authentication error.' });
  }
};

module.exports = requireAuth;

const { ZodError } = require('zod');

const validate = (schema) => (req, res, next) => {
  try {
    // Parse the multipart form data body
    // Multer creates req.body with text fields and req.files with files.
    // We will validate the body. Files are checked separately or within the controller.
    
    // Convert stringified objects/numbers if they come as strings from FormData
    const parsedBody = { ...req.body };
    
    // Arrays might need special handling depending on how client sends them, 
    // but the client appends them flatly. We will parse it in the validator.
    
    schema.parse(parsedBody);
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({
        code: 400,
        message: "Validation Error",
        errors: err.errors.map(e => ({ path: e.path.join('.'), message: e.message }))
      });
    }
    next(err);
  }
};

module.exports = validate;

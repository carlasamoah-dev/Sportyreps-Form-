const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const env = require('./config/env');
const logger = require('./utils/logger');
const errorHandler = require('./middlewares/error.middleware');
const { submissionLimiter } = require('./middlewares/rateLimit.middleware');
const submissionRoutes = require('./routes/submission.routes');

const app = express();

// --- Security & Utility Middlewares ---
app.use(helmet());
app.use(cors({ origin: '*' })); // In production, restrict this to your domain
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Rate Limiting ---
app.use('/api/', submissionLimiter);

// --- Routes ---
app.use('/api/submissions', submissionRoutes);

// --- Health Check ---
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// --- Global Error Handler ---
app.use(errorHandler);

// --- Server Startup ---
const server = app.listen(env.PORT, () => {
  logger.info(`Server is running on port ${env.PORT} in ${env.NODE_ENV} mode.`);
});

// Handle unhandled rejections globally
process.on('unhandledRejection', (err) => {
  logger.error(`UNHANDLED REJECTION! 💥 Shutting down...`);
  logger.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

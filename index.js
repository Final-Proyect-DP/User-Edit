// External Dependencies
require('dotenv').config();
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const cors = require('cors');

// Internal Imports
const userRoutes = require('./routes/userRoutes');
const logger = require('./config/logger');
const connectDB = require('./config/dbConfig');
const swaggerDocs = require('./config/swaggerConfig');

// Consumers
const userCreateConsumer = require('./consumers/userCreateConsumer');
const userDeleteConsumer = require('./consumers/userDeleteConsumer');
const authLoginConsumer = require('./consumers/authLoginConsumer');
const userLogoutConsumer = require('./consumers/userLogoutConsumer');

// App Configuration
const app = express();
const port = process.env.PORT || 3003;

const corsOptions = {
  origin: '*',
  methods: ['POST'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware Setup
app.use(cors(corsOptions));
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use('/users', userRoutes);

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'user-create' });
});

// Start Consumers
const startConsumers = async () => {
  try {
    await Promise.all([
      userCreateConsumer.run(),
      userDeleteConsumer.run(),
      authLoginConsumer.run(),
      userLogoutConsumer.run()
    ]);
    logger.info('All consumers started successfully');
  } catch (error) {
    logger.error('Failed to start consumers:', error);
    throw error;
  }
};

// Initialize Application
const initializeApp = async () => {
  try {
    await connectDB();
    await startConsumers();
    
    app.listen(port, '0.0.0.0', () => {
      logger.info(`Server running on port ${port}`);
    });
  } catch (error) {
    logger.error('Failed to initialize application:', error);
    process.exit(1);
  }
};

initializeApp();

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const logger = require('./config/logger');
const userRoutes = require('./routes/userRoutes');
const swaggerDocs = require('./config/swaggerConfig');
const connectDB = require('./config/dbConfig');
const userCreateConsumer = require('./consumers/userCreateConsumer');
const userDeleteConsumer = require('./consumers/userDeleteConsumer');
const authLoginConsumer = require('./consumers/authLoginConsumer');
const userLogoutConsumer = require('./consumers/userLogoutConsumer');

const app = express();
const port = process.env.PORT || 3003;

const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

const startConsumers = async () => {
  try {
    logger.info('Starting Kafka consumers...');
    await Promise.all([
      userCreateConsumer.run(),
      userDeleteConsumer.run(),
      authLoginConsumer.run(),
      userLogoutConsumer.run()
    ]);
    logger.info('All Kafka consumers started successfully');
  } catch (error) {
    logger.error('Error starting Kafka consumers:', error);
    throw error;
  }
};

const startServer = async () => {
  try {
    // Configurar middleware
    app.use(cors(corsOptions));
    app.use(express.json());
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
    app.use('/users', userRoutes);

    app.get('/health', (req, res) => {
      res.status(200).json({ status: 'OK', service: 'user-edit' });
    });
    

    // Conectar a la base de datos
    await connectDB();
    logger.info('Database connection established');

    // Iniciar consumidores
    await startConsumers();

    // Iniciar servidor
    app.listen(port, '0.0.0.0', () => {
      logger.info(`Server running at http://0.0.0.0:${port}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

require('dotenv').config();
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const logger = require('./config/logger');
const userCreateConsumer = require('./consumers/userCreateConsumer'); // Importar el consumidor
const userDeleteConsumer = require('./consumers/userDeleteConsumer'); // Importar el consumidor
const authLoginConsumer = require('./consumers/authLoginConsumer'); // Importar el consumidor
const userLogoutConsumer = require('./consumers/userLogoutConsumer'); // Importar el consumidor
const connectDB = require('./config/dbConfig'); // Importar la configuración de la base de datos

const app = express();
const port = process.env.PORT || 3003;

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: process.env.API_TITLE,
      version: process.env.API_VERSION,
      description: process.env.API_DESCRIPTION
    },
    servers: [
      {
        url: `http://localhost:${port}`
      }
    ]
  },
  apis: ['./routes/*.js']
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

const corsOptions = {
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use(express.json());
app.use('/users', userRoutes);

connectDB().then(async () => {
  app.listen(port, '0.0.0.0', () => {
    logger.info(`Server running at http://0.0.0.0:${port}`);
  });

  // Initialize consumers sequentially with error handling
  try {
    logger.info('Starting consumers...');
    await Promise.all([
      userCreateConsumer.run().then(() => {
        logger.info('Create consumer started successfully');
      }),
      userDeleteConsumer.run().then(() => {
        logger.info('Delete consumer started successfully');
      }),
      authLoginConsumer.run().then(() => {
        logger.info('Login consumer started successfully');
      }),
      userLogoutConsumer.run().then(() => {
        logger.info('Logout consumer started successfully');
      })
    ]);
  } catch (error) {
    logger.error('Error starting consumers:', error);
  }
}).catch(err => {
  logger.error('Error connecting to MongoDB', err);
});

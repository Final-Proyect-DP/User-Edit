const express = require('express');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const redis = require('redis');
const cors = require('cors');
const winston = require('winston');
const userRoutes = require('./routes/userRoutes');
const { run: createUserConsumerRun } = require('./consumers/userCreateConsumer');
const { run: loginConsumerRun } = require('./consumers/loginConsumer');
const { run: deleteUserConsumerRun } = require('./consumers/userDeleteConsumer');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

app.use(express.json());
app.use(cors());

const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => logger.info('Connected to MongoDB'))
  .catch(err => logger.error('Could not connect to MongoDB', err));

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
});
redisClient.on('error', (err) => logger.error('Redis error', err));

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'User API',
      version: '1.0.0',
      description: 'API for updating user information'
    }
  },
  apis: ['./routes/*.js']
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use((req, res, next) => {
  req.redisClient = redisClient;
  req.logger = logger;
  next();
});

app.use('/users', userRoutes);

app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
  createUserConsumerRun().catch(console.error);
  //loginConsumerRun().catch(console.error);
  deleteUserConsumerRun().catch(console.error);
});

require('dotenv').config();
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const logger = require('./config/logger');
const userCreateConsumer = require('./consumers/userCreateConsumer'); // Importar el consumidor
const userDeleteConsumer = require('./consumers/userDeleteConsumer'); // Importar el consumidor
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

app.use(cors());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use(express.json());
app.use('/users', userRoutes);

connectDB().then(async () => {
  app.listen(port, '0.0.0.0', () => {
    logger.info(`Servidor corriendo en http://0.0.0.0:${port}`);
  });

  // Inicializar los consumidores de manera secuencial con manejo de errores
  try {
    logger.info('Iniciando consumidores...');
    await Promise.all([
      userCreateConsumer.run().then(() => {
        logger.info('Consumidor de creación iniciado correctamente');
      }),
      userDeleteConsumer.run().then(() => {
        logger.info('Consumidor de eliminación iniciado correctamente');
      })
    ]);
  } catch (error) {
    logger.error('Error al iniciar los consumidores:', error);
  }
}).catch(err => {
  logger.error('Error al conectar a MongoDB', err);
});

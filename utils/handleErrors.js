const logger = require('../config/logger');

const handleErrors = (error, id = '') => {
  logger.error(`Error in operation ${id ? `for ID ${id}` : ''}:`, error);

  // Error de campos requeridos
  if (error.message.includes('Missing required fields')) {
    return {
      status: 400,
      response: {
        success: false,
        message: error.message
      }
    };
  }

  // Error de clave duplicada (usuario existente)
  if (error.code === 11000) {
    return {
      status: 400,
      response: {
        success: false,
        message: 'Username already exists'
      }
    };
  }

  // Error de validación de Mongoose
  if (error.name === 'ValidationError') {
    return {
      status: 400,
      response: {
        success: false,
        message: 'Validation error',
        details: error.message
      }
    };
  }

  // Error de usuario no encontrado
  if (error.message === 'User not found') {
    return {
      status: 404,
      response: {
        success: false,
        message: 'User not found'
      }
    };
  }

  // Error por defecto (500 Internal Server Error)
  return {
    status: 500,
    response: {
      success: false,
      message: 'Internal server error'
    }
  };
};

module.exports = handleErrors;

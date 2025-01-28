const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { sendMessage } = require('../producers/userProducer');

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { token } = req.query;
  const { username, email, firstName, lastName, address, phone, semester, parallel, career, description } = req.body;

  try {
    const redisClient = req.redisClient;
    const logger = req.logger;

    // Verificar el token JWT
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        logger.warn(`Invalid token for user ID: ${id}`);
        return res.status(401).json({ message: 'Invalid token' });
      }

      redisClient.get(id, async (err, result) => {
        if (err) {
          logger.error('Redis error', err);
          return res.status(500).send(err.message);
        }
        if (result !== token) {
          logger.warn(`Invalid token for user ID: ${id}`);
          return res.status(404).json({ message: 'Invalid token' });
        }

        const updateData = { username, email, firstName, lastName, address, phone, semester, parallel, career, description };

        try {
          const user = await User.findByIdAndUpdate(id, updateData, { new: true });
          if (!user) {
            logger.warn(`User not found: ${id}`);
            return res.status(404).json({ message: 'User not found' });
          }
          logger.info(`User updated: ${id}`);
          res.json({ message: 'Usuario actualizado correctamente' });

          // Enviar mensaje cifrado con los datos del usuario
          await sendMessage('user.edit', user);
          logger.info(`Message sent to Kafka topic: user.edit`);
        } catch (mongoError) {
          if (mongoError.code === 11000) {
            logger.error('Duplicate key error', mongoError);
            return res.status(400).json({ message: 'Duplicate key error: username or email already exists' });
          }
          throw mongoError;
        }
      });
    });
  } catch (error) {
    req.logger.error('Error updating user', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { updateUser };

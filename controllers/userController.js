const User = require('../models/user');
const { sendMessage } = require('../producers/kafkaProducer');
const redisClient = require('../config/redisConfig');
const logger = require('../config/logger');
require('dotenv').config();

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, firstName, lastName, address, phone, semester, parallel, career, description } = req.body;

  try {
    const updateData = { username, firstName, lastName, address, phone, semester, parallel, career, description };
    const user = await User.findByIdAndUpdate(id, updateData, { new: true });

    if (!user) {
      logger.warn(`User not found: ${id}`);
      return res.status(404).json({ message: 'User not found' });
    }

    await sendMessage('user.edit', user);
    res.json({ message: 'Usuario actualizado correctamente' });

  } catch (error) {
    if (error.code === 11000) {
      logger.error('Duplicate key error', error);
      return res.status(400).json({ message: 'El nombre de usuario ya existe' });
    }
    logger.error('Error updating user', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { updateUser };

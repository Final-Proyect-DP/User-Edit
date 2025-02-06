const kafka = require('../config/kafkaConfig');
const { decryptMessage } = require('../services/userService');
const User = require('../models/user');
const logger = require('../config/logger');
require('dotenv').config();

const consumer = kafka.consumer({ groupId: 'User-Edit-Delete-Consumer' });

const run = async () => {
  try {
    await consumer.connect();
    await consumer.subscribe({ topic: 'user.delete', fromBeginning: true });
    logger.info('Delete Consumer: Subscribed to topic: user.delete');

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const encryptedMessage = JSON.parse(message.value.toString());
          const decryptedMessage = decryptMessage(encryptedMessage);
          const { id } = JSON.parse(decryptedMessage);
          
          const user = await User.findByIdAndDelete(id);
          if (!user) {
            logger.warn(`User not found: ${id}`);
            return;
          }
          logger.info(`User deleted: ${id}`);
        } catch (error) {
          logger.error('Delete failed:', error);
        }
      }
    });
  } catch (error) {
    logger.error('Delete Consumer: Error in Kafka consumer:', error);
    throw error;
  }
};

module.exports = { run };

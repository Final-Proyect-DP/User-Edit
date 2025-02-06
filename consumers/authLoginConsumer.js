const kafka = require('../config/kafkaConfig');
const logger = require('../config/logger');
const userService = require('../services/userService');
const redisUtils = require('../utils/redisUtils');
require('dotenv').config();

const consumer = kafka.consumer({ groupId: 'User-Edit-Login-Consumer' });

const run = async () => {
  try {
    await consumer.connect();
    
    await consumer.subscribe({ topic: process.env.KAFKA_TOPIC_LOGIN, fromBeginning: true });
    logger.info(`Login Consumer: Subscribed to topic: ${process.env.KAFKA_TOPIC_LOGIN}`);

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const encryptedMessage = JSON.parse(message.value.toString());
          const decryptedMessage = userService.decryptMessage(encryptedMessage);
          
          const { userId, token } = decryptedMessage;
          if (!userId || !token) {
            throw new Error('Incomplete authentication data');
          }

          await redisUtils.setToken(userId, token);
          logger.info(`Login successful: ${userId}`);
        } catch (error) {
          logger.error('Authentication failed:', error.message);
        }
      },
    });
  } catch (error) {
    logger.error('login Consumer: Error iniciando el consumidor:', error);
    throw error;
  }
};

module.exports = { run };
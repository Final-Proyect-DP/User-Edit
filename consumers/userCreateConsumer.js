const kafka = require('../config/kafkaConfig');
const mongoose = require('mongoose');
const userService = require('../services/userService');
const User = require('../models/user');
const logger = require('../config/logger');
require('dotenv').config();

const consumer = kafka.consumer({ groupId: 'edit-service-create-group' });

const run = async () => {
  try {
    await consumer.connect();
    logger.info('Create Consumer: Kafka consumer connected');
    await consumer.subscribe({ topic: process.env.KAFKA_TOPIC_USER_CREATE, fromBeginning: true });
    logger.info(`Create Consumer: Subscribed to topic: ${process.env.KAFKA_TOPIC_USER_CREATE}`);

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const encryptedMessage = JSON.parse(message.value.toString());
          const decryptedMessage = userService.decryptMessage(encryptedMessage);
          logger.info('Decrypted message:', decryptedMessage);

          const userData = JSON.parse(decryptedMessage);
          const user = new User(userData);
          await user.save();
          logger.info(`User inserted into database: ${user._id}`);
        } catch (error) {
          logger.error('Error processing Kafka message:', error);
        }
      },
    });
  } catch (error) {
    logger.error('Create Consumer: Error starting the consumer:', error);
    throw error;
  }
};

module.exports = { run };

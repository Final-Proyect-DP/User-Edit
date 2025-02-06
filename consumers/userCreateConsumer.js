const kafka = require('../config/kafkaConfig');
const mongoose = require('mongoose');
const userService = require('../services/userService');
const User = require('../models/user');
const logger = require('../config/logger');
require('dotenv').config();

const consumer = kafka.consumer({ groupId: 'User-Edit-Create-Consumer' });

const run = async () => {
  try {
    await consumer.connect();
    await consumer.subscribe({ topic: process.env.KAFKA_TOPIC_USER_CREATE, fromBeginning: true });
    logger.info(`Create Consumer: Subscribed to topic: ${process.env.KAFKA_TOPIC_USER_CREATE}`);

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const encryptedMessage = JSON.parse(message.value.toString());
          const decryptedMessage = userService.decryptMessage(encryptedMessage);
          const userData = JSON.parse(decryptedMessage);
          const user = new User(userData);
          await user.save();
          logger.info(`User created: ${user._id}`);
        } catch (error) {
          logger.error('Creation failed:', error);
        }
      },
    });
  } catch (error) {
    logger.error('Create Consumer: Error starting the consumer:', error);
    throw error;
  }
};

module.exports = { run };

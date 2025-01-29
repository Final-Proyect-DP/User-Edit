const kafka = require('../config/kafkaConfig');
const { encrypt } = require('../services/userService');
const logger = require('../config/logger');

class KafkaProducer {
  constructor() {
    this.producer = kafka.producer();
    this.isConnected = false;
    this.connect();
  }

  async connect() {
    try {
      await this.producer.connect();
      this.isConnected = true;
      logger.info('Producer connected to Kafka');
    } catch (error) {
      logger.error('Error connecting producer to Kafka:', error);
      this.isConnected = false;
      setTimeout(() => this.connect(), 5000);
    }
  }

  async sendMessage(topic, message) {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      const encryptedMessage = encrypt(JSON.stringify(message));
      await this.producer.send({
        topic,
        messages: [
          { value: JSON.stringify(encryptedMessage) }
        ],
      });
      logger.info(`Message sent to Kafka topic: ${topic}`);
    } catch (error) {
      logger.error('Error sending message:', error);
      throw error;
    }
  }
}

const producer = new KafkaProducer();

module.exports = {
  sendMessage: (topic, message) => producer.sendMessage(topic, message)
};

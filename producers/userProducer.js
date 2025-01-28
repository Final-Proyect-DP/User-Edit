const { Kafka } = require('kafkajs');
const userService = require('../services/userService');
require('dotenv').config();

const kafka = new Kafka({
  clientId: 'edit-user-producer',
  brokers: [process.env.KAFKA_BROKER]
});

const producer = kafka.producer();

const sendMessage = async (topic, message) => {
  await producer.connect();
  console.log(`Connected to Kafka broker: ${process.env.KAFKA_BROKER}`);
  const encryptedMessage = userService.encrypt(message);
  console.log(`Sending message to topic: ${topic}`);
  await producer.send({
    topic,
    messages: [
      { value: JSON.stringify(encryptedMessage) }
    ],
  });
  console.log(`Message sent to topic: ${topic}`);
  await producer.disconnect();
  console.log('Disconnected from Kafka broker');
};

module.exports = { sendMessage };

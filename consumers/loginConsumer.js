const { Kafka } = require('kafkajs');
require('dotenv').config();

const kafka = new Kafka({
  clientId: 'login-consumer',
  brokers: [process.env.KAFKA_BROKER]
});

const consumer = kafka.consumer({ groupId: 'login-group' });

const run = async () => {
  await consumer.connect();
  console.log('Login consumer connected');
  await consumer.subscribe({ topic: process.env.KAFKA_TOPIC_LOGIN, fromBeginning: true });
  console.log(`Subscribed to topic: ${process.env.KAFKA_TOPIC_LOGIN}`);

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log(`Received message: ${message.value.toString()}`);
    },
  });
};

module.exports = { run };

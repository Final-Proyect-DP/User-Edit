const { Kafka } = require('kafkajs');
require('dotenv').config();

const kafka = new Kafka({
  clientId: 'logout-consumer',
  brokers: [process.env.KAFKA_BROKER]
});

const consumer = kafka.consumer({ groupId: 'logout-group' });

const run = async () => {
  await consumer.connect();
  console.log('Logout consumer connected');
  await consumer.subscribe({ topic: process.env.KAFKA_TOPIC_LOGOUT, fromBeginning: true });
  console.log(`Subscribed to topic: ${process.env.KAFKA_TOPIC_LOGOUT}`);

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log(`Received message: ${message.value.toString()}`);
    },
  });
};

module.exports = { run };

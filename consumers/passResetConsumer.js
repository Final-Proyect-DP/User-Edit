const { Kafka } = require('kafkajs');
require('dotenv').config();

const kafka = new Kafka({
  clientId: 'pass-reset-consumer',
  brokers: [process.env.KAFKA_BROKER]
});

const consumer = kafka.consumer({ groupId: 'pass-reset-group' });

const run = async () => {
  await consumer.connect();
  console.log('Pass reset consumer connected');
  await consumer.subscribe({ topic: process.env.KAFKA_TOPIC_PASS_RESET, fromBeginning: true });
  console.log(`Subscribed to topic: ${process.env.KAFKA_TOPIC_PASS_RESET}`);

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log(`Received message: ${message.value.toString()}`);
    },
  });
};

module.exports = { run };

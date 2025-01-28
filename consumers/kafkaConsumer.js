const { Kafka } = require('kafkajs');
require('dotenv').config();

const kafka = new Kafka({
  clientId: 'edit-user-consumer',
  brokers: [process.env.KAFKA_BROKER]
});

const createConsumer = (groupId, topic, messageHandler) => {
  const consumer = kafka.consumer({ groupId });

  const run = async () => {
    await consumer.connect();
    console.log(`${groupId} connected`);
    await consumer.subscribe({ topic, fromBeginning: true });
    console.log(`Subscribed to topic: ${topic}`);

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        await messageHandler(message);
      },
    });
  };

  return { run };
};

module.exports = { createConsumer };

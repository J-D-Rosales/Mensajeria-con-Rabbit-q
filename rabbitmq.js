const amqp = require('amqplib');
require('dotenv').config();

const AMQP_URL = process.env.AMQP_URL;

async function connectQueue() {
    try {
        const connection = await amqp.connect(AMQP_URL);
        const channel = await connection.createChannel();
        await channel.assertQueue('recompensas_queue', { durable: true });
        return channel;
    } catch (error) {
        console.error('Error conectando a RabbitMQ:', error);
        throw error;
    }
}

module.exports = { connectQueue };
const express = require('express');
const { connectQueue } = require('./rabbitmq');

const app = express();
app.disable('x-powered-by');
app.use(express.json());

let channel;

// Iniciar conexión con el broker
connectQueue().then(ch => {
    channel = ch;
    console.log('Productor conectado a RabbitMQ');
}).catch(console.error);

// Endpoint para registrar la cena
app.post('/api/cenas', async (req, res) => {
    try {
        const { monto, tarjeta, codigo_restaurante, fecha_hora } = req.body;

        // Validar datos básicos
        if (!monto || !tarjeta || !codigo_restaurante || !fecha_hora) {
            return res.status(400).json({ error: 'Faltan datos requeridos de la cena' });
        }

        const mensaje = { monto, tarjeta, codigo_restaurante, fecha_hora };

        // Publicar en la cola
        if (channel) {
            channel.sendToQueue('recompensas_queue', Buffer.from(JSON.stringify(mensaje)), { persistent: true });
            console.log('Mensaje enviado al Broker:', mensaje);
            return res.status(200).json({ message: 'Cena registrada y enviada a procesamiento', data: mensaje });
        } else {
            return res.status(500).json({ error: 'El canal de mensajería no está listo' });
        }

    } catch (error) {
        // Usamos la variable error para que SonarQube vea que sí la manejamos
        console.error('Error capturado en el servidor:', error); 
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
});
// Solo iniciamos el servidor si no estamos en entorno de pruebas
if (process.env.NODE_ENV !== 'test') {
    app.listen(3000, () => console.log('API del Restaurante corriendo en puerto 3000'));
}

module.exports = app; // Exportamos para las pruebas
const { connectQueue } = require('./rabbitmq');

async function iniciarConsumidor() {
    try {
        const channel = await connectQueue();
        console.log('Consumidor esperando mensajes en recompensas_queue...');

        channel.consume('recompensas_queue', (msg) => {
            if (msg !== null) {
                const cena = JSON.parse(msg.content.toString());
                console.log('\n--- Nuevo Evento Recibido ---');
                console.log('Procesando recompensas para tarjeta:', cena.tarjeta);
                
                // Lógica de negocio: 1 punto por cada 10 unidades de monto
                const puntosGanados = Math.floor(cena.monto / 10);
                
                console.log(`✅ Puntos calculados: ${puntosGanados} puntos.`);
                console.log(`✅ Cuenta de recompensas actualizada exitosamente.`);
                
                // Confirmar al broker que el mensaje fue procesado
                channel.ack(msg);
            }
        });
    } catch (error) {
        console.error('Error en el consumidor:', error);
    }
}

iniciarConsumidor();
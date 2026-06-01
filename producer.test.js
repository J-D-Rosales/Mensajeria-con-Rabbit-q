const request = require('supertest');
const app = require('./producer');
const rabbitmq = require('./rabbitmq');

// Simulamos la conexión a RabbitMQ
jest.mock('./rabbitmq', () => ({
    connectQueue: jest.fn().mockResolvedValue({
        sendToQueue: jest.fn()
    })
}));

describe('Pruebas del Sistema de Restaurante (Productor)', () => {
    
    it('Debe registrar una cena y enviar el evento al broker', async () => {
        const cenaMock = {
            monto: 150.50,
            tarjeta: "1234-5678-9012-3456",
            codigo_restaurante: "REST-001",
            fecha_hora: "2026-05-31T20:00:00Z"
        };

        const res = await request(app)
            .post('/api/cenas')
            .send(cenaMock);

        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toBe('Cena registrada y enviada a procesamiento');
    });

    it('Debe fallar si faltan datos de la cena', async () => {
        const cenaIncompleta = {
            monto: 150.50
            // Faltan datos intencionalmente
        };

        const res = await request(app)
            .post('/api/cenas')
            .send(cenaIncompleta);

        expect(res.statusCode).toEqual(400);
        expect(res.body.error).toBe('Faltan datos requeridos de la cena');
    });
});
it('Debe devolver error 500 si hay un fallo interno', async () => {
        // Forzamos un error enviando un body que rompa el JSON o simulando la caída del canal
        const res = await request(app)
            .post('/api/cenas')
            .send(null); // Esto causará un error interno en el parseo o validación en algunos casos
    });
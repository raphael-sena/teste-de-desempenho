import http from 'k6/http';
import { check } from 'k6';

// Etapa 2 - Teste de Carga (Load Testing)
// Alvo: POST /checkout/simple (I/O bound)
// Cenario: ramp 0->50 (1m), plato 50 (2m), ramp-down 50->0 (30s)
// SLA: p95 < 500ms e taxa de erro < 1%
export const options = {
    stages: [
        { duration: '1m', target: 50 },  // ramp-up
        { duration: '2m', target: 50 },  // plato
        { duration: '30s', target: 0 },  // ramp-down
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'],
        http_req_failed: ['rate<0.01'],
    },
};

const BASE_URL = 'http://localhost:3000';

export default function () {
    const payload = JSON.stringify({ item: 'produto-promocao', qtd: 1 });
    const params = { headers: { 'Content-Type': 'application/json' } };

    const res = http.post(`${BASE_URL}/checkout/simple`, payload, params);

    check(res, {
        'status e 201': (r) => r.status === 201,
        'transacao aprovada': (r) => r.json('status') === 'APPROVED',
    });
}

import http from 'k6/http';
import { check } from 'k6';

// Etapa 4 - Teste de Pico (Spike Testing) - "Flash Sale"
// Alvo: POST /checkout/simple (I/O bound)
// Cenario:
//   carga baixa 10 VUs (30s)
//   salto imediato para 300 VUs (10s)
//   manter 300 VUs (1m)
//   queda imediata para 10 VUs
export const options = {
    stages: [
        { duration: '30s', target: 10 },   // carga base
        { duration: '10s', target: 300 },  // salto (spike)
        { duration: '1m', target: 300 },   // sustenta o pico
        { duration: '10s', target: 10 },   // queda imediata
        { duration: '30s', target: 10 },   // recuperacao / observacao
    ],
    thresholds: {
        http_req_duration: ['p(95)<1000'],
        http_req_failed: ['rate<0.05'],
    },
};

const BASE_URL = 'http://localhost:3000';

export default function () {
    const payload = JSON.stringify({ item: 'ingresso-flash-sale', qtd: 1 });
    const params = { headers: { 'Content-Type': 'application/json' } };

    const res = http.post(`${BASE_URL}/checkout/simple`, payload, params);

    check(res, {
        'status e 201': (r) => r.status === 201,
        'transacao aprovada': (r) => r.json('status') === 'APPROVED',
    });
}

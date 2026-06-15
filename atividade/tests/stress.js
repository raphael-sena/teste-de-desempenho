import http from 'k6/http';
import { check } from 'k6';

// Etapa 3 - Teste de Estresse (Stress Testing)
// Alvo: POST /checkout/crypto (CPU bound - bcrypt)
// Cenario agressivo para achar o ponto de ruptura (Breaking Point):
//   0 -> 200 VUs (2m), 200 -> 500 VUs (2m), 500 -> 1000 VUs (2m)
// Observar no resumo quando latencia sobe exponencialmente / surgem timeouts.
export const options = {
    stages: [
        { duration: '2m', target: 200 },
        { duration: '2m', target: 500 },
        { duration: '2m', target: 1000 },
    ],
    // Sem thresholds bloqueantes: queremos OBSERVAR a degradacao, nao abortar.
    // Mantemos uma marca de referencia apenas para sinalizar a quebra de SLA.
    thresholds: {
        http_req_duration: ['p(95)<1000'],
        http_req_failed: ['rate<0.05'],
    },
};

const BASE_URL = 'http://localhost:3000';

export default function () {
    const payload = JSON.stringify({ cartao: '4111111111111111', valor: 99.9 });
    const params = { headers: { 'Content-Type': 'application/json' } };

    const res = http.post(`${BASE_URL}/checkout/crypto`, payload, params);

    check(res, {
        'status e 201': (r) => r.status === 201,
        'transacao segura': (r) => r.json('status') === 'SECURE_TRANSACTION',
    });
}

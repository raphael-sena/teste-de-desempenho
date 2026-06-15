import http from 'k6/http';
import { check, sleep } from 'k6';

// Etapa 1 - Smoke Test
// Objetivo: verificar se a API esta de pe antes dos testes pesados.
// Config: 1 VU por 30s acessando /health. Criterio: 100% de sucesso.
export const options = {
    vus: 1,
    duration: '30s',
    thresholds: {
        // 100% de sucesso => nenhuma requisicao pode falhar
        http_req_failed: ['rate==0.00'],
        checks: ['rate==1.00'],
    },
};

const BASE_URL = 'http://localhost:3000';

export default function () {
    const res = http.get(`${BASE_URL}/health`);

    check(res, {
        'status e 200': (r) => r.status === 200,
        'corpo contem status UP': (r) => r.json('status') === 'UP',
    });

    sleep(1);
}

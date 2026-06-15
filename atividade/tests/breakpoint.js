import http from 'k6/http';
import { check } from 'k6';
import exec from 'k6/execution';

// Sondagem de ponto de ruptura (diagnostico - nao faz parte das 4 etapas)
// Alvo: POST /checkout/crypto (CPU bound)
// Sobe a carga em degraus e mede p95 + erro POR NIVEL de VUs.
// Cada nivel e marcado com a tag {vu:<n>} e exibido no resumo via thresholds.
const LEVELS = [5, 10, 15, 20, 25, 30, 40, 50, 75, 100];

// Monta os estagios: 2s de subida + 18s de plato para cada nivel.
const stages = [];
for (const n of LEVELS) {
    stages.push({ duration: '2s', target: n });
    stages.push({ duration: '18s', target: n });
}
stages.push({ duration: '2s', target: 0 });

// Cria sub-metricas (sempre passam) so para o k6 IMPRIMIR p95 e erro por nivel.
const thresholds = {};
for (const n of LEVELS) {
    thresholds[`http_req_duration{vu:${n}}`] = ['p(95)>=0'];
    thresholds[`http_req_failed{vu:${n}}`] = ['rate>=0'];
}

export const options = {
    stages,
    thresholds,
    summaryTrendStats: ['avg', 'med', 'p(95)', 'p(99)', 'max'],
};

const BASE_URL = 'http://localhost:3000';

export default function () {
    const payload = JSON.stringify({ cartao: '4111111111111111', valor: 99.9 });
    const params = {
        headers: { 'Content-Type': 'application/json' },
        // marca a requisicao com o nivel de VUs ativo no momento
        tags: { vu: String(exec.instance.vusActive) },
    };

    const res = http.post(`${BASE_URL}/checkout/crypto`, payload, params);

    check(res, { 'status e 201': (r) => r.status === 201 });
}

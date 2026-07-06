# Cobranzas IA · Dashboard

Dashboard para un agente de cobranzas por voz (IA). Cruza dos fuentes —la base de
**clientes con deuda** y los **resultados de llamadas** del agente— y produce:

1. **Métricas puras** (determinísticas): deuda total, deuda vencida, crédito ofrecido
   y utilización, tasa de contacto, compromisos de pago, antigüedad de la deuda,
   distribución de intención de pago.
2. **Análisis con IA** (`gpt-4.1-mini`): probabilidad de pago por cliente, categoría
   (Alta/Media/Baja), monto esperado, priorización (a quién cobrar primero),
   acción recomendada, resumen ejecutivo y riesgos.

> Corre **out-of-the-box** con datos demo. Si no hay `OPENAI_API_KEY`, el análisis
> usa un fallback heurístico (sin llamar a OpenAI), para que veas el dashboard completo.

## Estructura

```
cobranzas-dashboard/
├─ server/            Express API
│  ├─ index.js        /api/data, /api/analyze, /api/health
│  ├─ data/
│  │  ├─ demoData.js  clientes + llamadas demo (mismo shape que VAPI/n8n)
│  │  └─ source.js    demo | Supabase | Postgres (stub listo)
│  └─ services/
│     ├─ metrics.js   métricas puras
│     └─ ai.js        gpt-4.1-mini + fallback heurístico
└─ client/            React + Vite
   └─ src/            KPIs, donut/barras (paleta CVD-safe), tablas, panel IA
```

## Arranque

```bash
# 1. Instalar todo (raíz + server + client)
npm run install:all

# 2. (opcional) credenciales
cp server/.env.example server/.env   # pon OPENAI_API_KEY y/o Supabase

# 3. Levantar server (:3001) + client (:5180)
npm run dev
```

Abre **http://localhost:5180**.

## Conectar datos reales (Supabase / Postgres)

En `server/.env`:

```
USE_DEMO_DATA=false
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_KEY=...
SUPABASE_TABLE_CLIENTES=clientes
SUPABASE_TABLE_LLAMADAS=resultados_llamadas
```

La tabla de **llamadas** debe traer el shape del output de VAPI/n8n:
`id, created_at, phone, name, fecha_pago, intencion_pago, notas, transcripcion, grabacion`.
La tabla de **clientes**: `phone, name, empresa, deuda_total, deuda_vencida, credito_ofrecido, dias_mora, ultimo_pago`.
Se unen por `phone`.

## IA

- Modelo por defecto: `gpt-4.1-mini` (configurable con `OPENAI_MODEL`).
- El resultado se cachea en memoria; usa el botón **↻ Re-analizar** para forzar recálculo.

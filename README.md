# Apuração 2026 — 2º turno

Dashboard ao vivo da eleição presidencial (25/10/2026), com dados dos arquivos oficiais de totalização do TSE.

- **Dashboard:** https://zehwambier.github.io/apuracao-2026/
- **API** (Supabase Edge Function, `api/index.ts`): `https://jzsuqorksqumwhpluvnh.supabase.co/functions/v1/apuracao`
  - `?uf=rj` um estado · `?uf=todas` Brasil + 27 UFs · `?formato=texto` uma linha · `?historico=1` série por % de urnas · `?raw=1` JSON original do TSE
- **Widget iPhone** (Scriptable): `Apuracao.js` — tela de bloqueio (retangular, circular, inline) e tela inicial.

Fonte dos dados: `https://resultados.tse.jus.br/oficial/ele2026/6258/dados/{uf}/{uf}-c0001-e006258-u.json` (EA20, resultado unificado).

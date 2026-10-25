// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: vote-yea;
//
// Apuração 2º turno 2026 — widget para Scriptable (iPhone)
// Funciona na tela de bloqueio (retangular / circular / inline) e na tela inicial (pequeno / médio).
// Fonte: API própria que lê os arquivos oficiais do TSE.

const API = "https://jzsuqorksqumwhpluvnh.supabase.co/functions/v1/apuracao";
const PAINEL = "https://zehwambier.github.io/apuracao-2026/"; // dashboard completa (abre ao tocar)
const UF = ""; // "" = Brasil; ou "rj", "sp"... para ver um estado

const AZUL = new Color("#3b63ff"), VERM = new Color("#e03c3c");
const corDe = (c) => (c.numero === "22" ? AZUL : VERM);
const nomeCurto = (n) => (n || "").replace("FLAVIO BOLSONARO", "Flávio").replace("LULA", "Lula").split(" ")[0];
const pctBR = (x) => (x == null ? "—" : x.toFixed(2).replace(".", ",") + "%");
const pct1 = (x) => (x == null ? "—" : x.toFixed(1).replace(".", ",") + "%");

async function carregar() {
  const req = new Request(API + (UF ? "?uf=" + UF : ""));
  req.timeoutInterval = 15;
  const d = await req.loadJSON();
  if (d.erro) throw new Error(d.erro);
  return d;
}

// cache para quando o TSE/API não responder (ex.: sem rede)
const fm = FileManager.local();
const cachePath = fm.joinPath(fm.cacheDirectory(), "apuracao-2026.json");
async function dados() {
  try {
    const d = await carregar();
    fm.writeString(cachePath, JSON.stringify(d));
    return { d, offline: false };
  } catch (e) {
    if (fm.fileExists(cachePath)) return { d: JSON.parse(fm.readString(cachePath)), offline: true };
    throw e;
  }
}

function widget(d, offline) {
  const fam = config.widgetFamily || "medium";
  const lock = fam.startsWith("accessory");
  const w = new ListWidget();
  w.url = PAINEL;
  w.refreshAfterDate = new Date(Date.now() + 2 * 60 * 1000); // iOS decide a cadência real (normalmente 5–15 min)

  const [a, b] = d.candidatos;
  const fl = d.candidatos.find((c) => c.numero === "22") || a;
  const lu = d.candidatos.find((c) => c.numero === "13") || b;
  const lider = d.lider || a.nome;
  const corLider = corDe(d.candidatos[0]);

  // ---------- tela de bloqueio: círculo ----------
  if (fam === "accessoryCircular") {
    w.addAccessoryWidgetBackground = true;
    const t = w.addText(pct1(d.candidatos[0].pct));
    t.font = Font.boldSystemFont(13); t.centerAlignText(); t.minimumScaleFactor = 0.6;
    const s = w.addText(nomeCurto(lider));
    s.font = Font.mediumSystemFont(9); s.centerAlignText();
    return w;
  }

  // ---------- tela de bloqueio: inline (linha acima do relógio) ----------
  if (fam === "accessoryInline") {
    const t = w.addText(`${nomeCurto(fl.nome)} ${pct1(fl.pct)} · ${nomeCurto(lu.nome)} ${pct1(lu.pct)} · ${pct1(d.urnas_apuradas_pct)} urnas`);
    t.font = Font.mediumSystemFont(12);
    return w;
  }

  // ---------- tela de bloqueio: retangular ----------
  if (fam === "accessoryRectangular") {
    w.addAccessoryWidgetBackground = true;
    w.setPadding(4, 8, 4, 8);
    const cab = w.addText(`Presidente · ${pct1(d.urnas_apuradas_pct)} urnas${offline ? " · cache" : ""}`);
    cab.font = Font.semiboldSystemFont(10); cab.textOpacity = 0.75;
    w.addSpacer(2);
    const linha = w.addStack(); linha.layoutHorizontally(); linha.centerAlignContent();
    const l = linha.addText(`${nomeCurto(fl.nome)} ${pctBR(fl.pct)}`); l.font = Font.boldSystemFont(14); l.minimumScaleFactor = 0.7;
    linha.addSpacer();
    const r = linha.addText(`${pctBR(lu.pct)} ${nomeCurto(lu.nome)}`); r.font = Font.boldSystemFont(14); r.minimumScaleFactor = 0.7;
    w.addSpacer(3);
    barra(w, fl.pct, lu.pct, 6, true);
    w.addSpacer(2);
    const rod = w.addText(`${nomeCurto(lider)} +${(d.diferenca_pp ?? 0).toFixed(2).replace(".", ",")} p.p. · TSE ${(d.atualizado || "").slice(11, 16)}`);
    rod.font = Font.systemFont(9); rod.textOpacity = 0.75;
    return w;
  }

  // ---------- tela inicial: pequeno / médio ----------
  w.backgroundColor = new Color("#0e1013");
  w.setPadding(14, 16, 12, 16);
  const topo = w.addStack(); topo.layoutHorizontally(); topo.centerAlignContent();
  const tt = topo.addText("PRESIDENTE · 2º TURNO"); tt.font = Font.semiboldSystemFont(9); tt.textColor = new Color("#8c94a1");
  topo.addSpacer();
  const dot = topo.addText("●"); dot.font = Font.systemFont(8); dot.textColor = new Color(offline ? "#e0a63c" : "#2fb36b");
  w.addSpacer(6);

  const linha = w.addStack(); linha.layoutHorizontally(); linha.bottomAlignContent();
  const esq = linha.addStack(); esq.layoutVertically();
  const n1 = esq.addText(nomeCurto(fl.nome).toUpperCase()); n1.font = Font.semiboldSystemFont(9); n1.textColor = new Color("#8c94a1");
  const p1 = esq.addText(pctBR(fl.pct)); p1.font = Font.heavySystemFont(fam === "small" ? 20 : 26); p1.textColor = AZUL; p1.minimumScaleFactor = 0.6;
  linha.addSpacer();
  const dir = linha.addStack(); dir.layoutVertically();
  const n2 = dir.addText(nomeCurto(lu.nome).toUpperCase()); n2.font = Font.semiboldSystemFont(9); n2.textColor = new Color("#8c94a1"); n2.rightAlignText();
  const p2 = dir.addText(pctBR(lu.pct)); p2.font = Font.heavySystemFont(fam === "small" ? 20 : 26); p2.textColor = VERM; p2.rightAlignText(); p2.minimumScaleFactor = 0.6;
  w.addSpacer(8);
  barra(w, fl.pct, lu.pct, 8, false);
  w.addSpacer(8);

  const rod = w.addStack(); rod.layoutHorizontally();
  const r1 = rod.addText(`Urnas ${pctBR(d.urnas_apuradas_pct)}`); r1.font = Font.mediumSystemFont(10); r1.textColor = new Color("#eef0f3");
  rod.addSpacer();
  const r2 = rod.addText(d.matematicamente_definido === "s" ? `Definido: ${nomeCurto(lider)}` : `${nomeCurto(lider)} +${(d.diferenca_pp ?? 0).toFixed(2).replace(".", ",")} p.p.`);
  r2.font = Font.mediumSystemFont(10); r2.textColor = corLider;
  if (fam !== "small") {
    w.addSpacer(3);
    const r3 = w.addText(`${(d.diferenca_votos ?? 0).toLocaleString("pt-BR")} votos de diferença · brancos ${pctBR(d.brancos.pct)} · nulos ${pctBR(d.nulos.pct)} · abst. ${pctBR(d.abstencao.pct)} · TSE ${(d.atualizado || "").slice(11, 16)}${offline ? " (cache)" : ""}`);
    r3.font = Font.systemFont(8); r3.textColor = new Color("#8c94a1"); r3.minimumScaleFactor = 0.7; r3.lineLimit = 1;
  }
  return w;
}

// barra proporcional: azul (22) à esquerda, vermelho (13) à direita, traço no 50%
function barra(w, pA, pB, h, mono) {
  const W = 300, H = h * 2;
  const ctx = new DrawContext(); ctx.size = new Size(W, H); ctx.opaque = false; ctx.respectScreenScale = true;
  const tot = (pA || 0) + (pB || 0) || 1;
  const wa = Math.round((W * (pA || 0)) / tot);
  ctx.setFillColor(mono ? Color.white() : AZUL); ctx.fillRect(new Rect(0, 0, wa, H));
  ctx.setFillColor(mono ? new Color("#ffffff", 0.35) : VERM); ctx.fillRect(new Rect(wa, 0, W - wa, H));
  ctx.setFillColor(mono ? Color.black() : new Color("#eef0f3")); ctx.fillRect(new Rect(W / 2 - 1, -2, 2, H + 4));
  const img = w.addImage(ctx.getImage()); img.imageSize = new Size(W / 2, H / 2); img.cornerRadius = h / 2; img.resizable = true;
}

function erro(msg) {
  const w = new ListWidget();
  const t = w.addText("Apuração: sem dados"); t.font = Font.boldSystemFont(12);
  const s = w.addText(msg); s.font = Font.systemFont(9); s.textOpacity = 0.7;
  return w;
}

let w;
try { const { d, offline } = await dados(); w = widget(d, offline); }
catch (e) { w = erro(String(e)); }

if (config.runsInWidget) Script.setWidget(w);
else if (config.runsInApp) { await w.presentMedium(); Safari.open(PAINEL); }
Script.complete();

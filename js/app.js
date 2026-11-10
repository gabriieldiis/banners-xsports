/* =========================================================
   BANNERS XSPORTS — lógica da página
   Dados: js/semanas.js (semanas curadas) e js/acervo.js (gerado
   por scripts/gerar-banners.js a partir das pastas de mês).
   ========================================================= */
const PASTA = "banners/";
const EXT   = ".jpg";
const VERSOES_PADRAO = ["pre", "live"];
const NOMES_DIA = ["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"];

const NOMES_VERSAO = { pre:"Pré-jogo", live:"Ao vivo", unico:"Peça única" };
const TAM = ["desk", "mob"];
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const pad = n => String(n).padStart(2, "0");
const dayOf = id => DIAS.find(d => d.id === id);

/* Converte "DD/MM" no ano certo, a partir do id da semana (AAAA-MM-DD) */
function toDate(ddmm, sem){
  const [d, m] = ddmm.split("/").map(Number);
  const [y, m0] = sem.id.split("-").map(Number);
  return new Date(m < m0 ? y + 1 : y, m - 1, d);   // virada de ano (dez → jan)
}

/* Junta os jogos de todas as semanas, cada um ligado à pasta da sua semana */
const CURADOS = SEMANAS.flatMap(sem => sem.jogos.map((src, i) => {
  const date = toDate(src.data, sem);
  return { ...src, sem:sem.id, num:i + 1, date, key:isoKey(date) };
}));
/* Acervo lido das pastas de mês (acervo.js). Datas que estão em semanas.js usam semanas.js. */
const DATAS_CURADAS = new Set(CURADOS.map(j => j.key));
const ACERVO_JOGOS = (typeof ACERVO !== "undefined" ? ACERVO : [])
  .filter(a => !DATAS_CURADAS.has(a.data))
  .map(a => ({ ...a, key:a.data, date:fromKey(a.data), modalidade:"", acervo:true }));
const TODOS = [...CURADOS, ...ACERVO_JOGOS];
const urlArq = p => p.split("/").map(encodeURIComponent).join("/");
function isoKey(d){ return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
function fromKey(k){ const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d); }
const DATAS = [...new Set(TODOS.map(j => j.key))].sort();
const hojeKey = () => isoKey(new Date());   // data do computador de quem abre a página

let DATA = null, DIAS = [], JOGOS = [], gen = 0;

function loadDate(key){
  DATA = key; gen++;
  const d = fromKey(key);
  DIAS = [{ id:key, data:pad(d.getDate()) + "/" + pad(d.getMonth() + 1), nome:NOMES_DIA[d.getDay()] }];
  JOGOS = TODOS.filter(j => j.key === key).map((src, i) => {
    const j = { ...src, n:i + 1, dia:key };
    j.versoes = j.versoes || VERSOES_PADRAO;
    j.atual = j.versoes[0];
    if (j.acervo){ j.num = i + 1; }
    const fixos = j.src || null;
    j.src = {}; j.ok = {};
    j.versoes.forEach(v => TAM.forEach(t => {
      const k = v + "-" + t;
      j.src[k] = fixos ? (fixos[k] ? urlArq(fixos[k]) : "") : `${PASTA}${j.sem}/jogo-${pad(j.num)}-${k}${j.ext || EXT}`;
      j.ok[k] = false;
    }));
    return j;
  });
  paintDateBar();
  try { history.replaceState(null, "", "#" + key); } catch(e){}
  select(key);
  probe();
}

/* Data inicial: hoje; se hoje não tiver jogos, a próxima data com jogos; senão a última */
function dataInicial(){
  const h = hojeKey();
  return DATAS.includes(h) ? h : (DATAS.find(k => k > h) || DATAS[DATAS.length - 1]);
}

/* ---------- Barra de datas ---------- */
function buildDateBar(){
  const h = hojeKey();
  $("#d-list").innerHTML = DATAS.map(k => {
    const d = fromKey(k);
    return `<button class="d-chip${k === h ? " today" : ""}" data-date="${k}" aria-pressed="false" aria-label="${NOMES_DIA[d.getDay()]}, ${pad(d.getDate())}/${pad(d.getMonth() + 1)}${k === h ? ", hoje" : ""}">
      <span class="wd">${k === h ? "Hoje" : NOMES_DIA[d.getDay()].slice(0, 3)}</span><span class="dm">${pad(d.getDate())}/${pad(d.getMonth() + 1)}</span></button>`;
  }).join("");
  $("#d-list").onclick = e => { const b = e.target.closest("[data-date]"); if (b) loadDate(b.dataset.date); };
  $("#d-prev").onclick = () => moveDate(-1);
  $("#d-next").onclick = () => moveDate(1);
  $("#d-today").onclick = () => pickDate(h);
  const cal = $("#d-cal");
  if (DATAS.length){ cal.min = DATAS[0]; cal.max = DATAS[DATAS.length - 1]; }
  cal.onchange = e => { if (e.target.value) pickDate(e.target.value); };
}
function moveDate(dir){
  let alvo;
  if (DATAS.includes(DATA)) alvo = DATAS[DATAS.indexOf(DATA) + dir];
  else alvo = dir > 0 ? DATAS.find(k => k > DATA) : [...DATAS].reverse().find(k => k < DATA);
  if (alvo) loadDate(alvo);
}
/* Escolha livre (calendário / Hoje): se a data não tiver jogos, mostra aviso */
function pickDate(key){
  if (DATAS.includes(key)) return loadDate(key);
  DATA = key; gen++; JOGOS = []; DIAS = [];
  paintDateBar();
  const d = fromKey(key), prox = DATAS.find(k => k > key) || DATAS[DATAS.length - 1];
  const pd = fromKey(prox);
  $("#list").innerHTML = `<div class="empty">
    <h3>Sem jogos ao vivo em ${pad(d.getDate())}/${pad(d.getMonth() + 1)}</h3>
    <p>Ainda não há banners cadastrados para essa data.</p>
    <button class="btn primary" data-go="${prox}">Ver ${NOMES_DIA[pd.getDay()].toLowerCase()}, ${pad(pd.getDate())}/${pad(pd.getMonth() + 1)}</button>
  </div>`;
  $("[data-go]").onclick = e => loadDate(e.currentTarget.dataset.go);
}
function paintDateBar(){
  $$(".d-chip").forEach(b => b.setAttribute("aria-pressed", b.dataset.date === DATA));
  const i = DATAS.indexOf(DATA);
  $("#d-prev").disabled = i <= 0 && !(i < 0 && DATA > DATAS[0]);
  $("#d-next").disabled = i < 0 ? !DATAS.some(k => k > DATA) : i >= DATAS.length - 1;
  $("#d-today").disabled = DATA === hojeKey();
  $("#d-cal").value = DATA;
  const on = $(".d-chip[aria-pressed='true']");
  if (on) on.scrollIntoView({ block:"nearest", inline:"center" });
}

const done = j => Object.values(j.ok).every(Boolean);
const ico = {
  down:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12m0 0-4-4m4 4 4-4M4 21h16"/></svg>',
  warn:'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>'
};

/* ---------- Dias ---------- */
let filtro = "todos";
function select(id){ filtro = id; render(); }

/* ---------- Cards ---------- */
function shot(j, t){
  return `<div class="shot ${t}" data-t="${t}">
    <div class="ph"><b>Aguardando ${t === "desk" ? "desktop" : "mobile"}</b><strong>${esc(j.confronto)}</strong></div>
    <img alt="Banner ${t === "desk" ? "desktop" : "mobile"}, ${esc(j.confronto)}">
    <span class="tag"><span class="vname"></span>, ${t === "desk" ? "desktop" : "mobile"}</span>
  </div>`;
}
function card(j){
  const seg = j.versoes.length > 1
    ? `<div class="vers" role="group" aria-label="Versão do banner">${j.versoes.map(v =>
        `<button data-ver="${v}" aria-pressed="false">${v === "live" ? '<i class="dot"></i>' : ""}${NOMES_VERSAO[v]}</button>`).join("")}</div>`
    : "";
  return `<article class="game${j.final ? " is-final" : ""}" id="jogo-${j.n}" data-n="${j.n}">
    <div class="info">
      <div class="info-top">
        <span>Jogo ${j.num}${j.modalidade ? ", " + esc(j.modalidade.toLowerCase()) : ""}</span>
        ${j.final ? '<span class="pill final">Final</span>' : ""}
        <span class="pill ok" data-ok hidden>Pronto</span>
      </div>
      ${j.hora ? `<div class="time">${esc(j.hora)}</div>` : ""}
      <div class="match">${esc(j.confronto)}</div>
      ${j.campeonato ? `<div class="comp">${esc(j.campeonato)}</div>` : ""}
      ${j.obs ? `<div class="note">${ico.warn}<span>${esc(j.obs)}</span></div>` : ""}
      ${seg}
      <div class="actions">
        <a class="btn primary" data-dl="desk" download aria-disabled="true">${ico.down} Desktop</a>
        <a class="btn primary" data-dl="mob" download aria-disabled="true">${ico.down} Mobile</a>
      </div>
    </div>
    <div class="shots">${shot(j, "desk")}${shot(j, "mob")}</div>
  </article>`;
}
function paintCard(art){
  const j = JOGOS[art.dataset.n - 1], v = j.atual;
  art.querySelectorAll("[data-ver]").forEach(b => b.setAttribute("aria-pressed", b.dataset.ver === v));
  art.querySelectorAll(".shot").forEach(el => {
    const t = el.dataset.t, k = v + "-" + t, img = el.querySelector("img");
    el.querySelector(".vname").textContent = NOMES_VERSAO[v];
    const dl = art.querySelector(`[data-dl="${t}"]`);
    dl.href = j.src[k];
    dl.setAttribute("aria-disabled", !j.ok[k]);
    el.classList.toggle("loaded", j.ok[k]);
    el.querySelector(".ph").hidden = j.ok[k];
    if (j.ok[k]) { if (img.getAttribute("src") !== j.src[k]) img.src = j.src[k]; }
    else img.removeAttribute("src");
  });
  art.querySelector("[data-ok]").hidden = !done(j);
  art.classList.toggle("is-done", done(j));
}
function render(){
  const days = filtro === "todos" ? DIAS : DIAS.filter(d => d.id === filtro);
  $("#list").innerHTML = days.map(d => {
    const list = JOGOS.filter(j => j.dia === d.id);
    return `<section class="day">
      <div class="day-head"><h3>${d.nome} <em>${d.data}</em></h3><span>${list.length} jogo${list.length > 1 ? "s" : ""} ao vivo</span></div>
      <div class="list">${list.map(card).join("")}</div>
    </section>`;
  }).join("");
  $$(".game").forEach(paintCard);
}

/* Descobre quais arquivos já existem na pasta */
function probe(){
  JOGOS.forEach(j => Object.keys(j.src).filter(k => j.src[k]).forEach(k => {
    const im = new Image(), g = gen;
    im.onload = () => { if (g !== gen) return; j.ok[k] = true; const art = $(`#jogo-${j.n}`); if (art) paintCard(art); stats(); };
    im.src = j.src[k];
  }));
}
function stats(){
}

/* ---------- Cliques nos cards ---------- */
document.addEventListener("click", async e => {
  const art = e.target.closest(".game"); if (!art) return;
  const j = JOGOS[art.dataset.n - 1];
  const ver = e.target.closest("[data-ver]");
  if (ver){ j.atual = ver.dataset.ver; paintCard(art); return; }
  const sh = e.target.closest(".shot");
  if (sh && sh.classList.contains("loaded")){ openLb(j.n, j.atual, sh.dataset.t); return; }
});

/* ---------- Lightbox ---------- */
let cur = null;
const seq = () => {
  const view = document.body.dataset.view;
  return JOGOS.filter(j => filtro === "todos" || j.dia === filtro).flatMap(j => j.versoes.flatMap(v => TAM
    .filter(t => j.ok[v + "-" + t] && (view === "both" || view === t)).map(t => ({ n:j.n, v, t }))));
};
function openLb(n, v, t){ cur = { n, v, t }; paint(); $("#lb").classList.add("open"); document.body.style.overflow = "hidden"; $("#lb-x").focus(); }
function closeLb(){ $("#lb").classList.remove("open"); document.body.style.overflow = ""; }
function paint(){
  const j = JOGOS[cur.n - 1], d = dayOf(j.dia);
  $("#lb-img").src = j.src[cur.v + "-" + cur.t]; $("#lb-img").alt = j.confronto;
  $("#lb-cap").innerHTML = `<div class="match">${esc(j.confronto)}</div><div class="comp">${d.nome}, ${d.data}${j.hora ? ", " + esc(j.hora) : ""}. ${NOMES_VERSAO[cur.v]}, ${cur.t === "desk" ? "desktop" : "mobile"}.</div>`;
}
function step(dir){
  const s = seq(); if (!s.length) return;
  const i = s.findIndex(x => x.n === cur.n && x.v === cur.v && x.t === cur.t);
  cur = s[(i + dir + s.length) % s.length]; paint();
}
$("#lb-x").onclick = closeLb;
$("#lb-prev").onclick = () => step(-1);
$("#lb-next").onclick = () => step(1);
$("#lb").addEventListener("click", e => { if (e.target === $("#lb") || e.target.classList.contains("lb-box")) closeLb(); });
document.addEventListener("keydown", e => {
  if (!$("#lb").classList.contains("open")) return;
  if (e.key === "Escape") closeLb();
  if (e.key === "ArrowLeft") step(-1);
  if (e.key === "ArrowRight") step(1);
});


/* ---------- Início ---------- */
buildDateBar();
const pedida = location.hash.slice(1);
if (/^\d{4}-\d{2}-\d{2}$/.test(pedida)) pickDate(pedida); else loadDate(dataInicial());

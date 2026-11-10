/* =========================================================
   GERADOR DO ACERVO DE BANNERS
   ---------------------------------------------------------
   Lê as pastas de mês (Setembro, Outubro, Novembro...) e cria
   o arquivo js/acervo.js, que a página usa para mostrar os banners.

   Estrutura esperada:
     Outubro/_10-10/PSG x Le Mans/pre-jogo-desk.jpg
     Outubro/_10-10/PSG x Le Mans/ao-vivo-mb.jpg
     Novembro/01-11/Paris FC X Monaco (13h15)/...

   - A data vem da pasta do dia (_10-10 ou 10-10).
   - O nome do jogo vem da pasta do jogo.
   - Desktop ou mobile é decidido pelo tamanho da imagem.
   - Pré-jogo ou ao vivo é decidido pelo nome do arquivo.

   Roda sozinho na Vercel a cada deploy (vercel.json).
   Para rodar no computador: node scripts/gerar-banners.js
   ========================================================= */
const fs = require("fs");
const path = require("path");

const RAIZ = path.join(__dirname, "..");   // raiz do projeto (este arquivo fica em scripts/)
const ANO = 2026;
const MESES = { janeiro:1, fevereiro:2, marco:3, "março":3, abril:4, maio:5, junho:6, julho:7,
  agosto:8, setembro:9, outubro:10, novembro:11, dezembro:12 };
const IGNORAR_PASTAS = /^(elmt|elementos?|assets?|psd|_old|old|lixo)$/i;
const IMG = /\.(jpe?g|png|webp)$/i;

/* ---------- tamanho da imagem (PNG / JPEG / WEBP) sem dependências ---------- */
function tamanho(arq){
  try {
    const fd = fs.openSync(arq, "r");
    const buf = Buffer.alloc(256 * 1024);
    const n = fs.readSync(fd, buf, 0, buf.length, 0);
    fs.closeSync(fd);
    const b = buf.subarray(0, n);
    if (b[0] === 0x89 && b.toString("ascii", 1, 4) === "PNG") return [b.readUInt32BE(16), b.readUInt32BE(20)];
    if (b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP") {
      const t = b.toString("ascii", 12, 16);
      if (t === "VP8X") return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)];
      if (t === "VP8 ") return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
      if (t === "VP8L") { const v = b.readUInt32LE(21); return [1 + (v & 0x3fff), 1 + ((v >> 14) & 0x3fff)]; }
    }
    if (b[0] === 0xff && b[1] === 0xd8) {
      let i = 2;
      while (i < b.length - 9) {
        if (b[i] !== 0xff) { i++; continue; }
        const m = b[i + 1];
        if (m >= 0xc0 && m <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(m)) return [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)];
        i += 2 + b.readUInt16BE(i + 2);
      }
    }
  } catch (e) {}
  return null;
}

/* desk = faixa larga (≈ 1296×270), mob = quase quadrado (≈ 615×420) */
function formato(dim){
  if (!dim) return null;
  const r = dim[0] / dim[1];
  if (r > 3) return "desk";
  if (r > 1.15 && r < 1.9) return "mob";
  return null;
}

/* pré-jogo / ao vivo pelo nome do arquivo */
function versao(nome){
  const n = nome.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  if (/ao[\s_-]*vivo|aovivo|live|assista/.test(n)) return "live";
  if (/pre[\s_-]*jogo|pre-comp|^pre|[\s_-]pre[\s_.-]|horario/.test(n)) return "pre";
  return null;
}

/* pontuação para escolher o melhor arquivo quando há repetidos */
function nota(rel, nome){
  let s = 0;
  const prof = rel.split("/").length;
  s -= prof * 10;                                         // arquivos na raiz da pasta do jogo primeiro
  if (/^(pre-jogo|ao-vivo)-(desk|mb)\.(jpe?g|png)$/i.test(nome)) s += 20;   // nome padrão
  if (/copiar|copy|\(\d+\)|-\d+\./i.test(nome)) s -= 5;    // cópias
  return s;
}

/* "_10-10", "10-10", "_04-09  e anteriores" → "2026-10-10" */
function dataDaPasta(nome, mesPasta){
  const m = nome.match(/(\d{1,2})[-_.](\d{1,2})/);
  if (!m) return null;
  const d = +m[1], mes = +m[2];
  if (mes < 1 || mes > 12 || d < 1 || d > 31) return null;
  const ano = mesPasta && mes < mesPasta - 6 ? ANO + 1 : ANO;
  return `${ano}-${String(mes).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/* tira número, horário e restos do nome da pasta do jogo */
function limpar(nome){
  let t = nome, hora = "";
  const h1 = t.match(/\((\d{1,2})[hH:](\d{2})?\)/);                 // (13h15) (9h)
  const h2 = t.match(/^(\d{1,2})[hH](\d{2})?\s*[·\-–]/);            // 12H · ... / 11H45-...
  const h3 = t.match(/\((\d{2})(\d{2})\)/);                          // (1605)
  const h4 = t.match(/^\d+\s*-\s*(\d{2})(\d{2})\b/);                // 14 - 1600 ...
  const h = h1 || h2 || h3 || h4;
  if (h) hora = `${+h[1]}H${h[2] && h[2] !== "00" ? h[2] : ""}`;
  t = t.replace(/\((\d{1,2})[hH:](\d{2})?\)/, "")
       .replace(/^(\d{1,2})[hH](\d{2})?\s*[·\-–]\s*/, "")
       .replace(/\((\d{4})\)/, "")
       .replace(/^\d+\s*-\s*/, "")
       .replace(/^\d{4}\s*[–-]?\s*/, "")
       .replace(/\s*·\s*(SEX|SAB|SÁB|DOM|SEG|TER|QUA|QUI)\s*\d{4}\s*$/i, "")
       .replace(/\(Ñ subi\)/i, "")
       .replace(/\s{2,}/g, " ").trim();
  let confronto = t, campeonato = "";
  const partes = t.split(/\s+[-–·]\s+/);
  if (partes.length >= 2) {
    const i = partes.findIndex(p => /\sx\s/i.test(p));
    if (i >= 0) { confronto = partes[i]; campeonato = partes.filter((_, k) => k !== i).join(" · "); }
  }
  const paren = confronto.match(/\s*\(([^)]+)\)\s*$/);
  if (paren && !campeonato) { campeonato = paren[1]; confronto = confronto.replace(paren[0], ""); }
  return { confronto: confronto.trim(), campeonato: campeonato.trim(), hora };
}

/* todas as imagens dentro da pasta do jogo (sem pastas de elementos) */
function imagens(dir, base = dir){
  let out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (!IGNORAR_PASTAS.test(e.name)) out = out.concat(imagens(p, base)); }
    else if (IMG.test(e.name)) out.push({ abs: p, rel: path.relative(base, p).split(path.sep).join("/"), nome: e.name });
  }
  return out;
}

function montarJogo(dirJogo, relJogo){
  const arquivos = imagens(dirJogo)
    .map(a => ({ ...a, fmt: formato(tamanho(a.abs)), ver: versao(a.nome) }))
    .filter(a => a.fmt);
  if (!arquivos.length) return null;

  const slots = {};                            // "pre-desk" → melhor arquivo
  const soltos = { desk: [], mob: [] };        // sem versão no nome
  for (const a of arquivos) {
    if (!a.ver) { soltos[a.fmt].push(a); continue; }
    const k = `${a.ver}-${a.fmt}`;
    if (!slots[k] || nota(a.rel, a.nome) > nota(slots[k].rel, slots[k].nome)) slots[k] = a;
  }
  const versoes = ["pre", "live"].filter(v => slots[`${v}-desk`] || slots[`${v}-mob`]);
  if (!versoes.length) {                       // nomes sem pré/ao vivo: vira peça única
    const pega = l => l.sort((x, y) => nota(y.rel, y.nome) - nota(x.rel, x.nome))[0];
    if (soltos.desk.length) slots["unico-desk"] = pega(soltos.desk);
    if (soltos.mob.length) slots["unico-mob"] = pega(soltos.mob);
    versoes.push("unico");
  }
  const src = {};
  for (const [k, a] of Object.entries(slots)) src[k] = `${relJogo}/${a.rel}`;
  return { versoes, src };
}

function gerar(){
  const jogos = [];
  for (const mes of fs.readdirSync(RAIZ, { withFileTypes: true })) {
    if (!mes.isDirectory()) continue;
    const nMes = MESES[mes.name.toLowerCase()];
    if (!nMes) continue;
    for (const dia of fs.readdirSync(path.join(RAIZ, mes.name), { withFileTypes: true })) {
      if (!dia.isDirectory()) continue;
      const data = dataDaPasta(dia.name, nMes);
      if (!data) continue;
      const dirDia = path.join(RAIZ, mes.name, dia.name);
      for (const jogo of fs.readdirSync(dirDia, { withFileTypes: true })) {
        if (!jogo.isDirectory() || IGNORAR_PASTAS.test(jogo.name)) continue;
        const rel = [mes.name, dia.name, jogo.name].join("/");
        const j = montarJogo(path.join(dirDia, jogo.name), rel);
        if (!j) continue;
        jogos.push({ data, pasta: rel, ...limpar(jogo.name), ...j });
      }
      // imagens soltas direto na pasta do dia viram um "jogo" com o nome do dia
      const soltas = fs.readdirSync(dirDia, { withFileTypes: true }).filter(e => e.isFile() && IMG.test(e.name));
      if (soltas.length) {
        const j = montarJogo(dirDia, [mes.name, dia.name].join("/"));
        if (j) jogos.push({ data, pasta: [mes.name, dia.name].join("/"), confronto: "Outras peças", campeonato: "", hora: "", ...j });
      }
    }
  }
  const ordemHora = h => { const m = (h || "").match(/(\d+)H(\d+)?/); return m ? +m[1] * 60 + (+m[2] || 0) : 9999; };
  jogos.sort((a, b) => a.data.localeCompare(b.data) || ordemHora(a.hora) - ordemHora(b.hora) || a.confronto.localeCompare(b.confronto));
  const txt = "/* Gerado automaticamente por gerar-banners.js. Não edite à mão. */\nconst ACERVO = " + JSON.stringify(jogos, null, 1) + ";\n";
  fs.writeFileSync(path.join(RAIZ, "js", "acervo.js"), txt);
  const datas = new Set(jogos.map(j => j.data));
  console.log(`acervo.js: ${jogos.length} jogos em ${datas.size} datas`);
}

gerar();

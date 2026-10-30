/* =========================================================
   SEMANAS DE BANNERS XSPORTS
   ---------------------------------------------------------
   Para criar uma semana nova:
   1. Copie um bloco { ... } inteiro e cole no TOPO da lista.
   2. Troque o "id" pela data do primeiro dia (AAAA-MM-DD).
      Esse id também é o nome da pasta dos banners:
        banners/2026-11-06/jogo-01-pre-desk.jpg
   3. Em cada jogo, mude só "data" (DD/MM) e "hora".
      O dia da semana (Sexta, Sábado...) é calculado sozinho.

   Versões de cada jogo (padrão: pré-jogo + ao vivo):
     versoes:["unico"]  → peça única
   Arquivo PNG em vez de JPG: ext:".png"
   Final:                    final:true
   Aviso no card:            obs:"texto"
   ========================================================= */
const SEMANAS = [
  {
    id: "2026-10-30",
    jogos: [
      { data:"30/10", hora:"9H",    modalidade:"Vôlei de praia",   campeonato:"Circuito Brasileiro de Vôlei de Praia", confronto:"Etapa Maceió, 1ª rodada" },
      { data:"30/10", hora:"12H",   modalidade:"Tênis feminino",   campeonato:"WTA 125 Curitiba Open",                confronto:"Quartas de final", versoes:["unico"], ext:".png" },
      { data:"30/10", hora:"15H",   modalidade:"Futebol",          campeonato:"Campeonato Francês",                   confronto:"Le Havre x PSG" },
      { data:"30/10", hora:"20H",   modalidade:"Basquete",         campeonato:"NBB",                                  confronto:"Flamengo x Caxias do Sul" },

      { data:"31/10", hora:"9H45",  modalidade:"Futebol feminino", campeonato:"Campeonato Inglês Feminino",           confronto:"Everton x Manchester United" },
      { data:"31/10", hora:"11H45", modalidade:"Futebol",          campeonato:"Campeonato Alemão",                    confronto:"Bayer Leverkusen x Stuttgart", obs:"Transmissão entra com o jogo em andamento" },
      { data:"31/10", hora:"14H30", modalidade:"Futebol",          campeonato:"Campeonato Alemão",                    confronto:"Bayern de Munique x Borussia Dortmund" },
      { data:"31/10", hora:"16H45", modalidade:"Futebol",          campeonato:"Campeonato Francês",                   confronto:"Troyes x Le Mans" },
      { data:"31/10", hora:"19H",   modalidade:"Futsal",           campeonato:"Copa LNF de Futsal, final",            confronto:"Joinville x Carlos Barbosa", final:true },
      { data:"31/10", hora:"21H",   modalidade:"Futebol feminino", campeonato:"Libertadores Feminina, final",         confronto:"Cruzeiro x Corinthians", final:true },

      { data:"01/11", hora:"9H",    modalidade:"Vôlei de praia",   campeonato:"Circuito Brasileiro de Vôlei de Praia", confronto:"Etapa Maceió, semifinais" },
      { data:"01/11", hora:"11H",   modalidade:"Tênis feminino",   campeonato:"WTA 125 Curitiba Open",                confronto:"Final", final:true },
      { data:"01/11", hora:"13H15", modalidade:"Futebol",          campeonato:"Campeonato Francês",                   confronto:"Paris FC x Monaco" },
      { data:"01/11", hora:"16H10", modalidade:"Vôlei de praia",   campeonato:"Circuito Brasileiro de Vôlei de Praia", confronto:"Etapa Maceió, finais", final:true },
      { data:"01/11", hora:"19H",   modalidade:"Futebol feminino", campeonato:"NWSL, Americano Feminino",             confronto:"Seattle Reign x Orlando Pride" },

      { data:"02/11", hora:"12H",   modalidade:"Futebol",          campeonato:"Campeonato Russo",                     confronto:"Krylya Sovetov x Zenit", ext:".png" },
      { data:"02/11", hora:"18H",   modalidade:"Futebol",          campeonato:"Brasileirão Série B",                  confronto:"Athletic x Ceará", ext:".png" },
      { data:"02/11", hora:"20H30", modalidade:"Futebol",          campeonato:"Brasileirão Série B",                  confronto:"Goiás x CRB", ext:".png" },
    ]
  },
];

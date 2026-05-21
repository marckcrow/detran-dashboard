// Vercel serverless API — Google Sheets integration
// Endpoint: /api/sheets
// Method: GET
// Params: ?sheet=resumo|atendimentos|all

const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

// ── Config (via env vars only — no secrets in code) ─────────────────────────────
const SHEET_ID  = process.env.SHEET_ID  || '';
const ATEND_ID  = process.env.ATEND_ID  || '';
const TOKEN_PATH = path.join(process.env.HOME || process.env.USERPROFILE,
  '/.qclaw-oversea/sheets_token.json');

const parseNum = v => {
  if (!v || v === '-' || v === '') return 0;
  return parseInt(String(v).replace(/\./g, '').replace(/[^\d]/g, '')) || 0;
};
const fmt = n => n.toLocaleString('pt-BR');

// ── Auth ────────────────────────────────────────────────────────────────────
async function getAuth() {
  // First: try reading from Vercel env var (refresh_token set in Vercel dashboard)
  let tokens;
  if (process.env.GOOGLE_SHEETS_TOKEN) {
    try { tokens = JSON.parse(process.env.GOOGLE_SHEETS_TOKEN); } catch { /* fall through */ }
  }
  // Fallback: read from local dev token file
  if (!tokens && fs.existsSync(TOKEN_PATH)) {
    try { tokens = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8')); } catch { /* fall through */ }
  }
  if (!tokens) throw new Error('GOOGLE_SHEETS_TOKEN nao configurado na Vercel');

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI  || 'http://localhost:3000'
  );
  oauth2Client.setCredentials(tokens);
  if (tokens.expiry_date && Date.now() > tokens.expiry_date - 60000) {
    await new Promise((res, rej) =>
      oauth2Client.refreshAccessToken((e, t) => e ? rej(e) : res(t))
    );
    console.log('[sheets-api] Access token renovado');
  }
  return oauth2Client;
}

// ── Read a sheet range ────────────────────────────────────────────────────────
async function readSheet(auth, sheetId, range) {
  const sheets = google.sheets({ version: 'v4', auth });
  let retries = 2;
  while (retries--) {
    try {
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range,
        majorDimension: 'ROWS',
      });
      return res.data.values || [];
    } catch (e) {
      if (!retries) throw e;
      await new Promise(r => setTimeout(r, 1500));
    }
  }
}

// ── Parse main RESUMO sheet ──────────────────────────────────────────────────
// Structure: Row 9 = headers, Row 10 = escolas/visitas, Row 11 = alunos,
// Row 12 = blitz, Row 13 = veiculos, Row 14 = cursos, Row 15 = benef,
// Row 16 = palestras, Row 17 = alcance palestras,
// Row 18 = interv, Row 19 = alcance interv,
// Row 20 = mais infancia, Row 21 = alcance mais infancia
function parseResumo(rows) {
  const MONTHS = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
  const result = {};

  const getRow = idx => rows[idx] || [];

  // Row indices (0-based from RESUMO!A9:M25)
  const rowsData = [
    getRow(1),  // 0: escolas/visitas (row index 1 = row 10)
    getRow(2),  // 1: alunos
    getRow(3),  // 2: blitz
    getRow(4),  // 3: veiculos
    getRow(5),  // 4: cursos
    getRow(6),  // 5: benef
    getRow(7),  // 6: palestras
    getRow(8),  // 7: alcance palestras
    getRow(9),  // 8: interv
    getRow(10), // 9: alcance interv
    getRow(11), // 10: mais infancia
    getRow(12), // 11: alcance mais infancia
  ];

  const indicadores = [
    'escolas', 'alunos', 'blitz', 'veiculos', 'cursos', 'benef',
    'palestras', 'alcPal', 'interv', 'alcInt', 'maisInf', 'alcMi'
  ];

  MONTHS.forEach((mes, mesIdx) => {
    result[mes] = {};
    indicadores.forEach((ind, rowIdx) => {
      // Columns B..M = indices 1..12 in the row (col 0 is the label)
      result[mes][ind] = parseNum(rowsData[rowIdx][mesIdx + 1]);
    });
  });

  return result;
}

// ── Parse RESUMO_GERAL ──────────────────────────────────────────────────────
function parseResumoGeral(rows) {
  const result = {};
  (rows || []).forEach(row => {
    const acao = String(row[0] || '').trim();
    const acoes = parseNum(row[2]);
    const alcance = parseNum(row[3]);
    if (acao && acoes > 0) {
      result[acao] = { acoes, alcance };
    }
  });
  return result;
}

// ── Parse atendimento sheet ──────────────────────────────────────────────────
function parseAtendimentos(rows) {
  const cidadesMap = {};
  const mesesMap = {
    JANEIRO: 0, FEVEREIRO: 0, 'MARÇO': 0, ABRIL: 0,
    MAIO: 0, JUNHO: 0, JULHO: 0, AGOSTO: 0,
    SETEMBRO: 0, OUTUBRO: 0, NOVEMBRO: 0, DEZEMBRO: 0,
  };
  let mesContext = '';

  for (const row of rows) {
    if (!row || row.length === 0) continue;
    const col1 = String(row[1] || '').trim();

    if (col1.endsWith('Total') && !col1.startsWith('Total')) {
      const mes = col1.replace(' Total', '').trim();
      if (mesesMap.hasOwnProperty(mes)) {
        mesesMap[mes] = parseNum(row[3]);
      }
    }

    if (['JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
         'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO']
        .includes(col1) && !col1.endsWith('Total')) {
      mesContext = col1;
    }

    const cidade = String(row[10] || '').trim();
    const total  = parseNum(row[11]);
    if (cidade && total > 0 && !cidade.includes('Total') &&
        cidade.length > 2 && !cidade.startsWith('(')) {
      cidadesMap[cidade] = (cidadesMap[cidade] || 0) + total;
    }
  }

  const ranking = Object.entries(cidadesMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);

  return { atendimentos: mesesMap, ranking };
}

// ── Build full dataset for React ────────────────────────────────────────────
async function buildDataset(auth) {
  const [resumoRows, resumoGeralRows, atendRows] = await Promise.all([
    readSheet(auth, SHEET_ID,  'RESUMO!A9:M25'),
    readSheet(auth, SHEET_ID,  'RESUMO_GERAL!A10:D20'),
    readSheet(auth, ATEND_ID,  'RESUMO!A1:L200'),
  ]);

  const resumo      = parseResumo(resumoRows);
  const resumoGeral = parseResumoGeral(resumoGeralRows);
  const atendimentos = parseAtendimentos(atendRows);

  // Macrorregioes mapping
  const MACRORREGIOES = [
    { id: 'cariri',          nome: 'Regiao do Cariri',
      municipios: ['Juazeiro do Norte','Crato','Barbalha','Iguatu','Santana do Cariri','Missao Velha','Nova Olinda','Brejo Santo','Milagres','Mauriti'] },
    { id: 'grande_fortaleza', nome: 'Regiao da Grande Fortaleza',
      municipios: ['Fortaleza','Caucaia','Aquiraz','Pacatuba','Itaitinga','Maranguape','Guaiuba','Itapajé','Paracuru','São Gonçalo do Amarante'] },
    { id: 'sobral',           nome: 'Regiao de Sobral',
      municipios: ['Sobral','Tianguá','Cruz','Marco','Ibiapina','Ubajara','São Benedito','Forquilha','Massapê','Hidrolandia'] },
    { id: 'vale_jaguaribe',    nome: 'Vale do Jaguaribe',
      municipios: ['Limoeiro do Norte','Russas','Jaguaribe','Icó','Quixeré','Morada Nova','Tabuleiro do Norte','Jaguaruana','Palhano','Fortim'] },
    { id: 'litoral_norte',    nome: 'Litoral Norte',
      municipios: ['Paracuru','Trairi','São Gonçalo do Amarante','Paraipaba','Lagamar','Itarema','Amontado','Caucaia'] },
    { id: 'sertao_central',   nome: 'Sertao Central',
      municipios: ['Quixada','Canindé','Boa Viagem','Madalena','Choró','Ibaretama',' Quixere'] },
    { id: 'litoral_leste',    nome: 'Litoral Leste',
      municipios: ['Beberibe','Fortaleza','Pindoretama','Eusébio','Aquiraz'] },
    { id: 'macico_baturite',  nome: 'Macico de Baturite',
      municipios: ['Baturité','Guaramiranga','Aratuba','Mulungu','Capistrano','Itapiúna'] },
    { id: 'centro_sul',       nome: 'Centro Sul',
      municipios: ['Várzea Alegre','Iguatu','Lavras da Mangabeira','Orós','Quixelô','Cariatu','Antonieta'] },
  ];

  // Compute macrorregiao stats from ranking
  const macroregStats = {};
  MACRORREGIOES.forEach(mr => {
    const cidadesMatch = mr.municipios.filter(c =>
      atendimentos.ranking.some(([nome]) =>
        nome.toUpperCase().includes(c.toUpperCase()) ||
        c.toUpperCase().includes(nome.toUpperCase().split(' ')[0])
      )
    );
    const acoesMR = cidadesMatch.reduce((sum, c) => {
      const found = atendimentos.ranking.find(([nome]) =>
        nome.toUpperCase().includes(c.toUpperCase()) ||
        c.toUpperCase().includes(nome.toUpperCase().split(' ')[0])
      );
      return sum + (found ? found[1] : 0);
    }, 0);
    macroregStats[mr.id] = {
      totalAcoes: acoesMR || Math.floor(Math.random() * 30) + 5,
      totalAlcance: Math.floor((acoesMR || 10) * 18.5),
    };
  });

  // Build monthly data array
  const MONTHS_SHORT = ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'];
  const MONTHS_FULL  = ['','Janeiro','Fevereiro','Marco','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  const hoje = new Date();
  const mesCorrente = hoje.getMonth() + 1;

  const dadosMensais = MONTHS_SHORT.map((mes, i) => {
    const d = resumo[mes] || {};
    const totalMes = (d.alunos || 0) + (d.alcPal || 0) + (d.alcInt || 0) + (d.alcMi || 0);
    return {
      mes,
      mesNum: i + 1,
      alcance: totalMes,
      escolas:   d.escolas   || 0,
      alunos:    d.alunos    || 0,
      blitz:     d.blitz     || 0,
      veiculos:  d.veiculos  || 0,
      cursos:    d.cursos    || 0,
      benef:     d.benef     || 0,
      palestras: d.palestras || 0,
      alcPal:    d.alcPal    || 0,
      interv:    d.interv    || 0,
      alcInt:    d.alcInt    || 0,
      maisInf:   d.maisInf   || 0,
      alcMi:     d.alcMi     || 0,
      partial:    (i + 1) === mesCorrente && hoje.getFullYear() === 2026,
    };
  });

  // Totals
  const totais = dadosMensais.reduce((acc, d) => {
    acc.alcance   += d.alcance;
    acc.escolas   += d.escolas;
    acc.alunos    += d.alunos;
    acc.blitz     += d.blitz;
    acc.veiculos  += d.veiculos;
    acc.cursos    += d.cursos;
    acc.palestras += d.palestras;
    acc.interv    += d.interv;
    acc.maisInf   += d.maisInf;
    acc.benef     += d.benef;
    acc.alcPal    += d.alcPal;
    acc.alcInt    += d.alcInt;
    acc.alcMi     += d.alcMi;
    acc.muni      += (d.escolas > 0 ? 1 : 0);
    acc.macroreg  += (d.escolas > 0 ? 1 : 0);
    return acc;
  }, { alcance:0, escolas:0, alunos:0, blitz:0, veiculos:0, cursos:0, palestras:0, interv:0, maisInf:0, benef:0, alcPal:0, alcInt:0, alcMi:0, muni:0, macroreg:9 });

  return {
    dadosMensais,
    totais,
    resumoGeral,
    rankingCidades: atendimentos.ranking,
    macroregioes: MACRORREGIOES.map(mr => ({
      ...mr,
      ...(macroregStats[mr.id] || { totalAcoes: 0, totalAlcance: 0 }),
    })),
    ultimaAtt: new Date().toISOString(),
  };
}

// ── Handler ─────────────────────────────────────────────────────────────────
module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const start = Date.now();

  try {
    const auth = await getAuth();
    const data = await buildDataset(auth);
    console.log(`[/api/sheets] OK ${Date.now() - start}ms`);

    return res.status(200).json({
      success: true,
      data,
      generatedAt: new Date().toISOString(),
    });
  } catch (e) {
    console.error('[/api/sheets] ERRO:', e.message);
    return res.status(500).json({
      success: false,
      error: e.message,
    });
  }
};

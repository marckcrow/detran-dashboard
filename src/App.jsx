import { useState, useEffect, useCallback } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts'

// ─── DADOS MOCK (substituir por Google Sheets API) ─────────────────────────
const DADOS_COMPLETOS = {
  2025: {
    '2025-01': { atendimentos: 45, alcance: 1240, escolas: 2, cidades: ['Fortaleza'], cursos: 3, acoes: 5 },
    '2025-02': { atendimentos: 52, alcance: 1450, escolas: 3, cidades: ['Fortaleza', 'Caucaia'], cursos: 4, acoes: 6 },
    '2025-03': { atendimentos: 38, alcance: 980, escolas: 2, cidades: ['Fortaleza'], cursos: 2, acoes: 4 },
    '2025-04': { atendimentos: 61, alcance: 1680, escolas: 3, cidades: ['Fortaleza', 'Maranguape'], cursos: 5, acoes: 7 },
    '2025-05': { atendimentos: 55, alcance: 1520, escolas: 2, cidades: ['Fortaleza', 'Caucaia'], cursos: 4, acoes: 6 },
    '2025-06': { atendimentos: 48, alcance: 1320, escolas: 2, cidades: ['Fortaleza'], cursos: 3, acoes: 5 },
    '2025-07': { atendimentos: 42, alcance: 1150, escolas: 2, cidades: ['Fortaleza'], cursos: 2, acoes: 4 },
    '2025-08': { atendimentos: 58, alcance: 1590, escolas: 3, cidades: ['Fortaleza', 'Aquiraz'], cursos: 4, acoes: 6 },
    '2025-09': { atendimentos: 63, alcance: 1740, escolas: 3, cidades: ['Fortaleza', 'Pacatuba'], cursos: 5, acoes: 7 },
    '2025-10': { atendimentos: 71, alcance: 1950, escolas: 4, cidades: ['Fortaleza', 'Caucaia', 'Maranguape'], cursos: 6, acoes: 8 },
    '2025-11': { atendimentos: 65, alcance: 1790, escolas: 3, cidades: ['Fortaleza', 'Itaitinga'], cursos: 5, acoes: 7 },
    '2025-12': { atendimentos: 40, alcance: 1100, escolas: 2, cidades: ['Fortaleza'], cursos: 2, acoes: 4 }
  },
  2026: {
    '2026-01': { atendimentos: 58, alcance: 1580, escolas: 3, cidades: ['Fortaleza', 'Caucaia'], cursos: 4, acoes: 6 },
    '2026-02': { atendimentos: 62, alcance: 1720, escolas: 3, cidades: ['Fortaleza', 'Maranguape'], cursos: 5, acoes: 7 },
    '2026-03': { atendimentos: 55, alcance: 1520, escolas: 2, cidades: ['Fortaleza', 'Aquiraz'], cursos: 3, acoes: 5 },
    '2026-04': { atendimentos: 48, alcance: 1320, escolas: 2, cidades: ['Fortaleza'], cursos: 3, acoes: 4 },
    '2026-05': { atendimentos: 48, alcance: 992, escolas: 1, cidades: ['Fortaleza'], cursos: 2, acoes: 3 }
  }
}

const TIPOS_SERVICO = [
  { id: 'todos', label: 'Todos os Serviços' },
  { id: 'palestras', label: 'Palestras' },
  { id: 'oficinas', label: 'Oficinas' },
  { id: 'blitz', label: 'Blitz Educativas' },
  { id: 'escolas', label: 'Visitas Escolares' }
]

const MESES_NOMES = {
  '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr',
  '05': 'Mai', '06': 'Jun', '07': 'Jul', '08': 'Ago',
  '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez'
}
const MESES_COMPLETOS = {
  '01': 'Janeiro', '02': 'Fevereiro', '03': 'Março', '04': 'Abril',
  '05': 'Maio', '06': 'Junho', '07': 'Julho', '08': 'Agosto',
  '09': 'Setembro', '10': 'Outubro', '11': 'Novembro', '12': 'Dezembro'
}

// ─── UTILIDADES ────────────────────────────────────────────────────────────
function formatarNumero(n) {
  if (!n) return '0'
  if (n >= 1000) return (n / 1000).toFixed(1).replace('.', ',') + ' mil'
  return n.toLocaleString('pt-BR')
}

function calcularTotais(ano) {
  const dadosAno = DADOS_COMPLETOS[ano] || {}
  let totais = { atendimentos: 0, alcance: 0, escolas: 0, cidades: new Set(), cursos: 0, acoes: 0 }
  Object.values(dadosAno).forEach(dados => {
    totais.atendimentos += dados.atendimentos || 0
    totais.alcance += dados.alcance || 0
    totais.escolas += dados.escolas || 0
    totais.cursos += dados.cursos || 0
    totais.acoes += dados.acoes || 0
    ;(dados.cidades || []).forEach(c => totais.cidades.add(c))
  })
  totais.cidades = totais.cidades.size
  return totais
}

function filtrarDadosMensais(ano) {
  const dadosAno = DADOS_COMPLETOS[ano] || {}
  return Object.entries(dadosAno).map(([chave, valor]) => {
    const mesNum = chave.split('-')[1]
    return {
      mes: MESES_NOMES[mesNum],
      mesCompleto: MESES_COMPLETOS[mesNum],
      atendimentos: valor.atendimentos || 0,
      alcance: valor.alcance || 0,
      escolas: valor.escolas || 0,
      cidades: (valor.cidades || []).length,
      cursos: valor.cursos || 0,
      acoes: valor.acoes || 0,
      key: chave
    }
  }).reverse()
}

// ─── COMPONENTES ───────────────────────────────────────────────────────────

function Header({ activeTab, setActiveTab, onRefresh, refreshing, ultimaAtt }) {
  const tabs = [
    { id: 'home', label: 'Início', icon: '🏠' },
    { id: 'graficos', label: 'Gráficos', icon: '📊' },
    { id: 'cidades', label: 'Cidades', icon: '📍' },
    { id: 'relatorio', label: 'Relatório', icon: '📄' }
  ]

  return (
    <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 text-white shadow-xl sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-3 sm:px-4">
        {/* Top bar with logo and actions */}
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
              <img src="/detran-logo.svg" alt="DETRAN" className="w-10 h-10" onError={e => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<span class="text-xl">🚗</span>'; }} />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black leading-tight tracking-wide">DETRAN<span className="text-yellow-400">-CE</span></h1>
              <p className="text-xs text-blue-200 hidden sm:block font-medium">DIET — Educação para o Trânsito</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Last update time */}
            <div className="hidden xs:block text-right mr-1">
              <p className="text-xs text-blue-300">Última att</p>
              <p className="text-xs font-semibold">{ultimaAtt}</p>
            </div>

            {/* Refresh button */}
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className={`flex items-center gap-1.5 bg-white/10 hover:bg-white/20 active:scale-95 px-3 py-2 rounded-xl text-xs font-semibold transition-all touch-manipulation ${
                refreshing ? 'opacity-70 animate-spin' : ''
              }`}
            >
              <span className="text-sm">🔄</span>
              <span className="hidden sm:inline">{refreshing ? 'Atualizando...' : 'Atualizar'}</span>
            </button>
          </div>
        </div>

        {/* Navigation tabs */}
        <nav className="flex overflow-x-auto scrollbar-hide pb-2 gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 touch-manipulation ${
                activeTab === tab.id
                  ? 'bg-white text-blue-900 shadow-lg ring-2 ring-yellow-400'
                  : 'text-white/75 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </header>
  )
}

function FiltroPeriodo({ ano, setAno, tipoServico, setTipoServico }) {
  const anos = Object.keys(DADOS_COMPLETOS).sort((a, b) => b - a)

  return (
    <div className="bg-white rounded-2xl shadow-md p-4 mb-4 border border-gray-100">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">📅 Ano de Referência</label>
          <div className="flex gap-2">
            {anos.map(a => (
              <button
                key={a}
                onClick={() => setAno(a)}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-extrabold transition-all shadow-sm touch-manipulation ${
                  ano === a
                    ? 'bg-gradient-to-br from-blue-800 to-blue-600 text-white shadow-lg ring-2 ring-yellow-400'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 active:scale-95'
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">🎯 Tipo de Serviço</label>
          <div className="relative">
            <select
              value={tipoServico}
              onChange={e => setTipoServico(e.target.value)}
              className="w-full py-3 px-4 rounded-xl border-2 border-gray-200 text-sm font-semibold bg-white appearance-none cursor-pointer touch-manipulation focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
            >
              {TIPOS_SERVICO.map(t => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CardMetrica({ titulo, valor, icone, cor, subtitulo }) {
  return (
    <div className={`bg-gradient-to-br ${cor} rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-shadow`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-md`}
             style={{ background: 'rgba(255,255,255,0.2)' }}>
          {icone}
        </div>
        {subtitulo && (
          <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{subtitulo}</span>
        )}
      </div>
      <p className="text-3xl sm:text-4xl font-black mb-1 leading-none">{valor}</p>
      <p className="text-xs sm:text-sm text-white/80 font-medium">{titulo}</p>
    </div>
  )
}

function CardMetricaLargo({ titulo, valor, icone, cor, barra }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-4 border border-gray-100 hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-sm`}
             style={{ background: cor + '20' }}>
          {icone}
        </div>
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{titulo}</p>
          <p className="text-2xl font-black" style={{ color: cor }}>{valor}</p>
        </div>
      </div>
      {barra}
    </div>
  )
}

function MiniBarra({ valor, max, cor }) {
  const pct = max > 0 ? Math.min((valor / max) * 100, 100) : 0
  return (
    <div className="w-full bg-gray-100 rounded-full h-2">
      <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: cor }} />
    </div>
  )
}

function GraficoBarras({ dados }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-4 mb-4 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-black text-gray-800">📊 Atendimentos por Mês</h3>
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-semibold">2025-2026</span>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={dados} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#666', fontWeight: '600' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#666' }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', fontSize: 13, fontWeight: '600' }}
            formatter={(value) => [value.toLocaleString('pt-BR'), 'Atendimentos']}
            labelStyle={{ color: '#333', fontWeight: '700' }}
            cursor={{ fill: '#e3f0ff' }}
          />
          <Bar dataKey="atendimentos" fill="#1565c0" radius={[8, 8, 0, 0]} name="Atendimentos" maxBarSize={50} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function GraficoLinha({ dados }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-4 mb-4 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-black text-gray-800">👥 Pessoas Alcançadas</h3>
        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold">Tendência</span>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={dados} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#666', fontWeight: '600' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#666' }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', fontSize: 13 }}
            formatter={(value) => [value.toLocaleString('pt-BR'), 'Pessoas']}
            labelStyle={{ color: '#333', fontWeight: '700' }}
          />
          <Line type="monotone" dataKey="alcance" stroke="#1565c0" strokeWidth={3} dot={{ r: 5, fill: '#1565c0', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 7, fill: '#0d47a1' }} name="Alcance" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function GraficoPizza({ dados }) {
  const CORES = ['#1565c0', '#1976d2', '#42a5f5', '#64b5f6', '#90caf9', '#bbdefb', '#1565c0']
  const top5 = dados.slice(-6)

  return (
    <div className="bg-white rounded-2xl shadow-md p-4 mb-4 border border-gray-100">
      <h3 className="text-base font-black text-gray-800 mb-4">🏆 Distribuição por Mês</h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={top5}
            dataKey="atendimentos"
            nameKey="mes"
            cx="50%"
            cy="50%"
            outerRadius={110}
            innerRadius={55}
            paddingAngle={4}
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            labelLine={{ stroke: '#999', strokeWidth: 1 }}
          >
            {top5.map((_, index) => (
              <Cell key={index} fill={CORES[index % CORES.length]} strokeWidth={0} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', fontSize: 13 }}
            formatter={(value) => [value.toLocaleString('pt-BR'), 'Atendimentos']}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

function GraficoCombo({ dados }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-4 mb-4 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-black text-gray-800">📈 Ações & Cursos x Mês</h3>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={dados} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#666', fontWeight: '600' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#666' }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', fontSize: 13 }}
            formatter={(value, name) => [value, name === 'acoes' ? 'Ações' : 'Cursos']}
            labelStyle={{ color: '#333', fontWeight: '700' }}
          />
          <Legend wrapperStyle={{ fontSize: 13, fontWeight: '600' }} />
          <Bar dataKey="acoes" fill="#1565c0" radius={[4, 4, 0, 0]} name="Ações" maxBarSize={35} />
          <Bar dataKey="cursos" fill="#ff8f00" radius={[4, 4, 0, 0]} name="Cursos" maxBarSize={35} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function TabelaCidades({ ano }) {
  const [cidades, setCidades] = useState({})

  useEffect(() => {
    const dadosAno = DADOS_COMPLETOS[ano] || {}
    const mapa = {}
    Object.values(dadosAno).forEach(d => {
      ;(d.cidades || []).forEach(c => {
        mapa[c] = (mapa[c] || 0) + (d.atendimentos || 0)
      })
    })
    const ranking = Object.entries(mapa).map(([cidade, qtd]) => ({ cidade, qtd })).sort((a, b) => b.qtd - a.qtd)
    setCidades(ranking)
  }, [ano])

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-base font-black text-gray-800">🏆 Ranking de Cidades — <span className="text-blue-700">{ano}</span></h3>
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-bold">{cidades.length} cidades</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-blue-800 text-white">
              <th className="text-left py-3 px-4 text-xs font-bold">#</th>
              <th className="text-left py-3 px-4 text-xs font-bold">Cidade</th>
              <th className="text-right py-3 px-4 text-xs font-bold">Atendimentos</th>
              <th className="text-right py-3 px-4 text-xs font-bold">%</th>
            </tr>
          </thead>
          <tbody>
            {cidades.map((item, i) => {
              const total = cidades.reduce((s, c) => s + c.qtd, 0)
              const pct = total > 0 ? ((item.qtd / total) * 100).toFixed(1) : 0
              const medals = ['🥇', '🥈', '🥉']
              return (
                <tr key={item.cidade} className={`border-b border-gray-50 hover:bg-blue-50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                  <td className="py-3 px-4">
                    {i < 3
                      ? <span className="text-lg">{medals[i]}</span>
                      : <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">{i + 1}</span>
                    }
                  </td>
                  <td className="py-3 px-4 text-sm font-bold text-gray-800">{item.cidade}</td>
                  <td className="py-3 px-4 text-right text-sm font-black text-blue-800">{item.qtd}</td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full">{pct}%</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── RELATÓRIO PDF ──────────────────────────────────────────────────────────
function BotaoRelatorio({ ano, dados, totais }) {
  const [modalAberto, setModalAberto] = useState(false)
  const [formato, setFormato] = useState('paisagem')

  const gerarHTML = () => {
    const rows = dados.map(d => `
      <tr>
        <td>${d.mesCompleto || d.mes}</td>
        <td style="text-align:center;font-weight:bold">${d.atendimentos}</td>
        <td style="text-align:center">${d.alcance.toLocaleString('pt-BR')}</td>
        <td style="text-align:center">${d.escolas}</td>
        <td style="text-align:center">${d.cursos}</td>
        <td style="text-align:center">${d.acoes}</td>
      </tr>`).join('')

    const estilo = formato === 'paisagem'
      ? '@page { size: A4 landscape; margin: 12mm 15mm; } body { font-size: 11px; }'
      : '@page { size: A4 portrait; margin: 15mm; }'

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Relatório DETRAN-CE ${ano}</title>
<style>
${estilo}
body { font-family: Arial, sans-serif; color: #1a1a2e; margin: 0; padding: 0; background: #fff; }
.header { background: linear-gradient(135deg, #1565c0, #0d47a1); color: white; padding: 20px 25px; display: flex; align-items: center; gap: 15px; }
.header img { width: 50px; height: 50px; background: white; border-radius: 10px; padding: 3px; }
.header h1 { margin: 0; font-size: 20px; }
.header p { margin: 3px 0; font-size: 12px; opacity: 0.85; }
.meta { display: flex; justify-content: space-around; padding: 15px 0; background: #f0f4ff; margin: 15px 0; border-radius: 10px; }
.meta-item { text-align: center; }
.meta-item .val { font-size: 22px; font-weight: 900; color: #1565c0; }
.meta-item .lab { font-size: 10px; color: #666; font-weight: 600; text-transform: uppercase; }
table { width: 100%; border-collapse: collapse; }
th { background: #1565c0; color: white; padding: 8px 6px; font-size: 10px; font-weight: 700; text-align: center; }
th:first-child { text-align: left; }
td { padding: 7px 6px; border-bottom: 1px solid #e8e8e8; font-size: 11px; text-align: center; }
td:first-child { text-align: left; font-weight: 600; }
tr:nth-child(even) { background: #f8fbff; }
tr:hover { background: #e3f0ff !important; }
.footer { margin-top: 20px; text-align: center; font-size: 10px; color: #888; border-top: 2px solid #e0e0e0; padding-top: 10px; }
@media print { .no-print { display: none; } }
</style>
</head>
<body>
<div class="header">
  <div><h1>🚗 DETRAN-CE — DIET/NUPET/NUCAT</h1>
  <p>Relatório de Atividades Educativas para o Trânsito — ${ano}</p>
  <p>Gerado em: ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })} | Ceará, Brasil</p>
  </div>
</div>
<div class="meta">
  <div class="meta-item"><div class="val">${totais.atendimentos}</div><div class="lab">Atendimentos</div></div>
  <div class="meta-item"><div class="val">${totais.alcance.toLocaleString('pt-BR')}</div><div class="lab">Pessoas Alcançadas</div></div>
  <div class="meta-item"><div class="val">${totais.cursos}</div><div class="lab">Cursos</div></div>
  <div class="meta-item"><div class="val">${totais.acoes}</div><div class="lab">Ações</div></div>
  <div class="meta-item"><div class="val">${totais.cidades}</div><div class="lab">Cidades</div></div>
</div>
<table>
  <thead><tr><th>Mês</th><th>Atendimentos</th><th>Alcance</th><th>Escolas</th><th>Cursos</th><th>Ações</th></tr></thead>
  <tbody>${rows}</tbody>
</table>
<div class="footer">DETRAN Ceará — Diretoria de Educação para o Trânsito |DIET-CE| — Imprima em formato A4</div>
</body>
</html>`
  }

  const handleImprimir = () => {
    const w = window.open('', '_blank')
    w.document.write(gerarHTML())
    w.document.close()
    w.onload = () => setTimeout(() => w.print(), 600)
  }

  const handleBaixar = () => {
    const blob = new Blob([gerarHTML()], { type: 'text/html' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `relatorio-detran-ce-${ano}.html`
    a.click()
    URL.revokeObjectURL(a.href)
    setModalAberto(false)
  }

  const handleWhatsApp = () => {
    const txt = `📊 *RELATÓRIO DETRAN-CE ${ano}*\n\n✅ *Atendimentos:* ${totais.atendimentos}\n👥 *Alcance:* ${totais.alcance.toLocaleString('pt-BR')}\n📚 *Cursos:* ${totais.cursos}\n🎯 *Ações:* ${totais.acoes}\n🏙️ *Cidades:* ${totais.cidades}\n\n_Enviado via DETRAN Dashboard_`
    window.open(`https://wa.me/?text=${encodeURIComponent(txt)}`, '_blank')
  }

  return (
    <>
      <button
        onClick={() => setModalAberto(true)}
        className="w-full bg-gradient-to-r from-blue-800 to-blue-600 text-white py-4 rounded-2xl font-extrabold text-base shadow-lg active:scale-95 transition-all touch-manipulation flex items-center justify-center gap-2"
      >
        📄 Gerar Relatório PDF
      </button>

      {modalAberto && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-end p-4" onClick={() => setModalAberto(false)}>
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b-2 border-blue-50">
              <h3 className="text-lg font-black text-gray-800">📄 Opções do Relatório</h3>
              <p className="text-xs text-gray-400 mt-1">Selecione formato e destino</p>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">📑 Formato A4</label>
                <div className="flex gap-2">
                  {[['retrato', '📄 Retrato'], ['paisagem', '📰 Paisagem']].map(([v, label]) => (
                    <button key={v} onClick={() => setFormato(v)}
                      className={`flex-1 py-3 px-3 rounded-xl border-2 text-sm font-bold transition-all touch-manipulation ${formato === v ? 'border-blue-600 bg-blue-50 text-blue-800' : 'border-gray-200 text-gray-500'}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <button onClick={handleImprimir}
                  className="w-full bg-blue-800 text-white py-3 rounded-xl font-bold text-sm active:scale-95 transition-all touch-manipulation flex items-center justify-center gap-2">
                  🖨️ Imprimir Agora
                </button>
                <button onClick={handleBaixar}
                  className="w-full bg-green-600 text-white py-3 rounded-xl font-bold text-sm active:scale-95 transition-all touch-manipulation flex items-center justify-center gap-2">
                  💾 Baixar HTML
                </button>
                <button onClick={handleWhatsApp}
                  className="w-full bg-emerald-500 text-white py-3 rounded-xl font-bold text-sm active:scale-95 transition-all touch-manipulation flex items-center justify-center gap-2">
                  📱 WhatsApp
                </button>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100">
              <button onClick={() => setModalAberto(false)} className="w-full py-2 text-sm text-gray-400 hover:text-gray-600">Fechar ✕</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ─── TELAS ─────────────────────────────────────────────────────────────────
function TelaHome({ ano, totais }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-gray-800">📊 Painel de Indicadores — {ano}</h2>
      </div>

      {/* 6 main metric cards */}
      <div className="grid grid-cols-2 gap-3">
        <CardMetrica titulo="Total Atendimentos" valor={totais.atendimentos} icone="👥" cor="from-blue-700 to-blue-500" />
        <CardMetrica titulo="Pessoas Alcançadas" valor={formatarNumero(totais.alcance)} icone="🌐" cor="from-green-600 to-green-500" />
        <CardMetrica titulo="Escolas Visitadas" valor={totais.escolas} icone="🏫" cor="from-purple-600 to-purple-500" />
        <CardMetrica titulo="Cidades Atendidas" valor={totais.cidades} icone="🏙️" cor="from-orange-500 to-orange-400" />
        <CardMetrica titulo="Cursos Realizados" valor={totais.cursos} icone="📚" cor="from-teal-600 to-teal-500" />
        <CardMetrica titulo="Ações Educativas" valor={totais.acoes} icone="🎯" cor="from-red-500 to-red-400" />
      </div>

      {/* Extra detail cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <CardMetricaLargo
          titulo="Taxa de Alcance" valor={`${Math.round((totais.alcance / (totais.atendimentos || 1)) * 10) / 10}x`}
          icone="📈" cor="#1565c0"
          barra={<MiniBarra valor={totais.alcance} max={totais.atendimentos * 30} cor="#1565c0" />}
        />
        <CardMetricaLargo
          titulo="Média por Cidade" valor={Math.round(totais.atendimentos / (totais.cidades || 1))}
          icone="📍" cor="#ff8f00"
          barra={<MiniBarra valor={totais.atendimentos} max={totais.cidades * 70} cor="#ff8f00" />}
        />
      </div>
    </div>
  )
}

function TelaGraficos({ dados }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-black text-gray-800">📈 Análise Gráfica</h2>
      <GraficoBarras dados={dados} />
      <GraficoLinha dados={dados} />
      <GraficoCombo dados={dados} />
      <GraficoPizza dados={dados} />
    </div>
  )
}

function TelaCidades({ ano }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-black text-gray-800">🏙️ Cobertura Municipal</h2>
      <TabelaCidades ano={ano} />
    </div>
  )
}

function TelaRelatorio({ ano, dados, totais }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-black text-gray-800">📄 Relatório para Impressão</h2>
      <BotaoRelatorio ano={ano} dados={dados} totais={totais} />
    </div>
  )
}

// ─── APP PRINCIPAL ─────────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [ano, setAno] = useState('2026')
  const [tipoServico, setTipoServico] = useState('todos')
  const [dados, setDados] = useState([])
  const [totais, setTotais] = useState({ atendimentos: 0, alcance: 0, escolas: 0, cidades: 0, cursos: 0, acoes: 0 })
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [ultimaAtt, setUltimaAtt] = useState('--:--')

  const carregarDados = useCallback(() => {
    setLoading(true)
    setTimeout(() => {
      const filtrados = filtrarDadosMensais(ano)
      const t = calcularTotais(ano)
      setDados(filtrados)
      setTotais(t)
      setLoading(false)
      setRefreshing(false)
      setUltimaAtt(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }))
    }, 400)
  }, [ano])

  useEffect(() => { carregarDados() }, [carregarDados])

  const handleRefresh = () => {
    if (refreshing) return
    setRefreshing(true)
    carregarDados()
  }

  if (loading && !refreshing) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <img src="/detran-logo.svg" alt="DETRAN" className="w-12 h-12" />
          </div>
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-800 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Carregando dados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        activeTab={activeTab} setActiveTab={setActiveTab}
        onRefresh={handleRefresh} refreshing={refreshing}
        ultimaAtt={ultimaAtt}
      />

      <main className="max-w-6xl mx-auto px-2 sm:px-4 py-4 pb-24">
        <FiltroPeriodo
          ano={ano} setAno={setAno}
          tipoServico={tipoServico} setTipoServico={setTipoServico}
        />

        {activeTab === 'home' && <TelaHome ano={ano} totais={totais} />}
        {activeTab === 'graficos' && <TelaGraficos dados={dados} />}
        {activeTab === 'cidades' && <TelaCidades ano={ano} />}
        {activeTab === 'relatorio' && <TelaRelatorio ano={ano} dados={dados} totais={totais} />}
      </main>

      <footer className="hidden md:block bg-gray-900 text-gray-400 text-center py-5 text-sm">
        <span className="font-bold text-gray-300">DETRAN-CE | DIET/NUPET/NUCAT</span>
        <span className="mx-2">•</span>
        <span>Diretoria de Educação para o Trânsito — Ceará</span>
        <span className="mx-2">•</span>
        <span>{new Date().getFullYear()}</span>
      </footer>
    </div>
  )
}

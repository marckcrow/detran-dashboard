import { useState, useEffect, useRef } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts'

// ─── DADOS MOCK (substituir por Google Sheets API) ─────────────────────────
const DADOS_COMPLETOS = {
  2025: {
    '2025-01': { atendimentos: 45, alcance: 1240, escolas: 2, cidades: ['Fortaleza'] },
    '2025-02': { atendimentos: 52, alcance: 1450, escolas: 3, cidades: ['Fortaleza', 'Caucaia'] },
    '2025-03': { atendimentos: 38, alcance: 980, escolas: 2, cidades: ['Fortaleza'] },
    '2025-04': { atendimentos: 61, alcance: 1680, escolas: 3, cidades: ['Fortaleza', 'Maranguape'] },
    '2025-05': { atendimentos: 55, alcance: 1520, escolas: 2, cidades: ['Fortaleza', 'Caucaia'] },
    '2025-06': { atendimentos: 48, alcance: 1320, escolas: 2, cidades: ['Fortaleza'] },
    '2025-07': { atendimentos: 42, alcance: 1150, escolas: 2, cidades: ['Fortaleza'] },
    '2025-08': { atendimentos: 58, alcance: 1590, escolas: 3, cidades: ['Fortaleza', 'Aquiraz'] },
    '2025-09': { atendimentos: 63, alcance: 1740, escolas: 3, cidades: ['Fortaleza', 'Pacatuba'] },
    '2025-10': { atendimentos: 71, alcance: 1950, escolas: 4, cidades: ['Fortaleza', 'Caucaia', 'Maranguape'] },
    '2025-11': { atendimentos: 65, alcance: 1790, escolas: 3, cidades: ['Fortaleza', 'Itaitinga'] },
    '2025-12': { atendimentos: 40, alcance: 1100, escolas: 2, cidades: ['Fortaleza'] }
  },
  2026: {
    '2026-01': { atendimentos: 58, alcance: 1580, escolas: 3, cidades: ['Fortaleza', 'Caucaia'] },
    '2026-02': { atendimentos: 62, alcance: 1720, escolas: 3, cidades: ['Fortaleza', 'Maranguape'] },
    '2026-03': { atendimentos: 55, alcance: 1520, escolas: 2, cidades: ['Fortaleza', 'Aquiraz'] },
    '2026-04': { atendimentos: 48, alcance: 1320, escolas: 2, cidades: ['Fortaleza'] },
    '2026-05': { atendimentos: 48, alcance: 992, escolas: 1, cidades: ['Fortaleza'] }
  }
}

const TIPOS_SERVICO = [
  { id: 'todos', label: 'Todos' },
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
  if (n >= 1000) return (n / 1000).toFixed(1).replace('.', ',') + ' mil'
  return n.toLocaleString('pt-BR')
}

function obterMesesDisponiveis() {
  const anos = Object.keys(DADOS_COMPLETOS).sort()
  const meses = []
  anos.forEach(ano => {
    Object.keys(DADOS_COMPLETOS[ano]).forEach(mes => {
      meses.push({ ano, mes, chave: mes })
    })
  })
  return meses.sort((a, b) => b.chave.localeCompare(a.chave))
}

function filtrarDados(ano, tipoServico) {
  const dadosAno = DADOS_COMPLETOS[ano] || {}
  return Object.entries(dadosAno).map(([chave, valor]) => {
    const mesNum = chave.split('-')[1]
    return {
      mes: MESES_NOMES[mesNum],
      mesCompleto: MESES_COMPLETOS[mesNum],
      atendimentos: valor.atendimentos,
      alcance: valor.alcance,
      escolas: valor.escolas,
      cidades: valor.cidades.length,
      key: chave
    }
  }).reverse()
}

function calcularTotais(ano) {
  const dadosAno = DADOS_COMPLETOS[ano] || {}
  let totais = { atendimentos: 0, alcance: 0, escolas: 0, cidades: new Set() }
  Object.values(dadosAno).forEach(dados => {
    totais.atendimentos += dados.atendimentos
    totais.alcance += dados.alcance
    totais.escolas += dados.escolas
    dados.cidades.forEach(c => totais.cidades.add(c))
  })
  totais.cidades = totais.cidades.size
  return totais
}

// ─── COMPONENTES ───────────────────────────────────────────────────────────

function Header({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'home', label: 'Início', icon: '🏠' },
    { id: 'graficos', label: 'Gráficos', icon: '📊' },
    { id: 'cidades', label: 'Cidades', icon: '📍' },
    { id: 'relatorio', label: 'Relatório', icon: '📄' }
  ]

  return (
    <header className="bg-gradient-to-r from-blue-800 to-blue-600 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🚗</span>
            <div>
              <h1 className="text-base sm:text-lg font-bold leading-tight">DETRAN-CE</h1>
              <p className="text-xs text-blue-200 hidden sm:block">DIET - Educação para o Trânsito</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-blue-200">Dados atualizados</p>
            <p className="text-sm font-semibold">{new Date().toLocaleDateString('pt-BR')}</p>
          </div>
        </div>
        <nav className="flex overflow-x-auto scrollbar-hide pb-1 gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                activeTab === tab.id
                  ? 'bg-white text-blue-800 shadow-md'
                  : 'text-white/80 hover:bg-white/20'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
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
    <div className="bg-white rounded-xl shadow-sm p-3 mb-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1">
          <label className="text-xs text-gray-500 font-medium block mb-1">Ano</label>
          <div className="flex gap-1">
            {anos.map(a => (
              <button
                key={a}
                onClick={() => setAno(a)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all touch-manipulation ${
                  ano === a
                    ? 'bg-blue-800 text-white shadow'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1">
          <label className="text-xs text-gray-500 font-medium block mb-1">Serviço</label>
          <select
            value={tipoServico}
            onChange={e => setTipoServico(e.target.value)}
            className="w-full py-2 px-3 rounded-lg border border-gray-200 text-sm bg-white touch-manipulation"
          >
            {TIPOS_SERVICO.map(t => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}

function CardMetrica({ titulo, valor, subtitulo, cor, icone }) {
  return (
    <div className={`bg-gradient-to-br ${cor} rounded-xl p-4 text-white shadow-lg`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs sm:text-sm text-white/80 mb-1">{titulo}</p>
          <p className="text-2xl sm:text-3xl font-bold">{valor}</p>
          {subtitulo && <p className="text-xs text-white/70 mt-1">{subtitulo}</p>}
        </div>
        <span className="text-3xl">{icone}</span>
      </div>
    </div>
  )
}

function GraficoBarras({ dados }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <h3 className="text-base font-bold text-gray-800 mb-3">Atendimentos por Mês</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={dados} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#666' }} />
          <YAxis tick={{ fontSize: 11, fill: '#666' }} />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: 'none', fontSize: 13 }}
            formatter={(value) => [value.toLocaleString('pt-BR'), 'Atendimentos']}
            labelFormatter={(label) => `Mês: ${label}`}
          />
          <Bar dataKey="atendimentos" fill="#1565c0" radius={[6, 6, 0, 0]} name="Atendimentos" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function GraficoLinha({ dados }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <h3 className="text-base font-bold text-gray-800 mb-3">Pessoas Alcançadas</h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={dados} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#666' }} />
          <YAxis tick={{ fontSize: 11, fill: '#666' }} />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: 'none', fontSize: 13 }}
            formatter={(value) => [value.toLocaleString('pt-BR'), 'Pessoas Alcançadas']}
            labelFormatter={(label) => `Mês: ${label}`}
          />
          <Line type="monotone" dataKey="alcance" stroke="#1565c0" strokeWidth={3} dot={{ r: 5, fill: '#1565c0' }} name="Alcance" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function GraficoPizza({ dados }) {
  const CORES = ['#1565c0', '#1976d2', '#42a5f5', '#64b5f6', '#90caf9']
  const top5 = dados.slice(-5)

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <h3 className="text-base font-bold text-gray-800 mb-3">Top 5 Cidades</h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={top5}
            dataKey="atendimentos"
            nameKey="mes"
            cx="50%"
            cy="50%"
            outerRadius={100}
            innerRadius={50}
            paddingAngle={3}
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            labelLine={{ stroke: '#999', strokeWidth: 1 }}
          >
            {top5.map((_, index) => (
              <Cell key={index} fill={CORES[index % CORES.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ borderRadius: 8, border: 'none', fontSize: 13 }}
            formatter={(value) => [value.toLocaleString('pt-BR'), 'Atendimentos']}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

function TabelaCidades({ dados }) {
  const ranking = Object.entries(dados).map(([cidade, qtd]) => ({ cidade, qtd }))
    .sort((a, b) => b.qtd - a.qtd)

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 overflow-hidden">
      <h3 className="text-base font-bold text-gray-800 mb-3">🏆 Ranking de Cidades</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-blue-50">
              <th className="text-left py-2 px-3 text-xs font-bold text-gray-600">Posição</th>
              <th className="text-left py-2 px-3 text-xs font-bold text-gray-600">Cidade</th>
              <th className="text-right py-2 px-3 text-xs font-bold text-gray-600">Atendimentos</th>
            </tr>
          </thead>
          <tbody>
            {ranking.map((item, i) => (
              <tr key={item.cidade} className={`border-b border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                <td className="py-3 px-3">
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                    i === 0 ? 'bg-yellow-400 text-yellow-900' :
                    i === 1 ? 'bg-gray-300 text-gray-800' :
                    i === 2 ? 'bg-amber-600 text-white' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {i + 1}
                  </span>
                </td>
                <td className="py-3 px-3 text-sm font-medium text-gray-800">{item.cidade}</td>
                <td className="py-3 px-3 text-right text-sm font-bold text-blue-800">{item.qtd}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── RELATÓRIO PDF ──────────────────────────────────────────────────────────
function BotaoRelatorio({ ano, dados, totais }) {
  const [loading, setLoading] = useState(false)
  const [formato, setFormato] = useState('vertical')
  const [modalAberto, setModalAberto] = useState(false)

  const gerarHTML = () => {
    const rows = dados.map(d => `
      <tr>
        <td>${d.mesCompleto || d.mes}</td>
        <td style="text-align:center">${d.atendimentos}</td>
        <td style="text-align:center">${d.alcance}</td>
        <td style="text-align:center">${d.escolas}</td>
      </tr>
    `).join('')

    const estilo = formato === 'paisagem'
      ? '@page { size: A4 landscape; margin: 15mm; }'
      : '@page { size: A4 portrait; margin: 15mm; }'

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Relatório DETRAN-CE</title>
<style>
  ${estilo}
  body { font-family: Arial, sans-serif; font-size: 12px; color: #222; margin: 0; padding: 20px; }
  .header { text-align: center; margin-bottom: 20px; border-bottom: 3px solid #1565c0; padding-bottom: 15px; }
  .header h1 { color: #1565c0; margin: 0; font-size: 22px; }
  .header p { margin: 3px 0; color: #555; font-size: 11px; }
  .resumo { display: flex; justify-content: space-around; margin: 20px 0; }
  .resumo-item { text-align: center; background: #f0f4ff; padding: 12px 20px; border-radius: 8px; border-left: 4px solid #1565c0; }
  .resumo-item .num { font-size: 22px; font-weight: bold; color: #1565c0; }
  .resumo-item .label { font-size: 10px; color: #666; margin-top: 2px; }
  table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11px; }
  th { background: #1565c0; color: white; padding: 8px 6px; text-align: left; }
  td { padding: 7px 6px; border-bottom: 1px solid #e0e0e0; }
  tr:nth-child(even) { background: #f8f9fa; }
  tr:hover { background: #e3f0ff; }
  .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #888; border-top: 1px solid #ddd; padding-top: 10px; }
  .badge { display: inline-block; background: #1565c0; color: white; padding: 2px 8px; border-radius: 4px; font-size: 10px; }
</style>
</head>
<body>
<div class="header">
  <h1>🚗 DETRAN-CE - DIET/NUPET/NUCAT</h1>
  <p>Relatório de Atividades Educativas para o Trânsito</p>
  <p>Período: ${ano} | Gerado em: ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
</div>
<div class="resumo">
  <div class="resumo-item"><div class="num">${totais.atendimentos}</div><div class="label">Total Atendimentos</div></div>
  <div class="resumo-item"><div class="num">${totais.alcance.toLocaleString('pt-BR')}</div><div class="label">Pessoas Alcançadas</div></div>
  <div class="resumo-item"><div class="num">${totais.cidades}</div><div class="label">Cidades</div></div>
</div>
<table>
  <thead><tr><th>Mês</th><th style="text-align:center">Atendimentos</th><th style="text-align:center">Alcance</th><th style="text-align:center">Escolas</th></tr></thead>
  <tbody>${rows}</tbody>
</table>
<div class="footer">
  <span class="badge">DIET-CE</span> Diretoria de Educação para o Trânsito - DETRAN Ceará<br>
  Este documento pode ser impresso diretamente no navegador (Ctrl+P) em formato A4
</div>
</body>
</html>`
  }

  const handleGerar = () => {
    setLoading(true)
    setTimeout(() => {
      const html = gerarHTML()
      const blob = new Blob([html], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `relatorio-detran-${ano}.html`
      a.click()
      URL.revokeObjectURL(url)
      setLoading(false)
      setModalAberto(false)
    }, 500)
  }

  const handleImprimir = () => {
    const html = gerarHTML()
    const win = window.open('', '_blank')
    win.document.write(html)
    win.document.close()
    win.onload = () => {
      setTimeout(() => {
        win.print()
      }, 500)
    }
  }

  const handleWhatsApp = () => {
    const texto = `📊 *RELATÓRIO DETRAN-CE ${ano}*\n\n✅ *Total de Atendimentos:* ${totais.atendimentos}\n👥 *Pessoas Alcançadas:* ${totais.alcance.toLocaleString('pt-BR')}\n🏙️ *Cidades Atendidas:* ${totais.cidades}\n\n_Enviado via DETRAN Dashboard_`
    const url = `https://wa.me/?text=${encodeURIComponent(texto)}`
    window.open(url, '_blank')
  }

  return (
    <>
      <button
        onClick={() => setModalAberto(true)}
        className="w-full bg-blue-800 text-white py-4 rounded-xl font-bold text-base shadow-lg active:scale-95 transition-transform touch-manipulation"
      >
        📄 Gerar Relatório
      </button>

      {modalAberto && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-end p-4" onClick={() => setModalAberto(false)}>
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">📄 Opções do Relatório</h3>
              <p className="text-xs text-gray-500 mt-1">Escolha o formato e destino</p>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">Formato da Folha</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFormato('vertical')}
                    className={`flex-1 py-3 px-4 rounded-xl border-2 text-sm font-semibold transition-all touch-manipulation ${
                      formato === 'vertical' ? 'border-blue-600 bg-blue-50 text-blue-800' : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    📄 Retrato (A4)
                  </button>
                  <button
                    onClick={() => setFormato('paisagem')}
                    className={`flex-1 py-3 px-4 rounded-xl border-2 text-sm font-semibold transition-all touch-manipulation ${
                      formato === 'paisagem' ? 'border-blue-600 bg-blue-50 text-blue-800' : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    📰 Paisagem (A4)
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleImprimir}
                  className="w-full bg-blue-800 text-white py-3 rounded-xl font-semibold text-sm active:scale-95 transition-transform touch-manipulation flex items-center justify-center gap-2"
                >
                  🖨️ Imprimir Agora (A4)
                </button>
                <button
                  onClick={handleGerar}
                  className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold text-sm active:scale-95 transition-transform touch-manipulation flex items-center justify-center gap-2"
                >
                  💾 Baixar HTML
                </button>
                <button
                  onClick={handleWhatsApp}
                  className="w-full bg-emerald-500 text-white py-3 rounded-xl font-semibold text-sm active:scale-95 transition-transform touch-manipulation flex items-center justify-center gap-2"
                >
                  📱 Enviar via WhatsApp
                </button>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100">
              <button
                onClick={() => setModalAberto(false)}
                className="w-full py-2 text-sm text-gray-500"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ─── Tela Cidades ──────────────────────────────────────────────────────────
function TelaCidades({ ano }) {
  const [cidades, setCidades] = useState({})

  useEffect(() => {
    const dadosAno = DADOS_COMPLETOS[ano] || {}
    const mapa = {}
    Object.values(dadosAno).forEach(d => {
      d.cidades.forEach(c => {
        mapa[c] = (mapa[c] || 0) + d.atendimentos
      })
    })
    setCidades(mapa)
  }, [ano])

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-800 px-1">🏙️ Cidades Atendidas - {ano}</h2>
      <TabelaCidades dados={cidades} />
      <div className="bg-blue-50 rounded-xl p-4">
        <p className="text-sm text-gray-700">
          <strong>Total de cidades únicas:</strong> {Object.keys(cidades).length}
        </p>
      </div>
    </div>
  )
}

// ─── Tela Relatório ────────────────────────────────────────────────────────
function TelaRelatorio({ ano, dados, totais }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-800 px-1">📄 Gerar Relatório</h2>
      <BotaoRelatorio ano={ano} dados={dados} totais={totais} />
    </div>
  )
}

// ─── Tela Gráficos ─────────────────────────────────────────────────────────
function TelaGraficos({ dados }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-800 px-1">📊 Análise Gráfica - {new Date().getFullYear()}</h2>
      <GraficoBarras dados={dados} />
      <GraficoLinha dados={dados} />
      <GraficoPizza dados={dados} />
    </div>
  )
}

// ─── Tela Início ───────────────────────────────────────────────────────────
function TelaHome({ ano, totais }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-800 px-1">📈 Resumo {ano}</h2>
      <div className="grid grid-cols-2 gap-3">
        <CardMetrica
          titulo="Atendimentos"
          valor={totais.atendimentos}
          subtitulo="Total realizado"
          cor="from-blue-700 to-blue-500"
          icone="👥"
        />
        <CardMetrica
          titulo="Pessoas Alcançadas"
          valor={formatarNumero(totais.alcance)}
          subtitulo="No ano"
          cor="from-green-700 to-green-500"
          icone="🌐"
        />
        <CardMetrica
          titulo="Escolas Visitadas"
          valor={totais.escolas}
          subtitulo="No ano"
          cor="from-purple-700 to-purple-500"
          icone="🏫"
        />
        <CardMetrica
          titulo="Cidades Atendidas"
          valor={totais.cidades}
          subtitulo="No estado"
          cor="from-orange-600 to-orange-400"
          icone="🏙️"
        />
      </div>
    </div>
  )
}

// ─── APP PRINCIPAL ─────────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [ano, setAno] = useState('2026')
  const [tipoServico, setTipoServico] = useState('todos')
  const [dados, setDados] = useState([])
  const [totais, setTotais] = useState({ atendimentos: 0, alcance: 0, escolas: 0, cidades: 0 })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      const filtrados = filtrarDados(ano, tipoServico)
      const t = calcularTotais(ano)
      setDados(filtrados)
      setTotais(t)
      setLoading(false)
    }, 300)
  }, [ano, tipoServico])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-800 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Carregando dados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="max-w-6xl mx-auto px-2 sm:px-4 py-4 pb-24">
        <FiltroPeriodo
          ano={ano} setAno={setAno}
          tipoServico={tipoServico} setTipoServico={setTipoServico}
        />

        {activeTab === 'home' && (
          <TelaHome ano={ano} totais={totais} />
        )}
        {activeTab === 'graficos' && (
          <TelaGraficos dados={dados} />
        )}
        {activeTab === 'cidades' && (
          <TelaCidades ano={ano} />
        )}
        {activeTab === 'relatorio' && (
          <TelaRelatorio ano={ano} dados={dados} totais={totais} />
        )}
      </main>

      {/* Desktop Footer */}
      <footer className="hidden md:block bg-gray-800 text-gray-400 text-center py-4 text-sm">
        DETRAN-CE | DIET/NUPET/NUCAT | {new Date().getFullYear()}
      </footer>
    </div>
  )
}

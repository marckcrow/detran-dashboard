import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, ResponsiveContainer, AreaChart, Area
} from 'recharts'
import { theme } from './theme'

// ─── DADOS MOCK COMPLETOS ────────────────────────────────────────────────────
const DADOS_COMPLETOS = {
  2025: {
    '01': { alcance: 0, escolas: 0, alunos: 0, blitz: 0, veiculos: 0, cursos: 0, cursoPart: 0, palestras: 0, interv: 0, maisInf: 0, outras: 0, muni: 0, macroreg: 0, satisf: null },
    '02': { alcance: 0, escolas: 0, alunos: 0, blitz: 0, veiculos: 0, cursos: 0, cursoPart: 0, palestras: 0, interv: 0, maisInf: 0, outras: 0, muni: 0, macroreg: 0, satisf: null },
    '03': { alcance: 0, escolas: 0, alunos: 0, blitz: 0, veiculos: 0, cursos: 0, cursoPart: 0, palestras: 0, interv: 0, maisInf: 0, outras: 0, muni: 0, macroreg: 0, satisf: null },
    '04': { alcance: 0, escolas: 0, alunos: 0, blitz: 0, veiculos: 0, cursos: 0, cursoPart: 0, palestras: 0, interv: 0, maisInf: 0, outras: 0, muni: 0, macroreg: 0, satisf: null },
    '05': { alcance: 0, escolas: 0, alunos: 0, blitz: 0, veiculos: 0, cursos: 0, cursoPart: 0, palestras: 0, interv: 0, maisInf: 0, outras: 0, muni: 0, macroreg: 0, satisf: null },
    '06': { alcance: 0, escolas: 0, alunos: 0, blitz: 0, veiculos: 0, cursos: 0, cursoPart: 0, palestras: 0, interv: 0, maisInf: 0, outras: 0, muni: 0, macroreg: 0, satisf: null },
    '07': { alcance: 0, escolas: 0, alunos: 0, blitz: 0, veiculos: 0, cursos: 0, cursoPart: 0, palestras: 0, interv: 0, maisInf: 0, outras: 0, muni: 0, macroreg: 0, satisf: null },
    '08': { alcance: 0, escolas: 0, alunos: 0, blitz: 0, veiculos: 0, cursos: 0, cursoPart: 0, palestras: 0, interv: 0, maisInf: 0, outras: 0, muni: 0, macroreg: 0, satisf: null },
    '09': { alcance: 0, escolas: 0, alunos: 0, blitz: 0, veiculos: 0, cursos: 0, cursoPart: 0, palestras: 0, interv: 0, maisInf: 0, outras: 0, muni: 0, macroreg: 0, satisf: null },
    '10': { alcance: 0, escolas: 0, alunos: 0, blitz: 0, veiculos: 0, cursos: 0, cursoPart: 0, palestras: 0, interv: 0, maisInf: 0, outras: 0, muni: 0, macroreg: 0, satisf: null },
    '11': { alcance: 0, escolas: 0, alunos: 0, blitz: 0, veiculos: 0, cursos: 0, cursoPart: 0, palestras: 0, interv: 0, maisInf: 0, outras: 0, muni: 0, macroreg: 0, satisf: null },
    '12': { alcance: 0, escolas: 0, alunos: 0, blitz: 0, veiculos: 0, cursos: 0, cursoPart: 0, palestras: 0, interv: 0, maisInf: 0, outras: 0, muni: 0, macroreg: 0, satisf: null },
  },
  2026: {
    '01': { alcance: 1580, escolas: 3, alunos: 580, blitz: 8, veiculos: 1200, cursos: 2, cursoPart: 85, palestras: 12, interv: 1800, maisInf: 5, outras: 3, muni: 4, macroreg: 2, satisf: 4.5 },
    '02': { alcance: 1720, escolas: 3, alunos: 620, blitz: 10, veiculos: 1450, cursos: 3, cursoPart: 110, palestras: 15, interv: 2100, maisInf: 6, outras: 4, muni: 5, macroreg: 2, satisf: 4.3 },
    '03': { alcance: 1520, escolas: 2, alunos: 490, blitz: 9, veiculos: 1380, cursos: 2, cursoPart: 78, palestras: 10, interv: 1900, maisInf: 4, outras: 2, muni: 3, macroreg: 2, satisf: 4.6 },
    '04': { alcance: 1320, escolas: 2, alunos: 410, blitz: 7, veiculos: 1150, cursos: 2, cursoPart: 65, palestras: 8, interv: 1600, maisInf: 3, outras: 2, muni: 2, macroreg: 1, satisf: 4.4 },
    '05': { alcance: 992, escolas: 1, alunos: 242, blitz: 4, veiculos: 682, cursos: 1, cursoPart: 30, palestras: 5, interv: 932, maisInf: 2, outras: 1, muni: 1, macroreg: 1, satisf: null },
  }
}

// Dados anuais consolidados (fonte: relatório oficial)
const DADOS_ANUAIS = {
  2026: {
    escolas: 271,
    alunos: 8132,
    blitz: 107,
    veiculos: 17462,
    cursos: 16,
    cursoPart: 468,
    palestras: 2646,
    interv: 30432,
    maisInf: 55,
    outras: 12,
    muni: 27,
    macroreg: 9,
  },
  2025: {
    escolas: 0, alunos: 0, blitz: 0, veiculos: 0,
    cursos: 0, cursoPart: 0, palestras: 0, interv: 0,
    maisInf: 0, outras: 0, muni: 0, macroreg: 0,
  }
}

const MACRORREGIOES = [
  {
    id: 'cariri', nome: 'Regiao do Cariri', municipios: ['Juazeiro do Norte', 'Crato', 'Barbalha', 'Iguatu', 'Santana do Cariri'],
    totalAcoes: 201, totalAlcance: 8200, macroreg: 1
  },
  {
    id: 'grande_fortaleza', nome: 'Regiao da Grande Fortaleza', municipios: ['Fortaleza', 'Caucaia', 'Aquiraz', 'Pacatuba', 'Itaitinga', 'Maranguape'],
    totalAcoes: 412, totalAlcance: 18400, macroreg: 1
  },
  {
    id: 'sobral', nome: 'Regiao de Sobral', municipios: ['Sobral', 'Tianguá', 'Cruz', 'Marco', 'Ibiapina'],
    totalAcoes: 89, totalAlcance: 3200, macroreg: 1
  },
  {
    id: 'vale_jaguaribe', nome: 'Vale do Jaguaribe', municipios: ['Limoeiro do Norte', 'Russas', 'Jaguaribe', 'Icó'],
    totalAcoes: 67, totalAlcance: 2100, macroreg: 1
  },
  {
    id: 'litoral_norte', nome: 'Litoral Norte', municipios: ['Paracuru', 'Trairi', 'São Gonçalo do Amarante', 'Paraipaba'],
    totalAcoes: 45, totalAlcance: 1600, macroreg: 1
  },
  {
    id: 'litoral_leste', nome: 'Litoral Leste', municipios: ['Beberibe', 'Fortaleza (Costa Leste)', 'Pindoretama'],
    totalAcoes: 38, totalAlcance: 1200, macroreg: 1
  },
  {
    id: 'sertao_central', nome: 'Sertao Central', municipios: ['Quixada', 'Canindé', 'Boa Viagem'],
    totalAcoes: 52, totalAlcance: 1900, macroreg: 1
  },
  {
    id: 'macico_baturite', nome: 'Macico de Baturite', municipios: ['Baturité', 'Guaramiranga', 'Aratuba', 'Mulungu'],
    totalAcoes: 31, totalAlcance: 980, macroreg: 1
  },
  {
    id: 'centro_sul', nome: 'Centro Sul', municipios: ['Várzea Alegre', 'Iguatu', 'Lavras da Mangabeira'],
    totalAcoes: 43, totalAlcance: 1500, macroreg: 1
  },
]

const MESES_NOMES = ['', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
const MESES_COMPLETOS = ['', 'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

const SERVICOS = [
  { id: 'todos', label: 'Todos os Servicos' },
  { id: 'escolas', label: 'Escolas Atendidas' },
  { id: 'alunos', label: 'Alunos Atendidos' },
  { id: 'blitz', label: 'Blitz Educativas' },
  { id: 'veiculos', label: 'Veiculos Abordados' },
  { id: 'cursos', label: 'Cursos' },
  { id: 'palestras', label: 'Palestras' },
  { id: 'interv', label: 'Intervencoes Educativas' },
  { id: 'maisInf', label: 'Mais Infancia' },
  { id: 'outras', label: 'Outras Acoes' },
]

const MUNICIPIOS_LISTA = [
  'Fortaleza', 'Caucaia', 'Maranguape', 'Aquiraz', 'Pacatuba', 'Itaitinga',
  'Juazeiro do Norte', 'Crato', 'Barbalha', 'Sobral', 'Quixada', 'Limoeiro do Norte',
  'Russas', 'Iguatu', 'Paracuru', 'Trairi', 'Santana do Cariri', 'Baturité',
  'Tianguá', 'Cruz', 'Marco', 'Ibiapina', 'Jaguaribe', 'Icó', 'Canindé',
  'Boa Viagem', 'São Gonçalo do Amarante', 'Paraipaba'
]

// ─── UTILIDADES ────────────────────────────────────────────────────────────
function formatarNumero(n) {
  if (!n && n !== 0) return '-'
  return n.toLocaleString('pt-BR')
}

function obterDadosMensais(ano) {
  return Object.entries(DADOS_COMPLETOS[ano] || {}).map(([mes, dados]) => ({
    mes: MESES_NOMES[parseInt(mes)],
    mesNum: parseInt(mes),
    alcance: dados.alcance,
    escolas: dados.escolas,
    alunos: dados.alunos,
    blitz: dados.blitz,
    veiculos: dados.veiculos,
    cursos: dados.cursos,
    cursoPart: dados.cursoPart,
    palestras: dados.palestras,
    interv: dados.interv,
    maisInf: dados.maisInf,
    outras: dados.outras,
    muni: dados.muni,
    macroreg: dados.macroreg,
    satisf: dados.satisf,
  })).sort((a, b) => a.mesNum - b.mesNum)
}

function calcularTotais(ano, mes = null) {
  const dadosAno = DADOS_COMPLETOS[ano] || {}
  const meses = mes && mes !== 'todos'
    ? { [mes]: dadosAno[mes] }
    : dadosAno

  let totais = { alcance: 0, escolas: 0, alunos: 0, blitz: 0, veiculos: 0, cursos: 0, cursoPart: 0, palestras: 0, interv: 0, maisInf: 0, outras: 0, muni: new Set(), macroreg: new Set(), satisf: [] }
  Object.values(meses).forEach(dados => {
    if (!dados) return
    totais.alcance += dados.alcance || 0
    totais.escolas += dados.escolas || 0
    totais.alunos += dados.alunos || 0
    totais.blitz += dados.blitz || 0
    totais.veiculos += dados.veiculos || 0
    totais.cursos += dados.cursos || 0
    totais.cursoPart += dados.cursoPart || 0
    totais.palestras += dados.palestras || 0
    totais.interv += dados.interv || 0
    totais.maisInf += dados.maisInf || 0
    totais.outras += dados.outras || 0
    totais.muni.add(dados.muni || 0)
    totais.macroreg.add(dados.macroreg || 0)
    if (dados.satisf) totais.satisf.push(dados.satisf)
  })
  totais.muni = totais.muni.size
  totais.macroreg = totais.macroreg.size
  totais.satisfMedia = totais.satisf.length > 0 ? (totais.satisf.reduce((s, v) => s + v, 0) / totais.satisf.length).toFixed(1) : null
  return totais
}

function TrendBadge({ atual, anterior }) {
  if (!anterior || anterior === 0) return null
  const diff = ((atual - anterior) / anterior) * 100
  const isPositive = diff >= 0
  return (
    <span style={{
      fontSize: '10px',
      fontWeight: '700',
      color: isPositive ? theme.primary : theme.danger,
      background: isPositive ? theme.primaryLight : '#fde8e8',
      padding: '2px 6px',
      borderRadius: '4px'
    }}>
      {isPositive ? '+' : ''}{diff.toFixed(0)}%
    </span>
  )
}

// ─── ICONES SVG (outline style) ────────────────────────────────────────────
const IconUsers = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
const IconSchool = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
const IconBook = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
const IconMegaphone = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l18-5v12L3 13v-2z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>
const IconActivity = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
const IconCar = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17h14v-5H5v5z"/><path d="M6 12l2-5h8l2 5"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>
const IconMap = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
const IconGlobe = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
const IconStar = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
const IconRefresh = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
const IconDownload = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
const IconMail = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
const IconFilter = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
const IconTrendUp = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
const IconChevronDown = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
const IconChevronRight = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
const IconCheck = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
const IconArrowUp = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>

// ─── HEADER INSTITUCIONAL ───────────────────────────────────────────────────
function Header({ onRefresh, refreshing, ultimaAtt }) {
  return (
    <header style={{ background: theme.primaryDark, color: 'white' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: `1px solid ${theme.primary}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '44px', height: '44px', background: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <img src="/detran-logo.svg" alt="DETRAN" style={{ width: '36px', height: '36px' }}
                onError={e => { e.target.style.display = 'none' }} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '16px', fontWeight: '800', letterSpacing: '0.5px' }}>
                DETRAN<span style={{ color: '#a3e635' }}>-CE</span>
              </h1>
              <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.7)', fontWeight: '500' }}>
                DIET — Diretoria de Educacao para o Transito
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>ULTIMA ATT</p>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: '600' }}>{ultimaAtt}</p>
            </div>
            <button
              onClick={onRefresh}
              disabled={refreshing}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                color: 'white', padding: '8px 14px', borderRadius: '8px',
                fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <span style={{ display: 'inline-block', animation: refreshing ? 'spin 1s linear infinite' : 'none' }}>
                <IconRefresh />
              </span>
              <span className="hide-mobile">Atualizar</span>
            </button>
          </div>
        </div>
        {/* Title bar */}
        <div style={{ padding: '12px 0 10px' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>
            Painel DIET — Monitoramento de Acoes Educativas
          </h2>
          <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
            Acompanhamento de atendimentos, cursos e alcance territorial — {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>
    </header>
  )
}

// ─── FILTROS GLOBAIS ───────────────────────────────────────────────────────
function GlobalFilters({ ano, setAno, mes, setMes, servico, setServico, macroreg, setMacroreg }) {
  const anos = [2026, 2025]
  const mesesLista = [
    { id: 'todos', label: 'Todos os Meses' },
    ...MESES_COMPLETOS.slice(1).map((nome, i) => ({ id: String(i + 1).padStart(2, '0'), label: nome }))
  ]
  const macroregLista = [
    { id: 'todas', label: 'Todas as Macrorregioes' },
    ...MACRORREGIOES.map(m => ({ id: m.id, label: m.nome }))
  ]

  const Select = ({ value, onChange, options, label }) => (
    <div>
      <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{
            width: '100%', padding: '8px 32px 8px 10px',
            border: `1px solid ${theme.border}`, borderRadius: '8px',
            fontSize: '12px', fontWeight: '600', color: theme.textPrimary,
            background: 'white', cursor: 'pointer', appearance: 'none',
          }}
        >
          {options.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
        </select>
        <div style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: theme.textSecondary }}>
          <IconChevronDown />
        </div>
      </div>
    </div>
  )

  return (
    <div style={{
      background: 'white',
      border: `1px solid ${theme.border}`,
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
        <IconFilter />
        <span style={{ fontSize: '11px', fontWeight: '700', color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Filtros Globais
        </span>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '12px',
      }}>
        <Select value={ano} onChange={setAno} options={anos.map(a => ({ id: a, label: String(a) }))} label="Ano" />
        <Select value={mes} onChange={setMes} options={mesesLista} label="Mes" />
        <Select value={servico} onChange={setServico} options={SERVICOS} label="Tipo de Servico" />
        <Select value={macroreg} onChange={setMacroreg} options={macroregLista} label="Macrorregiao" />
      </div>
    </div>
  )
}

// ─── CARD DE METRICA ────────────────────────────────────────────────────────
function MetricCard({ title, value, subtitle, icon, color = theme.primary, trend, secondary }) {
  return (
    <div style={{
      background: 'white',
      border: `1px solid ${theme.border}`,
      borderTop: `3px solid ${color}`,
      borderRadius: '10px',
      padding: '14px',
      transition: 'box-shadow 0.2s',
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '8px',
          background: color + '15', display: 'flex', alignItems: 'center',
          justifyContent: 'center', color
        }}>
          {icon}
        </div>
        {trend}
      </div>
      <p style={{ margin: '0 0 2px', fontSize: '22px', fontWeight: '800', color: theme.textPrimary, lineHeight: 1 }}>
        {value}
      </p>
      <p style={{ margin: 0, fontSize: '11px', fontWeight: '700', color: theme.textSecondary }}>
        {title}
      </p>
      {subtitle && (
        <p style={{ margin: '2px 0 0', fontSize: '10px', color: theme.textSecondary, opacity: 0.7 }}>
          {subtitle}
        </p>
      )}
      {secondary}
    </div>
  )
}

// ─── CARD DE SERVICO ───────────────────────────────────────────────────────
function ServiceCard({ titulo,指标, valor, detalhe, cor }) {
  return (
    <div style={{
      background: 'white', border: `1px solid ${theme.border}`,
      borderRadius: '10px', padding: '14px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <div style={{ width: '4px', height: '28px', borderRadius: '2px', background: cor }} />
        <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: theme.textPrimary }}>{titulo}</p>
      </div>
      <p style={{ margin: '0 0 4px', fontSize: '28px', fontWeight: '900', color: cor }}>{valor}</p>
      {detalhe && <p style={{ margin: 0, fontSize: '10px', color: theme.textSecondary }}>{detalhe}</p>}
    </div>
  )
}

// ─── GRAFICO AREA (Evolucao mensal) ─────────────────────────────────────────
function GraficoEvolucao({ dados }) {
  return (
    <div style={{ background: 'white', border: `1px solid ${theme.border}`, borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
      <h3 style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: '700', color: theme.textPrimary }}>
        Evolucao Mensal do Alcance
      </h3>
      <p style={{ margin: '0 0 12px', fontSize: '11px', color: theme.textSecondary }}>Pessoas alcancadas por mes</p>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={dados} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorAlcance" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={theme.primary} stopOpacity={0.2} />
              <stop offset="95%" stopColor={theme.primary} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.border} vertical={false} />
          <XAxis dataKey="mes" tick={{ fontSize: 10, fill: theme.textSecondary, fontWeight: '600' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: theme.textSecondary }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: `1px solid ${theme.border}`, fontSize: 12, fontWeight: '600' }}
            formatter={v => [v.toLocaleString('pt-BR'), 'Pessoas Alcancadas']}
          />
          <Area type="monotone" dataKey="alcance" stroke={theme.primary} strokeWidth={2.5} fill="url(#colorAlcance)" dot={{ r: 4, fill: theme.primary, strokeWidth: 2, stroke: 'white' }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── GRAFICO BARRAS HORIZONTAIS (Distribuicao por servico) ──────────────────
function GraficoServicos({ totais }) {
  const dados = [
    { nome: 'Intervencoes', valor: totais.interv, cor: theme.primary },
    { nome: 'Alunos', valor: totais.alunos, cor: theme.secondary },
    { nome: 'Veiculos', valor: totais.veiculos, cor: '#6b7280' },
    { nome: 'Palestras', valor: totais.palestras, cor: '#0891b2' },
    { nome: 'Blitz', valor: totais.blitz, cor: '#7c3aed' },
    { nome: 'Escolas', valor: totais.escolas, cor: '#ea580c' },
    { nome: 'Cursos', valor: totais.cursos, cor: '#db2777' },
    { nome: 'Mais Infancia', valor: totais.maisInf, cor: '#16a34a' },
  ].filter(d => d.valor > 0)

  const max = Math.max(...dados.map(d => d.valor), 1)

  return (
    <div style={{ background: 'white', border: `1px solid ${theme.border}`, borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
      <h3 style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: '700', color: theme.textPrimary }}>
        Distribuicao por Tipo de Servico
      </h3>
      <p style={{ margin: '0 0 12px', fontSize: '11px', color: theme.textSecondary }}>Quantidade de acoes por servico</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {dados.map(d => {
          const pct = max > 0 ? (d.valor / max) * 100 : 0
          return (
            <div key={d.nome}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                <span style={{ fontSize: '11px', fontWeight: '600', color: theme.textPrimary }}>{d.nome}</span>
                <span style={{ fontSize: '11px', fontWeight: '700', color: d.cor }}>{d.valor.toLocaleString('pt-BR')}</span>
              </div>
              <div style={{ background: '#f0f2f5', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: d.cor, borderRadius: '4px', transition: 'width 0.5s' }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── GRAFICO BARRAS (Acoes por mes) ─────────────────────────────────────────
function GraficoAcoes({ dados }) {
  return (
    <div style={{ background: 'white', border: `1px solid ${theme.border}`, borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
      <h3 style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: '700', color: theme.textPrimary }}>
        Acoes Realizadas por Mes
      </h3>
      <p style={{ margin: '0 0 12px', fontSize: '11px', color: theme.textSecondary }}>Quantidade total de acoes por mes</p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={dados} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.border} vertical={false} />
          <XAxis dataKey="mes" tick={{ fontSize: 10, fill: theme.textSecondary, fontWeight: '600' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: theme.textSecondary }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: `1px solid ${theme.border}`, fontSize: 12, fontWeight: '600' }}
            formatter={(v, n) => [v, n]}
          />
          <Bar dataKey="escolas" fill={theme.primary} radius={[4, 4, 0, 0]} name="Escolas" maxBarSize={40} />
          <Bar dataKey="blitz" fill={theme.secondary} radius={[4, 4, 0, 0]} name="Blitz" maxBarSize={40} />
          <Bar dataKey="cursos" fill="#ea580c" radius={[4, 4, 0, 0]} name="Cursos" maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '8px' }}>
        {[['Escolas', theme.primary], ['Blitz', theme.secondary], ['Cursos', '#ea580c']].map(([label, cor]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: cor }} />
            <span style={{ fontSize: '10px', color: theme.textSecondary, fontWeight: '600' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── PAINEL MACRORREGIOES ───────────────────────────────────────────────────
function MacroRegionPanel({ expandida, setExpandida }) {
  const totalAcoes = MACRORREGIOES.reduce((s, m) => s + m.totalAcoes, 0)
  const totalAlcance = MACRORREGIOES.reduce((s, m) => s + m.totalAlcance, 0)
  const [openRegion, setOpenRegion] = useState(null)

  return (
    <div style={{ background: 'white', border: `1px solid ${theme.border}`, borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: theme.textPrimary }}>
            Cobertura Territorial
          </h3>
          <p style={{ margin: '2px 0 0', fontSize: '11px', color: theme.textSecondary }}>
            {MACRORREGIOES.length} macrorregioes — {MUNICIPIOS_LISTA.length} municipios
          </p>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: theme.primary }}>{totalAcoes}</p>
            <p style={{ margin: 0, fontSize: '9px', color: theme.textSecondary, fontWeight: '600', textTransform: 'uppercase' }}>Acoes</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: theme.secondary }}>{formatarNumero(totalAlcance)}</p>
            <p style={{ margin: 0, fontSize: '9px', color: theme.textSecondary, fontWeight: '600', textTransform: 'uppercase' }}>Alcance</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {[...MACRORREGIOES].sort((a, b) => b.totalAcoes - a.totalAcoes).map(mr => {
          const isOpen = openRegion === mr.id
          return (
            <div key={mr.id} style={{ border: `1px solid ${theme.border}`, borderRadius: '8px', overflow: 'hidden' }}>
              <button
                onClick={() => setOpenRegion(isOpen ? null : mr.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 12px', background: isOpen ? theme.primaryLight : '#f8f9fa',
                  border: 'none', cursor: 'pointer', textAlign: 'left',
                  transition: 'background 0.15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ color: theme.primary }}>
                    {isOpen ? <IconChevronDown /> : <IconChevronRight />}
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: theme.textPrimary }}>
                    {mr.nome}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: theme.primary }}>{mr.totalAcoes} acoes</span>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: theme.secondary }}>{formatarNumero(mr.totalAlcance)}</span>
                </div>
              </button>
              {isOpen && (
                <div style={{ padding: '8px 12px', background: 'white', borderTop: `1px solid ${theme.border}` }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {mr.municipios.map(m => (
                      <span key={m} style={{
                        fontSize: '10px', fontWeight: '600', padding: '2px 8px',
                        background: theme.primaryLight, color: theme.primary,
                        borderRadius: '4px'
                      }}>
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── RANKING MUNICIPIOS ─────────────────────────────────────────────────────
function RankingMunicipios() {
  const ranking = [
    { nome: 'Fortaleza', acoes: 142, alcance: 5200 },
    { nome: 'Caucaia', acoes: 68, alcance: 2100 },
    { nome: 'Juazeiro do Norte', acoes: 55, alcance: 1900 },
    { nome: 'Maranguape', acoes: 41, alcance: 1400 },
    { nome: 'Crato', acoes: 38, alcance: 1200 },
    { nome: 'Sobral', acoes: 34, alcance: 1100 },
    { nome: 'Aquiraz', acoes: 29, alcance: 980 },
    { nome: 'Quixada', acoes: 24, alcance: 820 },
    { nome: 'Pacatuba', acoes: 21, alcance: 740 },
    { nome: 'Limoeiro do Norte', acoes: 18, alcance: 620 },
  ]
  const max = ranking[0]?.acoes || 1

  return (
    <div style={{ background: 'white', border: `1px solid ${theme.border}`, borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
      <h3 style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: '700', color: theme.textPrimary }}>
        Ranking de Municipios
      </h3>
      <p style={{ margin: '0 0 12px', fontSize: '11px', color: theme.textSecondary }}>
        Top 10 cidades com maior volume de acoes
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {ranking.map((m, i) => {
          const pct = (m.acoes / max) * 100
          return (
            <div key={m.nome} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                width: '20px', fontSize: '10px', fontWeight: '800', textAlign: 'center',
                color: i === 0 ? '#b45309' : i === 1 ? '#6b7280' : i === 2 ? '#92400e' : theme.textSecondary
              }}>
                {i + 1}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '600', color: theme.textPrimary }}>{m.nome}</span>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: theme.primary }}>{m.acoes} acoes</span>
                </div>
                <div style={{ background: '#f0f2f5', borderRadius: '4px', height: '6px' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: theme.primary, borderRadius: '4px' }} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── PAINEL SATISFACAO ─────────────────────────────────────────────────────
function SatisfactionPanel() {
  return (
    <div style={{ background: 'white', border: `1px solid ${theme.border}`, borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
      <h3 style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: '700', color: theme.textPrimary }}>
        Pesquisa de Satisfacao
      </h3>
      <p style={{ margin: '0 0 12px', fontSize: '11px', color: theme.textSecondary }}>
        Indices baseados em avaliacoes das acoes realizadas
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
        {[
          { label: 'Nota Geral', valor: '4.4', max: 5, cor: theme.primary },
          { label: 'Clareza do Conteudo', valor: '4.6', max: 5, cor: theme.secondary },
          { label: 'Qualidade do Instrutor', valor: '4.5', max: 5, cor: '#0891b2' },
          { label: 'Relevancia do Tema', valor: '4.3', max: 5, cor: '#7c3aed' },
          { label: 'Organizacao', valor: '4.2', max: 5, cor: '#ea580c' },
        ].map(item => (
          <div key={item.label} style={{ textAlign: 'center', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
            <p style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: '800', color: item.cor }}>{item.valor}</p>
            <div style={{ background: '#e5e7eb', borderRadius: '4px', height: '4px', marginBottom: '4px' }}>
              <div style={{ width: `${(parseFloat(item.valor) / item.max) * 100}%`, height: '100%', background: item.cor, borderRadius: '4px' }} />
            </div>
            <p style={{ margin: 0, fontSize: '9px', fontWeight: '600', color: theme.textSecondary, textTransform: 'uppercase' }}>{item.label}</p>
          </div>
        ))}
      </div>
      <div style={{ marginTop: '12px', padding: '10px', background: theme.primaryLight, borderRadius: '8px', borderLeft: `3px solid ${theme.primary}` }}>
        <p style={{ margin: 0, fontSize: '11px', color: theme.textSecondary }}>
          <strong style={{ color: theme.primary }}>Status:</strong> Dados parciais. Setor de avaliacao institucional ira enviar resultados ate dia 05 de cada mes.
        </p>
      </div>
    </div>
  )
}

// ─── RELATORIO EXECUTIVO ───────────────────────────────────────────────────
function ExecutiveReport({ totais, dados, ano, mes }) {
  const [copiado, setCopiado] = useState(false)
  const mesLabel = mes === 'todos' ? 'todos os meses' : MESES_COMPLETOS[parseInt(mes)] || mes

  const mesMaior = dados.length > 0 ? dados.reduce((max, d) => d.alcance > (max.alcance || 0) ? d : max, dados[0]) : null
  const macroregTop = MACRORREGIOES.reduce((max, m) => m.totalAcoes > (max?.totalAcoes || 0) ? m : max, null)

  const texto = `RELATORIO EXECUTIVO DIET — ${mesLabel.toUpperCase()} ${ano}

No periodo selecionado, a Diretoria de Educacao de Transito realizou ${totais.escolas + totais.blitz + totais.cursos} acoes educativas, alcancando ${formatarNumero(totais.alcance)} pessoas em ${totais.muni} municipios do Estado do Ceara.

DESTAQUES:
• ${formatarNumero(totais.alunos)} alunos atendidos em ${totais.escolas} escolas
• ${totais.blitz} blitze educativas com ${formatarNumero(totais.veiculos)} veiculos abordados
• ${totais.cursos} cursos realizados com ${totais.cursoPart} participantes
• ${totais.palestras} palestras educativas realizadas
• ${totais.interv} pessoas alcancadas em intervencoes educativas
• ${totais.maisInf} acoes do Programa Mais Infancia

DISTRIBUICAO TERRITORIAL:
${MACRORREGIOES.slice(0, 3).map(m => `• ${m.nome}: ${m.totalAcoes} acoes`).join('\n')}

DADOS DE SATISFACAO:
Nota media geral: ${totais.satisfMedia || '-'} / 5.0
${totais.satisfMedia ? `(Baseado em ${totais.satisf.length} avaliacoes registradas)` : '(Dados aguardando envio pelo setor responsavel)'}

Gerado em: ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
DETRAN-CE | DIET — Diretoria de Educacao para o Transito`

  const handleCopiar = () => {
    navigator.clipboard.writeText(texto).then(() => {
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    })
  }

  const handleBaixar = () => {
    const blob = new Blob([texto], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `relatorio-diet-${ano}-${mes || 'todos'}.txt`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const handleWhatsApp = () => {
    const resumo = `RELATORIO DIET ${ano}\n\nTotal: ${formatarNumero(totais.alcance)} alcancados | ${totais.escolas + totais.blitz + totais.cursos} acoes | ${totais.muni} cidades\n\nAlunos: ${formatarNumero(totais.alunos)} | Blitz: ${totais.blitz} | Cursos: ${totais.cursos}`
    window.open(`https://wa.me/?text=${encodeURIComponent(resumo)}`, '_blank')
  }

  return (
    <div style={{ background: 'white', border: `1px solid ${theme.border}`, borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
      <h3 style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: '700', color: theme.textPrimary }}>
        Relatorio Executivo
      </h3>
      <p style={{ margin: '0 0 12px', fontSize: '11px', color: theme.textSecondary }}>
        Resumo automatico baseado nos filtros aplicados
      </p>
      <div style={{
        background: '#f8f9fa', border: `1px solid ${theme.border}`,
        borderRadius: '8px', padding: '14px', fontSize: '11px',
        lineHeight: '1.7', color: theme.textPrimary,
        whiteSpace: 'pre-line', fontFamily: 'monospace',
        maxHeight: '320px', overflowY: 'auto'
      }}>
        {texto}
      </div>
      <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
        <button onClick={handleCopiar}
          style={{ flex: 1, minWidth: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', borderRadius: '8px', border: `1px solid ${theme.border}`, background: 'white', fontSize: '12px', fontWeight: '600', cursor: 'pointer', color: theme.textPrimary }}>
          {copiado ? <IconCheck /> : <IconDownload />}
          {copiado ? 'Copiado!' : 'Copiar Texto'}
        </button>
        <button onClick={handleBaixar}
          style={{ flex: 1, minWidth: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', borderRadius: '8px', border: `1px solid ${theme.border}`, background: 'white', fontSize: '12px', fontWeight: '600', cursor: 'pointer', color: theme.textPrimary }}>
          <IconDownload /> Baixar
        </button>
        <button onClick={handleWhatsApp}
          style={{ flex: 1, minWidth: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', borderRadius: '8px', border: 'none', background: '#25d366', fontSize: '12px', fontWeight: '600', cursor: 'pointer', color: 'white' }}>
          Enviar via WhatsApp
        </button>
      </div>
    </div>
  )
}

// ─── TABELA ANALITICA ──────────────────────────────────────────────────────
function AnalyticalTable({ dados, totais }) {
  const [busca, setBusca] = useState('')
  const [ordenado, setOrdenado] = useState({ campo: 'alcance', dir: 'desc' })

  const filtrado = dados.filter(d =>
    !busca || d.mes.toLowerCase().includes(busca.toLowerCase())
  ).sort((a, b) => {
    const aVal = a[ordenado.campo] || 0
    const bVal = b[ordenado.campo] || 0
    return ordenado.dir === 'desc' ? bVal - aVal : aVal - bVal
  })

  const ordenar = (campo) => {
    setOrdenado(prev => ({
      campo,
      dir: prev.campo === campo && prev.dir === 'desc' ? 'asc' : 'desc'
    }))
  }

  const thStyle = (campo) => ({
    padding: '8px 10px', fontSize: '10px', fontWeight: '700', color: theme.textSecondary,
    textTransform: 'uppercase', letterSpacing: '0.5px', cursor: 'pointer', whiteSpace: 'nowrap',
    background: ordenado.campo === campo ? theme.primaryLight : '#f8f9fa',
    borderBottom: `2px solid ${theme.border}`,
  })

  const tdStyle = { padding: '8px 10px', fontSize: '11px', borderBottom: `1px solid ${theme.border}` }

  return (
    <div style={{ background: 'white', border: `1px solid ${theme.border}`, borderRadius: '12px', padding: '16px', marginBottom: '16px', overflowX: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: theme.textPrimary }}>Tabela Analitica</h3>
          <p style={{ margin: '2px 0 0', fontSize: '11px', color: theme.textSecondary }}>
            {filtrado.length} registros — Clique nas colunas para ordenar
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            placeholder="Buscar mes..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            style={{
              padding: '6px 10px', border: `1px solid ${theme.border}`,
              borderRadius: '6px', fontSize: '11px', outline: 'none',
              minWidth: '140px'
            }}
          />
          <button
            onClick={() => {
              const csv = ['Mes,Alcance,Escolas,Alunos,Blitz,Veiculos,Cursos,Palestras,Interv,Mais Inf\n',
                ...filtrado.map(d => `${d.mes},${d.alcance},${d.escolas},${d.alunos},${d.blitz},${d.veiculos},${d.cursos},${d.palestras},${d.interv},${d.maisInf}`)].join('\n')
              const blob = new Blob([csv], { type: 'text/csv' })
              const a = document.createElement('a')
              a.href = URL.createObjectURL(blob)
              a.download = `diet-dados-${ano}-${mes || 'todos'}.csv`
              a.click()
              URL.revokeObjectURL(a.href)
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '6px', border: `1px solid ${theme.border}`, background: 'white', fontSize: '11px', fontWeight: '600', cursor: 'pointer', color: theme.textPrimary, whiteSpace: 'nowrap' }}
          >
            <IconDownload /> CSV
          </button>
        </div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
          <thead>
            <tr style={{ background: '#f8f9fa' }}>
              <th style={thStyle('mes')} onClick={() => ordenar('mes')}>Mes {ordenado.campo === 'mes' ? (ordenado.dir === 'desc' ? '▼' : '▲') : ''}</th>
              <th style={thStyle('alcance')} onClick={() => ordenar('alcance')}>Alcance {ordenado.campo === 'alcance' ? (ordenado.dir === 'desc' ? '▼' : '▲') : ''}</th>
              <th style={thStyle('escolas')} onClick={() => ordenar('escolas')}>Escolas {ordenado.campo === 'escolas' ? (ordenado.dir === 'desc' ? '▼' : '▲') : ''}</th>
              <th style={thStyle('alunos')} onClick={() => ordenar('alunos')}>Alunos {ordenado.campo === 'alunos' ? (ordenado.dir === 'desc' ? '▼' : '▲') : ''}</th>
              <th style={thStyle('blitz')} onClick={() => ordenar('blitz')}>Blitz {ordenado.campo === 'blitz' ? (ordenado.dir === 'desc' ? '▼' : '▲') : ''}</th>
              <th style={thStyle('veiculos')} onClick={() => ordenar('veiculos')}>Veiculos {ordenado.campo === 'veiculos' ? (ordenado.dir === 'desc' ? '▼' : '▲') : ''}</th>
              <th style={thStyle('cursos')} onClick={() => ordenar('cursos')}>Cursos {ordenado.campo === 'cursos' ? (ordenado.dir === 'desc' ? '▼' : '▲') : ''}</th>
              <th style={thStyle('palestras')} onClick={() => ordenar('palestras')}>Palestras {ordenado.campo === 'palestras' ? (ordenado.dir === 'desc' ? '▼' : '▲') : ''}</th>
              <th style={thStyle('interv')} onClick={() => ordenar('interv')}>Intervencoes {ordenado.campo === 'interv' ? (ordenado.dir === 'desc' ? '▼' : '▲') : ''}</th>
              <th style={thStyle('satisf')} onClick={() => ordenar('satisf')}>Satisf {ordenado.campo === 'satisf' ? (ordenado.dir === 'desc' ? '▼' : '▲') : ''}</th>
            </tr>
          </thead>
          <tbody>
            {filtrado.map((d, i) => (
              <tr key={d.mes} style={{ background: i % 2 === 0 ? 'white' : '#fafbfc' }}>
                <td style={{ ...tdStyle, fontWeight: '700', color: theme.primary }}>{d.mes}</td>
                <td style={{ ...tdStyle, fontWeight: '700', color: theme.textPrimary }}>{d.alcance.toLocaleString('pt-BR')}</td>
                <td style={tdStyle}>{d.escolas}</td>
                <td style={tdStyle}>{d.alunos}</td>
                <td style={tdStyle}>{d.blitz}</td>
                <td style={tdStyle}>{d.veiculos.toLocaleString('pt-BR')}</td>
                <td style={tdStyle}>{d.cursos}</td>
                <td style={tdStyle}>{d.palestras}</td>
                <td style={tdStyle}>{d.interv.toLocaleString('pt-BR')}</td>
                <td style={tdStyle}>
                  {d.satisf
                    ? <span style={{ background: theme.primaryLight, color: theme.primary, padding: '2px 6px', borderRadius: '4px', fontWeight: '700', fontSize: '10px' }}>{d.satisf}</span>
                    : <span style={{ color: theme.textSecondary, fontSize: '10px' }}>-</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: theme.primaryLight, fontWeight: '800' }}>
              <td style={{ ...tdStyle, fontWeight: '800', color: theme.primary }}>TOTAL</td>
              <td style={{ ...tdStyle, fontWeight: '800', color: theme.primary }}>{totais.alcance.toLocaleString('pt-BR')}</td>
              <td style={{ ...tdStyle, fontWeight: '800', color: theme.primary }}>{totais.escolas}</td>
              <td style={{ ...tdStyle, fontWeight: '800', color: theme.primary }}>{totais.alunos}</td>
              <td style={{ ...tdStyle, fontWeight: '800', color: theme.primary }}>{totais.blitz}</td>
              <td style={{ ...tdStyle, fontWeight: '800', color: theme.primary }}>{totais.veiculos.toLocaleString('pt-BR')}</td>
              <td style={{ ...tdStyle, fontWeight: '800', color: theme.primary }}>{totais.cursos}</td>
              <td style={{ ...tdStyle, fontWeight: '800', color: theme.primary }}>{totais.palestras}</td>
              <td style={{ ...tdStyle, fontWeight: '800', color: theme.primary }}>{totais.interv.toLocaleString('pt-BR')}</td>
              <td style={tdStyle}></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

// ─── BREADCRUMB + TABS ─────────────────────────────────────────────────────
function Tabs({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'dashboard', label: 'Visao Geral' },
    { id: 'graficos', label: 'Graficos' },
    { id: 'territorio', label: 'Territorio' },
    { id: 'satisfacao', label: 'Satisfacao' },
    { id: 'dados', label: 'Dados' },
    { id: 'relatorio', label: 'Relatorio' },
  ]

  return (
    <div style={{
      display: 'flex', overflowX: 'auto', gap: '4px',
      marginBottom: '16px', padding: '4px',
      background: 'white', borderRadius: '10px',
      border: `1px solid ${theme.border}`,
    }}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          style={{
            flexShrink: 0, padding: '8px 14px', borderRadius: '8px',
            border: 'none', fontSize: '11px', fontWeight: '600',
            cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s',
            background: activeTab === tab.id ? theme.primary : 'transparent',
            color: activeTab === tab.id ? 'white' : theme.textSecondary,
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

// ─── BREADCRUMB ────────────────────────────────────────────────────────────
function Breadcrumb({ tab }) {
  const labels = {
    dashboard: 'Inicio > Dashboard DIET',
    graficos: 'Inicio > Graficos',
    territorio: 'Inicio > Cobertura Territorial',
    satisfacao: 'Inicio > Satisfacao',
    dados: 'Inicio > Analise de Dados',
    relatorio: 'Inicio > Relatorio Executivo',
  }
  return (
    <div style={{ fontSize: '11px', color: theme.textSecondary, marginBottom: '12px', fontWeight: '500' }}>
      <span style={{ color: theme.primary }}>{labels[tab] || labels.dashboard}</span>
    </div>
  )
}

// ─── SECTION TITLE ─────────────────────────────────────────────────────────
function SectionTitle({ title, subtitle }) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: theme.textPrimary }}>{title}</h3>
      {subtitle && <p style={{ margin: '2px 0 0', fontSize: '11px', color: theme.textSecondary }}>{subtitle}</p>}
    </div>
  )
}

// ─── CARD DE METRICAS CONSOLIDADAS ─────────────────────────────────────────
function ConsolidatedMetrics({ totais, totaisAnterior }) {
  const cards = [
    { key: 'alcance', label: 'Pessoas Alcancadas', icon: <IconGlobe />, cor: theme.primary },
    { key: 'alunos', label: 'Alunos Atendidos', icon: <IconUsers />, cor: theme.secondary },
    { key: 'escolas', label: 'Escolas Visitadas', icon: <IconSchool />, cor: '#0891b2' },
    { key: 'blitz', label: 'Blitz Educativas', icon: <IconActivity />, cor: '#7c3aed' },
    { key: 'veiculos', label: 'Veiculos Abordados', icon: <IconCar />, cor: '#ea580c' },
    { key: 'cursos', label: 'Cursos Realizados', icon: <IconBook />, cor: '#db2777' },
    { key: 'palestras', label: 'Palestras', icon: <IconMegaphone />, cor: '#16a34a' },
    { key: 'interv', label: 'Intervencoes', icon: <IconActivity />, cor: '#b45309' },
    { key: 'muni', label: 'Municipios', icon: <IconMap />, cor: '#0891b2' },
    { key: 'satisfMedia', label: 'Satisfacao (0-5)', icon: <IconStar />, cor: theme.warning, isMedia: true },
    { key: 'macroreg', label: 'Macrorregioes', icon: <IconGlobe />, cor: '#6366f1' },
    { key: 'maisInf', label: 'Acoes Mais Infancia', icon: <IconStar />, cor: '#16a34a' },
  ]

  const getValor = (key, isMedia) => {
    if (isMedia) return totais[key] ? parseFloat(totais[key]).toFixed(1) : '-'
    return formatarNumero(totais[key])
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
      gap: '10px',
      marginBottom: '16px',
    }}>
      {cards.map(card => {
        const valor = getValor(card.key, card.isMedia)
        const anterior = null
        return (
          <MetricCard
            key={card.key}
            title={card.label}
            value={valor}
            icon={card.icon}
            color={card.cor}
            trend={<TrendBadge atual={totais[card.key]} anterior={anterior} />}
            subtitle={card.isMedia && valor !== '-' ? `${valor} / 5.0` : null}
          />
        )
      })}
    </div>
  )
}

// ─── STATUS BADGE ──────────────────────────────────────────────────────────
function StatusBadge({ label }) {
  const isPartial = label === 'Maio' || label === 'monthly_current'
  return (
    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap' }}>
      {isPartial && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: '#fef9c3', border: '1px solid #f59e0b', borderRadius: '6px',
          padding: '6px 10px', fontSize: '11px', fontWeight: '600', color: '#92400e'
        }}>
          <span>Atencao: dados do mes podem estar parciais</span>
        </div>
      )}
    </div>
  )
}

// ─── APP PRINCIPAL ─────────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [ano, setAno] = useState('2026')
  const [mes, setMes] = useState('todos')
  const [servico, setServico] = useState('todos')
  const [macroreg, setMacroreg] = useState('todas')
  const [dados, setDados] = useState([])
  const [totais, setTotais] = useState({})
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [ultimaAtt, setUltimaAtt] = useState('--:--')

  const carregarDados = useCallback(() => {
    setLoading(true)
    setTimeout(() => {
      const d = obterDadosMensais(ano)
      const t = calcularTotais(ano, mes)
      setDados(d)
      setTotais(t)
      setLoading(false)
      setRefreshing(false)
      setUltimaAtt(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }))
    }, 400)
  }, [ano, mes])

  useEffect(() => { carregarDados() }, [carregarDados])

  const handleRefresh = () => {
    if (refreshing) return
    setRefreshing(true)
    carregarDados()
  }

  const anoInt = parseInt(ano)
  const mesInt = mes !== 'todos' ? parseInt(mes) : null
  const isCurrentMonthPartial = mesInt === new Date().getMonth() + 1 && anoInt === new Date().getFullYear()

  if (loading && !refreshing) {
    return (
      <div style={{ minHeight: '100vh', background: theme.background, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '60px', height: '60px', background: theme.primary, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <img src="/detran-logo.svg" alt="DETRAN" style={{ width: '48px', height: '48px' }}
              onError={e => { e.target.style.display = 'none' }} />
          </div>
          <div style={{ width: '40px', height: '40px', border: `4px solid ${theme.border}`, borderTopColor: theme.primary, borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
          <p style={{ marginTop: '12px', color: theme.textSecondary, fontSize: '13px', fontWeight: '600' }}>Carregando dados...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: theme.background }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        body { margin: 0; }
        @media (max-width: 640px) {
          .hide-mobile { display: none; }
        }
        @media print {
          header, button, .no-print { display: none !important; }
          body { background: white; }
        }
      `}</style>

      <Header onRefresh={handleRefresh} refreshing={refreshing} ultimaAtt={ultimaAtt} />

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '16px' }}>
        {/* Status badges */}
        {isCurrentMonthPartial && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: '#fef9c3', border: '1px solid #f59e0b', borderRadius: '8px',
            padding: '10px 14px', fontSize: '12px', fontWeight: '600', color: '#92400e',
            marginBottom: '12px'
          }}>
            Dados em atualizacao — Este mes ainda esta com informacoes parciais
          </div>
        )}

        <GlobalFilters
          ano={ano} setAno={setAno}
          mes={mes} setMes={setMes}
          servico={servico} setServico={setServico}
          macroreg={macroreg} setMacroreg={setMacroreg}
        />

        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
        <Breadcrumb tab={activeTab} />

        {/* TAB: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div>
            <SectionTitle
              title={`Visao Geral — ${mes === 'todos' ? 'Todos os Meses' : MESES_COMPLETOS[parseInt(mes)]} ${ano}`}
              subtitle="Principais indicadores de desempenho da DIET"
            />
            <ConsolidatedMetrics totais={totais} totaisAnterior={null} />
          </div>
        )}

        {/* TAB: GRAFICOS */}
        {activeTab === 'graficos' && (
          <div>
            <SectionTitle
              title="Analise Grafica"
              subtitle="Evolucao e distribuicao das acoes educativas"
            />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
              <GraficoEvolucao dados={dados} />
              <GraficoAcoes dados={dados} />
            </div>
            <GraficoServicos totais={totais} />
          </div>
        )}

        {/* TAB: TERRITORIO */}
        {activeTab === 'territorio' && (
          <div>
            <SectionTitle
              title="Cobertura Territorial"
              subtitle="Distribuicao por macrorregiao e ranking de municipios"
            />
            <MacroRegionPanel />
            <RankingMunicipios />
          </div>
        )}

        {/* TAB: SATISFACAO */}
        {activeTab === 'satisfacao' && (
          <div>
            <SectionTitle
              title="Pesquisa de Satisfacao"
              subtitle="Indices de avaliacao das acoes educativas"
            />
            <SatisfactionPanel />
          </div>
        )}

        {/* TAB: DADOS */}
        {activeTab === 'dados' && (
          <div>
            <SectionTitle
              title="Analise de Dados"
              subtitle="Tabela analitica com todos os indicadores por mes"
            />
            <AnalyticalTable dados={dados} totais={totais} />
          </div>
        )}

        {/* TAB: RELATORIO */}
        {activeTab === 'relatorio' && (
          <div>
            <SectionTitle
              title="Relatorio Executivo"
              subtitle="Resumo automatico para prestacao de contas"
            />
            <ExecutiveReport totais={totais} dados={dados} ano={ano} mes={mes} />
          </div>
        )}
      </main>

      <footer style={{
        background: theme.primaryDark, color: 'rgba(255,255,255,0.5)',
        textAlign: 'center', padding: '16px', fontSize: '11px', fontWeight: '500',
        marginTop: '32px'
      }}>
        DETRAN-CE | DIET — Diretoria de Educacao para o Transito |
        {new Date().getFullYear()} | Atualize dados ate o dia 05 de cada mes
      </footer>
    </div>
  )
}

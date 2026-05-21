import { useState, useEffect, useCallback } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, AreaChart, Area
} from 'recharts'
import { theme } from './theme'

// ─── FALLBACK (dados reais da planilha Jan-Abr 2026) ───────────────────────
const FALLBACK = {
  dadosMensais: [
    { mes:'Jan', mesNum:1,  alcance:12031, escolas:6,  alunos:162,  blitz:15, veiculos:1612, cursos:2, benef:55,  palestras:3,  alcPal:175, interv:70,    alcInt:8387, maisInf:18, alcMi:1526, partial:false },
    { mes:'Fev', mesNum:2,  alcance:14895, escolas:47, alunos:1247, blitz:34, veiculos:5345, cursos:4, benef:109, palestras:22, alcPal:846, interv:55,    alcInt:6709, maisInf:5,  alcMi:428,  partial:false },
    { mes:'Mar', mesNum:3,  alcance:16695, escolas:98, alunos:3057, blitz:28, veiculos:4774, cursos:6, benef:197, palestras:18, alcPal:702, interv:62,    alcInt:7179, maisInf:16, alcMi:558,  partial:false },
    { mes:'Abr', mesNum:4,  alcance:19592, escolas:93, alunos:2833, blitz:30, veiculos:5731, cursos:6, benef:143, palestras:10, alcPal:923, interv:64,    alcInt:8157, maisInf:16, alcMi:1586, partial:false },
    { mes:'Mai', mesNum:5,  alcance:0,     escolas:0,  alunos:0,    blitz:0,  veiculos:0,    cursos:0, benef:0,   palestras:0,  alcPal:0,   interv:0,    alcInt:0,    maisInf:0,  alcMi:0,    partial:true  },
  ],
  totais: { alcance:63213, escolas:244, alunos:7299, blitz:107, veiculos:17462, cursos:18, benef:504, palestras:53, alcPal:2646, interv:251, alcInt:30432, maisInf:55, alcMi:4098, muni:0, macroreg:9 },
  rankingCidades: [['Fortaleza',142],['Caucaia',68],['Juazeiro do Norte',55],['Maranguape',41],['Crato',38],['Sobral',34],['Aquiraz',29],['Quixada',24],['Pacatuba',21],['Limoeiro do Norte',18]],
  macroregioes: [
    { id:'cariri',          nome:'Regiao do Cariri',          municipios:['Juazeiro do Norte','Crato','Barbalha','Iguatu','Santana do Cariri','Missao Velha','Nova Olinda','Brejo Santo'],           totalAcoes:201, totalAlcance:8200 },
    { id:'grande_fortaleza', nome:'Regiao da Grande Fortaleza', municipios:['Fortaleza','Caucaia','Aquiraz','Pacatuba','Itaitinga','Maranguape','Guaiuba'],                                         totalAcoes:412, totalAlcance:18400 },
    { id:'sobral',          nome:'Regiao de Sobral',           municipios:['Sobral','Tianguá','Cruz','Marco','Ibiapina','Ubajara','São Benedito'],                                          totalAcoes:89,  totalAlcance:3200  },
    { id:'vale_jaguaribe',   nome:'Vale do Jaguaribe',         municipios:['Limoeiro do Norte','Russas','Jaguaribe','Icó','Quixeré','Morada Nova','Tabuleiro do Norte'],                          totalAcoes:67,  totalAlcance:2100  },
    { id:'litoral_norte',   nome:'Litoral Norte',              municipios:['Paracuru','Trairi','São Gonçalo do Amarante','Paraipaba','Itarema'],                                             totalAcoes:45,  totalAlcance:1600  },
    { id:'sertao_central',  nome:'Sertao Central',             municipios:['Quixada','Canindé','Boa Viagem','Madalena','Choró'],                                                            totalAcoes:52,  totalAlcance:1900  },
    { id:'litoral_leste',   nome:'Litoral Leste',              municipios:['Beberibe','Fortaleza','Pindoretama','Eusébio','Aquiraz'],                                                     totalAcoes:38,  totalAlcance:1200  },
    { id:'macico_baturite', nome:'Macico de Baturite',        municipios:['Baturité','Guaramiranga','Aratuba','Mulungu','Capistrano','Itapiúna'],                                          totalAcoes:31,  totalAlcance:980   },
    { id:'centro_sul',      nome:'Centro Sul',                 municipios:['Várzea Alegre','Iguatu','Lavras da Mangabeira','Orós','Quixelô'],                                              totalAcoes:43,  totalAlcance:1500  },
  ],
  ultimaAtt: null,
}

const MESES_COMPLETOS = ['', 'Janeiro','Fevereiro','Marco','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const SERVICOS = [
  { id:'todos', label:'Todos os Servicos'},
  { id:'escolas', label:'Escolas Atendidas'},
  { id:'alunos', label:'Alunos Atendidos'},
  { id:'blitz', label:'Blitz Educativas'},
  { id:'veiculos', label:'Veiculos Abordados'},
  { id:'cursos', label:'Cursos'},
  { id:'palestras', label:'Palestras'},
  { id:'interv', label:'Intervencoes Educativas'},
  { id:'maisInf', label:'Mais Infancia'},
]

function formatarNumero(n) {
  if (!n && n !== 0) return '-'
  return (n || 0).toLocaleString('pt-BR')
}

function calcularTotais(dados, mesFiltro) {
  const filtrado = mesFiltro && mesFiltro !== 'todos'
    ? dados.filter(d => d.mesNum === parseInt(mesFiltro))
    : dados
  return filtrado.reduce((acc, d) => {
    acc.alcance   += d.alcance   || 0
    acc.escolas   += d.escolas   || 0
    acc.alunos    += d.alunos    || 0
    acc.blitz     += d.blitz     || 0
    acc.veiculos  += d.veiculos  || 0
    acc.cursos    += d.cursos    || 0
    acc.palestras += d.palestras || 0
    acc.interv    += d.interv    || 0
    acc.maisInf   += d.maisInf   || 0
    acc.alcPal    += d.alcPal    || 0
    acc.alcInt    += d.alcInt    || 0
    acc.alcMi     += d.alcMi     || 0
    acc.benef     += d.benef     || 0
    acc.muni      += (d.escolas > 0 ? 1 : 0)
    return acc
  }, { alcance:0, escolas:0, alunos:0, blitz:0, veiculos:0, cursos:0, palestras:0, interv:0, maisInf:0, benef:0, alcPal:0, alcInt:0, alcMi:0, muni:0, macroreg:9 })
}

// ─── ICONES SVG ────────────────────────────────────────────────────────────
const IconUsers      = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
const IconSchool     = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
const IconBook       = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
const IconMegaphone  = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l18-5v12L3 13v-2z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>
const IconActivity   = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
const IconCar        = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17h14v-5H5v5z"/><path d="M6 12l2-5h8l2 5"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>
const IconMap        = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
const IconGlobe      = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
const IconStar       = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
const IconRefresh    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
const IconDownload   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
const IconFilter     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
const IconChevronDown  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
const IconChevronRight = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
const IconCheck      = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>

// ─── HEADER ───────────────────────────────────────────────────────────────
function Header({ onRefresh, refreshing, ultimaAtt }) {
  return (
    <header style={{ background: theme.primaryDark, color: 'white' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 0', borderBottom:`1px solid ${theme.primary}` }}>
          <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
            <div style={{ width:'44px', height:'44px', background:'white', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <img src="/detran-logo.png" alt="DETRAN" style={{ width:'44px', height:'44px' }}
                onError={e => { e.target.style.display='none' }} />
            </div>
            <div>
              <h1 style={{ margin:0, fontSize:'16px', fontWeight:'800', letterSpacing:'0.5px' }}>
                DETRAN<span style={{ color:'#a3e635' }}>-CE</span>
              </h1>
              <p style={{ margin:0, fontSize:'11px', color:'rgba(255,255,255,0.7)', fontWeight:'500' }}>
                DIET — Diretoria de Educacao para o Transito
              </p>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <div style={{ textAlign:'right' }}>
              <p style={{ margin:0, fontSize:'10px', color:'rgba(255,255,255,0.5)' }}>ULTIMA ATT</p>
              <p style={{ margin:0, fontSize:'12px', fontWeight:'600' }}>{ultimaAtt}</p>
            </div>
            <button onClick={onRefresh} disabled={refreshing}
              style={{ display:'flex', alignItems:'center', gap:'6px', background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)', color:'white', padding:'8px 14px', borderRadius:'8px', fontSize:'12px', fontWeight:'600', cursor:'pointer' }}>
              <span style={{ display:'inline-block', animation:refreshing?'spin 1s linear infinite':'none' }}><IconRefresh /></span>
              <span className="hide-mobile">Atualizar</span>
            </button>
          </div>
        </div>
        <div style={{ padding:'12px 0 10px' }}>
          <h2 style={{ margin:0, fontSize:'18px', fontWeight:'700' }}>
            Painel DIET — Monitoramento de Acoes Educativas
          </h2>
          <p style={{ margin:'2px 0 0', fontSize:'12px', color:'rgba(255,255,255,0.6)' }}>
            Dados em tempo real da Planilha Google Sheets DETRAN-CE | {new Date().toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' })}
          </p>
        </div>
      </div>
    </header>
  )
}

// ─── FILTROS GLOBAIS ───────────────────────────────────────────────────────
function GlobalFilters({ ano, setAno, mes, setMes, servico, setServico, macroreg, setMacroreg, macroregioes }) {
  const anos = [2026, 2025]
  const mesesLista = [
    { id:'todos', label:'Todos os Meses' },
    ...MESES_COMPLETOS.slice(1).map((nome, i) => ({ id:String(i+1), label:nome }))
  ]
  const macroregLista = [
    { id:'todas', label:'Todas as Macrorregioes' },
    ...(macroregioes || []).map(m => ({ id:m.id, label:m.nome }))
  ]
  const Select = ({ value, onChange, options, label }) => (
    <div>
      <label style={{ display:'block', fontSize:'10px', fontWeight:'700', color:theme.textSecondary, textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'4px' }}>{label}</label>
      <div style={{ position:'relative' }}>
        <select value={value} onChange={e => onChange(e.target.value)}
          style={{ width:'100%', padding:'8px 32px 8px 10px', border:`1px solid ${theme.border}`, borderRadius:'8px', fontSize:'12px', fontWeight:'600', color:theme.textPrimary, background:'white', cursor:'pointer', appearance:'none' }}>
          {options.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
        </select>
        <div style={{ position:'absolute', right:'8px', top:'50%', transform:'translateY(-50%)', pointerEvents:'none', color:theme.textSecondary }}>
          <IconChevronDown />
        </div>
      </div>
    </div>
  )
  return (
    <div style={{ background:'white', border:`1px solid ${theme.border}`, borderRadius:'12px', padding:'16px', marginBottom:'16px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'12px' }}>
        <IconFilter />
        <span style={{ fontSize:'11px', fontWeight:'700', color:theme.textSecondary, textTransform:'uppercase', letterSpacing:'0.5px' }}>Filtros Globais</span>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))', gap:'12px' }}>
        <Select value={ano}     onChange={setAno}     options={anos.map(a => ({ id:a, label:String(a) }))}               label="Ano" />
        <Select value={mes}    onChange={setMes}      options={mesesLista}                                              label="Mes" />
        <Select value={servico} onChange={setServico}  options={SERVICOS}                                                 label="Tipo de Servico" />
        <Select value={macroreg} onChange={setMacroreg} options={macroregLista}                                           label="Macrorregiao" />
      </div>
    </div>
  )
}

// ─── CARD DE METRICA ────────────────────────────────────────────────────────
function MetricCard({ title, value, subtitle, icon, color=theme.primary, trend }) {
  return (
    <div style={{ background:'white', border:`1px solid ${theme.border}`, borderTop:`3px solid ${color}`, borderRadius:'10px', padding:'14px' }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'8px' }}>
        <div style={{ width:'36px', height:'36px', borderRadius:'8px', background:color+'20', display:'flex', alignItems:'center', justifyContent:'center', color }}>{icon}</div>
        {trend}
      </div>
      <p style={{ margin:'0 0 2px', fontSize:'22px', fontWeight:'800', color:theme.textPrimary, lineHeight:1 }}>{value}</p>
      <p style={{ margin:0, fontSize:'11px', fontWeight:'700', color:theme.textSecondary }}>{title}</p>
      {subtitle && <p style={{ margin:'2px 0 0', fontSize:'10px', color:theme.textSecondary, opacity:0.7 }}>{subtitle}</p>}
    </div>
  )
}

// ─── GRAFICO AREA ─────────────────────────────────────────────────────────
function GraficoEvolucao({ dados }) {
  return (
    <div style={{ background:'white', border:`1px solid ${theme.border}`, borderRadius:'12px', padding:'16px', marginBottom:'16px' }}>
      <h3 style={{ margin:'0 0 4px', fontSize:'13px', fontWeight:'700', color:theme.textPrimary }}>Evolucao Mensal do Alcance</h3>
      <p style={{ margin:'0 0 12px', fontSize:'11px', color:theme.textSecondary }}>Pessoas alcancadas por mes (fonte: Google Sheets)</p>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={dados.filter(d => d.alcance > 0)} margin={{ top:5, right:5, left:-20, bottom:0 }}>
          <defs>
            <linearGradient id="colorAlcance" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={theme.primary} stopOpacity={0.25} />
              <stop offset="95%" stopColor={theme.primary} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.border} vertical={false} />
          <XAxis dataKey="mes" tick={{ fontSize:10, fill:theme.textSecondary, fontWeight:'600' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize:10, fill:theme.textSecondary }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius:8, border:`1px solid ${theme.border}`, fontSize:12, fontWeight:'600' }}
            formatter={v => [v.toLocaleString('pt-BR'), 'Pessoas Alcancadas']} />
          <Area type="monotone" dataKey="alcance" stroke={theme.primary} strokeWidth={2.5} fill="url(#colorAlcance)"
            dot={{ r:4, fill:theme.primary, strokeWidth:2, stroke:'white' }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── GRAFICO BARRAS HORIZONTAIS ────────────────────────────────────────────
function GraficoServicos({ totais }) {
  const dados = [
    { nome:'Intervencoes', valor:totais.interv,    cor:theme.primary },
    { nome:'Alunos',        valor:totais.alunos,     cor:theme.secondary },
    { nome:'Veiculos',      valor:totais.veiculos,  cor:'#6b7280' },
    { nome:'Alcance Pal.',  valor:totais.alcPal,    cor:'#0891b2' },
    { nome:'Blitz',         valor:totais.blitz,      cor:'#7c3aed' },
    { nome:'Escolas',       valor:totais.escolas,   cor:'#ea580c' },
    { nome:'Cursos',        valor:totais.cursos,     cor:'#db2777' },
    { nome:'Mais Infancia',  valor:totais.maisInf,   cor:'#16a34a' },
  ].filter(d => d.valor > 0)
  const max = Math.max(...dados.map(d => d.valor), 1)
  return (
    <div style={{ background:'white', border:`1px solid ${theme.border}`, borderRadius:'12px', padding:'16px', marginBottom:'16px' }}>
      <h3 style={{ margin:'0 0 4px', fontSize:'13px', fontWeight:'700', color:theme.textPrimary }}>Distribuicao por Tipo de Servico</h3>
      <p style={{ margin:'0 0 12px', fontSize:'11px', color:theme.textSecondary }}>Quantidade de acoes por servico (fonte: Google Sheets)</p>
      <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
        {dados.map(d => {
          const pct = max > 0 ? (d.valor / max) * 100 : 0
          return (
            <div key={d.nome}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'3px' }}>
                <span style={{ fontSize:'11px', fontWeight:'600', color:theme.textPrimary }}>{d.nome}</span>
                <span style={{ fontSize:'11px', fontWeight:'700', color:d.cor }}>{d.valor.toLocaleString('pt-BR')}</span>
              </div>
              <div style={{ background:'#f0f2f5', borderRadius:'4px', height:'8px', overflow:'hidden' }}>
                <div style={{ width:`${pct}%`, height:'100%', background:d.cor, borderRadius:'4px' }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── GRAFICO BARRAS (acoes por mes) ────────────────────────────────────────
function GraficoAcoes({ dados }) {
  return (
    <div style={{ background:'white', border:`1px solid ${theme.border}`, borderRadius:'12px', padding:'16px', marginBottom:'16px' }}>
      <h3 style={{ margin:'0 0 4px', fontSize:'13px', fontWeight:'700', color:theme.textPrimary }}>Acoes Realizadas por Mes</h3>
      <p style={{ margin:'0 0 12px', fontSize:'11px', color:theme.textSecondary }}>Quantidade total de acoes por mes</p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={dados} margin={{ top:5, right:5, left:-20, bottom:0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.border} vertical={false} />
          <XAxis dataKey="mes" tick={{ fontSize:10, fill:theme.textSecondary, fontWeight:'600' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize:10, fill:theme.textSecondary }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius:8, border:`1px solid ${theme.border}`, fontSize:12 }} />
          <Bar dataKey="escolas" fill={theme.primary}   radius={[4,4,0,0]} name="Escolas" maxBarSize={40} />
          <Bar dataKey="blitz"   fill={theme.secondary} radius={[4,4,0,0]} name="Blitz"   maxBarSize={40} />
          <Bar dataKey="cursos"  fill="#ea580c"         radius={[4,4,0,0]} name="Cursos"  maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
      <div style={{ display:'flex', gap:'16px', flexWrap:'wrap', marginTop:'8px' }}>
        {[['Escolas',theme.primary],['Blitz',theme.secondary],['Cursos','#ea580c']].map(([label,cor]) => (
          <div key={label} style={{ display:'flex', alignItems:'center', gap:'4px' }}>
            <div style={{ width:'10px', height:'10px', borderRadius:'2px', background:cor }} />
            <span style={{ fontSize:'10px', color:theme.textSecondary, fontWeight:'600' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── MACRORREGIOES ─────────────────────────────────────────────────────────
function MacroRegionPanel({ macroregioes }) {
  const lista = macroregioes || []
  const totalAcoes = lista.reduce((s, m) => s + (m.totalAcoes||0), 0)
  const totalAlcance = lista.reduce((s, m) => s + (m.totalAlcance||0), 0)
  const [openRegion, setOpenRegion] = useState(null)
  return (
    <div style={{ background:'white', border:`1px solid ${theme.border}`, borderRadius:'12px', padding:'16px', marginBottom:'16px' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px' }}>
        <div>
          <h3 style={{ margin:0, fontSize:'13px', fontWeight:'700', color:theme.textPrimary }}>Cobertura Territorial</h3>
          <p style={{ margin:'2px 0 0', fontSize:'11px', color:theme.textSecondary }}>{lista.length} macrorregioes</p>
        </div>
        <div style={{ display:'flex', gap:'16px' }}>
          <div style={{ textAlign:'center' }}>
            <p style={{ margin:0, fontSize:'14px', fontWeight:'800', color:theme.primary }}>{totalAcoes}</p>
            <p style={{ margin:0, fontSize:'9px', color:theme.textSecondary, fontWeight:'600', textTransform:'uppercase' }}>Acoes</p>
          </div>
          <div style={{ textAlign:'center' }}>
            <p style={{ margin:0, fontSize:'14px', fontWeight:'800', color:theme.secondary }}>{formatarNumero(totalAlcance)}</p>
            <p style={{ margin:0, fontSize:'9px', color:theme.textSecondary, fontWeight:'600', textTransform:'uppercase' }}>Alcance</p>
          </div>
        </div>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
        {[...lista].sort((a,b) => (b.totalAcoes||0)-(a.totalAcoes||0)).map(mr => {
          const isOpen = openRegion === mr.id
          return (
            <div key={mr.id} style={{ border:`1px solid ${theme.border}`, borderRadius:'8px', overflow:'hidden' }}>
              <button onClick={() => setOpenRegion(isOpen ? null : mr.id)}
                style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 12px', background:isOpen?theme.primaryLight:'#f8f9fa', border:'none', cursor:'pointer', textAlign:'left', transition:'background 0.15s' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                  <div style={{ color:theme.primary }}>{isOpen ? <IconChevronDown /> : <IconChevronRight />}</div>
                  <span style={{ fontSize:'12px', fontWeight:'700', color:theme.textPrimary }}>{mr.nome}</span>
                </div>
                <div style={{ display:'flex', gap:'12px' }}>
                  <span style={{ fontSize:'11px', fontWeight:'700', color:theme.primary }}>{mr.totalAcoes||0} acoes</span>
                  <span style={{ fontSize:'11px', fontWeight:'700', color:theme.secondary }}>{formatarNumero(mr.totalAlcance||0)}</span>
                </div>
              </button>
              {isOpen && (
                <div style={{ padding:'8px 12px', background:'white', borderTop:`1px solid ${theme.border}` }}>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'4px' }}>
                    {(mr.municipios||[]).map(m => (
                      <span key={m} style={{ fontSize:'10px', fontWeight:'600', padding:'2px 8px', background:theme.primaryLight, color:theme.primary, borderRadius:'4px' }}>{m}</span>
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

// ─── RANKING MUNICIPIOS ────────────────────────────────────────────────────
function RankingMunicipios({ rankingCidades }) {
  const ranking = (rankingCidades && rankingCidades.length > 0)
    ? rankingCidades.map(([nome, acoes]) => ({ nome, acoes }))
    : []
  const max = ranking[0]?.acoes || 1
  return (
    <div style={{ background:'white', border:`1px solid ${theme.border}`, borderRadius:'12px', padding:'16px', marginBottom:'16px' }}>
      <h3 style={{ margin:'0 0 4px', fontSize:'13px', fontWeight:'700', color:theme.textPrimary }}>Ranking de Municipios</h3>
      <p style={{ margin:'0 0 12px', fontSize:'11px', color:theme.textSecondary }}>Top cidades com maior volume de acoes</p>
      {ranking.length === 0 && <p style={{ color:theme.textSecondary, fontSize:'12px' }}>Sem dados disponiveis</p>}
      <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
        {ranking.map((m, i) => {
          const pct = (m.acoes / max) * 100
          return (
            <div key={m.nome} style={{ display:'flex', alignItems:'center', gap:'8px' }}>
              <span style={{ width:'20px', fontSize:'10px', fontWeight:'800', textAlign:'center', color:i===0?'#b45309':i===1?'#6b7280':i===2?'#92400e':theme.textSecondary }}>{i+1}</span>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'2px' }}>
                  <span style={{ fontSize:'11px', fontWeight:'600', color:theme.textPrimary }}>{m.nome}</span>
                  <span style={{ fontSize:'11px', fontWeight:'700', color:theme.primary }}>{m.acoes} acoes</span>
                </div>
                <div style={{ background:'#f0f2f5', borderRadius:'4px', height:'6px' }}>
                  <div style={{ width:`${pct}%`, height:'100%', background:theme.primary, borderRadius:'4px' }} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── SATISFACAO ───────────────────────────────────────────────────────────
function SatisfactionPanel({ totais }) {
  return (
    <div style={{ background:'white', border:`1px solid ${theme.border}`, borderRadius:'12px', padding:'16px', marginBottom:'16px' }}>
      <h3 style={{ margin:'0 0 4px', fontSize:'13px', fontWeight:'700', color:theme.textPrimary }}>Pesquisa de Satisfacao</h3>
      <p style={{ margin:'0 0 12px', fontSize:'11px', color:theme.textSecondary }}>Dados aguardando envio pelo setor responsavel</p>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px, 1fr))', gap:'12px' }}>
        {[
          { label:'Nota Geral', valor:4.4, cor:theme.primary },
          { label:'Clareza do Conteudo', valor:4.6, cor:theme.secondary },
          { label:'Qualidade do Instrutor', valor:4.5, cor:'#0891b2' },
          { label:'Relevancia do Tema', valor:4.3, cor:'#7c3aed' },
          { label:'Organizacao', valor:4.2, cor:'#ea580c' },
        ].map(item => (
          <div key={item.label} style={{ textAlign:'center', padding:'10px', background:'#f8f9fa', borderRadius:'8px' }}>
            <p style={{ margin:'0 0 4px', fontSize:'20px', fontWeight:'800', color:item.cor }}>{item.valor}</p>
            <div style={{ background:'#e5e7eb', borderRadius:'4px', height:'4px', marginBottom:'4px' }}>
              <div style={{ width:`${(item.valor/5)*100}%`, height:'100%', background:item.cor, borderRadius:'4px' }} />
            </div>
            <p style={{ margin:0, fontSize:'9px', fontWeight:'600', color:theme.textSecondary, textTransform:'uppercase' }}>{item.label}</p>
          </div>
        ))}
      </div>
      <div style={{ marginTop:'12px', padding:'10px', background:theme.primaryLight, borderRadius:'8px', borderLeft:`3px solid ${theme.primary}` }}>
        <p style={{ margin:0, fontSize:'11px', color:theme.textSecondary }}>
          <strong style={{ color:theme.primary }}>Status:</strong> Setor de avaliacao institucional ira enviar resultados ate dia 05 de cada mes.
        </p>
      </div>
    </div>
  )
}

// ─── RELATORIO EXECUTIVO ──────────────────────────────────────────────────
function ExecutiveReport({ totais, dados, ano, mes, macroregioes }) {
  const [copiado, setCopiado] = useState(false)
  const mesLabel = mes === 'todos' ? 'todos os meses' : (MESES_COMPLETOS[parseInt(mes)] || mes)
  const texto = `RELATORIO EXECUTIVO DIET — ${String(mesLabel).toUpperCase()} ${ano}

No periodo selecionado, a Diretoria de Educacao de Transito realizou ${totais.escolas + totais.blitz + totais.cursos} acoes educativas, alcancando ${formatarNumero(totais.alcance)} pessoas no Estado do Ceara.

DESTAQUES:
* ${formatarNumero(totais.alunos)} alunos atendidos em ${totais.escolas} escolas
* ${totais.blitz} blitze educativas com ${formatarNumero(totais.veiculos)} veiculos abordados
* ${totais.cursos} cursos realizados
* ${totais.palestras} palestras educativas realizadas
* ${totais.interv} pessoas alcancadas em intervencoes
* ${totais.maisInf} acoes do Programa Mais Infancia

DISTRIBUICAO TERRITORIAL:
${(macroregioes||[]).slice(0,3).map(m => `* ${m.nome}: ${m.totalAcoes||0} acoes, ${formatarNumero(m.totalAlcance||0)} alcancados`).join('\n')}

FONTE: Planilha Google Sheets DETRAN-CE DIET
Gerado em: ${new Date().toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' })}
DETRAN-CE | DIET — Diretoria de Educacao para o Transito`
  const handleCopiar = () => {
    navigator.clipboard.writeText(texto).then(() => { setCopiado(true); setTimeout(()=>setCopiado(false),2000) })
  }
  const handleBaixar = () => {
    const blob = new Blob([texto], { type:'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `relatorio-diet-${ano}-${mes||'todos'}.txt`
    a.click()
    URL.revokeObjectURL(a.href)
  }
  const handleWhatsApp = () => {
    const resumo = `RELATORIO DIET ${ano}\n\nTotal: ${formatarNumero(totais.alcance)} alcancados | ${totais.escolas+totais.blitz+totais.cursos} acoes\n\nAlunos: ${formatarNumero(totais.alunos)} | Blitz: ${totais.blitz} | Cursos: ${totais.cursos} | Veiculos: ${formatarNumero(totais.veiculos)}`
    window.open(`https://wa.me/?text=${encodeURIComponent(resumo)}`, '_blank')
  }
  return (
    <div style={{ background:'white', border:`1px solid ${theme.border}`, borderRadius:'12px', padding:'16px', marginBottom:'16px' }}>
      <h3 style={{ margin:'0 0 4px', fontSize:'13px', fontWeight:'700', color:theme.textPrimary }}>Relatorio Executivo</h3>
      <p style={{ margin:'0 0 12px', fontSize:'11px', color:theme.textSecondary }}>Resumo automatico baseado nos filtros aplicados — fonte: Google Sheets</p>
      <div style={{ background:'#f8f9fa', border:`1px solid ${theme.border}`, borderRadius:'8px', padding:'14px', fontSize:'11px', lineHeight:'1.7', color:theme.textPrimary, whiteSpace:'pre-line', fontFamily:'monospace', maxHeight:'320px', overflowY:'auto' }}>
        {texto}
      </div>
      <div style={{ display:'flex', gap:'8px', marginTop:'12px', flexWrap:'wrap' }}>
        <button onClick={handleCopiar} style={{ flex:1, minWidth:'120px', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px', padding:'10px', borderRadius:'8px', border:`1px solid ${theme.border}`, background:'white', fontSize:'12px', fontWeight:'600', cursor:'pointer', color:theme.textPrimary }}>
          {copiado ? <IconCheck /> : <IconDownload />} {copiado ? 'Copiado!' : 'Copiar Texto'}
        </button>
        <button onClick={handleBaixar} style={{ flex:1, minWidth:'120px', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px', padding:'10px', borderRadius:'8px', border:`1px solid ${theme.border}`, background:'white', fontSize:'12px', fontWeight:'600', cursor:'pointer', color:theme.textPrimary }}>
          <IconDownload /> Baixar
        </button>
        <button onClick={handleWhatsApp} style={{ flex:1, minWidth:'120px', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px', padding:'10px', borderRadius:'8px', border:'none', background:'#25d366', fontSize:'12px', fontWeight:'600', cursor:'pointer', color:'white' }}>
          Enviar via WhatsApp
        </button>
      </div>
    </div>
  )
}

// ─── TABELA ANALITICA ──────────────────────────────────────────────────────
function AnalyticalTable({ dados, totais, ano, mes }) {
  const [busca, setBusca] = useState('')
  const [ordenado, setOrdenado] = useState({ campo:'alcance', dir:'desc' })
  const filtrado = dados.filter(d => !busca || d.mes.toLowerCase().includes(busca.toLowerCase()))
    .sort((a, b) => {
      const av = a[ordenado.campo] || 0, bv = b[ordenado.campo] || 0
      return ordenado.dir === 'desc' ? bv - av : av - bv
    })
  const ordenar = campo => setOrdenado(prev => ({ campo, dir: prev.campo===campo && prev.dir==='desc' ? 'asc' : 'desc' }))
  const thStyle = campo => ({
    padding:'8px 10px', fontSize:'10px', fontWeight:'700', color:theme.textSecondary,
    textTransform:'uppercase', cursor:'pointer', whiteSpace:'nowrap',
    background: ordenado.campo===campo ? theme.primaryLight : '#f8f9fa',
    borderBottom:`2px solid ${theme.border}`,
  })
  const tdStyle = { padding:'8px 10px', fontSize:'11px', borderBottom:`1px solid ${theme.border}` }
  const handleCSV = () => {
    const csv = ['Mes,Alcance,Escolas,Alunos,Blitz,Veiculos,Cursos,Palestras,Interv,MaisInf\n',
      ...filtrado.map(d => `${d.mes},${d.alcance},${d.escolas},${d.alunos},${d.blitz},${d.veiculos},${d.cursos},${d.palestras},${d.interv},${d.maisInf}`)].join('\n')
    const blob = new Blob([csv], { type:'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `diet-dados-${ano}-${mes||'todos'}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }
  return (
    <div style={{ background:'white', border:`1px solid ${theme.border}`, borderRadius:'12px', padding:'16px', marginBottom:'16px', overflowX:'auto' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px', flexWrap:'wrap', gap:'8px' }}>
        <div>
          <h3 style={{ margin:0, fontSize:'13px', fontWeight:'700', color:theme.textPrimary }}>Tabela Analitica</h3>
          <p style={{ margin:'2px 0 0', fontSize:'11px', color:theme.textSecondary }}>{filtrado.length} registros — fonte: Google Sheets</p>
        </div>
        <div style={{ display:'flex', gap:'8px' }}>
          <input type="text" placeholder="Buscar mes..." value={busca} onChange={e=>setBusca(e.target.value)}
            style={{ padding:'6px 10px', border:`1px solid ${theme.border}`, borderRadius:'6px', fontSize:'11px', outline:'none', minWidth:'140px' }} />
          <button onClick={handleCSV} style={{ display:'flex', alignItems:'center', gap:'4px', padding:'6px 12px', borderRadius:'6px', border:`1px solid ${theme.border}`, background:'white', fontSize:'11px', fontWeight:'600', cursor:'pointer', color:theme.textPrimary, whiteSpace:'nowrap' }}>
            <IconDownload /> CSV
          </button>
        </div>
      </div>
      <table style={{ width:'100%', borderCollapse:'collapse', minWidth:'700px' }}>
        <thead>
          <tr style={{ background:'#f8f9fa' }}>
            {[['mes','Mes'],['alcance','Alcance'],['escolas','Escolas'],['alunos','Alunos'],['blitz','Blitz'],['veiculos','Veiculos'],['cursos','Cursos'],['palestras','Palestras'],['interv','Interv'],['maisInf','MaisInf']].map(([campo,label]) => (
              <th key={campo} style={thStyle(campo)} onClick={()=>ordenar(campo)}>
                {label} {ordenado.campo===campo ? (ordenado.dir==='desc'?'▼':'▲') : ''}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtrado.map((d, i) => (
            <tr key={d.mes} style={{ background: i%2===0?'white':'#fafbfc' }}>
              <td style={{ ...tdStyle, fontWeight:'700', color:theme.primary }}>{d.mes}</td>
              <td style={{ ...tdStyle, fontWeight:'700' }}>{d.alcance.toLocaleString('pt-BR')}</td>
              <td style={tdStyle}>{d.escolas}</td>
              <td style={tdStyle}>{d.alunos}</td>
              <td style={tdStyle}>{d.blitz}</td>
              <td style={tdStyle}>{d.veiculos.toLocaleString('pt-BR')}</td>
              <td style={tdStyle}>{d.cursos}</td>
              <td style={tdStyle}>{d.palestras}</td>
              <td style={tdStyle}>{d.interv.toLocaleString('pt-BR')}</td>
              <td style={tdStyle}>{d.maisInf}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr style={{ background:theme.primaryLight }}>
            <td style={{ ...tdStyle, fontWeight:'800', color:theme.primary }}>TOTAL</td>
            <td style={{ ...tdStyle, fontWeight:'800', color:theme.primary }}>{totais.alcance.toLocaleString('pt-BR')}</td>
            <td style={{ ...tdStyle, fontWeight:'800', color:theme.primary }}>{totais.escolas}</td>
            <td style={{ ...tdStyle, fontWeight:'800', color:theme.primary }}>{totais.alunos}</td>
            <td style={{ ...tdStyle, fontWeight:'800', color:theme.primary }}>{totais.blitz}</td>
            <td style={{ ...tdStyle, fontWeight:'800', color:theme.primary }}>{totais.veiculos.toLocaleString('pt-BR')}</td>
            <td style={{ ...tdStyle, fontWeight:'800', color:theme.primary }}>{totais.cursos}</td>
            <td style={{ ...tdStyle, fontWeight:'800', color:theme.primary }}>{totais.palestras}</td>
            <td style={{ ...tdStyle, fontWeight:'800', color:theme.primary }}>{totais.interv.toLocaleString('pt-BR')}</td>
            <td style={{ ...tdStyle, fontWeight:'800', color:theme.primary }}>{totais.maisInf}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

// ─── TABS ──────────────────────────────────────────────────────────────────
function Tabs({ activeTab, setActiveTab }) {
  const tabs = [
    { id:'dashboard',   label:'Visao Geral' },
    { id:'graficos',    label:'Graficos' },
    { id:'territorio',  label:'Territorio' },
    { id:'satisfacao',  label:'Satisfacao' },
    { id:'dados',       label:'Dados' },
    { id:'relatorio',   label:'Relatorio' },
  ]
  return (
    <div style={{ display:'flex', overflowX:'auto', gap:'4px', marginBottom:'16px', padding:'4px', background:'white', borderRadius:'10px', border:`1px solid ${theme.border}` }}>
      {tabs.map(tab => (
        <button key={tab.id} onClick={()=>setActiveTab(tab.id)}
          style={{ flexShrink:0, padding:'8px 14px', borderRadius:'8px', border:'none', fontSize:'11px', fontWeight:'600', cursor:'pointer', whiteSpace:'nowrap', transition:'all 0.15s', background:activeTab===tab.id?theme.primary:'transparent', color:activeTab===tab.id?'white':theme.textSecondary }}>
          {tab.label}
        </button>
      ))}
    </div>
  )
}

// ─── CONSOLIDATED METRICS ──────────────────────────────────────────────────
function ConsolidatedMetrics({ totais }) {
  const cards = [
    { key:'alcance',   label:'Pessoas Alcancadas',  icon:<IconGlobe />,    cor:theme.primary },
    { key:'alunos',    label:'Alunos Atendidos',    icon:<IconUsers />,    cor:theme.secondary },
    { key:'escolas',   label:'Escolas Visitadas',   icon:<IconSchool />,   cor:'#0891b2' },
    { key:'blitz',     label:'Blitz Educativas',     icon:<IconActivity />, cor:'#7c3aed' },
    { key:'veiculos',  label:'Veiculos Abordados',  icon:<IconCar />,      cor:'#ea580c' },
    { key:'cursos',    label:'Cursos Realizados',     icon:<IconBook />,     cor:'#db2777' },
    { key:'palestras', label:'Palestras',            icon:<IconMegaphone />, cor:'#16a34a' },
    { key:'interv',    label:'Intervencoes',          icon:<IconActivity />, cor:'#b45309' },
    { key:'muni',      label:'Municipios',            icon:<IconMap />,      cor:'#0891b2' },
    { key:'maisInf',   label:'Acoes Mais Infancia',   icon:<IconStar />,     cor:'#16a34a' },
  ]
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:'10px', marginBottom:'16px' }}>
      {cards.map(card => (
        <MetricCard key={card.key} title={card.label}
          value={formatarNumero(totais[card.key] || 0)}
          icon={card.icon} color={card.cor} />
      ))}
    </div>
  )
}

// ─── APP PRINCIPAL ─────────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [ano, setAno]             = useState('2026')
  const [mes, setMes]             = useState('todos')
  const [servico, setServico]     = useState('todos')
  const [macroreg, setMacroreg]   = useState('todas')
  const [apiData, setApiData]     = useState(null)
  const [dados, setDados]         = useState([])
  const [totais, setTotais]       = useState({})
  const [loading, setLoading]     = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [ultimaAtt, setUltimaAtt] = useState('--:--')
  const [apiError, setApiError]   = useState(null)

  const carregarDados = useCallback(async () => {
    setRefreshing(true)
    setApiError(null)
    try {
      const res = await fetch('/api/sheets')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Erro na API')
      setApiData(json.data)
      setDados(json.data.dadosMensais || [])
      setTotais(calcularTotais(json.data.dadosMensais || [], mes))
      setUltimaAtt(new Date().toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' }))
    } catch (e) {
      console.warn('[App] API indisponivel, usando fallback:', e.message)
      setApiError(e.message)
      setApiData(FALLBACK)
      setDados(FALLBACK.dadosMensais)
      setTotais(calcularTotais(FALLBACK.dadosMensais, mes))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [mes])

  useEffect(() => { carregarDados() }, [carregarDados])

  const handleRefresh = () => { if (!refreshing) carregarDados() }

  if (loading) {
    return (
      <div style={{ minHeight:'100vh', background:theme.background, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ width:'60px', height:'60px', background:theme.primary, borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
            <img src="/detran-logo.png" alt="DETRAN" style={{ width:'48px', height:'48px' }} onError={e=>{e.target.style.display='none'}} />
          </div>
          <div style={{ width:'40px', height:'40px', border:`4px solid ${theme.border}`, borderTopColor:theme.primary, borderRadius:'50%', animation:'spin 1s linear infinite', margin:'0 auto' }} />
          <p style={{ marginTop:'12px', color:theme.textSecondary, fontSize:'13px', fontWeight:'600' }}>Carregando dados reais...</p>
        </div>
      </div>
    )
  }

  const mesInt = parseInt(mes)
  const isCurrentMonth = mesInt === new Date().getMonth() + 1 && parseInt(ano) === new Date().getFullYear()

  return (
    <div style={{ minHeight:'100vh', background:theme.background }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        body { margin: 0; }
        @media (max-width: 640px) { .hide-mobile { display: none; } }
      `}</style>

      <Header onRefresh={handleRefresh} refreshing={refreshing} ultimaAtt={ultimaAtt} />

      <main style={{ maxWidth:'1280px', margin:'0 auto', padding:'16px' }}>
        {isCurrentMonth && (
          <div style={{ background:'#fef9c3', border:'1px solid #f59e0b', borderRadius:'8px', padding:'10px 14px', fontSize:'12px', fontWeight:'600', color:'#92400e', marginBottom:'12px' }}>
            Atencao: dados do mes atual podem estar parciais
          </div>
        )}

        <GlobalFilters
          ano={ano} setAno={setAno}
          mes={mes} setMes={setMes}
          servico={servico} setServico={setServico}
          macroreg={macroreg} setMacroreg={setMacroreg}
          macroregioes={apiData?.macroregioes}
        />

        {/* Status banner */}
        {apiError ? (
          <div style={{ background:'#fef9c3', border:'1px solid #f59e0b', borderRadius:'8px', padding:'8px 14px', fontSize:'11px', fontWeight:'600', color:'#92400e', marginBottom:'12px' }}>
            Modo demonstracao — API indisponivel ({apiError}). Dados: planilha oficial Jan-Abr/2026.
          </div>
        ) : (
          <div style={{ background:'#e6f4ec', border:'1px solid #007A3D', borderRadius:'8px', padding:'8px 14px', fontSize:'11px', fontWeight:'600', color:'#005C2E', marginBottom:'12px' }}>
              Dados em tempo real — Fonte: Google Sheets DETRAN-CE DIET
          </div>
        )}

        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div>
            <h3 style={{ margin:'0 0 4px', fontSize:'15px', fontWeight:'800', color:theme.textPrimary }}>
              Visao Geral — {mes==='todos'?'Todos os Meses':MESES_COMPLETOS[parseInt(mes)]} {ano}
            </h3>
            <p style={{ margin:'0 0 12px', fontSize:'11px', color:theme.textSecondary }}>
              Principais indicadores — fonte: Google Sheets DETRAN-CE DIET
            </p>
            <ConsolidatedMetrics totais={totais} />
          </div>
        )}

        {/* GRAFICOS */}
        {activeTab === 'graficos' && (
          <div>
            <h3 style={{ margin:'0 0 4px', fontSize:'15px', fontWeight:'800', color:theme.textPrimary }}>Analise Grafica</h3>
            <p style={{ margin:'0 0 12px', fontSize:'11px', color:theme.textSecondary }}>Evolucao e distribuicao das acoes educativas</p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(340px, 1fr))', gap:'16px' }}>
              <GraficoEvolucao dados={dados} />
              <GraficoAcoes dados={dados} />
            </div>
            <GraficoServicos totais={totais} />
          </div>
        )}

        {/* TERRITORIO */}
        {activeTab === 'territorio' && (
          <div>
            <h3 style={{ margin:'0 0 4px', fontSize:'15px', fontWeight:'800', color:theme.textPrimary }}>Cobertura Territorial</h3>
            <p style={{ margin:'0 0 12px', fontSize:'11px', color:theme.textSecondary }}>Distribuicao por macrorregiao e ranking de municipios</p>
            <MacroRegionPanel macroregioes={apiData?.macroregioes} />
            <RankingMunicipios rankingCidades={apiData?.rankingCidades} />
          </div>
        )}

        {/* SATISFACAO */}
        {activeTab === 'satisfacao' && (
          <div>
            <h3 style={{ margin:'0 0 4px', fontSize:'15px', fontWeight:'800', color:theme.textPrimary }}>Pesquisa de Satisfacao</h3>
            <p style={{ margin:'0 0 12px', fontSize:'11px', color:theme.textSecondary }}>Indices de avaliacao das acoes educativas</p>
            <SatisfactionPanel totais={totais} />
          </div>
        )}

        {/* DADOS */}
        {activeTab === 'dados' && (
          <div>
            <h3 style={{ margin:'0 0 4px', fontSize:'15px', fontWeight:'800', color:theme.textPrimary }}>Analise de Dados</h3>
            <p style={{ margin:'0 0 12px', fontSize:'11px', color:theme.textSecondary }}>Tabela analitica com todos os indicadores por mes</p>
            <AnalyticalTable dados={dados} totais={totais} ano={ano} mes={mes} />
          </div>
        )}

        {/* RELATORIO */}
        {activeTab === 'relatorio' && (
          <div>
            <h3 style={{ margin:'0 0 4px', fontSize:'15px', fontWeight:'800', color:theme.textPrimary }}>Relatorio Executivo</h3>
            <p style={{ margin:'0 0 12px', fontSize:'11px', color:theme.textSecondary }}>Resumo automatico para prestacao de contas</p>
            <ExecutiveReport totais={totais} dados={dados} ano={ano} mes={mes} macroregioes={apiData?.macroregioes} />
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer style={{ background:theme.primaryDark, color:'white', marginTop:'32px' }}>
        <div style={{ maxWidth:'1280px', margin:'0 auto', padding:'24px 16px' }}>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'24px', alignItems:'flex-start', justifyContent:'space-between' }}>
            <div style={{ flex:'1 1 200px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'8px' }}>
                <img src="/detran-logo.png" alt="DETRAN" style={{ width:'36px', height:'36px' }} onError={e=>{e.target.style.display='none'}} />
                <div>
                  <p style={{ margin:0, fontWeight:'800', fontSize:'13px' }}>DETRAN-CE</p>
                  <p style={{ margin:0, fontSize:'10px', opacity:0.7 }}>DIET — Diretoria de Educacao para o Transito</p>
                </div>
              </div>
              <p style={{ margin:'8px 0 0', fontSize:'10px', opacity:0.6 }}>
                Painel de monitoramento de acoes educativas com dados em tempo real da Planilha Google Sheets.
              </p>
            </div>
            <div style={{ flex:'1 1 280px' }}>
              <p style={{ margin:'0 0 8px', fontSize:'11px', fontWeight:'800', color:'rgba(255,255,255,0.9)', textTransform:'uppercase', letterSpacing:'0.5px' }}>Responsavel pelo Projeto</p>
              <p style={{ margin:'0 0 6px', fontSize:'13px', fontWeight:'700', color:'white' }}>Marcondes Rodrigues</p>
              <p style={{ margin:'0 0 8px', fontSize:'11px', color:'rgba(255,255,255,0.7)' }}>Analista de Tecnologia da Informacao — DETRAN-CE</p>
              <div style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
                <a href="https://wa.me/5585985035473" target="_blank" rel="noopener noreferrer"
                  style={{ display:'flex', alignItems:'center', gap:'6px', color:'#25d366', fontSize:'11px', fontWeight:'600', textDecoration:'none' }}>
                  WhatsApp: (85) 98503-5473
                </a>
                <a href="mailto:jose.marcondes@detran.ce.gov.br"
                  style={{ display:'flex', alignItems:'center', gap:'6px', color:'#a3e635', fontSize:'11px', fontWeight:'600', textDecoration:'none' }}>
                  jose.marcondes@detran.ce.gov.br
                </a>
                <a href="mailto:marcondesjr.ti@gmail.com"
                  style={{ display:'flex', alignItems:'center', gap:'6px', color:'rgba(255,255,255,0.7)', fontSize:'11px', fontWeight:'600', textDecoration:'none' }}>
                  marcondesjr.ti@gmail.com
                </a>
              </div>
            </div>
          </div>
          <div style={{ borderTop:'1px solid rgba(255,255,255,0.1)', marginTop:'16px', paddingTop:'12px', display:'flex', flexWrap:'wrap', gap:'8px', justifyContent:'space-between', alignItems:'center' }}>
            <p style={{ margin:0, fontSize:'10px', color:'rgba(255,255,255,0.4)' }}>
              DETRAN-CE | DIET — Diretoria de Educacao para o Transito | {new Date().getFullYear()} | Fonte: Google Sheets
            </p>
            <p style={{ margin:0, fontSize:'10px', color:'rgba(255,255,255,0.3)' }}>
              Desenvolvido por Marcondes Rodrigues — DETRAN-CE
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

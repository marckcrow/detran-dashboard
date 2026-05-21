# DETRAN-CE DIET Dashboard — SPEC v3

## Concept & Vision
Dashboard **institucional profissional** para a Diretoria de Educação de Trânsito do DETRAN-CE (DIET/NUPET/NUCAT). Alinhado à identidade visual do site oficial do DETRAN-CE com predominância de verde institucional, design sóbrio, governamental e administrativo. Responsivo para desktop, tablet e mobile. 100% em português.

## Design Language

**Palette (institucional):**
- `primary: #007A3D` — verde institucional
- `primaryDark: #005C2E` — verde escuro (header/footer)
- `primaryLight: #E6F4EC` — verde claro (fundos)
- `secondary: #0B5CAD` — azul moderado
- `warning: #F2B705` — amarelo (alertas)
- `danger: #C62828` — vermelho (pendências)
- `background: #F7F9FA`
- `surface: #FFFFFF`
- `border: #DDE5E8`
- `textPrimary: #1F2933`
- `textSecondary: #5B6770`

**Tipografia:** Sistema nativo, sem emojis nos cards, ícones SVG outline

## Features

### Filtros Globais
- Ano (2025 / 2026)
- Mês (Janeiro–Dezembro + Todos)
- Tipo de Serviço (10 categorias)
- Macrorregião (todas + 9 macrorregiões)

### 6 Tabs
1. **Visão Geral** — 12 cards de métricas (compactos, profissionais)
2. **Gráficos** — Área (alcance), Barras (ações por mês), Barras horizontais (distribuição)
3. **Território** — Accordion macrorregiões + ranking de municípios
4. **Satisfação** — Notas médias por critério
5. **Dados** — Tabela analítica com ordenação + exportação CSV
6. **Relatório** — Texto executivo + copiar/baixar/WhatsApp

### Indicadores Rastreados
- Pessoas alcançadas, escolas visitadas, alunos atendidos
- Blitz educativas, veículos abordados
- Cursos (presenciais/remotos), palestrantes
- Intervenções educativas, Mais Infância, outras ações
- Cobertura municipal e macrorregional
- Pesquisa de satisfação (estrutura preparada)

### Dados Reais (2026)
- 271 escolas, 8.132 alunos, 107 blitz, 17.462 veículos
- 16 cursos, 468 participantes, 2.646 palestras
- 30.432 intervenções, 55 ações Mais Infância

## Technical
- React 18 + Vite + TailwindCSS + Recharts
- Google Sheets API ready (mock data atual)
- Deploy: Vercel (github.com/marckcrow/detran-dashboard)

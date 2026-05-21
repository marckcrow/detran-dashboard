# DETRAN Dashboard — SPEC v2

## Concept & Vision
Dashboard mobile-first PWA para acompanhar indicadores educacionais do DETRAN-CE (DIET/NUPET/NUCAT). Visual moderno com gradientes, cards grandes, gráficos interativos e geração de relatórios em PDF/A4 para impressão ou WhatsApp. 100% em português.

## Design Language
- **Estética**: Gradientes azul DETRAN, cards elevados com sombra, tipografia bold
- **Cores**: `#1565c0` (primária), `#0d47a1` (escura), `#ff8f00` (ação), verde/roxo/laranja para métricas
- **Tipografia**: Sistema nativo (-apple-system, Segoe UI, Roboto)
- **Ícones**: Emoji + SVG DETRAN personalizado
- **Motion**: transições suaves, spinner, scale 95% em touch

## Features
- 4 tabs: Início | Gráficos | Cidades | Relatório
- Filtro por ANO (2025/2026) e tipo de serviço
- 6 cards de métricas: atendimentos, alcance, escolas, cidades, cursos, ações
- 2 cards largos: taxa de alcance e média por cidade
- Gráfico de barras (atendimentos por mês)
- Gráfico de linha (alcance ao longo do tempo)
- Gráfico combo (ações + cursos por mês)
- Gráfico de pizza (distribuição mensal)
- Ranking de cidades com medalhas 🥇🥈🥉
- Botão Atualizar (carrega dados novamente com timestamp)
- Relatório HTML com: Retrato A4 / Paisagem A4 / WhatsApp / Baixar HTML

## Technical
- Stack: React 18 + Vite + TailwindCSS + Recharts
- Deploy: Vercel (github.com/marckcrow/detran-dashboard)
- Dados: mockados (prontos para integração Google Sheets API)
- Responsivo: mobile-first, breakpoints sm/lg

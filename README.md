# Instrumenta-Sin
## Sistema de Monitoramento de Dispositivos Médicos em Campo

### 📋 Visão Geral
Aplicação web/mobile para monitoramento em tempo real de dispositivos médicos durante cirurgias, com gamificação para engajar instrumentadores na coleta de dados de campo.

### 🎯 Objetivos
- Rastrear uso de dispositivos médicos durante cirurgias
- Coletar feedback em tempo real sobre desempenho dos produtos
- Monitorar localização e atividades dos instrumentadores
- Gamificar o processo de coleta de dados
- Centralizar informações em torre de controle para administradores

### 👥 Usuários
- **Instrumentadores** (Mobile): Profissionais em campo que registram dados das cirurgias
- **Administradores** (Desktop): Gerentes que monitoram dados em tempo real

### ✨ Funcionalidades Principais

#### Para Instrumentadores (Mobile)
- 📍 GPS automático para localização
- 📷 Scanner de código de barras para identificação de produtos
- 📝 Formulário de registro de cirurgia
- 🎮 Sistema de gamificação (pontos, badges, ranking)
- 📊 Histórico pessoal de atividades
- 🔔 Notificações e missões

#### Para Administradores (Desktop)
- 🗺️ Torre de controle com mapa em tempo real
- 📈 Dashboard de métricas e KPIs
- 📋 Relatórios de cirurgias e dispositivos
- 👤 Gestão de instrumentadores
- ⚠️ Alertas de problemas reportados
- 📊 Analytics e insights

### 📁 Estrutura do Projeto
```
instrumenta-sin/
├── docs/              # Documentação técnica
├── frontend/          # Aplicação web (React + PWA)
├── backend/           # API REST (Node.js)
├── database/          # Scripts e migrations
└── infrastructure/    # Configs de deploy
```

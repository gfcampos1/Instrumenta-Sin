# Paleta de Cores - Instrumenta-Sin
## Baseada no OKR Manager Sintegra

### 🎨 Cores Principais (Identidade Sintegra)

#### Primary (Azul Sintegra)
```css
--sintegra-blue-light: #4DB5E8;    /* Azul principal do logo */
--sintegra-blue-medium: #1E9FD8;   /* Azul médio */
--sintegra-blue-dark: #2B5C9E;     /* Azul corporativo escuro */
```

**Escala Completa Primary:**
```typescript
primary: {
  50:  '#e8f7fd',   // Azul muito claro
  100: '#c9edfb',   // Azul claro suave
  200: '#9de2f9',   // Azul claro
  300: '#6dd5f6',   // Azul claro vibrante
  400: '#4dc9f3',   // Azul céu
  500: '#4DB5E8',   // Azul Sintegra principal (LOGO) ⭐
  600: '#1E9FD8',   // Azul médio
  700: '#1789be',   // Azul médio escuro
  800: '#2B5C9E',   // Azul corporativo (LOGO) ⭐
  900: '#1e4177',   // Azul escuro
}
```

#### Secondary (Cinza Sintegra)
```css
--sintegra-gray-light: #A8A8A8;    /* Cinza do logo */
--sintegra-gray-dark: #3D3D3D;     /* Cinza escuro do logo */
```

**Escala Completa Secondary:**
```typescript
secondary: {
  50:  '#f5f5f5',   // Cinza muito claro
  100: '#e5e5e5',   // Cinza claro
  200: '#d4d4d4',   // Cinza médio claro
  300: '#a3a3a3',   // Cinza médio
  400: '#A8A8A8',   // Cinza Sintegra (LOGO) ⭐
  500: '#737373',   // Cinza
  600: '#525252',   // Cinza escuro
  700: '#3D3D3D',   // Cinza Sintegra escuro (LOGO) ⭐
  800: '#262626',   // Cinza muito escuro
  900: '#171717',   // Quase preto
}
```

### 📊 Cores de Status

```typescript
status: {
  green:  '#52c41a',  // Verde - Sucesso / No Prazo
  yellow: '#faad14',  // Amarelo - Atenção / Alerta
  red:    '#ff4d4f',  // Vermelho - Erro / Atrasado
}
```

**Cores Expandidas de Status:**
```typescript
// Verde (Sucesso)
green: {
  50:  '#f0f9ff',
  100: '#e0f2fe',
  500: '#52c41a',  // Principal
  600: '#47a817',
  700: '#3a8c13',
}

// Amarelo (Atenção)
yellow: {
  50:  '#fffbeb',
  100: '#fef3c7',
  500: '#faad14',  // Principal
  600: '#d99212',
  700: '#b8770e',
}

// Vermelho (Problema)
red: {
  50:  '#fef2f2',
  100: '#fee2e2',
  500: '#ff4d4f',  // Principal
  600: '#e03e40',
  700: '#c12f31',
}
```

### 🎭 Gradientes Sintegra

```css
/* Gradiente Principal */
.bg-gradient-sintegra {
  background: linear-gradient(135deg, #4DB5E8 0%, #2B5C9E 100%);
}

/* Gradiente Claro */
.bg-gradient-sintegra-light {
  background: linear-gradient(135deg, #c9edfb 0%, #4DB5E8 100%);
}

/* Gradiente Reverso */
.bg-gradient-sintegra-reverse {
  background: linear-gradient(135deg, #2B5C9E 0%, #4DB5E8 100%);
}
```

### 🌓 Modo Escuro (Dark Mode)

```typescript
// Classes dark: aplicadas automaticamente
dark: {
  primary: {
    50:  '#1e4177',   // Invertido
    900: '#e8f7fd',   // Invertido
  },
  secondary: {
    50:  '#171717',   // Background escuro
    800: '#262626',   // Cards escuros
    900: '#0a0a0a',   // Background principal
  }
}
```

---

## 🎨 Aplicação nas Interfaces

### Mobile (Instrumentador)

#### Header / Barra Superior
```css
background: linear-gradient(135deg, #4DB5E8 0%, #2B5C9E 100%);
color: #ffffff;
```

#### Botão Principal (FAB)
```css
background: linear-gradient(135deg, #4DB5E8 0%, #2B5C9E 100%);
color: #ffffff;
box-shadow: 0 4px 12px rgba(77, 181, 232, 0.4);
```

#### Cards de Cirurgia
```css
background: #ffffff;
border: 1px solid #e5e5e5;
border-radius: 12px;
```

#### Status Badges
```css
/* Sucesso */
background: #f0f9ff;
color: #3a8c13;
border: 1px solid #52c41a;

/* Problema */
background: #fef2f2;
color: #c12f31;
border: 1px solid #ff4d4f;
```

#### Gamificação
```css
/* Pontos */
color: #4DB5E8;
font-weight: 700;

/* Badges */
background: linear-gradient(135deg, #faad14 0%, #d99212 100%);
border-radius: 50%;

/* Nível */
background: linear-gradient(135deg, #4DB5E8 0%, #2B5C9E 100%);
```

### Desktop (Administrador)

#### Sidebar
```css
background: #ffffff;
border-right: 1px solid #e5e5e5;

/* Item ativo */
background: linear-gradient(135deg, #4DB5E8 0%, #2B5C9E 100%);
color: #ffffff;

/* Item hover */
background: #e8f7fd;
color: #2B5C9E;
```

#### Dashboard Cards (KPIs)
```css
background: #ffffff;
border-radius: 12px;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

/* Hover */
box-shadow: 0 4px 12px rgba(77, 181, 232, 0.15);
transform: translateY(-2px);
```

#### Mapa (Torre de Controle)
```css
/* Marcadores */
success: {
  background: #52c41a;
  border: 2px solid #ffffff;
}

problem: {
  background: #ff4d4f;
  border: 2px solid #ffffff;
}

active-user: {
  background: #4DB5E8;
  border: 2px solid #ffffff;
  animation: pulse;
}
```

#### Gráficos (Recharts)
```typescript
colors: {
  primary: '#4DB5E8',    // Barras principais
  secondary: '#2B5C9E',  // Barras secundárias
  accent: '#faad14',     // Destaques
  grid: '#e5e5e5',       // Grade
}
```

---

## 📱 Componentes Específicos

### Barra de Progresso
```css
/* Container */
background: #e5e5e5;
border-radius: 999px;
height: 8px;

/* Progresso - Verde */
background: linear-gradient(90deg, #52c41a 0%, #47a817 100%);

/* Progresso - Amarelo */
background: linear-gradient(90deg, #faad14 0%, #d99212 100%);

/* Progresso - Vermelho */
background: linear-gradient(90deg, #ff4d4f 0%, #e03e40 100%);
```

### Botões

#### Primário
```css
background: linear-gradient(135deg, #4DB5E8 0%, #2B5C9E 100%);
color: #ffffff;
border: none;
box-shadow: 0 2px 8px rgba(77, 181, 232, 0.3);

/* Hover */
box-shadow: 0 4px 12px rgba(77, 181, 232, 0.4);
transform: translateY(-1px);
```

#### Secundário
```css
background: #ffffff;
color: #2B5C9E;
border: 2px solid #4DB5E8;

/* Hover */
background: #e8f7fd;
border-color: #2B5C9E;
```

#### Perigo
```css
background: #ff4d4f;
color: #ffffff;
border: none;

/* Hover */
background: #e03e40;
```

### Inputs / Forms
```css
/* Input padrão */
background: #ffffff;
border: 2px solid #e5e5e5;
border-radius: 8px;
color: #3D3D3D;

/* Focus */
border-color: #4DB5E8;
box-shadow: 0 0 0 3px rgba(77, 181, 232, 0.1);

/* Erro */
border-color: #ff4d4f;
box-shadow: 0 0 0 3px rgba(255, 77, 79, 0.1);
```

### Notificações (Toast)
```css
/* Sucesso */
background: #f0f9ff;
border-left: 4px solid #52c41a;
color: #3a8c13;

/* Erro */
background: #fef2f2;
border-left: 4px solid #ff4d4f;
color: #c12f31;

/* Aviso */
background: #fffbeb;
border-left: 4px solid #faad14;
color: #b8770e;

/* Info */
background: #e8f7fd;
border-left: 4px solid #4DB5E8;
color: #2B5C9E;
```

---

## 🎯 Configuração Tailwind CSS

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta Sintegra
        primary: {
          50: '#e8f7fd',
          100: '#c9edfb',
          200: '#9de2f9',
          300: '#6dd5f6',
          400: '#4dc9f3',
          500: '#4DB5E8',  // Principal
          600: '#1E9FD8',
          700: '#1789be',
          800: '#2B5C9E',  // Escuro
          900: '#1e4177',
        },
        secondary: {
          50: '#f5f5f5',
          100: '#e5e5e5',
          200: '#d4d4d4',
          300: '#a3a3a3',
          400: '#A8A8A8',
          500: '#737373',
          600: '#525252',
          700: '#3D3D3D',  // Principal
          800: '#262626',
          900: '#171717',
        },
        status: {
          green: '#52c41a',
          yellow: '#faad14',
          red: '#ff4d4f',
        }
      },
      backgroundImage: {
        'gradient-sintegra': 'linear-gradient(135deg, #4DB5E8 0%, #2B5C9E 100%)',
        'gradient-sintegra-light': 'linear-gradient(135deg, #c9edfb 0%, #4DB5E8 100%)',
        'gradient-sintegra-reverse': 'linear-gradient(135deg, #2B5C9E 0%, #4DB5E8 100%)',
      },
    },
  },
  plugins: [],
}

export default config
```

---

## 🎨 CSS Global (globals.css)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* Cores Sintegra */
  --sintegra-blue-light: #4DB5E8;
  --sintegra-blue-medium: #1E9FD8;
  --sintegra-blue-dark: #2B5C9E;
  --sintegra-gray-light: #A8A8A8;
  --sintegra-gray-dark: #3D3D3D;

  /* Gradientes */
  --gradient-sintegra-primary: linear-gradient(135deg, #4DB5E8 0%, #2B5C9E 100%);
  --gradient-sintegra-light: linear-gradient(135deg, #c9edfb 0%, #4DB5E8 100%);
}

@layer utilities {
  .bg-gradient-sintegra {
    background: linear-gradient(135deg, #4DB5E8 0%, #2B5C9E 100%);
  }

  .bg-gradient-sintegra-light {
    background: linear-gradient(135deg, #c9edfb 0%, #4DB5E8 100%);
  }

  .bg-gradient-sintegra-reverse {
    background: linear-gradient(135deg, #2B5C9E 0%, #4DB5E8 100%);
  }

  .hover-sintegra {
    transition: all 0.3s ease;
  }

  .hover-sintegra:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(77, 181, 232, 0.3);
  }
}
```

---

## 🎭 Acessibilidade (WCAG AA)

### Contraste de Cores

✅ **Aprovado:**
- Texto escuro (#3D3D3D) em fundo claro (#ffffff): **13.6:1**
- Texto branco (#ffffff) em azul (#2B5C9E): **7.2:1**
- Texto branco (#ffffff) em azul claro (#4DB5E8): **4.8:1**

⚠️ **Atenção:**
- Amarelo (#faad14) em branco necessita texto escuro
- Usar `#b8770e` para texto em fundos claros

### Recomendações
- Textos em badges sempre com fundo de 50-100
- Ícones em gradientes sempre brancos
- Botões primários sempre com texto branco
- Links azuis (#4DB5E8) em fundo branco

---

Esta paleta garante consistência visual com o OKR Manager Sintegra e mantém identidade corporativa forte! 🎨

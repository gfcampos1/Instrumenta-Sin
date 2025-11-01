# ⚠️ ATENÇÃO: Ícones PWA Pendentes

Os ícones do PWA precisam ser gerados para evitar erros 404.

## 🚀 Solução Rápida

### Opção 1: PWA Icon Generator (Recomendado)
1. Acesse: https://www.pwabuilder.com/imageGenerator
2. Faça upload do logo da Sintegra
3. Selecione os tamanhos: 72, 96, 128, 144, 152, 192, 384, 512
4. Baixe e extraia os arquivos nesta pasta

### Opção 2: Real Favicon Generator
1. Acesse: https://realfavicongenerator.net/
2. Upload do logo
3. Configure para PWA/Android Chrome
4. Baixe e extraia nesta pasta

### Opção 3: ImageMagick (CLI)
```bash
# Instalar ImageMagick
# Windows: choco install imagemagick
# Mac: brew install imagemagick

# Gerar todos os tamanhos
magick logo-original.png -resize 72x72 icon-72x72.png
magick logo-original.png -resize 96x96 icon-96x96.png
magick logo-original.png -resize 128x128 icon-128x128.png
magick logo-original.png -resize 144x144 icon-144x144.png
magick logo-original.png -resize 152x152 icon-152x152.png
magick logo-original.png -resize 192x192 icon-192x192.png
magick logo-original.png -resize 384x384 icon-384x384.png
magick logo-original.png -resize 512x512 icon-512x512.png
```

## 📐 Especificações

- **Formato**: PNG com transparência
- **Cor de fundo**: Azul Sintegra (#4DB5E8) ou branco
- **Padding**: 10-15% de margem interna
- **Qualidade**: Alta resolução, sem distorção

## 📝 Tamanhos Necessários

- ✅ icon-72x72.png (Android)
- ✅ icon-96x96.png (Android)
- ✅ icon-128x128.png (Android)
- ⚠️ **icon-144x144.png** (Android - **PRINCIPAL**)
- ✅ icon-152x152.png (iOS)
- ✅ icon-192x192.png (Android baseline)
- ✅ icon-384x384.png (Android)
- ✅ icon-512x512.png (Android splash screen)

## 🎨 Recomendações de Design

1. Use o logo da Sintegra ou letra "I" estilizada
2. Mantenha simplicidade (ícones pequenos ficam ilegíveis se complexos)
3. Evite texto (exceto em tamanhos maiores como 512x512)
4. Teste em fundo claro e escuro
5. Use cores contrastantes com a marca (#4DB5E8 ou #2B5C9E)

## ✅ Após Gerar os Ícones

Verifique se todos os arquivos estão presentes:
```bash
ls -la public/icons/
```

Teste o PWA:
1. Abra o app em modo incógnito
2. Inspecione > Application > Manifest
3. Verifique se todos os ícones carregam sem erro 404

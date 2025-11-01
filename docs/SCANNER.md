# Scanner de Código de Barras

## Visão Geral

O sistema inclui um scanner de código de barras completo que suporta múltiplos formatos de códigos 1D (lineares) e 2D.

## Formatos Suportados

### Códigos de Barras 1D (Lineares)
- **CODE_128**: Código alfanumérico de alta densidade
- **CODE_39**: Código alfanumérico usado em logística
- **CODE_93**: Versão melhorada do CODE_39
- **CODABAR**: Usado em bibliotecas e bancos de sangue
- **EAN_13**: Código de barras europeu (13 dígitos)
- **EAN_8**: Versão compacta do EAN (8 dígitos)
- **UPC_A**: Código de barras americano (12 dígitos)
- **UPC_E**: Versão compacta do UPC
- **ITF**: Interleaved 2 of 5
- **RSS_14**: Reduced Space Symbology

### Códigos 2D
- **QR Code**: Código de resposta rápida
- **Data Matrix**: Código 2D compacto
- **PDF_417**: Código 2D usado em documentos
- **Aztec**: Código 2D de alta densidade
- **MaxiCode**: Usado por correios

## Recursos

### Scanner de Câmera
- ✅ Detecção automática de códigos
- ✅ Suporte para câmera frontal e traseira
- ✅ Feedback visual em tempo real
- ✅ Vibração ao escanear com sucesso
- ✅ Área de escaneamento otimizada (280x200px)
- ✅ Taxa de quadros: 10 FPS

### Entrada Manual
- ✅ Opção para digitar código manualmente
- ✅ Útil quando a câmera não está disponível
- ✅ Validação de entrada

## Como Usar

### 1. Acesso ao Scanner
- No app do instrumentador, clique no botão "Scanner" na tela inicial
- Ou acesse diretamente em `/app/scanner`

### 2. Escaneamento
1. Permita o acesso à câmera quando solicitado
2. Posicione o código de barras dentro do quadro
3. O scanner detectará automaticamente o código
4. Você sentirá uma vibração quando o código for reconhecido
5. Será redirecionado automaticamente para o registro de cirurgia

### 3. Alternância de Câmera
- Use o botão de alternância (🔄) no topo da tela
- Alterna entre câmera traseira (padrão) e frontal

### 4. Entrada Manual
- Clique em "Inserir código manualmente"
- Digite o código do dispositivo
- Clique em "Confirmar"

## Permissões Necessárias

### Navegador Web
- **Câmera**: Necessária para escanear códigos
- **Vibração**: Opcional, para feedback tátil

### Configurações
Se o scanner não funcionar:
1. Verifique as permissões do navegador
2. Acesse as configurações do site
3. Permita o acesso à câmera
4. Recarregue a página

## Solução de Problemas

### Câmera não inicia
- Verifique se deu permissão para o navegador acessar a câmera
- Certifique-se de que está usando HTTPS (necessário para câmera)
- Tente recarregar a página
- Use a opção de entrada manual como alternativa

### Código não é reconhecido
- Certifique-se de que o código está bem iluminado
- Mantenha o dispositivo estável
- Aproxime ou afaste a câmera do código
- Limpe a lente da câmera
- Tente alternar a câmera
- Use a entrada manual se o código estiver danificado

### Performance lenta
- Feche outras abas/aplicativos
- Verifique a iluminação do ambiente
- Limpe o cache do navegador

## Tecnologia

O scanner utiliza a biblioteca `html5-qrcode` que:
- Funciona em todos os navegadores modernos
- Não requer instalação de apps nativos
- Suporta múltiplos formatos de código
- Otimizado para performance em mobile

## Integração

O scanner está integrado com o fluxo de registro de cirurgia:

```
Scanner → Busca Dispositivo → Registro de Cirurgia
```

Quando um código é escaneado:
1. O sistema busca o dispositivo no banco de dados
2. Se encontrado, preenche automaticamente os dados
3. Redireciona para a tela de registro de cirurgia
4. O usuário completa os demais campos

## Segurança

- ✅ Requer autenticação para acessar
- ✅ Códigos são validados no backend
- ✅ Apenas dispositivos ativos podem ser usados
- ✅ Permissões de câmera são solicitadas explicitamente

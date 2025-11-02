'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, Keyboard, SwitchCamera } from 'lucide-react';
import Button from './Button';
import Input from './Input';

export interface CameraScannerProps {
  onScanSuccess: (barcode: string) => void;
  onClose?: () => void;
  allowManualInput?: boolean;
}

export default function CameraScanner({
  onScanSuccess,
  onClose,
  allowManualInput = true
}: CameraScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  useEffect(() => {
    startScanner();

    return () => {
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  const startScanner = async () => {
    try {
      setError(null);
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;

      // Configurações otimizadas para leitura de código de barras em mobile
      const config = {
        fps: 10,
        qrbox: function(viewfinderWidth: number, viewfinderHeight: number) {
          // Área de scan responsiva e maior para facilitar leitura
          const minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight);
          const qrboxSize = Math.floor(minEdgeSize * 0.8); // 80% da área disponível
          return {
            width: Math.min(qrboxSize, 350),
            height: Math.min(Math.floor(qrboxSize * 0.6), 200), // Mais largo que alto para códigos de barras
          };
        },
        aspectRatio: 1.777778, // 16:9
        // Configurações avançadas para melhorar foco e leitura
        videoConstraints: {
          facingMode,
          // Solicitar autofoco contínuo (suportado no iOS Safari 14.3+)
          advanced: [
            { focusMode: 'continuous' },
            { focusDistance: 0 }, // 0 = infinito, ajuda em leitura de longe
          ],
        },
        // Suporte explícito para códigos de barras 1D (lineares)
        // A biblioteca html5-qrcode detecta automaticamente:
        // - EAN-13 (European Article Number - 13 dígitos, padrão brasileiro)
        // - UPC-A (Universal Product Code - 12 dígitos, padrão EUA/Canadá)
        // - EAN-8 (8 dígitos para produtos pequenos)
        // - CODE_128 (alfanumérico variável)
        // - CODE_39 (alfanumérico)
        // - ITF-14 (Interleaved 2 of 5 - 14 dígitos, logística)
        // - GS1-128 (alfanumérico variável, logística)
        // - Codabar (numérico)
        // - QR Code, Data Matrix, PDF_417, Aztec (2D)
        // Todos os formatos estão habilitados por padrão
      };

      await scanner.start(
        { facingMode }, // Câmera selecionada
        config as any,
        (decodedText) => {
          // Sucesso na leitura
          console.log('Código escaneado:', decodedText);
          
          // Vibrar (se disponível)
          if ('vibrate' in navigator) {
            navigator.vibrate(200);
          }

          stopScanner();
          onScanSuccess(decodedText);
        },
        (errorMessage) => {
          // Erro de leitura (normal, acontece constantemente enquanto procura)
          // Não fazer nada aqui para não poluir o console
        }
      );

      setIsScanning(true);
    } catch (err) {
      console.error('Erro ao iniciar scanner:', err);
      setError('Não foi possível acessar a câmera. Verifique as permissões.');
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
        setIsScanning(false);
      } catch (err) {
        console.error('Erro ao parar scanner:', err);
      }
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onScanSuccess(manualCode.trim());
    }
  };

  const toggleCamera = async () => {
    await stopScanner();
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between text-white">
          <h2 className="text-lg font-bold">Escanear Código de Barras</h2>
          <div className="flex items-center gap-2">
            {isScanning && (
              <button
                onClick={toggleCamera}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="Alternar câmera"
              >
                <SwitchCamera size={24} />
              </button>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="Fechar scanner"
              >
                <X size={24} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Scanner area */}
      <div className="absolute inset-0 flex items-center justify-center">
        {error ? (
          <div className="text-center p-6 max-w-md">
            <Camera className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-white text-lg mb-4">{error}</p>
            {allowManualInput && (
              <Button
                variant="primary"
                onClick={() => setShowManualInput(true)}
                leftIcon={<Keyboard />}
              >
                Inserir código manualmente
              </Button>
            )}
          </div>
        ) : (
          <div id="qr-reader" className="w-full max-w-sm" />
        )}
      </div>

      {/* Manual input modal */}
      {showManualInput && (
        <div className="absolute inset-0 bg-black/90 flex items-center justify-center p-6">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-secondary-900 mb-4">
              Inserir Código Manualmente
            </h3>

            <form onSubmit={handleManualSubmit} className="space-y-4">
              <Input
                label="Código de Barras"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Digite o código"
                autoFocus
                required
              />

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowManualInput(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                  disabled={!manualCode.trim()}
                >
                  Confirmar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 to-transparent p-6">
        <div className="text-center text-white space-y-3">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <p className="text-sm font-medium">
              Escaneando...
            </p>
          </div>
          
          {/* Dicas para melhor leitura */}
          <div className="bg-black/40 backdrop-blur-sm rounded-lg p-3 space-y-2">
            <p className="text-xs font-semibold text-yellow-300">
              📱 Dicas para melhor leitura:
            </p>
            <ul className="text-xs space-y-1 text-left opacity-90">
              <li>• Mantenha distância de 15-25cm do código</li>
              <li>• Garanta boa iluminação</li>
              <li>• Mantenha a câmera estável</li>
              <li>• Alinhe o código dentro do quadro</li>
            </ul>
          </div>

          <p className="text-xs opacity-80">
            Suporta: EAN-13, UPC-A, EAN-8, ITF-14, GS1-128, CODE-128, CODE-39, QR Code
          </p>

          {allowManualInput && !showManualInput && (
            <Button
              variant="outline"
              onClick={() => setShowManualInput(true)}
              leftIcon={<Keyboard />}
              className="bg-white/20 border-white/40 text-white hover:bg-white/30"
            >
              Inserir código manualmente
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

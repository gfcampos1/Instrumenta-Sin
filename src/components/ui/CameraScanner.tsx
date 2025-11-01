'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, Keyboard } from 'lucide-react';
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

  useEffect(() => {
    startScanner();

    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = async () => {
    try {
      setError(null);
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' }, // Câmera traseira
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        (decodedText) => {
          // Sucesso na leitura
          stopScanner();
          onScanSuccess(decodedText);
        },
        (errorMessage) => {
          // Erro de leitura (normal, acontece constantemente)
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

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between text-white">
          <h2 className="text-lg font-bold">Escanear Código de Barras</h2>
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
          <p className="text-sm">
            Posicione o código de barras dentro do quadro
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

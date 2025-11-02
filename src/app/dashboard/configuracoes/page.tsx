'use client';

import { useState, useEffect } from 'react';
import { Save, RefreshCw, AlertCircle } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { toast } from 'react-toastify';

interface GamificationRules {
  baseSurgeryPoints: number;
  photoBonusThreshold: number;
  photoBonusPoints: number;
  successBonusPoints: number;
  goodRatingThreshold: number;
  goodRatingBonus: number;
  detailedFeedbackMinLength: number;
  detailedFeedbackBonus: number;
  deviceCooldownHours: number;
  maxDailyUsageSameDevice: number;
  sameLocationToleranceKm: number;
  minMinutesBetweenScans: number;
  pointsDecayEnabled: boolean;
  firstUsePoints: number;
  secondUsePointsPercent: number;
  thirdUsePointsPercent: number;
}

const DEFAULT_RULES: GamificationRules = {
  baseSurgeryPoints: 10,
  photoBonusThreshold: 3,
  photoBonusPoints: 5,
  successBonusPoints: 5,
  goodRatingThreshold: 4,
  goodRatingBonus: 3,
  detailedFeedbackMinLength: 50,
  detailedFeedbackBonus: 5,
  deviceCooldownHours: 24,
  maxDailyUsageSameDevice: 2,
  sameLocationToleranceKm: 1,
  minMinutesBetweenScans: 10,
  pointsDecayEnabled: true,
  firstUsePoints: 100,
  secondUsePointsPercent: 50,
  thirdUsePointsPercent: 0,
};

export default function ConfiguracoesPage() {
  const [rules, setRules] = useState<GamificationRules>(DEFAULT_RULES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/admin/gamification-settings');
      const data = await response.json();
      
      if (data.success && data.data) {
        setRules(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/gamification-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rules),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Configurações salvas com sucesso!');
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('Tem certeza que deseja restaurar as configurações padrão?')) {
      setRules(DEFAULT_RULES);
      toast.info('Configurações restauradas. Clique em Salvar para aplicar.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="animate-spin text-primary-500" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">
            Configurações de Gamificação
          </h1>
          <p className="text-secondary-600 mt-1">
            Controle as regras de pontuação e limites do sistema
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleReset}
            leftIcon={<RefreshCw />}
          >
            Restaurar Padrão
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            isLoading={saving}
            leftIcon={<Save />}
          >
            Salvar Alterações
          </Button>
        </div>
      </div>

      {/* Alerta */}
      <Card className="bg-yellow-50 border-yellow-200">
        <div className="flex gap-3">
          <AlertCircle className="text-yellow-600 flex-shrink-0" size={24} />
          <div>
            <h3 className="font-semibold text-yellow-900">Atenção</h3>
            <p className="text-sm text-yellow-700 mt-1">
              As alterações afetarão imediatamente o cálculo de pontos para novos registros.
              Registros anteriores não serão recalculados.
            </p>
          </div>
        </div>
      </Card>

      {/* Seção: Pontos Base */}
      <Card>
        <h2 className="text-xl font-bold text-secondary-900 mb-4">
          📊 Pontos Base
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Pontos por Cirurgia Registrada"
            type="number"
            value={rules.baseSurgeryPoints}
            onChange={(e) =>
              setRules({ ...rules, baseSurgeryPoints: parseInt(e.target.value) })
            }
            min={0}
            helperText="Pontos ganhos ao registrar qualquer cirurgia"
          />
        </div>
      </Card>

      {/* Seção: Bônus */}
      <Card>
        <h2 className="text-xl font-bold text-secondary-900 mb-4">
          ✨ Bônus e Incentivos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Mínimo de Fotos para Bônus"
            type="number"
            value={rules.photoBonusThreshold}
            onChange={(e) =>
              setRules({ ...rules, photoBonusThreshold: parseInt(e.target.value) })
            }
            min={1}
            max={10}
            helperText="Quantidade mínima de fotos"
          />
          <Input
            label="Pontos de Bônus por Fotos"
            type="number"
            value={rules.photoBonusPoints}
            onChange={(e) =>
              setRules({ ...rules, photoBonusPoints: parseInt(e.target.value) })
            }
            min={0}
          />
          <Input
            label="Bônus por Cirurgia Bem-Sucedida"
            type="number"
            value={rules.successBonusPoints}
            onChange={(e) =>
              setRules({ ...rules, successBonusPoints: parseInt(e.target.value) })
            }
            min={0}
          />
          <Input
            label="Nota Mínima para Bônus"
            type="number"
            value={rules.goodRatingThreshold}
            onChange={(e) =>
              setRules({ ...rules, goodRatingThreshold: parseInt(e.target.value) })
            }
            min={1}
            max={5}
            helperText="Avaliação mínima (1-5)"
          />
          <Input
            label="Pontos de Bônus por Boa Avaliação"
            type="number"
            value={rules.goodRatingBonus}
            onChange={(e) =>
              setRules({ ...rules, goodRatingBonus: parseInt(e.target.value) })
            }
            min={0}
          />
          <Input
            label="Tamanho Mínimo para Feedback Detalhado"
            type="number"
            value={rules.detailedFeedbackMinLength}
            onChange={(e) =>
              setRules({
                ...rules,
                detailedFeedbackMinLength: parseInt(e.target.value),
              })
            }
            min={10}
            helperText="Caracteres mínimos"
          />
          <Input
            label="Bônus por Feedback Detalhado"
            type="number"
            value={rules.detailedFeedbackBonus}
            onChange={(e) =>
              setRules({ ...rules, detailedFeedbackBonus: parseInt(e.target.value) })
            }
            min={0}
          />
        </div>
      </Card>

      {/* Seção: Prevenção de Fraudes */}
      <Card>
        <h2 className="text-xl font-bold text-secondary-900 mb-4">
          🛡️ Prevenção de Fraudes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Cooldown de Dispositivo (horas)"
            type="number"
            value={rules.deviceCooldownHours}
            onChange={(e) =>
              setRules({ ...rules, deviceCooldownHours: parseInt(e.target.value) })
            }
            min={0}
            helperText="Tempo mínimo entre usos do mesmo código de barras"
          />
          <Input
            label="Máximo Diário por Dispositivo"
            type="number"
            value={rules.maxDailyUsageSameDevice}
            onChange={(e) =>
              setRules({
                ...rules,
                maxDailyUsageSameDevice: parseInt(e.target.value),
              })
            }
            min={1}
            helperText="Usos permitidos do mesmo código por dia"
          />
          <Input
            label="Tolerância de Localização (km)"
            type="number"
            step="0.1"
            value={rules.sameLocationToleranceKm}
            onChange={(e) =>
              setRules({
                ...rules,
                sameLocationToleranceKm: parseFloat(e.target.value),
              })
            }
            min={0.1}
            helperText="Distância mínima entre usos do mesmo código"
          />
          <Input
            label="Intervalo Mínimo Entre Scans (minutos)"
            type="number"
            value={rules.minMinutesBetweenScans}
            onChange={(e) =>
              setRules({
                ...rules,
                minMinutesBetweenScans: parseInt(e.target.value),
              })
            }
            min={1}
            helperText="Anti-spam: tempo mínimo entre registros"
          />
        </div>
      </Card>

      {/* Seção: Pontos Decrescentes */}
      <Card>
        <h2 className="text-xl font-bold text-secondary-900 mb-4">
          📉 Sistema de Pontos Decrescentes
        </h2>
        <div className="mb-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={rules.pointsDecayEnabled}
              onChange={(e) =>
                setRules({ ...rules, pointsDecayEnabled: e.target.checked })
              }
              className="w-4 h-4 text-primary-600 rounded"
            />
            <span className="text-sm font-medium text-secondary-700">
              Habilitar pontos decrescentes por repetição
            </span>
          </label>
          <p className="text-sm text-secondary-500 mt-1 ml-6">
            Reduz pontos quando o mesmo dispositivo é usado várias vezes no mesmo dia
          </p>
        </div>

        {rules.pointsDecayEnabled && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="1º Uso (%)"
              type="number"
              value={rules.firstUsePoints}
              onChange={(e) =>
                setRules({ ...rules, firstUsePoints: parseInt(e.target.value) })
              }
              min={0}
              max={100}
              helperText="Primeiro uso do dia = 100%"
            />
            <Input
              label="2º Uso (%)"
              type="number"
              value={rules.secondUsePointsPercent}
              onChange={(e) =>
                setRules({
                  ...rules,
                  secondUsePointsPercent: parseInt(e.target.value),
                })
              }
              min={0}
              max={100}
              helperText="Segunda vez no dia"
            />
            <Input
              label="3º+ Uso (%)"
              type="number"
              value={rules.thirdUsePointsPercent}
              onChange={(e) =>
                setRules({
                  ...rules,
                  thirdUsePointsPercent: parseInt(e.target.value),
                })
              }
              min={0}
              max={100}
              helperText="Terceira vez em diante"
            />
          </div>
        )}
      </Card>

      {/* Preview de Pontos */}
      <Card className="bg-primary-50 border-primary-200">
        <h2 className="text-xl font-bold text-primary-900 mb-4">
          🎯 Preview de Pontuação
        </h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-secondary-700">Cirurgia básica:</span>
            <span className="font-semibold text-secondary-900">
              {rules.baseSurgeryPoints} pontos
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-secondary-700">
              + {rules.photoBonusThreshold} fotos:
            </span>
            <span className="font-semibold text-green-600">
              +{rules.photoBonusPoints} pontos
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-secondary-700">+ Cirurgia bem-sucedida:</span>
            <span className="font-semibold text-green-600">
              +{rules.successBonusPoints} pontos
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-secondary-700">
              + Avaliação ≥ {rules.goodRatingThreshold}:
            </span>
            <span className="font-semibold text-green-600">
              +{rules.goodRatingBonus} pontos
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-secondary-700">+ Feedback detalhado:</span>
            <span className="font-semibold text-green-600">
              +{rules.detailedFeedbackBonus} pontos
            </span>
          </div>
          <div className="border-t border-primary-300 pt-3 mt-3 flex justify-between">
            <span className="font-bold text-secondary-900">Máximo possível:</span>
            <span className="font-bold text-primary-600 text-lg">
              {rules.baseSurgeryPoints +
                rules.photoBonusPoints +
                rules.successBonusPoints +
                rules.goodRatingBonus +
                rules.detailedFeedbackBonus}{' '}
              pontos
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}

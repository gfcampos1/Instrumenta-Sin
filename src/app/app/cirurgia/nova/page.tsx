'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Scan,
  MapPin,
  FileText,
  Camera,
  Loader2,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import RatingStars from '@/components/ui/RatingStars';
import PhotoUpload from '@/components/ui/PhotoUpload';
import Link from 'next/link';
import BottomNav from '@/components/mobile/BottomNav';

interface Device {
  id: string;
  barcode: string;
  name: string;
  category: string;
  manufacturer: string;
  model: string;
}

interface FormData {
  // Step 1: Dispositivo
  deviceId: string;
  device: Device | null;

  // Step 2: Dados da cirurgia
  surgeryDate: string;
  surgeryType: string;
  hospitalName: string;
  hospitalCNPJ: string;
  latitude: number;
  longitude: number;
  city: string;
  state: string;

  // Step 3: Avaliação
  status: 'SUCESSO' | 'PROBLEMA' | 'COMPLICACAO';
  doctorName: string;
  doctorConduct: string;
  devicePerformance: string;
  problemsReported: string;
  notes: string;
  deviceRating: number;
  doctorRating: number;

  // Step 4: Fotos
  photos: string[];
}

const INITIAL_FORM_DATA: FormData = {
  deviceId: '',
  device: null,
  surgeryDate: new Date().toISOString().slice(0, 16),
  surgeryType: '',
  hospitalName: '',
  hospitalCNPJ: '',
  latitude: 0,
  longitude: 0,
  city: '',
  state: '',
  status: 'SUCESSO',
  doctorName: '',
  doctorConduct: '',
  devicePerformance: '',
  problemsReported: '',
  notes: '',
  deviceRating: 0,
  doctorRating: 0,
  photos: [],
};

export default function NovaCirurgiaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [loading, setLoading] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [searchingDevice, setSearchingDevice] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');

  // Obter localização ao carregar a página
  useEffect(() => {
    getLocation();

    // Se veio código de barras da URL, buscar dispositivo
    const barcode = searchParams?.get('barcode');
    if (barcode) {
      setBarcodeInput(barcode);
      searchDevice(barcode);
    }
  }, [searchParams]);

  const getLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocalização não suportada');
      return;
    }

    setLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        setFormData((prev) => ({
          ...prev,
          latitude,
          longitude,
        }));

        // Buscar cidade/estado via API reversa de geolocalização
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();

          setFormData((prev) => ({
            ...prev,
            city: data.address?.city || data.address?.town || '',
            state: data.address?.state || '',
          }));
        } catch (error) {
          console.error('Erro ao buscar localização:', error);
        } finally {
          setLoadingLocation(false);
        }
      },
      (error) => {
        console.error('Erro ao obter localização:', error);
        toast.error('Erro ao obter localização. Ative o GPS.');
        setLoadingLocation(false);
      }
    );
  };

  const searchDevice = async (barcode: string) => {
    if (!barcode.trim()) {
      toast.error('Digite o código de barras');
      return;
    }

    setSearchingDevice(true);

    try {
      const response = await fetch(
        `/api/devices/barcode/${encodeURIComponent(barcode)}`
      );

      if (!response.ok) {
        toast.error('Dispositivo não encontrado');
        setFormData((prev) => ({ ...prev, device: null, deviceId: '' }));
        return;
      }

      const result = await response.json();
      const device = result.data;

      if (!device || !device.id) {
        toast.error('Dados do dispositivo inválidos');
        setFormData((prev) => ({ ...prev, device: null, deviceId: '' }));
        return;
      }

      setFormData((prev) => ({
        ...prev,
        device,
        deviceId: device.id,
      }));

      toast.success(`Dispositivo encontrado: ${device.name}`);
    } catch (error) {
      console.error('Erro ao buscar dispositivo:', error);
      toast.error('Erro ao buscar dispositivo');
      setFormData((prev) => ({ ...prev, device: null, deviceId: '' }));
    } finally {
      setSearchingDevice(false);
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.deviceId) {
          toast.error('Selecione um dispositivo');
          return false;
        }
        return true;

      case 2:
        if (!formData.surgeryType.trim()) {
          toast.error('Digite o tipo de cirurgia');
          return false;
        }
        if (!formData.hospitalName.trim()) {
          toast.error('Digite o nome do hospital');
          return false;
        }
        if (formData.latitude === 0 || formData.longitude === 0) {
          toast.error('Localização não detectada. Clique em "Atualizar Localização"');
          return false;
        }
        return true;

      case 3:
        if (!formData.doctorConduct.trim() || formData.doctorConduct.length < 10) {
          toast.error('Descreva a conduta médica (mínimo 10 caracteres)');
          return false;
        }
        if (!formData.devicePerformance.trim() || formData.devicePerformance.length < 10) {
          toast.error('Descreva a performance do dispositivo (mínimo 10 caracteres)');
          return false;
        }
        return true;

      case 4:
        // Fotos são opcionais
        return true;

      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setLoading(true);

    try {
      const payload = {
        deviceId: formData.deviceId,
        surgeryDate: new Date(formData.surgeryDate).toISOString(),
        surgeryType: formData.surgeryType,
        hospitalName: formData.hospitalName,
        hospitalCNPJ: formData.hospitalCNPJ || undefined,
        latitude: formData.latitude,
        longitude: formData.longitude,
        locationAccuracy: 0, // Opcional, valor padrão
        city: formData.city || undefined,
        state: formData.state || undefined,
        status: formData.status,
        doctorName: formData.doctorName || undefined,
        doctorConduct: formData.doctorConduct,
        devicePerformance: formData.devicePerformance,
        problemsReported: formData.problemsReported || undefined,
        notes: formData.notes || undefined,
        deviceRating: formData.deviceRating > 0 ? formData.deviceRating : undefined,
        doctorRating: formData.doctorRating > 0 ? formData.doctorRating : undefined,
        photos: formData.photos.length > 0 ? formData.photos : [],
      };

      console.log('Payload sendo enviado:', payload);

      const response = await fetch('/api/surgeries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Erro de validação:', result.details);
        throw new Error(result.error || 'Erro ao registrar cirurgia');
      }

      toast.success(
        `Cirurgia registrada com sucesso! +${result.pointsEarned} pontos`
      );

      if (result.newLevel) {
        toast.success(`Parabéns! Você subiu para o nível ${result.newLevel}!`);
      }

      // Verificar conquistas
      await fetch('/api/gamification/check', { method: 'POST' });

      router.push('/app');
    } catch (error: any) {
      console.error('Erro ao registrar cirurgia:', error);
      toast.error(error.message || 'Erro ao registrar cirurgia');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Dispositivo', icon: Scan },
    { number: 2, title: 'Dados', icon: MapPin },
    { number: 3, title: 'Avaliação', icon: FileText },
    { number: 4, title: 'Fotos', icon: Camera },
  ];

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header com gradiente */}
      <header className="bg-gradient-sintegra shadow-lg sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/app"
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ArrowLeft className="text-white" size={24} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Nova Cirurgia</h1>
              <p className="text-primary-100 text-sm">
                Passo {currentStep} de {steps.length}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Progress bar */}
      <div className="bg-white border-b border-secondary-200 sticky top-[88px] z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;

              return (
                <React.Fragment key={step.number}>
                  <div className="flex flex-col items-center gap-2 flex-1">
                    <div
                      className={`
                        w-10 h-10 rounded-full flex items-center justify-center transition-all
                        ${
                          isCompleted
                            ? 'bg-status-green text-white'
                            : isActive
                            ? 'bg-gradient-sintegra text-white'
                            : 'bg-secondary-200 text-secondary-500'
                        }
                      `}
                    >
                      {isCompleted ? (
                        <Check size={20} />
                      ) : (
                        <Icon size={20} />
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        isActive
                          ? 'text-primary-600'
                          : isCompleted
                          ? 'text-status-green'
                          : 'text-secondary-500'
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>

                  {index < steps.length - 1 && (
                    <div className="flex-1 h-0.5 bg-secondary-200 mx-2 mt-[-20px]">
                      <div
                        className={`h-full transition-all ${
                          currentStep > step.number
                            ? 'bg-status-green'
                            : 'bg-transparent'
                        }`}
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Form content */}
      <main className="max-w-3xl mx-auto px-4 py-6 pb-28 w-full">
        <div className="bg-white rounded-xl shadow-md p-6">
          {/* Step 1: Dispositivo */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-secondary-900">
                Selecionar Dispositivo
              </h2>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <Input
                    label="Código de Barras"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    placeholder="Digite ou escaneie"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        searchDevice(barcodeInput);
                      }
                    }}
                  />
                  <div className="flex gap-2 items-end">
                    <Button
                      variant="primary"
                      onClick={() => searchDevice(barcodeInput)}
                      disabled={searchingDevice}
                      isLoading={searchingDevice}
                    >
                      Buscar
                    </Button>
                    <Link href="/app/scanner">
                      <Button variant="outline" leftIcon={<Scan />}>
                        Escanear
                      </Button>
                    </Link>
                  </div>
                </div>

                {formData.device && (
                  <div className="p-4 bg-primary-50 border-2 border-primary-500 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-primary-900">
                        {formData.device.name}
                      </h3>
                      <span className="px-2 py-1 bg-primary-500 text-white text-xs rounded">
                        {formData.device.category}
                      </span>
                    </div>
                    <p className="text-sm text-primary-700 mb-1">
                      <strong>Fabricante:</strong> {formData.device.manufacturer}
                    </p>
                    <p className="text-sm text-primary-700 mb-1">
                      <strong>Modelo:</strong> {formData.device.model}
                    </p>
                    <p className="text-sm text-primary-700">
                      <strong>Código:</strong> {formData.device.barcode}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Dados da cirurgia */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-secondary-900">
                Dados da Cirurgia
              </h2>

              <div className="space-y-4">
                <Input
                  label="Data e Hora da Cirurgia"
                  type="datetime-local"
                  value={formData.surgeryDate}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, surgeryDate: e.target.value }))
                  }
                  required
                />

                <Input
                  label="Tipo de Cirurgia"
                  value={formData.surgeryType}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, surgeryType: e.target.value }))
                  }
                  placeholder="Ex: Artroplastia de Joelho"
                  required
                />

                <Input
                  label="Nome do Hospital"
                  value={formData.hospitalName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, hospitalName: e.target.value }))
                  }
                  placeholder="Hospital Regional de..."
                  required
                />

                <Input
                  label="CNPJ do Hospital (opcional)"
                  value={formData.hospitalCNPJ}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, hospitalCNPJ: e.target.value }))
                  }
                  placeholder="00.000.000/0000-00"
                />

                <div className="p-4 bg-secondary-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-secondary-900">
                      Localização
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={getLocation}
                      isLoading={loadingLocation}
                      leftIcon={<MapPin />}
                    >
                      Atualizar
                    </Button>
                  </div>

                  {formData.latitude !== 0 && formData.longitude !== 0 ? (
                    <div className="text-sm text-secondary-700 space-y-1">
                      <p>
                        <strong>Coordenadas:</strong> {formData.latitude.toFixed(6)},{' '}
                        {formData.longitude.toFixed(6)}
                      </p>
                      {formData.city && formData.state && (
                        <p>
                          <strong>Local:</strong> {formData.city}, {formData.state}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-red-600">
                      Localização não detectada. Clique em "Atualizar".
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Avaliação */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-secondary-900">
                Avaliação da Cirurgia
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Status da Cirurgia
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'SUCESSO', label: 'Sucesso', color: 'green' },
                      { value: 'PROBLEMA', label: 'Problema', color: 'yellow' },
                      { value: 'COMPLICACAO', label: 'Complicação', color: 'red' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            status: option.value as any,
                          }))
                        }
                        className={`
                          p-3 rounded-lg border-2 font-semibold transition-all
                          ${
                            formData.status === option.value
                              ? `bg-status-${option.color} text-white border-status-${option.color}`
                              : 'bg-white text-secondary-700 border-secondary-300 hover:border-secondary-400'
                          }
                        `}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <Input
                  label="Nome do Médico (opcional)"
                  value={formData.doctorName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, doctorName: e.target.value }))
                  }
                  placeholder="Dr. João Silva"
                />

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Conduta Médica <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.doctorConduct}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        doctorConduct: e.target.value,
                      }))
                    }
                    placeholder="Descreva a conduta médica durante a cirurgia..."
                    rows={4}
                    className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-secondary-500 mt-1">
                    Mínimo 10 caracteres
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Performance do Dispositivo <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.devicePerformance}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        devicePerformance: e.target.value,
                      }))
                    }
                    placeholder="Descreva como o dispositivo funcionou..."
                    rows={4}
                    className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-secondary-500 mt-1">
                    Mínimo 10 caracteres
                  </p>
                </div>

                {formData.status !== 'SUCESSO' && (
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Problemas Reportados
                    </label>
                    <textarea
                      value={formData.problemsReported}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          problemsReported: e.target.value,
                        }))
                      }
                      placeholder="Descreva os problemas encontrados..."
                      rows={4}
                      className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Observações Adicionais (opcional)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, notes: e.target.value }))
                    }
                    placeholder="Outras informações relevantes..."
                    rows={3}
                    className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Avaliação do Dispositivo
                  </label>
                  <RatingStars
                    rating={formData.deviceRating}
                    onChange={(rating) =>
                      setFormData((prev) => ({ ...prev, deviceRating: rating }))
                    }
                    size={32}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Avaliação do Médico
                  </label>
                  <RatingStars
                    rating={formData.doctorRating}
                    onChange={(rating) =>
                      setFormData((prev) => ({ ...prev, doctorRating: rating }))
                    }
                    size={32}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Fotos */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-secondary-900">
                Evidências Fotográficas (Opcional)
              </h2>
              <p className="text-sm text-secondary-600">
                Adicione fotos da cirurgia para complementar o registro
              </p>

              <PhotoUpload
                photos={formData.photos}
                onChange={(photos) =>
                  setFormData((prev) => ({ ...prev, photos }))
                }
                maxPhotos={10}
                disabled={loading}
              />

              <p className="text-sm text-secondary-600">
                <strong>Dica:</strong> Tire fotos claras do dispositivo, da embalagem
                e do ambiente cirúrgico. Mínimo 1 foto, máximo 10.
              </p>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-3 mt-8 pt-6 border-t border-secondary-200">
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={prevStep}
                leftIcon={<ArrowLeft />}
                disabled={loading}
              >
                Voltar
              </Button>
            )}

            <div className="flex-1" />

            {currentStep < 4 ? (
              <Button
                variant="primary"
                onClick={nextStep}
                rightIcon={<ArrowRight />}
              >
                Próximo
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleSubmit}
                isLoading={loading}
                leftIcon={loading ? <Loader2 className="animate-spin" /> : <Check />}
              >
                {loading ? 'Salvando...' : 'Finalizar Registro'}
              </Button>
            )}
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}

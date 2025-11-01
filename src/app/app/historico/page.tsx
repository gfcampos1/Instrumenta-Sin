'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';
import {
  Search,
  Filter,
  Calendar,
  Package,
  ArrowLeft,
  Loader2,
  X,
} from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import SurgeryCard from '@/components/ui/SurgeryCard';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import StatusBadge from '@/components/ui/StatusBadge';
import RatingStars from '@/components/ui/RatingStars';
import BottomNav from '@/components/mobile/BottomNav';

interface Surgery {
  id: string;
  hospitalName: string;
  surgeryType: string;
  surgeryDate: Date;
  status: 'SUCESSO' | 'PROBLEMA' | 'COMPLICACAO';
  device: {
    id: string;
    name: string;
    category: string;
    barcode: string;
  };
  city?: string;
  state?: string;
  photos: string[];
  doctorName?: string;
  doctorConduct: string;
  devicePerformance: string;
  problemsReported?: string;
  notes?: string;
  deviceRating?: number;
  doctorRating?: number;
  createdAt: Date;
}

export default function HistoricoPage() {
  const { data: session } = useSession();
  const [surgeries, setSurgeries] = useState<Surgery[]>([]);
  const [filteredSurgeries, setFilteredSurgeries] = useState<Surgery[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedSurgery, setSelectedSurgery] = useState<Surgery | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadSurgeries();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [surgeries, searchTerm, selectedStatus]);

  const loadSurgeries = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/surgeries');
      const result = await response.json();

      if (response.ok) {
        setSurgeries(result.data);
      } else {
        toast.error('Erro ao carregar cirurgias');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao carregar cirurgias');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = surgeries;

    // Filtro de status
    if (selectedStatus !== 'ALL') {
      filtered = filtered.filter((s) => s.status === selectedStatus);
    }

    // Filtro de busca
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.hospitalName.toLowerCase().includes(term) ||
          s.surgeryType.toLowerCase().includes(term) ||
          s.device.name.toLowerCase().includes(term) ||
          s.city?.toLowerCase().includes(term) ||
          s.state?.toLowerCase().includes(term)
      );
    }

    setFilteredSurgeries(filtered);
  };

  const statusCounts = {
    ALL: surgeries.length,
    SUCESSO: surgeries.filter((s) => s.status === 'SUCESSO').length,
    PROBLEMA: surgeries.filter((s) => s.status === 'PROBLEMA').length,
    COMPLICACAO: surgeries.filter((s) => s.status === 'COMPLICACAO').length,
  };

  const statusConfig = {
    SUCESSO: 'green' as const,
    PROBLEMA: 'yellow' as const,
    COMPLICACAO: 'red' as const,
  };

  return (
    <div className="min-h-screen bg-secondary-50 pb-20">
      {/* Header */}
      <header className="bg-gradient-sintegra shadow-lg">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/app"
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ArrowLeft className="text-white" size={24} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Histórico</h1>
              <p className="text-primary-100 text-sm">
                {filteredSurgeries.length} cirurgia{filteredSurgeries.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {/* Search and filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400"
              size={20}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por hospital, tipo, dispositivo..."
              className="w-full pl-10 pr-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Status filters */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { key: 'ALL', label: 'Todas' },
              { key: 'SUCESSO', label: 'Sucesso' },
              { key: 'PROBLEMA', label: 'Problema' },
              { key: 'COMPLICACAO', label: 'Complicação' },
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setSelectedStatus(filter.key)}
                className={`
                  flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${
                    selectedStatus === filter.key
                      ? 'bg-gradient-sintegra text-white shadow-md'
                      : 'bg-white text-secondary-700 border border-secondary-300 hover:border-primary-400'
                  }
                `}
              >
                {filter.label} ({(statusCounts as any)[filter.key]})
              </button>
            ))}
          </div>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-4" />
            <p className="text-secondary-600">Carregando cirurgias...</p>
          </div>
        ) : filteredSurgeries.length === 0 ? (
          <EmptyState
            icon={<Package size={48} />}
            title="Nenhuma cirurgia encontrada"
            description={
              searchTerm || selectedStatus !== 'ALL'
                ? 'Tente ajustar os filtros de busca'
                : 'Você ainda não registrou nenhuma cirurgia'
            }
            action={
              searchTerm || selectedStatus !== 'ALL' ? (
                <Button
                  variant="primary"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedStatus('ALL');
                  }}
                >
                  Limpar filtros
                </Button>
              ) : undefined
            }
          />
        ) : (
          /* Surgery list */
          <div className="space-y-4">
            {filteredSurgeries.map((surgery) => (
              <SurgeryCard
                key={surgery.id}
                id={surgery.id}
                hospitalName={surgery.hospitalName}
                surgeryType={surgery.surgeryType}
                surgeryDate={surgery.surgeryDate}
                status={surgery.status}
                deviceName={surgery.device.name}
                deviceCategory={surgery.device.category}
                city={surgery.city}
                state={surgery.state}
                photos={surgery.photos}
                onClick={() => setSelectedSurgery(surgery)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Surgery detail modal */}
      {selectedSurgery && (
        <Modal
          isOpen={!!selectedSurgery}
          onClose={() => setSelectedSurgery(null)}
          title="Detalhes da Cirurgia"
          size="lg"
        >
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-secondary-900">
                  {selectedSurgery.hospitalName}
                </h3>
                <p className="text-secondary-600">{selectedSurgery.surgeryType}</p>
              </div>
              <StatusBadge
                status={statusConfig[selectedSurgery.status]}
                label={selectedSurgery.status}
              />
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-secondary-600 mb-1">Data</p>
                <p className="font-semibold text-secondary-900">
                  {new Date(selectedSurgery.surgeryDate).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              {selectedSurgery.city && selectedSurgery.state && (
                <div>
                  <p className="text-sm text-secondary-600 mb-1">Local</p>
                  <p className="font-semibold text-secondary-900">
                    {selectedSurgery.city}, {selectedSurgery.state}
                  </p>
                </div>
              )}

              <div className="col-span-2">
                <p className="text-sm text-secondary-600 mb-1">Dispositivo</p>
                <p className="font-semibold text-secondary-900">
                  {selectedSurgery.device.name}
                </p>
                <p className="text-xs text-secondary-500 mt-1">
                  {selectedSurgery.device.category} • {selectedSurgery.device.barcode}
                </p>
              </div>
            </div>

            {/* Ratings */}
            {(selectedSurgery.deviceRating || selectedSurgery.doctorRating) && (
              <div className="space-y-3 p-4 bg-secondary-50 rounded-lg">
                {selectedSurgery.deviceRating && (
                  <div>
                    <p className="text-sm text-secondary-600 mb-2">
                      Avaliação do Dispositivo
                    </p>
                    <RatingStars rating={selectedSurgery.deviceRating} readonly />
                  </div>
                )}

                {selectedSurgery.doctorRating && (
                  <div>
                    <p className="text-sm text-secondary-600 mb-2">
                      Avaliação do Médico
                    </p>
                    <RatingStars rating={selectedSurgery.doctorRating} readonly />
                  </div>
                )}
              </div>
            )}

            {/* Details */}
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-secondary-900 mb-2">
                  Conduta Médica
                </h4>
                <p className="text-sm text-secondary-700">
                  {selectedSurgery.doctorConduct}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-secondary-900 mb-2">
                  Performance do Dispositivo
                </h4>
                <p className="text-sm text-secondary-700">
                  {selectedSurgery.devicePerformance}
                </p>
              </div>

              {selectedSurgery.problemsReported && (
                <div>
                  <h4 className="font-semibold text-red-700 mb-2">
                    Problemas Reportados
                  </h4>
                  <p className="text-sm text-red-600">
                    {selectedSurgery.problemsReported}
                  </p>
                </div>
              )}

              {selectedSurgery.notes && (
                <div>
                  <h4 className="font-semibold text-secondary-900 mb-2">
                    Observações
                  </h4>
                  <p className="text-sm text-secondary-700">{selectedSurgery.notes}</p>
                </div>
              )}
            </div>

            {/* Photos */}
            {selectedSurgery.photos.length > 0 && (
              <div>
                <h4 className="font-semibold text-secondary-900 mb-3">
                  Fotos ({selectedSurgery.photos.length})
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {selectedSurgery.photos.map((photo, index) => (
                    <img
                      key={index}
                      src={photo}
                      alt={`Foto ${index + 1}`}
                      className="aspect-square object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}

'use client';

import React from 'react';
import { Calendar, MapPin, Package, User, ChevronRight } from 'lucide-react';
import StatusBadge from './StatusBadge';

export interface SurgeryCardProps {
  id: string;
  hospitalName: string;
  surgeryType: string;
  surgeryDate: Date;
  status: 'SUCESSO' | 'PROBLEMA' | 'COMPLICACAO';
  deviceName: string;
  deviceCategory: string;
  city?: string;
  state?: string;
  photos: string[];
  onClick?: () => void;
}

export default function SurgeryCard({
  hospitalName,
  surgeryType,
  surgeryDate,
  status,
  deviceName,
  deviceCategory,
  city,
  state,
  photos,
  onClick
}: SurgeryCardProps) {
  const statusConfig = {
    SUCESSO: 'green' as const,
    PROBLEMA: 'yellow' as const,
    COMPLICACAO: 'red' as const
  };

  return (
    <button
      onClick={onClick}
      className="w-full p-4 bg-white rounded-xl border border-secondary-200 hover:shadow-lg hover:border-primary-400 transition-all text-left"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-bold text-secondary-900 mb-1">{hospitalName}</h3>
          <p className="text-sm text-secondary-600">{surgeryType}</p>
        </div>

        <StatusBadge
          status={statusConfig[status]}
          label={status}
        />
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* Data */}
        <div className="flex items-center gap-2 text-xs text-secondary-600">
          <Calendar size={14} className="text-primary-500" />
          <span>{new Date(surgeryDate).toLocaleDateString('pt-BR')}</span>
        </div>

        {/* Localização */}
        {city && state && (
          <div className="flex items-center gap-2 text-xs text-secondary-600">
            <MapPin size={14} className="text-primary-500" />
            <span>{city}, {state}</span>
          </div>
        )}

        {/* Dispositivo */}
        <div className="flex items-center gap-2 text-xs text-secondary-600 col-span-2">
          <Package size={14} className="text-primary-500" />
          <span className="truncate">{deviceName}</span>
        </div>
      </div>

      {/* Category badge */}
      <div className="flex items-center justify-between">
        <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-semibold rounded">
          {deviceCategory}
        </span>

        {/* Photo count */}
        {photos.length > 0 && (
          <span className="text-xs text-secondary-500">
            {photos.length} foto{photos.length > 1 ? 's' : ''}
          </span>
        )}

        {/* Arrow */}
        <ChevronRight size={16} className="text-secondary-400" />
      </div>
    </button>
  );
}

'use client';

import React from 'react';
import { Lock, Sparkles } from 'lucide-react';
import Image from 'next/image';

export interface BadgeCardProps {
  name: string;
  description: string;
  iconUrl?: string;
  rarity: 'COMUM' | 'RARO' | 'EPICO' | 'LENDARIO';
  pointsRequired: number;
  earned: boolean;
  earnedAt?: Date;
  onClick?: () => void;
}

export default function BadgeCard({
  name,
  description,
  iconUrl,
  rarity,
  pointsRequired,
  earned,
  earnedAt,
  onClick
}: BadgeCardProps) {
  const rarityConfig = {
    COMUM: {
      gradient: 'from-gray-400 to-gray-600',
      bg: 'bg-gray-50',
      text: 'text-gray-700',
      border: 'border-gray-300'
    },
    RARO: {
      gradient: 'from-blue-400 to-blue-600',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-300'
    },
    EPICO: {
      gradient: 'from-purple-400 to-purple-600',
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-300'
    },
    LENDARIO: {
      gradient: 'from-yellow-400 to-orange-600',
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      border: 'border-yellow-300'
    }
  };

  const config = rarityConfig[rarity];

  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`
        relative w-full p-4 rounded-xl border-2 transition-all duration-300
        ${earned ? config.bg : 'bg-secondary-50'}
        ${earned ? config.border : 'border-secondary-200'}
        ${onClick ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1' : 'cursor-default'}
        ${!earned ? 'opacity-60' : ''}
      `}
    >
      {/* Badge icon */}
      <div className="relative w-20 h-20 mx-auto mb-3">
        <div
          className={`
            w-full h-full rounded-full p-1
            ${earned ? `bg-gradient-to-br ${config.gradient}` : 'bg-secondary-300'}
          `}
        >
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
            {earned && iconUrl ? (
              <Image
                src={iconUrl}
                alt={name}
                width={60}
                height={60}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <Lock className="w-8 h-8 text-secondary-400" />
            )}
          </div>
        </div>

        {/* Sparkle effect for legendary */}
        {earned && rarity === 'LENDARIO' && (
          <Sparkles className="absolute -top-1 -right-1 w-6 h-6 text-yellow-500 animate-pulse" />
        )}
      </div>

      {/* Badge info */}
      <div className="text-center">
        <h3 className="font-bold text-secondary-900 mb-1">{name}</h3>
        <p className="text-xs text-secondary-600 mb-2 line-clamp-2">
          {description}
        </p>

        {/* Rarity badge */}
        <span
          className={`
            inline-block px-2 py-1 rounded-full text-xs font-semibold
            ${earned ? `${config.bg} ${config.text}` : 'bg-secondary-100 text-secondary-600'}
          `}
        >
          {rarity}
        </span>

        {/* Points or earned date */}
        <div className="mt-2 text-xs text-secondary-500">
          {earned && earnedAt ? (
            <span>
              Conquistado em {new Date(earnedAt).toLocaleDateString('pt-BR')}
            </span>
          ) : (
            <span>{pointsRequired} pontos necessários</span>
          )}
        </div>
      </div>

      {/* Lock overlay for locked badges */}
      {!earned && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/40 rounded-xl backdrop-blur-[1px]">
          <Lock className="w-8 h-8 text-secondary-400" />
        </div>
      )}
    </button>
  );
}

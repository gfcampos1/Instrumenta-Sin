'use client';

import React from 'react';
import { Target, Trophy, Calendar, CheckCircle2 } from 'lucide-react';

export interface MissionCardProps {
  title: string;
  description: string;
  pointsReward: number;
  currentCount: number;
  targetCount: number;
  completed: boolean;
  completedAt?: Date;
  endDate: Date;
  missionType: 'REGISTER_SURGERIES' | 'CONSECUTIVE_DAYS' | 'UPLOAD_PHOTOS' | 'REPORT_PROBLEMS' | 'SPECIFIC_CATEGORY';
}

export default function MissionCard({
  title,
  description,
  pointsReward,
  currentCount,
  targetCount,
  completed,
  completedAt,
  endDate
}: MissionCardProps) {
  const progress = Math.min((currentCount / targetCount) * 100, 100);
  const isExpired = new Date() > new Date(endDate);

  return (
    <div
      className={`
        relative p-4 rounded-xl border-2 transition-all
        ${completed
          ? 'bg-green-50 border-green-300'
          : isExpired
          ? 'bg-red-50 border-red-300 opacity-60'
          : 'bg-white border-secondary-200 hover:shadow-lg hover:border-primary-400'
        }
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={`
              p-2 rounded-lg
              ${completed
                ? 'bg-green-200 text-green-700'
                : 'bg-primary-100 text-primary-600'
              }
            `}
          >
            {completed ? (
              <CheckCircle2 size={20} />
            ) : (
              <Target size={20} />
            )}
          </div>

          <div>
            <h3 className="font-bold text-secondary-900">{title}</h3>
            <p className="text-xs text-secondary-600">{description}</p>
          </div>
        </div>

        {/* Reward */}
        <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-semibold whitespace-nowrap">
          <Trophy size={14} />
          <span>{pointsReward} pts</span>
        </div>
      </div>

      {/* Progress */}
      {!completed && !isExpired && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-secondary-600 mb-1">
            <span>Progresso</span>
            <span className="font-semibold">
              {currentCount} / {targetCount}
            </span>
          </div>

          <div className="w-full bg-secondary-200 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-sintegra transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs">
        {completed && completedAt ? (
          <div className="flex items-center gap-1 text-green-700">
            <CheckCircle2 size={14} />
            <span>
              Completa em {new Date(completedAt).toLocaleDateString('pt-BR')}
            </span>
          </div>
        ) : isExpired ? (
          <div className="text-red-600 font-semibold">
            Missão expirada
          </div>
        ) : (
          <div className="flex items-center gap-1 text-secondary-500">
            <Calendar size={14} />
            <span>
              Até {new Date(endDate).toLocaleDateString('pt-BR')}
            </span>
          </div>
        )}

        {!completed && !isExpired && (
          <div className="text-primary-600 font-semibold">
            {Math.round(progress)}%
          </div>
        )}
      </div>
    </div>
  );
}

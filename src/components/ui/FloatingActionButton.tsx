'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface FloatingActionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  badge?: number;
  disabled?: boolean;
}

export default function FloatingActionButton({
  icon: Icon,
  label,
  onClick,
  variant = 'primary',
  position = 'bottom-right',
  badge,
  disabled = false
}: FloatingActionButtonProps) {
  const variantStyles = {
    primary: 'bg-gradient-sintegra text-white hover:shadow-2xl hover:scale-110',
    secondary: 'bg-secondary-700 text-white hover:bg-secondary-800 hover:shadow-xl hover:scale-110',
    danger: 'bg-status-red text-white hover:bg-red-600 hover:shadow-xl hover:scale-110'
  };

  const positionStyles = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'bottom-center': 'bottom-6 left-1/2 -translate-x-1/2'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`
        fixed z-50 w-14 h-14 rounded-full shadow-lg
        flex items-center justify-center
        transition-all duration-300 ease-in-out
        focus:outline-none focus:ring-4 focus:ring-primary-300
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
        ${variantStyles[variant]}
        ${positionStyles[position]}
      `}
    >
      <Icon size={24} />

      {/* Badge de notificação */}
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-bounce">
          {badge > 99 ? '99+' : badge}
        </span>
      )}

      {/* Tooltip */}
      <span className="absolute bottom-full mb-2 px-3 py-1 bg-secondary-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        {label}
      </span>
    </button>
  );
}

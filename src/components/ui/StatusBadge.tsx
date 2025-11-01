import React from 'react';

export interface StatusBadgeProps {
  status: 'gray' | 'green' | 'yellow' | 'red';
  label?: string;
  showDot?: boolean;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  showDot = true
}) => {
  const styles = {
    gray: {
      bg: 'bg-secondary-100',
      text: 'text-secondary-700',
      dot: 'bg-secondary-400'
    },
    green: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      dot: 'bg-status-green'
    },
    yellow: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      dot: 'bg-status-yellow'
    },
    red: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      dot: 'bg-status-red'
    }
  };

  const style = styles[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
      {showDot && (
        <span className={`w-2 h-2 rounded-full ${style.dot}`} />
      )}
      {label}
    </span>
  );
};

export default StatusBadge;

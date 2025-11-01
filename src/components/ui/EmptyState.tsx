import React from 'react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      {icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary-100 text-secondary-400">
          {icon}
        </div>
      )}

      <h3 className="text-lg font-semibold text-secondary-900 mb-2">
        {title}
      </h3>

      {description && (
        <p className="text-sm text-secondary-600 max-w-md mb-6">
          {description}
        </p>
      )}

      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;

'use client';

import React from 'react';
import { Star } from 'lucide-react';

export interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  showLabel?: boolean;
}

export default function RatingStars({
  rating,
  maxRating = 5,
  size = 24,
  onChange,
  readonly = false,
  showLabel = false
}: RatingStarsProps) {
  const [hoverRating, setHoverRating] = React.useState(0);

  const handleClick = (value: number) => {
    if (!readonly && onChange) {
      onChange(value);
    }
  };

  const handleMouseEnter = (value: number) => {
    if (!readonly) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  const displayRating = hoverRating || rating;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {Array.from({ length: maxRating }, (_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= displayRating;

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleClick(starValue)}
              onMouseEnter={() => handleMouseEnter(starValue)}
              onMouseLeave={handleMouseLeave}
              disabled={readonly}
              className={`transition-all duration-150 ${
                readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
              }`}
              aria-label={`${starValue} estrela${starValue > 1 ? 's' : ''}`}
            >
              <Star
                size={size}
                className={`transition-colors ${
                  isFilled
                    ? 'fill-status-yellow text-status-yellow'
                    : 'text-gray-300'
                }`}
              />
            </button>
          );
        })}
      </div>

      {showLabel && (
        <span className="text-sm font-medium text-secondary-700">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

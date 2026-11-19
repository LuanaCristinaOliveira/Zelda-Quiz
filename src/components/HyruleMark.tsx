import React from 'react';

export const TriforceEmblem: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg
    viewBox="0 0 64 56"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <polygon
      points="32,4 46,28 18,28"
      stroke="currentColor"
      strokeWidth="2.5"
      fill="currentColor"
      fillOpacity="0.18"
      strokeLinejoin="round"
    />
    <polygon
      points="18,28 32,52 4,52"
      stroke="currentColor"
      strokeWidth="2.5"
      fill="currentColor"
      fillOpacity="0.18"
      strokeLinejoin="round"
    />
    <polygon
      points="46,28 60,52 32,52"
      stroke="currentColor"
      strokeWidth="2.5"
      fill="currentColor"
      fillOpacity="0.18"
      strokeLinejoin="round"
    />
  </svg>
);

export const HyruleCompassOrnament: React.FC<{ className?: string }> = ({
  className = 'w-10 h-10',
}) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <circle cx="32" cy="32" r="24" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.45" />
    <circle cx="32" cy="32" r="18" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.4" />
    <path
      d="M32 4L36.5 27.5L60 32L36.5 36.5L32 60L27.5 36.5L4 32L27.5 27.5L32 4Z"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="currentColor"
      fillOpacity="0.1"
      strokeLinejoin="round"
    />
  </svg>
);

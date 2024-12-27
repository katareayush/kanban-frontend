import React from 'react';

interface BackgroundGridProps {
  className?: string;
  children?: React.ReactNode;
}

export default function BackgroundGrid({ className, children }: BackgroundGridProps) {
  return (
    <div className={`relative min-h-screen ${className || ''}`}>
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-60 bg-grid bg-[size:6rem_6rem]"
          style={{ 
            '--grid-color': '#75d22e',
            mask: 'radial-gradient(circle at center, black, transparent 80%)'
          } as React.CSSProperties}
        />
        <div 
          className="absolute inset-0 opacity-10 bg-grid bg-[size:1rem_1rem]"
          style={{ 
            '--grid-color': '#99f453',
            mask: 'radial-gradient(circle at center, black, transparent 80%)'
          } as React.CSSProperties}
        />
      </div>
      {children}
    </div>
  );
}
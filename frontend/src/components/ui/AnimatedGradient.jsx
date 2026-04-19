import React, { useEffect, useState } from 'react';

export default function AnimatedGradient({ children, className = "" }) {
  const [position, setPosition] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const interval = setInterval(() => {
      setPosition({
        x: Math.random() * 100,
        y: Math.random() * 100
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(circle at ${position.x}% ${position.y}%, rgba(99, 102, 241, 0.3) 0%, rgba(139, 92, 246, 0.3) 25%, rgba(236, 72, 153, 0.3) 50%, transparent 100%)`,
          transition: 'all 3s ease-in-out'
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}

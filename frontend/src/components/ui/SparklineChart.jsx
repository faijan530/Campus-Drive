import React, { useEffect, useRef } from 'react';

export default function SparklineChart({ data = [], color = "indigo", height = 100 }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Color gradients for different colors
    const colors = {
      indigo: ['rgba(99, 102, 241, 1)', 'rgba(99, 102, 241, 0.2)', 'rgba(99, 102, 241, 0.05)'],
      emerald: ['rgba(16, 185, 129, 1)', 'rgba(16, 185, 129, 0.2)', 'rgba(16, 185, 129, 0.05)'],
      amber: ['rgba(245, 158, 11, 1)', 'rgba(245, 158, 11, 0.2)', 'rgba(245, 158, 11, 0.05)'],
      purple: ['rgba(139, 92, 246, 1)', 'rgba(139, 92, 246, 0.2)', 'rgba(139, 92, 246, 0.05)'],
    };
    
    const chartColor = colors[color] || colors.indigo;
    
    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    chartColor.forEach((color, index) => {
      gradient.addColorStop(index / (chartColor.length - 1), color);
    });
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    
    // Draw the sparkline
    ctx.beginPath();
    data.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x * 2, height - (point.y * 2));
      } else {
        ctx.lineTo(point.x * 2, height - (point.y * 2));
      }
    });
    ctx.stroke();
    
    // Add glow effect
    ctx.shadowBlur = 10;
    ctx.shadowColor = chartColor[0];
    ctx.stroke();
  }, [data, color, height]);

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ height: `${height}px` }}
      />
    </div>
  );
}

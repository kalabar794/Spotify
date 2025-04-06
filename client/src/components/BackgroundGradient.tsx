import React, { useEffect, useRef } from 'react';

const BackgroundGradient: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;

    // Color configurations
    const colors = ['#4A9DFF', '#9747FF', '#00E9F5', '#7EB3FF'];
    let colorIndices = [0, 1, 2, 3];
    let step = 0.002; // Animation speed
    let gradientSpeed = 0.002;

    // Handle resize
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);

    // Animation function
    function animate() {
      if (!ctx) return;

      // Calculate color transition
      const c0_0 = colors[colorIndices[0]];
      const c0_1 = colors[colorIndices[1]];
      const c1_0 = colors[colorIndices[2]];
      const c1_1 = colors[colorIndices[3]];

      // Transition between colors
      const istep = 1 - step;
      const r1 = Math.round(parseInt(c0_0.substring(1, 3), 16) * istep + parseInt(c0_1.substring(1, 3), 16) * step).toString(16).padStart(2, '0');
      const g1 = Math.round(parseInt(c0_0.substring(3, 5), 16) * istep + parseInt(c0_1.substring(3, 5), 16) * step).toString(16).padStart(2, '0');
      const b1 = Math.round(parseInt(c0_0.substring(5, 7), 16) * istep + parseInt(c0_1.substring(5, 7), 16) * step).toString(16).padStart(2, '0');
      const color1 = "#" + r1 + g1 + b1;

      const r2 = Math.round(parseInt(c1_0.substring(1, 3), 16) * istep + parseInt(c1_1.substring(1, 3), 16) * step).toString(16).padStart(2, '0');
      const g2 = Math.round(parseInt(c1_0.substring(3, 5), 16) * istep + parseInt(c1_1.substring(3, 5), 16) * step).toString(16).padStart(2, '0');
      const b2 = Math.round(parseInt(c1_0.substring(5, 7), 16) * istep + parseInt(c1_1.substring(5, 7), 16) * step).toString(16).padStart(2, '0');
      const color2 = "#" + r2 + g2 + b2;

      // Create gradient
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, color1);
      gradient.addColorStop(1, color2);

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Update step
      step += gradientSpeed;
      if (step >= 1) {
        step %= 1;
        colorIndices[0] = colorIndices[1];
        colorIndices[2] = colorIndices[3];
        colorIndices[1] = (colorIndices[1] + Math.floor(1 + Math.random() * (colors.length - 1))) % colors.length;
        colorIndices[3] = (colorIndices[3] + Math.floor(1 + Math.random() * (colors.length - 1))) % colors.length;
      }

      requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -1,
          opacity: 0.85,
        }}
      />
      {children}
    </div>
  );
};

export default BackgroundGradient; 
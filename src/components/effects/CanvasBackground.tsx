import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  type: 'qi' | 'petal' | 'sword';
  angle: number;
  rotationSpeed: number;
  color: string;
}

export const CanvasBackground: React.FC<{ isDemonMode?: boolean }> = ({ isDemonMode = false }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Generate Particles
    const particles: Particle[] = [];
    const count = 70;

    for (let i = 0; i < count; i++) {
      const isSword = i < 5;
      const isPetal = i >= 5 && i < 35;
      
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: isSword ? 18 + Math.random() * 12 : isPetal ? 6 + Math.random() * 6 : 2 + Math.random() * 3,
        speedX: isSword ? 1.5 + Math.random() * 2 : (Math.random() - 0.5) * 0.8,
        speedY: isSword ? -(0.5 + Math.random() * 1) : 0.8 + Math.random() * 1.2,
        opacity: Math.random() * 0.7 + 0.3,
        type: isSword ? 'sword' : isPetal ? 'petal' : 'qi',
        angle: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.04,
        color: isDemonMode
          ? (isPetal ? '#c084fc' : isSword ? '#a855f7' : '#ef4444')
          : (isPetal ? '#fbcfe8' : isSword ? '#f3c669' : '#2dd4bf'),
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Gradient background glow
      const bgGrad = ctx.createRadialGradient(
        width / 2,
        height * 0.3,
        50,
        width / 2,
        height / 2,
        Math.max(width, height)
      );
      if (isDemonMode) {
        bgGrad.addColorStop(0, 'rgba(45, 10, 60, 0.6)');
        bgGrad.addColorStop(0.6, 'rgba(15, 6, 25, 0.95)');
        bgGrad.addColorStop(1, '#08030c');
      } else {
        bgGrad.addColorStop(0, 'rgba(15, 28, 48, 0.7)');
        bgGrad.addColorStop(0.6, 'rgba(10, 15, 26, 0.95)');
        bgGrad.addColorStop(1, '#060a12');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Render Floating Cloud Fog Layers
      const time = Date.now() * 0.0003;
      ctx.fillStyle = isDemonMode ? 'rgba(88, 28, 135, 0.03)' : 'rgba(45, 212, 191, 0.025)';
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        const cx = (Math.sin(time + i) * 150) + width * (0.3 * i + 0.2);
        const cy = (Math.cos(time * 0.8 + i) * 80) + height * (0.2 * i + 0.3);
        ctx.arc(cx, cy, 300 + i * 80, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw Particles
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.angle += p.rotationSpeed;

        if (p.y > height + 20) p.y = -20;
        if (p.x > width + 20) p.x = -20;
        if (p.x < -20) p.x = width + 20;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);

        if (p.type === 'sword') {
          // Render Flying Sword (Kiếm Bay)
          ctx.strokeStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 15;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.lineTo(0, p.size);
          ctx.moveTo(-p.size * 0.25, p.size * 0.4);
          ctx.lineTo(p.size * 0.25, p.size * 0.4);
          ctx.stroke();

          // Sword trail aura
          ctx.strokeStyle = isDemonMode ? 'rgba(192, 132, 252, 0.3)' : 'rgba(243, 198, 105, 0.3)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(-p.speedX * 8, -p.speedY * 8);
          ctx.lineTo(0, 0);
          ctx.stroke();
        } else if (p.type === 'petal') {
          // Render Falling Peach Blossom Petal (Lá đào rơi)
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 8;
          ctx.globalAlpha = p.opacity;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size * 0.5, p.angle, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Render Spiritual Qi Particle (Hạt Linh Khí)
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 10;
          ctx.globalAlpha = p.opacity;
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDemonMode]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
};

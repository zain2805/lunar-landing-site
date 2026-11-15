import React, { useEffect, useRef } from 'react';

export default function AstronautBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Floating Astronauts with individual microgravity physics
    const astronauts = [
      {
        x: width * 0.88,
        y: height * 0.22,
        vx: -0.15,
        vy: 0.12,
        rot: 0.2,
        vrot: 0.0015,
        scale: 0.95,
        tetherLength: 90,
      },
      {
        x: width * 0.12,
        y: height * 0.72,
        vx: 0.12,
        vy: -0.10,
        rot: -0.35,
        vrot: -0.0012,
        scale: 0.75,
        tetherLength: 75,
      },
      {
        x: width * 0.92,
        y: height * 0.82,
        vx: -0.08,
        vy: -0.09,
        rot: 0.45,
        vrot: 0.001,
        scale: 0.60,
        tetherLength: 60,
      },
    ];

    // Floating lunar dust particles
    const particles = Array.from({ length: 65 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      alpha: Math.random() * 0.4 + 0.1,
    }));

    // Draw realistic spacesuit astronaut
    const drawAstronaut = (astro) => {
      ctx.save();
      ctx.translate(astro.x, astro.y);
      ctx.rotate(astro.rot);
      ctx.scale(astro.scale, astro.scale);

      // 1. Oxygen umbilical tether cable waving behind astronaut
      ctx.beginPath();
      ctx.moveTo(-10, 15);
      const wave = Math.sin(Date.now() * 0.002 + astro.x) * 12;
      ctx.bezierCurveTo(
        -35 + wave,
        25,
        -55 - wave,
        -15,
        -astro.tetherLength,
        20
      );
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // 2. Life Support Backpack (PLSS)
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.roundRect(-22, -18, 16, 36, 4);
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.stroke();

      // 3. Torso (White Apollo/Artemis EMU spacesuit)
      ctx.fillStyle = '#f1f5f9';
      ctx.beginPath();
      ctx.roundRect(-12, -16, 26, 34, 6);
      ctx.fill();
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Chest control unit & mission badge
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(-4, -6, 10, 8);
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(1, -2, 2, 0, Math.PI * 2);
      ctx.fill();

      // 4. Helmet
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(1, -24, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Gold reflective sun visor
      const visorGrad = ctx.createLinearGradient(-6, -30, 8, -18);
      visorGrad.addColorStop(0, '#f59e0b');
      visorGrad.addColorStop(0.5, '#fbbf24');
      visorGrad.addColorStop(1, '#d97706');
      ctx.fillStyle = visorGrad;
      ctx.beginPath();
      ctx.ellipse(3, -24, 8, 7, 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Visor light glint
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.beginPath();
      ctx.ellipse(5, -27, 3, 1.5, 0.3, 0, Math.PI * 2);
      ctx.fill();

      // 5. Arms
      ctx.fillStyle = '#e2e8f0';
      // Left arm floating back
      ctx.beginPath();
      ctx.roundRect(-18, -12, 8, 20, 4);
      ctx.fill();
      // Right arm extended forward
      ctx.beginPath();
      ctx.roundRect(12, -14, 8, 22, 4);
      ctx.fill();

      // 6. Legs
      // Left leg
      ctx.beginPath();
      ctx.roundRect(-10, 16, 9, 24, 4);
      ctx.fill();
      // Right leg slightly bent
      ctx.beginPath();
      ctx.roundRect(2, 17, 9, 22, 4);
      ctx.fill();

      // Boots
      ctx.fillStyle = '#475569';
      ctx.fillRect(-12, 36, 12, 6);
      ctx.fillRect(2, 35, 12, 6);

      // Subtle atmospheric glow around astronaut
      ctx.shadowColor = '#00f5d4';
      ctx.shadowBlur = 15;

      ctx.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render floating lunar dust particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.fillStyle = `rgba(186, 230, 253, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Update and render each floating astronaut
      astronauts.forEach((astro) => {
        astro.x += astro.vx;
        astro.y += astro.vy;
        astro.rot += astro.vrot;

        // Wrap around viewport edges seamlessly
        if (astro.x < -120) astro.x = width + 100;
        if (astro.x > width + 120) astro.x = -100;
        if (astro.y < -120) astro.y = height + 100;
        if (astro.y > height + 120) astro.y = -100;

        drawAstronaut(astro);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10 w-full h-full opacity-60"
      aria-hidden="true"
    />
  );
}

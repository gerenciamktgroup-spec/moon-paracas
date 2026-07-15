import React, { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

export const StardustEffect: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];

    // Colors matching brandbook (Pastel Cream #E1D9C1, Faded Rose #E2725B, White)
    const colors = ["rgba(225, 217, 193, ", "rgba(226, 114, 91, ", "rgba(255, 255, 255, "];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const createParticle = (x: number, y: number) => {
      // Limit total active particles to avoid performance degradation
      if (particles.length > 70) return;

      const baseColor = colors[Math.floor(Math.random() * colors.length)];
      const maxLife = 40 + Math.random() * 30; // lifetime in frames

      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 1.6,
        vy: (Math.random() - 0.5) * 1.6,
        size: 0.8 + Math.random() * 1.6,
        color: baseColor,
        alpha: 0.8 + Math.random() * 0.2,
        life: 0,
        maxLife,
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Spawn 1-2 particles per mousemove event to keep it elegant and subtle
      for (let i = 0; i < 2; i++) {
        createParticle(e.clientX, e.clientY);
      }
    };
    window.addEventListener("mousemove", handleMouseMove);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        
        // Calculate remaining opacity/alpha
        const ratio = 1 - p.life / p.maxLife;
        p.alpha = Math.max(0, ratio);

        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
          continue;
        }

        // Draw star particles
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999]"
      style={{ mixBlendMode: "screen" }}
    />
  );
};

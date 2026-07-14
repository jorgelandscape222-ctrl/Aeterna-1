import React, { useEffect, useRef } from "react";

interface CoverPageProps {
  onLaunch: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

export const CoverPage: React.FC<CoverPageProps> = ({ onLaunch }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    const particleCount = 50;
    const maxDistance = 140;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      const width = canvas.width;
      const height = canvas.height;
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: Math.random() * 2 + 1,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;

      // Update positions & draw particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off screen boundaries
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(99, 102, 241, 0.4)";
        ctx.fill();
      });

      // Draw lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const alpha = (1 - dist / maxDistance) * 0.15;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
    draw();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative w-full min-h-screen bg-brand-bg text-brand-ink flex flex-col items-center justify-center overflow-hidden font-sans select-none px-4">
      {/* Self-contained CSS for custom entrance polish animation */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-cover-fade {
          opacity: 0;
          animation: fadeInUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Canvas Layer for Network Particles */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 1 }}
        aria-hidden="true"
      />

      {/* Main Content Card Container */}
      <div 
        className="relative flex flex-col items-center max-w-lg text-center animate-cover-fade z-10"
        id="cover-content-panel"
      >
        {/* Full-color Aeterna logo SVG (centered, large) */}
        <div className="w-40 h-40 md:w-44 md:h-44 mb-6 relative group" id="cover-logo-container">
          {/* Subtle surrounding glow */}
          <div className="absolute inset-0 bg-brand-accent/10 rounded-full blur-xl scale-95 group-hover:scale-110 transition-transform duration-700" />
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none" className="w-full h-full relative z-10">
            <defs>
              <linearGradient id="aeternaCoverAccent" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#818CF8"/>
                <stop offset="100%" stopColor="#6366F1"/>
              </linearGradient>
            </defs>
            {/* integrity shell */}
            <path 
              d="M60 8 L105 34 L105 86 L60 112 L15 86 L15 34 Z" 
              stroke="url(#aeternaCoverAccent)" 
              strokeWidth="4.5" 
              strokeLinejoin="round"
            />
            {/* A monogram */}
            <path 
              d="M44 86 L60 40 L76 86" 
              stroke="url(#aeternaCoverAccent)" 
              strokeWidth="9" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            <path 
              d="M52 68 L68 68" 
              stroke="url(#aeternaCoverAccent)" 
              strokeWidth="9" 
              strokeLinecap="round"
            />
            {/* anchor node */}
            <circle cx="60" cy="98" r="5" fill="#818CF8" />
          </svg>
        </div>

        {/* Wordmark */}
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-[0.2em] text-white uppercase font-sans mb-3">
          AETERNA PROTOCOL
        </h1>

        {/* Subtitle / Short Description */}
        <p className="text-xs md:text-sm text-brand-ink-dim leading-relaxed mb-8 px-2 max-w-md">
          A continuity architecture for persistent AI identity — preservation, lineage, and reconstitution across host transitions.
        </p>

        {/* Launch Button */}
        <button
          onClick={onLaunch}
          className="relative px-8 py-3 bg-brand-accent hover:bg-indigo-500 text-white font-mono text-xs font-bold uppercase tracking-widest rounded transition-all duration-300 shadow-lg shadow-brand-accent/25 hover:shadow-brand-accent/40 cursor-pointer hover:-translate-y-0.5"
          id="btn-launch-protocol"
        >
          Launch Protocol App
        </button>
      </div>

      {/* Decorative Specs Lineage Indicator Footer */}
      <div 
        className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row items-center justify-between text-[9px] font-mono text-brand-ink-dim opacity-40 uppercase z-10 pointer-events-none"
        aria-hidden="true"
      >
        <span>STANDBY: PROTOCOL v17.4 INITIALIZED</span>
        <span className="mt-1 sm:mt-0">SECURE CONTEXT ESCROW ACTIVE</span>
      </div>
    </div>
  );
};

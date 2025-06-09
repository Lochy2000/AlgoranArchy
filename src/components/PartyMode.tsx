import React, { useEffect, useRef, useState } from 'react';
import { PartyPopper, X } from 'lucide-react';

export const PartyMode: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPartyMode, setIsPartyMode] = useState(false);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);

  class Particle {
    x: number;
    y: number;
    size: number;
    color: string;
    speedX: number;
    speedY: number;
    opacity: number;

    constructor(canvas: HTMLCanvasElement) {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 3 + 1;
      this.color = ['#FF00C3', '#00FFC3', '#00FFF9', '#FBFF00', '#9D00FF'][Math.floor(Math.random() * 5)];
      this.speedX = Math.random() * 3 - 1.5;
      this.speedY = Math.random() * 3 - 1.5;
      this.opacity = Math.random() * 0.6 + 0.2;
    }

    update(canvas: HTMLCanvasElement) {
      this.x += this.speedX;
      this.y += this.speedY;

      if (this.x < 0 || this.x > canvas.width) {
        this.speedX = -this.speedX;
      }

      if (this.y < 0 || this.y > canvas.height) {
        this.speedY = -this.speedY;
      }
    }

    draw(ctx: CanvasRenderingContext2D) {
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.opacity;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const initParticles = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    particlesRef.current = [];
    for (let i = 0; i < 100; i++) {
      particlesRef.current.push(new Particle(canvas));
    }
  };

  const animate = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particlesRef.current.forEach((particle, i) => {
      particle.update(canvas);
      particle.draw(ctx);

      // Draw connections
      particlesRef.current.slice(i + 1).forEach(otherParticle => {
        const dx = particle.x - otherParticle.x;
        const dy = particle.y - otherParticle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 100) {
          ctx.beginPath();
          ctx.strokeStyle = particle.color;
          ctx.globalAlpha = 0.2 * (1 - distance / 100);
          ctx.lineWidth = 0.5;
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(otherParticle.x, otherParticle.y);
          ctx.stroke();
        }
      });
    });

    if (isPartyMode) {
      animationRef.current = requestAnimationFrame(animate);
    }
  };

  const togglePartyMode = () => {
    setIsPartyMode(!isPartyMode);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isPartyMode) {
      initParticles();
      animate();
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPartyMode]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className={`fixed top-0 left-0 w-full h-full pointer-events-none z-0 transition-opacity duration-500 ${
          isPartyMode ? 'opacity-50' : 'opacity-30'
        }`}
      />
      
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={togglePartyMode}
          className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg hover:opacity-90 transition-all transform hover:scale-105 ${
            isPartyMode 
              ? 'bg-gradient-to-br from-purple-600 to-pink-500' 
              : 'bg-gradient-to-br from-pink-500 to-purple-600'
          }`}
        >
          {isPartyMode ? <X size={24} /> : <PartyPopper size={24} />}
        </button>
      </div>
    </>
  );
};
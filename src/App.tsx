import { useState, useEffect, useRef, useCallback } from 'react';
import { planets, Planet } from './data/planets';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);
  const planetPositionsRef = useRef<Map<string, { x: number; y: number; radius: number }>>(new Map());
  const sizeRef = useRef<{ width: number; height: number; scale: number }>({ width: 800, height: 600, scale: 1 });

  const getOrbitRadius = useCallback((baseRadius: number) => {
    const { width, height, scale } = sizeRef.current;
    const minDim = Math.min(width, height);
    return baseRadius * scale * (minDim / 1000);
  }, []);

  const getSunRadius = useCallback(() => {
    const { width, height, scale } = sizeRef.current;
    const minDim = Math.min(width, height);
    return 28 * scale * (minDim / 1000);
  }, []);

  const getPlanetRadius = useCallback((baseRadius: number) => {
    const { width, height, scale } = sizeRef.current;
    const minDim = Math.min(width, height);
    return Math.max(baseRadius * scale * (minDim / 1200), 3);
  }, []);

  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    const { width, height } = sizeRef.current;
    const centerX = width / 2;
    const centerY = height / 2;

    // Clear canvas
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, width, height);

    // Draw stars
    drawStars(ctx, width, height);

    // Draw orbit paths
    planets.forEach((planet) => {
      const orbitR = getOrbitRadius(planet.orbitRadius);
      ctx.beginPath();
      ctx.arc(centerX, centerY, orbitR, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // Draw Sun
    drawSun(ctx, centerX, centerY);

    // Draw planets
    const newPositions = new Map<string, { x: number; y: number; radius: number }>();
    planets.forEach((planet) => {
      const orbitR = getOrbitRadius(planet.orbitRadius);
      const planetR = getPlanetRadius(planet.radius);
      const angle = (timeRef.current / planet.orbitalPeriod) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * orbitR;
      const y = centerY + Math.sin(angle) * orbitR;
      newPositions.set(planet.id, { x, y, radius: planetR });

      // Planet glow
      const glowGrad = ctx.createRadialGradient(x, y, 0, x, y, planetR * 2.5);
      glowGrad.addColorStop(0, planet.color + '30');
      glowGrad.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(x, y, planetR * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = glowGrad;
      ctx.fill();

      // Planet body with gradient
      const bodyGrad = ctx.createRadialGradient(x - planetR * 0.3, y - planetR * 0.3, 0, x, y, planetR);
      bodyGrad.addColorStop(0, lightenColor(planet.color, 30));
      bodyGrad.addColorStop(1, planet.color);
      ctx.beginPath();
      ctx.arc(x, y, planetR, 0, Math.PI * 2);
      ctx.fillStyle = bodyGrad;
      ctx.fill();

      // Saturn's rings
      if (planet.id === 'saturn') {
        ctx.beginPath();
        ctx.ellipse(x, y, planetR * 1.8, planetR * 0.4, 0.3, 0, Math.PI * 2);
        ctx.strokeStyle = '#e8d5a090';
        ctx.lineWidth = Math.max(2, planetR * 0.15);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(x, y, planetR * 2.1, planetR * 0.5, 0.3, 0, Math.PI * 2);
        ctx.strokeStyle = '#e8d5a050';
        ctx.lineWidth = Math.max(1, planetR * 0.1);
        ctx.stroke();
      }

      // Highlight on hover
      if (hoveredPlanet === planet.id) {
        ctx.beginPath();
        ctx.arc(x, y, planetR + 5, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Selected indicator
      if (selectedPlanet?.id === planet.id) {
        ctx.beginPath();
        ctx.arc(x, y, planetR + 7, 0, Math.PI * 2);
        ctx.strokeStyle = '#60a5fa';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Planet name label
      ctx.fillStyle = hoveredPlanet === planet.id ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.6)';
      ctx.font = `${hoveredPlanet === planet.id ? 'bold ' : ''}11px Inter, system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(planet.name, x, y + planetR + 15);
    });

    planetPositionsRef.current = newPositions;
  }, [hoveredPlanet, selectedPlanet, getOrbitRadius, getPlanetRadius]);

  const drawStars = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const pseudoRandom = (i: number) => {
      const x = Math.sin(42 + i * 127.1) * 43758.5453;
      return x - Math.floor(x);
    };

    for (let i = 0; i < 250; i++) {
      const x = pseudoRandom(i * 2) * width;
      const y = pseudoRandom(i * 2 + 1) * height;
      const size = pseudoRandom(i * 3) * 1.5 + 0.3;
      const opacity = pseudoRandom(i * 4) * 0.6 + 0.2;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.fill();
    }
  };

  const drawSun = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    const sunR = getSunRadius();

    // Sun outer glow
    const outerGlow = ctx.createRadialGradient(x, y, 0, x, y, sunR * 2.5);
    outerGlow.addColorStop(0, 'rgba(255, 200, 50, 0.25)');
    outerGlow.addColorStop(0.4, 'rgba(255, 150, 30, 0.1)');
    outerGlow.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(x, y, sunR * 2.5, 0, Math.PI * 2);
    ctx.fillStyle = outerGlow;
    ctx.fill();

    // Sun body
    const sunGradient = ctx.createRadialGradient(x - sunR * 0.2, y - sunR * 0.2, 0, x, y, sunR);
    sunGradient.addColorStop(0, '#fffbe8');
    sunGradient.addColorStop(0.3, '#ffdd44');
    sunGradient.addColorStop(0.7, '#ffaa00');
    sunGradient.addColorStop(1, '#ff6600');
    ctx.beginPath();
    ctx.arc(x, y, sunR, 0, Math.PI * 2);
    ctx.fillStyle = sunGradient;
    ctx.fill();

    // Corona effect
    ctx.beginPath();
    ctx.arc(x, y, sunR + 3, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 180, 50, 0.3)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Sun label
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.font = 'bold 12px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('☀ Sun', x, y + sunR + 18);
  };

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (isPlaying) {
      timeRef.current += 0.5 * speed;
    }

    ctx.save();
    ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    draw(ctx);
    ctx.restore();

    animationRef.current = requestAnimationFrame(animate);
  }, [draw, isPlaying, speed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      sizeRef.current = {
        width: rect.width,
        height: rect.height,
        scale: Math.min(rect.width / 960, rect.height / 700, 1.2),
      };
    };

    resize();
    window.addEventListener('resize', resize);
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [animate]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let clicked: Planet | null = null;
    for (const planet of planets) {
      const pos = planetPositionsRef.current.get(planet.id);
      if (pos) {
        const dist = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
        if (dist <= pos.radius + 10) {
          clicked = planet;
          break;
        }
      }
    }

    setSelectedPlanet(clicked);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let hovered: string | null = null;
    for (const planet of planets) {
      const pos = planetPositionsRef.current.get(planet.id);
      if (pos) {
        const dist = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
        if (dist <= pos.radius + 10) {
          hovered = planet.id;
          break;
        }
      }
    }

    setHoveredPlanet(hovered);
    canvas.style.cursor = hovered ? 'pointer' : 'default';
  };

  const speedOptions = [0.5, 1, 2, 5, 10];

  return (
    <div className="w-full h-screen bg-[#0a0a1a] flex flex-col overflow-hidden relative">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 p-4 md:p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-300 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <span className="text-lg">☀️</span>
          </div>
          <div>
            <h1 className="text-white text-lg md:text-2xl font-bold tracking-tight">
              Solar System Explorer
            </h1>
            <p className="text-gray-500 text-xs md:text-sm">
              Interactive learning demo • Click any planet to explore
            </p>
          </div>
        </div>
      </header>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
      />

      {/* Controls */}
      <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 md:gap-3 bg-black/60 backdrop-blur-xl rounded-full px-4 md:px-6 py-2.5 md:py-3 border border-white/10 shadow-2xl">
        {/* Play/Pause */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all text-white hover:scale-105 active:scale-95"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <rect x="3" y="2" width="3.5" height="12" rx="1" />
              <rect x="9.5" y="2" width="3.5" height="12" rx="1" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4 2l10 6-10 6V2z" />
            </svg>
          )}
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-white/10" />

        {/* Speed controls */}
        <div className="flex items-center gap-1">
          <span className="text-gray-500 text-[10px] md:text-xs mr-1 md:mr-2 uppercase tracking-wider">Speed</span>
          {speedOptions.map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-2 md:px-2.5 py-1 rounded-full text-[10px] md:text-xs font-semibold transition-all ${
                speed === s
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-white/5 text-gray-400 hover:bg-white/15 hover:text-white'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Planet quick nav - left side */}
      <div className="absolute top-20 md:top-24 left-3 md:left-5 z-10 flex flex-col gap-1">
        {planets.map((planet) => (
          <button
            key={planet.id}
            onClick={() => setSelectedPlanet(selectedPlanet?.id === planet.id ? null : planet)}
            className={`group flex items-center gap-2 px-2.5 md:px-3 py-1.5 rounded-lg text-[10px] md:text-xs transition-all ${
              selectedPlanet?.id === planet.id
                ? 'bg-white/15 text-white border border-white/20'
                : 'bg-black/30 text-gray-500 hover:bg-white/10 hover:text-white border border-transparent'
            } backdrop-blur-sm`}
          >
            <span
              className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full inline-block flex-shrink-0 transition-transform group-hover:scale-125"
              style={{ backgroundColor: planet.color }}
            />
            <span className="hidden sm:inline">{planet.name}</span>
          </button>
        ))}
      </div>

      {/* Planet Info Panel */}
      {selectedPlanet && (
        <div className="absolute top-20 md:top-24 right-3 md:right-5 z-20 w-72 md:w-80 bg-black/70 backdrop-blur-2xl rounded-2xl border border-white/10 p-4 md:p-5 shadow-2xl animate-slide-in">
          <button
            onClick={() => setSelectedPlanet(null)}
            className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white text-sm transition-colors"
          >
            ✕
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center"
              style={{
                background: `radial-gradient(circle at 35% 35%, ${lightenColor(selectedPlanet.color, 40)}, ${selectedPlanet.color})`,
                boxShadow: `0 0 25px ${selectedPlanet.color}40, inset 0 -3px 6px rgba(0,0,0,0.3)`,
              }}
            />
            <div>
              <h2 className="text-white text-lg md:text-xl font-bold">{selectedPlanet.name}</h2>
              <p className="text-gray-500 text-[10px] md:text-xs">
                Planet {planets.indexOf(selectedPlanet) + 1} of 8 • {selectedPlanet.orbitalPeriod < 365 ? 'Inner' : 'Outer'} planet
              </p>
            </div>
          </div>

          <p className="text-gray-300 text-xs md:text-sm mb-4 leading-relaxed">{selectedPlanet.description}</p>

          <div className="space-y-2">
            <InfoRow label="Radius" value={`${selectedPlanet.actualRadius.toLocaleString()} km`} icon="📏" />
            <InfoRow label="Distance from Sun" value={`${selectedPlanet.distanceFromSun.toLocaleString()} M km`} icon="📡" />
            <InfoRow label="Orbital Period" value={`${selectedPlanet.orbitalPeriod.toLocaleString()} days`} icon="🔄" />
            <InfoRow
              label="In Earth Years"
              value={`≈ ${(selectedPlanet.orbitalPeriod / 365.25).toFixed(2)} years`}
              icon="📅"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="flex items-center gap-2.5 bg-white/5 rounded-lg px-3 py-2 border border-white/5">
      <span className="text-base">{icon}</span>
      <div className="min-w-0">
        <p className="text-gray-500 text-[9px] md:text-[10px] uppercase tracking-wider">{label}</p>
        <p className="text-white text-xs md:text-sm font-medium truncate">{value}</p>
      </div>
    </div>
  );
}

function lightenColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, ((num >> 16) & 0xff) + amount);
  const g = Math.min(255, ((num >> 8) & 0xff) + amount);
  const b = Math.min(255, (num & 0xff) + amount);
  return `rgb(${r}, ${g}, ${b})`;
}

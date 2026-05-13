// Stylized SVG map of Africa. Regions "fall" to your control as territory grows.
// Each region has a threshold (% territory at which it's claimed).

type Region = { id: string; name: string; threshold: number; d: string };

// Hand-drawn paths approximating African regions. Coordinates inside a 320x420 viewBox.
const REGIONS: Region[] = [
  { id: "maghreb",     name: "Maghreb",          threshold: 8,  d: "M70,55 L210,40 L240,80 L210,110 L120,115 L80,95 Z" },
  { id: "sahara",      name: "Sahara",           threshold: 18, d: "M80,95 L210,110 L255,150 L240,185 L130,190 L75,165 Z" },
  { id: "west_africa", name: "West Africa",      threshold: 32, d: "M75,165 L150,180 L165,220 L140,250 L95,235 L70,200 Z" },
  { id: "horn",        name: "Horn of Africa",   threshold: 45, d: "M240,185 L290,180 L295,225 L255,235 L235,215 Z" },
  { id: "congo",       name: "Congo Basin",      threshold: 58, d: "M150,180 L240,185 L235,215 L230,255 L165,265 L140,250 L165,220 Z" },
  { id: "great_lakes", name: "Great Lakes",      threshold: 70, d: "M230,255 L255,235 L270,275 L240,300 L215,290 Z" },
  { id: "kalahari",    name: "Kalahari",         threshold: 82, d: "M140,250 L165,265 L215,290 L210,330 L150,335 L120,300 Z" },
  { id: "cape",        name: "Cape Colony",      threshold: 95, d: "M150,335 L210,330 L215,360 L175,385 L145,365 Z" },
];

export function AfricaMap({ territory }: { territory: number }) {
  return (
    <div className="relative">
      <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-blood mb-2">
        Cartographer's Plate · {Math.round(territory)}% claimed
      </div>
      <svg viewBox="0 0 320 420" className="w-full h-auto">
        <defs>
          <pattern id="paper" patternUnits="userSpaceOnUse" width="6" height="6">
            <rect width="6" height="6" fill="oklch(0.94 0.025 80)" />
            <circle cx="1" cy="1" r="0.4" fill="oklch(0.85 0.04 70)" />
          </pattern>
          <filter id="ink" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence baseFrequency="0.9" numOctaves="2" seed="3" />
            <feDisplacementMap in="SourceGraphic" scale="0.7" />
          </filter>
        </defs>
        {/* Ocean / paper backdrop */}
        <rect width="320" height="420" fill="url(#paper)" />
        {/* Latitude lines */}
        {[80, 140, 200, 260, 320, 380].map((y) => (
          <line key={y} x1="0" x2="320" y1={y} y2={y} stroke="oklch(0.4 0.04 60)" strokeWidth="0.3" strokeDasharray="2 4" opacity="0.3" />
        ))}
        {/* Continent outline (faint) */}
        <path
          d="M70,55 L210,40 L240,80 L255,150 L290,180 L295,225 L270,275 L240,300 L215,360 L175,385 L145,365 L120,300 L95,235 L70,200 L75,165 L80,95 Z"
          fill="oklch(0.92 0.03 80)"
          stroke="oklch(0.25 0.02 60)"
          strokeWidth="1.2"
          filter="url(#ink)"
        />
        {REGIONS.map((r) => {
          const claimed = territory >= r.threshold;
          return (
            <g key={r.id} className="transition-all duration-700">
              <path
                d={r.d}
                fill={claimed ? "var(--blood, #7a1a14)" : "transparent"}
                fillOpacity={claimed ? 0.55 : 0}
                stroke="oklch(0.25 0.02 60)"
                strokeWidth="0.6"
                style={{ transition: "fill-opacity 800ms ease" }}
              />
            </g>
          );
        })}
        {/* Compass rose */}
        <g transform="translate(280,360)" opacity="0.65">
          <circle r="14" fill="none" stroke="oklch(0.25 0.02 60)" strokeWidth="0.6" />
          <path d="M0,-14 L3,0 L0,14 L-3,0 Z" fill="oklch(0.25 0.02 60)" />
          <text y="-18" textAnchor="middle" fontSize="7" fontFamily="monospace" fill="oklch(0.25 0.02 60)">N</text>
        </g>
        {/* Title */}
        <text x="160" y="28" textAnchor="middle" fontSize="11" fontFamily="serif" fontStyle="italic" fill="oklch(0.25 0.02 60)">
          Africa — A.D. 1885
        </text>
      </svg>
      <div className="mt-3 grid grid-cols-2 gap-1 text-[9px] font-mono uppercase tracking-wider">
        {REGIONS.map((r) => {
          const claimed = territory >= r.threshold;
          return (
            <div key={r.id} className={`flex items-center gap-2 ${claimed ? "text-blood" : "text-muted-foreground/60"}`}>
              <span className={`size-1.5 rounded-full ${claimed ? "bg-blood" : "bg-foreground/20"}`} />
              <span>{r.name}</span>
              {!claimed && <span className="ml-auto opacity-50">≥{r.threshold}%</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
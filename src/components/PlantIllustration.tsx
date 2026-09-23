import React from 'react';

interface PlantIllustrationProps {
  stage: 'seed' | 'sprout' | 'seedling' | 'tall';
  heightCm?: number | string;
  isWatered?: boolean;
  isSunny?: boolean;
  className?: string;
  highlightPart?: 'akar' | 'batang' | 'daun' | null;
}

export const PlantIllustration: React.FC<PlantIllustrationProps> = ({
  stage,
  heightCm,
  isWatered = false,
  isSunny = false,
  className = '',
  highlightPart = null,
}) => {
  return (
    <div className={`relative flex flex-col items-center justify-end select-none ${className}`}>
      {/* Background cute nature elements */}
      <div className="absolute -top-12 -right-8 pointer-events-none">
        {/* Smiling Sun */}
        <div className={`relative transition-transform duration-500 ${isSunny ? 'scale-125' : 'scale-100 animate-pulse'}`}>
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 shadow-lg shadow-yellow-200/50 flex items-center justify-center border-2 border-yellow-200">
            {/* Sun Face */}
            <div className="flex flex-col items-center">
              <div className="flex gap-2">
                <span className="w-1.5 h-2 bg-amber-900 rounded-full"></span>
                <span className="w-1.5 h-2 bg-amber-900 rounded-full"></span>
              </div>
              <div className="w-3 h-1.5 bg-rose-500 rounded-b-full mt-1"></div>
            </div>
          </div>
          {/* Sun Rays */}
          <div className="absolute inset-0 -m-2 border-2 border-dashed border-amber-300 rounded-full animate-spin [animation-duration:15s] pointer-events-none"></div>
        </div>
      </div>

      {/* Fluttering Butterfly */}
      <div className="absolute -top-6 -left-6 text-2xl animate-bounce [animation-duration:3s] pointer-events-none">
        🦋
      </div>

      {/* Floating Cloud */}
      <div className="absolute -top-10 left-4 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-full shadow-xs text-xs font-bold text-sky-700 flex items-center gap-1 border border-sky-100">
        ☁️ <span>Cerah!</span>
      </div>

      {/* Water Drops Animation if watered */}
      {isWatered && (
        <div className="absolute top-12 z-20 flex gap-4 animate-bounce">
          <span className="text-2xl animate-ping">💧</span>
          <span className="text-xl animate-bounce delay-100">💧</span>
          <span className="text-2xl animate-pulse delay-200">💧</span>
        </div>
      )}

      {/* Main Plant SVG Canvas */}
      <div className="relative w-64 h-72 flex flex-col items-center justify-end">
        <svg
          viewBox="0 0 240 280"
          className="w-full h-full overflow-visible transition-all duration-500"
        >
          {/* Defs for gradients & filters */}
          <defs>
            <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4ade80" />
              <stop offset="100%" stopColor="#16a34a" />
            </linearGradient>
            <linearGradient id="stemGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#15803d" />
            </linearGradient>
            <linearGradient id="potGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fb923c" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
            <linearGradient id="soilGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#78350f" />
              <stop offset="100%" stopColor="#451a03" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* === STAGES RENDERING === */}

          {/* 1. SEED IN SOIL */}
          {stage === 'seed' && (
            <g className="transition-all duration-500">
              {/* Seed buried in soil */}
              <ellipse
                cx="120"
                cy="195"
                rx="14"
                ry="10"
                fill="#854d0e"
                stroke="#713f12"
                strokeWidth="2"
                className="animate-pulse"
              />
              <path
                d="M 124 190 Q 128 184 130 180"
                stroke="#a3e635"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              />
              {/* Seed smile */}
              <circle cx="116" cy="194" r="1.5" fill="#fef08a" />
              <circle cx="122" cy="194" r="1.5" fill="#fef08a" />
              <path d="M 118 198 Q 119 200 121 198" stroke="#fef08a" strokeWidth="1" fill="none" />
              <text x="120" y="160" textAnchor="middle" fill="#166534" fontWeight="bold" fontSize="13">
                Biji Kangkung 🌰
              </text>
            </g>
          )}

          {/* 2. SPROUT (KECAMBAH) */}
          {stage === 'sprout' && (
            <g className="transition-all duration-500">
              {/* Sprout Stem */}
              <path
                d="M 120 190 Q 118 170 120 150"
                stroke="url(#stemGrad)"
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
                filter={highlightPart === 'batang' ? 'url(#glow)' : undefined}
              />
              {/* Tiny First Two Cotyledon Leaves */}
              <path
                d="M 120 150 C 105 140 100 125 110 125 C 120 125 120 145 120 150"
                fill="url(#leafGrad)"
                stroke="#15803d"
                strokeWidth="2"
                filter={highlightPart === 'daun' ? 'url(#glow)' : undefined}
              />
              <path
                d="M 120 150 C 135 140 140 125 130 125 C 120 125 120 145 120 150"
                fill="url(#leafGrad)"
                stroke="#15803d"
                strokeWidth="2"
                filter={highlightPart === 'daun' ? 'url(#glow)' : undefined}
              />
              {/* Cute Sprout Face */}
              <circle cx="116" cy="142" r="2" fill="#14532d" />
              <circle cx="124" cy="142" r="2" fill="#14532d" />
              <path d="M 118 146 Q 120 148 122 146" stroke="#14532d" strokeWidth="1.5" fill="none" />
              <text x="120" y="105" textAnchor="middle" fill="#166534" fontWeight="bold" fontSize="14">
                Kecambah Tumbuh! 🌱
              </text>
            </g>
          )}

          {/* 3. SEEDLING (TANAMAN KECIL) */}
          {stage === 'seedling' && (
            <g className="transition-all duration-500">
              {/* Stem */}
              <path
                d="M 120 190 Q 122 145 120 105"
                stroke="url(#stemGrad)"
                strokeWidth="7"
                strokeLinecap="round"
                fill="none"
                filter={highlightPart === 'batang' ? 'url(#glow)' : undefined}
              />
              {/* Lower leaves */}
              <path
                d="M 120 150 C 95 145 80 125 100 120 C 115 118 120 145 120 150"
                fill="url(#leafGrad)"
                stroke="#15803d"
                strokeWidth="2"
                filter={highlightPart === 'daun' ? 'url(#glow)' : undefined}
              />
              <path
                d="M 120 140 C 145 135 160 115 140 110 C 125 108 120 135 120 140"
                fill="url(#leafGrad)"
                stroke="#15803d"
                strokeWidth="2"
                filter={highlightPart === 'daun' ? 'url(#glow)' : undefined}
              />
              {/* Upper spear leaves (kangkung signature long lanceolate leaves) */}
              <path
                d="M 120 105 C 100 90 90 65 110 60 C 120 60 120 100 120 105"
                fill="url(#leafGrad)"
                stroke="#15803d"
                strokeWidth="2"
                filter={highlightPart === 'daun' ? 'url(#glow)' : undefined}
              />
              <path
                d="M 120 105 C 140 90 150 65 130 60 C 120 60 120 100 120 105"
                fill="url(#leafGrad)"
                stroke="#15803d"
                strokeWidth="2"
                filter={highlightPart === 'daun' ? 'url(#glow)' : undefined}
              />
              {/* Cute leaf veins */}
              <path d="M 120 105 L 105 75" stroke="#bbf7d0" strokeWidth="1.5" />
              <path d="M 120 105 L 135 75" stroke="#bbf7d0" strokeWidth="1.5" />
              <text x="120" y="45" textAnchor="middle" fill="#166534" fontWeight="bold" fontSize="14">
                Tanaman Kecil 🌿
              </text>
            </g>
          )}

          {/* 4. TALL KANGKUNG (TANAMAN SEMAKIN TINGGI & SEGAR) */}
          {stage === 'tall' && (
            <g className="transition-all duration-500">
              {/* Main sturdy green stem */}
              <path
                d="M 120 190 Q 118 120 120 50"
                stroke="url(#stemGrad)"
                strokeWidth="8"
                strokeLinecap="round"
                fill="none"
                filter={highlightPart === 'batang' ? 'url(#glow)' : undefined}
              />

              {/* Bottom Leaves Pair */}
              <path
                d="M 120 155 C 80 155 60 125 90 115 C 115 110 120 148 120 155"
                fill="url(#leafGrad)"
                stroke="#15803d"
                strokeWidth="2.5"
                filter={highlightPart === 'daun' ? 'url(#glow)' : undefined}
              />
              <path
                d="M 120 145 C 160 145 180 115 150 105 C 125 100 120 138 120 145"
                fill="url(#leafGrad)"
                stroke="#15803d"
                strokeWidth="2.5"
                filter={highlightPart === 'daun' ? 'url(#glow)' : undefined}
              />

              {/* Mid Leaves Pair */}
              <path
                d="M 120 115 C 75 110 60 70 95 65 C 115 65 120 105 120 115"
                fill="url(#leafGrad)"
                stroke="#15803d"
                strokeWidth="2.5"
                filter={highlightPart === 'daun' ? 'url(#glow)' : undefined}
              />
              <path
                d="M 120 100 C 165 95 180 55 145 50 C 125 50 120 90 120 100"
                fill="url(#leafGrad)"
                stroke="#15803d"
                strokeWidth="2.5"
                filter={highlightPart === 'daun' ? 'url(#glow)' : undefined}
              />

              {/* Top Fresh Spear Leaves */}
              <path
                d="M 120 50 C 90 35 85 5 110 10 C 122 15 120 45 120 50"
                fill="url(#leafGrad)"
                stroke="#15803d"
                strokeWidth="2.5"
                filter={highlightPart === 'daun' ? 'url(#glow)' : undefined}
              />
              <path
                d="M 120 50 C 150 35 155 5 130 10 C 118 15 120 45 120 50"
                fill="url(#leafGrad)"
                stroke="#15803d"
                strokeWidth="2.5"
                filter={highlightPart === 'daun' ? 'url(#glow)' : undefined}
              />
              <path
                d="M 120 50 C 112 25 115 0 120 0 C 125 0 128 25 120 50"
                fill="#86efac"
                stroke="#16a34a"
                strokeWidth="2"
              />

              {/* Leaf veins */}
              <path d="M 120 155 L 85 130" stroke="#bbf7d0" strokeWidth="2" strokeLinecap="round" />
              <path d="M 120 145 L 155 120" stroke="#bbf7d0" strokeWidth="2" strokeLinecap="round" />
              <path d="M 120 115 L 85 85" stroke="#bbf7d0" strokeWidth="2" strokeLinecap="round" />
              <path d="M 120 100 L 155 70" stroke="#bbf7d0" strokeWidth="2" strokeLinecap="round" />

              {/* Cheerful star sparkle */}
              <text x="180" y="35" fontSize="20" className="animate-spin [animation-duration:6s]">
                ✨
              </text>
            </g>
          )}

          {/* ROOTS (Akar) inside soil */}
          <g
            className={`transition-all duration-300 ${highlightPart === 'akar' ? 'opacity-100 scale-110' : 'opacity-90'}`}
            filter={highlightPart === 'akar' ? 'url(#glow)' : undefined}
          >
            {/* Primary & secondary roots */}
            <path
              d="M 120 190 Q 120 225 120 245"
              stroke="#fef08a"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 120 205 Q 105 220 95 235"
              stroke="#fef08a"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 120 215 Q 135 230 145 240"
              stroke="#fef08a"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 105 225 Q 90 235 85 245"
              stroke="#fef08a"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 135 230 Q 145 242 155 248"
              stroke="#fef08a"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          </g>

          {/* CUTE GARDEN POT (POT TANAH) */}
          <g>
            {/* Soil inside pot (with transparent view to show roots) */}
            <path
              d="M 65 190 L 175 190 L 160 255 L 80 255 Z"
              fill="url(#soilGrad)"
              fillOpacity="0.88"
              stroke="#451a03"
              strokeWidth="2"
            />
            {/* Soil Texture specs */}
            <circle cx="95" cy="205" r="3" fill="#92400e" />
            <circle cx="145" cy="215" r="2.5" fill="#92400e" />
            <circle cx="110" cy="235" r="3" fill="#92400e" />

            {/* Clay Pot Outer Shell */}
            <path
              d="M 50 185 L 190 185 L 185 198 L 55 198 Z"
              fill="#ea580c"
              stroke="#9a3412"
              strokeWidth="3"
              rx="4"
            />
            <path
              d="M 57 198 L 183 198 L 168 268 C 166 272 162 275 158 275 L 82 275 C 78 275 74 272 72 268 Z"
              fill="url(#potGrad)"
              stroke="#9a3412"
              strokeWidth="3"
            />

            {/* Cute Happy Face on the Pot */}
            <g className="translate-y-2">
              <circle cx="106" cy="225" r="3.5" fill="#7c2d12" />
              <circle cx="134" cy="225" r="3.5" fill="#7c2d12" />
              {/* Rosy cheeks */}
              <circle cx="99" cy="230" r="4" fill="#fca5a5" fillOpacity="0.8" />
              <circle cx="141" cy="230" r="4" fill="#fca5a5" fillOpacity="0.8" />
              {/* Smile */}
              <path
                d="M 114 233 Q 120 240 126 233"
                stroke="#7c2d12"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
            </g>

            {/* Pot Ribbon or Tag */}
            <rect
              x="92"
              y="252"
              width="56"
              height="16"
              rx="8"
              fill="#fef08a"
              stroke="#ca8a04"
              strokeWidth="1.5"
            />
            <text x="120" y="264" textAnchor="middle" fill="#854d0e" fontSize="10" fontWeight="bold">
              KANGKUNG
            </text>
          </g>
        </svg>

        {/* Height badge if provided */}
        {heightCm !== undefined && heightCm !== '' && (
          <div className="absolute top-2 right-0 bg-emerald-600 text-white font-bold px-3 py-1 rounded-full text-sm shadow-md border-2 border-white flex items-center gap-1 animate-bounce">
            📏 {heightCm} cm
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { CaliberType } from '../types';

interface WatchDialCanvasProps {
  brand: string;
  model: string;
  dialColor?: string;
  caseDiameterMm?: number;
  caliberType?: CaliberType;
  vph?: number;
  isLumeMode?: boolean;
  size?: number;
}

export const WatchDialCanvas: React.FC<WatchDialCanvasProps> = ({
  brand,
  model,
  dialColor = '#111111',
  caliberType = 'Automatic',
  vph = 28800,
  isLumeMode = false,
  size = 180,
}) => {
  const [secondsAngle, setSecondsAngle] = useState(0);
  const [minutesAngle, setMinutesAngle] = useState(0);
  const [hoursAngle, setHoursAngle] = useState(0);

  useEffect(() => {
    let animationFrameId: number;

    const updateHands = () => {
      const now = new Date();
      const ms = now.getMilliseconds();
      const sec = now.getSeconds();
      const min = now.getMinutes();
      const hour = now.getHours() % 12;

      // Spring Drive = Continuous Glide. Mechanical = Sub-second step ticks (e.g. 8 steps/sec for 28800 vph)
      let fractionalSeconds: number;
      if (caliberType === 'Spring Drive') {
        fractionalSeconds = sec + ms / 1000;
      } else if (vph && vph > 0) {
        const stepsPerSecond = vph / 3600; // e.g. 8 steps
        const stepFraction = Math.floor((ms / 1000) * stepsPerSecond) / stepsPerSecond;
        fractionalSeconds = sec + stepFraction;
      } else {
        fractionalSeconds = sec;
      }

      setSecondsAngle(fractionalSeconds * 6); // 360 deg / 60s = 6 deg/sec
      setMinutesAngle((min + sec / 60) * 6);
      setHoursAngle((hour + min / 60) * 30); // 360 deg / 12h = 30 deg/hour

      animationFrameId = requestAnimationFrame(updateHands);
    };

    animationFrameId = requestAnimationFrame(updateHands);
    return () => cancelAnimationFrame(animationFrameId);
  }, [caliberType, vph]);

  const center = size / 2;
  const radius = size * 0.44;

  // Lume colors
  const lumeFill = isLumeMode ? '#22c55e' : '#e5e7eb';
  const lumeGlow = isLumeMode ? 'filter drop-shadow(0 0 6px rgba(34, 197, 94, 0.8))' : '';
  const bezelTone = isLumeMode ? '#0a0a0a' : '#262626';

  return (
    <div 
      className="relative flex items-center justify-center select-none"
      style={{ width: size, height: size }}
    >
      <svg 
        width={size} 
        height={size} 
        viewBox={`0 0 ${size} ${size}`}
        className="transition-all duration-300"
      >
        <defs>
          <radialGradient id={`dialGrad-${brand}-${size}`} cx="45%" cy="40%" r="60%">
            <stop offset="0%" stopColor={isLumeMode ? '#050c07' : '#2a2622'} />
            <stop offset="70%" stopColor={isLumeMode ? '#020503' : '#141312'} />
            <stop offset="100%" stopColor={isLumeMode ? '#000000' : '#0a0908'} />
          </radialGradient>
          <linearGradient id="steelBezel" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#737373" />
            <stop offset="30%" stopColor="#d4d4d4" />
            <stop offset="50%" stopColor="#525252" />
            <stop offset="70%" stopColor="#e5e5e5" />
            <stop offset="100%" stopColor="#404040" />
          </linearGradient>
          <linearGradient id="goldHand" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
        </defs>

        {/* Outer Steel Watch Case & Bezel */}
        <circle 
          cx={center} 
          cy={center} 
          r={radius + 8} 
          fill="url(#steelBezel)" 
          stroke="#171717"
          strokeWidth="1.5"
        />
        
        {/* Inner Bezel Ring */}
        <circle 
          cx={center} 
          cy={center} 
          r={radius + 3} 
          fill={bezelTone}
          stroke="#404040" 
          strokeWidth="0.75"
        />

        {/* Watch Dial */}
        <circle 
          cx={center} 
          cy={center} 
          r={radius} 
          fill={`url(#dialGrad-${brand}-${size})`}
          stroke="#333333" 
          strokeWidth="1"
        />

        {/* Hour Indices (12 positions) */}
        {[...Array(12)].map((_, i) => {
          const angle = i * 30 * (Math.PI / 180);
          const isCardinal = i % 3 === 0;
          const markerLen = isCardinal ? size * 0.08 : size * 0.05;
          const x1 = center + (radius - 2) * Math.sin(angle);
          const y1 = center - (radius - 2) * Math.cos(angle);
          const x2 = center + (radius - markerLen - 2) * Math.sin(angle);
          const y2 = center - (radius - markerLen - 2) * Math.cos(angle);

          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={isCardinal ? (isLumeMode ? '#22c55e' : '#f59e0b') : lumeFill}
              strokeWidth={isCardinal ? 2.5 : 1.5}
              strokeLinecap="round"
              className={lumeGlow}
            />
          );
        })}

        {/* Minute Track (60 ticks) */}
        {!isLumeMode && [...Array(60)].map((_, i) => {
          if (i % 5 === 0) return null;
          const angle = i * 6 * (Math.PI / 180);
          const x1 = center + (radius - 2) * Math.sin(angle);
          const y1 = center - (radius - 2) * Math.cos(angle);
          const x2 = center + (radius - 5) * Math.sin(angle);
          const y2 = center - (radius - 5) * Math.cos(angle);
          return (
            <line
              key={`min-${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#525252"
              strokeWidth="0.75"
            />
          );
        })}

        {/* Brand & Model Dial Typography */}
        {!isLumeMode && (
          <>
            <text
              x={center}
              y={center - radius * 0.42}
              fill="#e5e5e5"
              fontSize={size * 0.065}
              fontFamily="Cinzel, serif"
              fontWeight="bold"
              letterSpacing="1.5"
              textAnchor="middle"
            >
              {brand.toUpperCase()}
            </text>
            <text
              x={center}
              y={center - radius * 0.26}
              fill="#9ca3af"
              fontSize={size * 0.042}
              fontFamily="Plus Jakarta Sans, sans-serif"
              textAnchor="middle"
            >
              {model.length > 18 ? model.slice(0, 16) + '...' : model}
            </text>

            {/* Caliber Frequency / Certification Badge */}
            <text
              x={center}
              y={center + radius * 0.48}
              fill="#d97706"
              fontSize={size * 0.038}
              fontFamily="JetBrains Mono, monospace"
              letterSpacing="0.8"
              textAnchor="middle"
            >
              {caliberType === 'Spring Drive' ? 'SPRING DRIVE' : `${vph.toLocaleString()} VPH`}
            </text>
          </>
        )}

        {/* Hour Hand */}
        <g transform={`rotate(${hoursAngle} ${center} ${center})`}>
          <line
            x1={center}
            y1={center + 6}
            x2={center}
            y2={center - radius * 0.52}
            stroke={isLumeMode ? '#22c55e' : '#d4d4d4'}
            strokeWidth={size * 0.032}
            strokeLinecap="round"
            className={lumeGlow}
          />
          {/* Lume insert in hour hand */}
          <line
            x1={center}
            y1={center - radius * 0.15}
            x2={center}
            y2={center - radius * 0.46}
            stroke={isLumeMode ? '#4ade80' : '#ffffff'}
            strokeWidth={size * 0.014}
            strokeLinecap="round"
          />
        </g>

        {/* Minute Hand */}
        <g transform={`rotate(${minutesAngle} ${center} ${center})`}>
          <line
            x1={center}
            y1={center + 8}
            x2={center}
            y2={center - radius * 0.78}
            stroke={isLumeMode ? '#22c55e' : '#e5e5e5'}
            strokeWidth={size * 0.024}
            strokeLinecap="round"
            className={lumeGlow}
          />
          {/* Lume insert in minute hand */}
          <line
            x1={center}
            y1={center - radius * 0.2}
            x2={center}
            y2={center - radius * 0.72}
            stroke={isLumeMode ? '#4ade80' : '#ffffff'}
            strokeWidth={size * 0.01}
            strokeLinecap="round"
          />
        </g>

        {/* Center Pinion Boss */}
        <circle 
          cx={center} 
          cy={center} 
          r={size * 0.035} 
          fill="#d4d4d4" 
          stroke="#171717" 
          strokeWidth="1"
        />

        {/* Sweeping Mechanical Seconds Hand */}
        {!isLumeMode && (
          <g transform={`rotate(${secondsAngle} ${center} ${center})`}>
            {/* Counterbalance tail */}
            <line
              x1={center}
              y1={center}
              x2={center}
              y2={center + radius * 0.28}
              stroke="#f59e0b"
              strokeWidth={size * 0.015}
              strokeLinecap="round"
            />
            {/* Long needle hand reaching outer minute track */}
            <line
              x1={center}
              y1={center}
              x2={center}
              y2={center - radius * 0.88}
              stroke="#f59e0b"
              strokeWidth={size * 0.012}
              strokeLinecap="round"
            />
            {/* Center dot */}
            <circle cx={center} cy={center} r={size * 0.02} fill="#b45309" />
          </g>
        )}
      </svg>
    </div>
  );
};

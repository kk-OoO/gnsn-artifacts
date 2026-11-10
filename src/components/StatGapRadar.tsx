'use client';

import React from 'react';
import { StatGap } from '@/types/genshin';

interface StatGapRadarProps {
  gaps: StatGap[];
  size?: number;
}

export function StatGapRadar({ gaps, size = 320 }: StatGapRadarProps) {
  if (!gaps || gaps.length === 0) return null;

  // レーダーに含める項目（最大6-8項目）
  const displayGaps = gaps.slice(0, 7);
  const count = displayGaps.length;
  if (count < 3) return null;

  const center = size / 2;
  const radius = center * 0.72;
  const angleStep = (Math.PI * 2) / count;

  // 各軸の角度（上から時計回り）
  const getCoordinates = (index: number, factor: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const x = center + radius * factor * Math.cos(angle);
    const y = center + radius * factor * Math.sin(angle);
    return { x, y };
  };

  // 目標ライン (100% = factor 1.0)
  const targetPolygonPoints = displayGaps
    .map((_, i) => {
      const { x, y } = getCoordinates(i, 1.0);
      return `${x},${y}`;
    })
    .join(' ');

  // 現在の達成度ポリゴン (上限130%、下限10%)
  const currentPolygonPoints = displayGaps
    .map((g, i) => {
      const factor = Math.max(0.1, Math.min(1.3, g.percentAchieved / 100));
      const { x, y } = getCoordinates(i, factor);
      return `${x},${y}`;
    })
    .join(' ');

  // グリッド線（25%, 50%, 75%, 100%）
  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  return (
    <div className="flex flex-col items-center justify-center p-1 w-full">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full max-w-[260px] sm:max-w-[320px] h-auto overflow-visible select-none"
      >
        <defs>
          <radialGradient id="radarBgGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#d4af37" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#1e2330" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="currentFillGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#eab308" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.35" />
          </linearGradient>
        </defs>

        {/* 背景グロー */}
        <circle cx={center} cy={center} r={radius * 1.1} fill="url(#radarBgGlow)" />

        {/* 同心多角形グリッド */}
        {gridLevels.map((lvl) => {
          const points = displayGaps
            .map((_, i) => {
              const { x, y } = getCoordinates(i, lvl);
              return `${x},${y}`;
            })
            .join(' ');
          return (
            <polygon
              key={lvl}
              points={points}
              fill="none"
              stroke={lvl === 1.0 ? '#d4af37' : '#334155'}
              strokeWidth={lvl === 1.0 ? '1.5' : '1'}
              strokeDasharray={lvl === 1.0 ? '4 3' : undefined}
              opacity={lvl === 1.0 ? 0.8 : 0.4}
            />
          );
        })}

        {/* 軸ライン */}
        {displayGaps.map((_, i) => {
          const { x, y } = getCoordinates(i, 1.05);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="#334155"
              strokeWidth="1"
              strokeOpacity="0.6"
            />
          );
        })}

        {/* 目標ラインの枠 */}
        <polygon
          points={targetPolygonPoints}
          fill="none"
          stroke="#eab308"
          strokeWidth="1.5"
          strokeDasharray="3 3"
          opacity="0.6"
        />

        {/* 現在値の塗りつぶしポリゴン */}
        <polygon
          points={currentPolygonPoints}
          fill="url(#currentFillGrad)"
          stroke="#facc15"
          strokeWidth="2"
        />

        {/* データポイントの点 */}
        {displayGaps.map((g, i) => {
          const factor = Math.max(0.1, Math.min(1.3, g.percentAchieved / 100));
          const { x, y } = getCoordinates(i, factor);
          const isFull = g.percentAchieved >= 100;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="4"
              fill={isFull ? '#22c55e' : '#eab308'}
              stroke="#0f172a"
              strokeWidth="1.5"
            />
          );
        })}

        {/* ラベル */}
        {displayGaps.map((g, i) => {
          const { x, y } = getCoordinates(i, 1.25);
          const isDeficit = g.status === 'insufficient';
          return (
            <g key={i}>
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="11"
                fontWeight="600"
                fill={isDeficit ? '#f87171' : '#cbd5e1'}
                className="transition-colors"
              >
                {g.statName}
              </text>
              <text
                x={x}
                y={y + 12}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="9"
                fill={isDeficit ? '#ef4444' : '#a3e635'}
              >
                {g.percentAchieved}%
              </text>
            </g>
          );
        })}
      </svg>

      <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-yellow-400 border border-yellow-400 border-dashed" />
          <span>目標ライン (100%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-yellow-400/40 border border-yellow-400" />
          <span>現在のステータス</span>
        </div>
      </div>
    </div>
  );
}

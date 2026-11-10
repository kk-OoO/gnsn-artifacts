'use client';

import React, { useState } from 'react';
import { Artifact, Character } from '@/types/genshin';
import {
  ARTIFACT_SETS,
  ARTIFACT_SLOT_NAMES,
  STAT_DISPLAY_NAMES,
} from '@/data/artifactSets';
import { calculateSubStatCV } from '@/utils/artifactCalculator';
import { Edit2, Trash2, Shield } from 'lucide-react';

interface ArtifactCardProps {
  artifact: Artifact;
  characters?: Character[];
  onEdit?: (artifact: Artifact) => void;
  onDelete?: (id: string) => void;
  onSelect?: (artifact: Artifact) => void;
  isSelected?: boolean;
}

export function ArtifactCard({
  artifact,
  characters = [],
  onEdit,
  onDelete,
  onSelect,
  isSelected = false,
}: ArtifactCardProps) {
  const setInfo = ARTIFACT_SETS[artifact.setId];
  const slotInfo = ARTIFACT_SLOT_NAMES[artifact.slot] || {
    ja: artifact.slot,
    icon: '💎',
  };
  const mainStatInfo = STAT_DISPLAY_NAMES[artifact.mainStat.type] || {
    label: artifact.mainStat.type,
    unit: '',
  };
  const subCV = calculateSubStatCV(artifact);

  // 聖遺物の部位画像URL
  const slotImageUrl = setInfo?.images?.[artifact.slot];
  const [imageError, setImageError] = useState(false);

  // 装備中キャラクター
  const equippedChar = characters.find(
    (c) => c.id === artifact.equippedToCharacterId
  );
  const [avatarError, setAvatarError] = useState(false);

  const getCvBadgeColor = (cv: number) => {
    if (cv >= 40) return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    if (cv >= 30) return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
    if (cv >= 20) return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    return 'bg-slate-700/50 text-slate-300 border-slate-600/40';
  };

  return (
    <div
      onClick={() => onSelect && onSelect(artifact)}
      className={`group relative rounded-xl border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
        isSelected
          ? 'ring-2 ring-amber-400 border-amber-400 bg-slate-900 shadow-lg shadow-amber-500/10'
          : 'border-slate-800 bg-slate-900/80 hover:border-slate-700 hover:bg-slate-900'
      } ${onSelect ? 'cursor-pointer' : ''}`}
    >
      {/* カード上部：レアリティ背景ヘッダー */}
      <div
        className={`p-2.5 sm:p-3 relative ${
          artifact.rarity === 5
            ? 'bg-gradient-to-r from-amber-900/40 via-amber-800/20 to-transparent border-b border-amber-500/20'
            : 'bg-gradient-to-r from-purple-900/40 via-purple-800/20 to-transparent border-b border-purple-500/20'
        }`}
      >
        <div className="flex items-start justify-between gap-1.5">
          <div className="flex items-center gap-2 min-w-0">
            {/* 聖遺物部位の画像 */}
            <div className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-lg bg-slate-950/80 border border-slate-700/60 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-inner">
              {slotImageUrl && !imageError ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={slotImageUrl}
                  alt={slotInfo.ja}
                  loading="lazy"
                  onError={() => setImageError(true)}
                  className="w-full h-full object-contain p-0.5 group-hover:scale-110 transition duration-300"
                />
              ) : (
                <span className="text-lg sm:text-xl">{slotInfo.icon}</span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1 text-[11px] sm:text-xs text-amber-200/90 font-medium truncate">
                <span>{slotInfo.ja}</span>
                <span className="text-[9px] sm:text-[10px] px-1 rounded bg-slate-800/80 text-amber-300 font-mono font-bold">
                  +{artifact.level}
                </span>
              </div>
              <div className="font-bold text-slate-100 text-[11px] sm:text-xs mt-0.5 truncate max-w-[130px]">
                {setInfo?.name || artifact.setId}
              </div>
            </div>
          </div>

          {/* スコアバッジ */}
          <div
            className={`text-right px-1.5 sm:px-2 py-0.5 rounded-md border text-[10px] sm:text-[11px] font-bold flex-shrink-0 ${getCvBadgeColor(
              subCV
            )}`}
            title="会心スコア (会心率×2 + 会心ダメージ)"
          >
            {subCV} CV
          </div>
        </div>

        {/* メインステータス */}
        <div className="mt-2 flex items-baseline justify-between pt-1 border-t border-slate-800/40">
          <span className="text-[11px] sm:text-xs text-slate-400 truncate max-w-[100px]">
            {mainStatInfo.label}
          </span>
          <span className="text-sm sm:text-base font-black text-amber-300 font-mono">
            {artifact.mainStat.value}
            {mainStatInfo.unit}
          </span>
        </div>
      </div>

      {/* サブステータス一覧 */}
      <div className="p-2 sm:p-3 space-y-1 text-[11px] sm:text-xs flex-1">
        {artifact.subStats.map((sub, idx) => {
          const subInfo = STAT_DISPLAY_NAMES[sub.type] || {
            label: sub.type,
            unit: '',
          };
          const isCrit = sub.type === 'crit_rate' || sub.type === 'crit_damage';

          return (
            <div
              key={idx}
              className={`flex items-center justify-between py-0.5 px-1 rounded transition ${
                isCrit
                  ? 'bg-amber-500/10 text-amber-200 font-medium'
                  : 'text-slate-300 hover:bg-slate-800/40'
              }`}
            >
              <span className="flex items-center gap-1 min-w-0">
                <span className="text-[8px] text-slate-500">•</span>
                <span className="truncate max-w-[100px] sm:max-w-[120px]">
                  {subInfo.label}
                </span>
              </span>
              <span
                className={`font-mono font-semibold text-[10px] sm:text-xs ${
                  isCrit ? 'text-amber-300' : 'text-slate-300'
                }`}
              >
                +{sub.value}
                {subInfo.unit}
              </span>
            </div>
          );
        })}
      </div>

      {/* フッター：装備状況 & アクションボタン */}
      <div className="px-2.5 py-1.5 sm:py-2 bg-slate-950/70 border-t border-slate-800/80 flex items-center justify-between gap-1.5 text-xs">
        {equippedChar ? (
          <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 truncate max-w-[140px]">
            {equippedChar.avatarUrl && !avatarError ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={equippedChar.avatarUrl}
                alt={equippedChar.japaneseName}
                loading="lazy"
                onError={() => setAvatarError(true)}
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <Shield className="w-3 h-3 flex-shrink-0" />
            )}
            <span className="truncate text-[10px] sm:text-xs">
              {equippedChar.japaneseName}
            </span>
          </div>
        ) : (
          <span className="text-slate-500 text-[10px] sm:text-[11px]">未装備</span>
        )}

        <div className="flex items-center gap-0.5">
          {onEdit && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(artifact);
              }}
              className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition"
              title="聖遺物を編集"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('この聖遺物を削除しますか？')) {
                  onDelete(artifact.id);
                }
              }}
              className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition"
              title="聖遺物を削除"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

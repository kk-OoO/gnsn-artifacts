'use client';

import React from 'react';
import { Artifact, Character } from '@/types/genshin';
import {
  ARTIFACT_SETS,
  ARTIFACT_SLOT_NAMES,
  STAT_DISPLAY_NAMES,
} from '@/data/artifactSets';
import { calculateSubStatCV } from '@/utils/artifactCalculator';
import { Edit2, Trash2, CheckCircle, Shield } from 'lucide-react';

interface ArtifactCardProps {
  artifact: Artifact;
  characters?: Character[];
  onEdit?: (artifact: Artifact) => void;
  onDelete?: (id: string) => void;
  onSelect?: (artifact: Artifact) => void;
  isSelected?: boolean;
  showEquipAction?: boolean;
  onEquipToggle?: (artifact: Artifact) => void;
}

export function ArtifactCard({
  artifact,
  characters = [],
  onEdit,
  onDelete,
  onSelect,
  isSelected = false,
  showEquipAction = false,
  onEquipToggle,
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

  // 装備中キャラクター
  const equippedChar = characters.find(
    (c) => c.id === artifact.equippedToCharacterId
  );

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
        className={`p-3 relative ${
          artifact.rarity === 5
            ? 'bg-gradient-to-r from-amber-900/40 via-amber-800/20 to-transparent border-b border-amber-500/20'
            : 'bg-gradient-to-r from-purple-900/40 via-purple-800/20 to-transparent border-b border-purple-500/20'
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-amber-200/90 font-medium">
              <span className="text-sm">{slotInfo.icon}</span>
              <span>{slotInfo.ja}</span>
              <span className="text-[10px] px-1 rounded bg-slate-800/80 text-amber-300 font-mono font-bold">
                +{artifact.level}
              </span>
            </div>
            <div className="font-bold text-slate-100 text-sm mt-0.5 truncate max-w-[170px]">
              {setInfo?.name || artifact.setId}
            </div>
          </div>

          {/* スコアバッジ */}
          <div
            className={`text-right px-2 py-0.5 rounded-md border text-[11px] font-bold ${getCvBadgeColor(
              subCV
            )}`}
            title="会心スコア (会心率×2 + 会心ダメージ)"
          >
            {subCV} CV
          </div>
        </div>

        {/* メインステータス */}
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-xs text-slate-400">{mainStatInfo.label}</span>
          <span className="text-lg font-black text-amber-300">
            {artifact.mainStat.value}
            {mainStatInfo.unit}
          </span>
        </div>
      </div>

      {/* サブステータス一覧 */}
      <div className="p-3 space-y-1.5 text-xs flex-1">
        {artifact.subStats.map((sub, idx) => {
          const subInfo = STAT_DISPLAY_NAMES[sub.type] || {
            label: sub.type,
            unit: '',
          };
          const isCrit = sub.type === 'crit_rate' || sub.type === 'crit_damage';

          return (
            <div
              key={idx}
              className={`flex items-center justify-between py-0.5 px-1.5 rounded transition ${
                isCrit
                  ? 'bg-amber-500/10 text-amber-200 font-medium'
                  : 'text-slate-300 hover:bg-slate-800/40'
              }`}
            >
              <span className="flex items-center gap-1">
                <span className="text-[10px] text-slate-500">•</span>
                <span className="truncate max-w-[120px]">{subInfo.label}</span>
              </span>
              <span className={`font-mono font-semibold ${isCrit ? 'text-amber-300' : 'text-slate-300'}`}>
                +{sub.value}
                {subInfo.unit}
              </span>
            </div>
          );
        })}
      </div>

      {/* フッター：装備状況 & アクションボタン */}
      <div className="px-3 py-2 bg-slate-950/70 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs">
        {equippedChar ? (
          <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 truncate max-w-[150px]">
            <Shield className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{equippedChar.japaneseName} 装備中</span>
          </div>
        ) : (
          <span className="text-slate-500 text-[11px]">未装備</span>
        )}

        <div className="flex items-center gap-1">
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

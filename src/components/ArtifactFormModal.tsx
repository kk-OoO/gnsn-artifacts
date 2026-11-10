'use client';

import React, { useState, useEffect } from 'react';
import {
  Artifact,
  ArtifactSlot,
  MainStatType,
  SubStatType,
  Character,
} from '@/types/genshin';
import {
  ARTIFACT_SETS,
  ARTIFACT_SLOT_NAMES,
  STAT_DISPLAY_NAMES,
} from '@/data/artifactSets';
import { calculateSubStatCV } from '@/utils/artifactCalculator';
import { X, Sparkles } from 'lucide-react';

interface ArtifactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (artifact: Artifact) => void;
  editingArtifact?: Artifact | null;
  characters: Character[];
}

// 部位ごとの利用可能なメインステータス
const AVAILABLE_MAIN_STATS: Record<ArtifactSlot, MainStatType[]> = {
  flower: ['hp_flat'],
  plume: ['atk_flat'],
  sands: [
    'hp_percent',
    'atk_percent',
    'def_percent',
    'elemental_mastery',
    'energy_recharge',
  ],
  goblet: [
    'hp_percent',
    'atk_percent',
    'def_percent',
    'elemental_mastery',
    'pyro_dmg',
    'hydro_dmg',
    'anemo_dmg',
    'electro_dmg',
    'dendro_dmg',
    'cryo_dmg',
    'geo_dmg',
    'physical_dmg',
  ],
  circlet: [
    'hp_percent',
    'atk_percent',
    'def_percent',
    'elemental_mastery',
    'crit_rate',
    'crit_damage',
    'healing_bonus',
  ],
};

// Lv20時のメインステータス標準値
const DEFAULT_MAIN_STAT_VALUES: Record<MainStatType, number> = {
  hp_flat: 4780,
  atk_flat: 311,
  hp_percent: 46.6,
  atk_percent: 46.6,
  def_percent: 58.3,
  elemental_mastery: 187,
  energy_recharge: 51.8,
  crit_rate: 31.1,
  crit_damage: 62.2,
  healing_bonus: 35.9,
  pyro_dmg: 46.6,
  hydro_dmg: 46.6,
  anemo_dmg: 46.6,
  electro_dmg: 46.6,
  dendro_dmg: 46.6,
  cryo_dmg: 46.6,
  geo_dmg: 46.6,
  physical_dmg: 58.3,
};

const ALL_SUB_STAT_TYPES: SubStatType[] = [
  'crit_rate',
  'crit_damage',
  'atk_percent',
  'energy_recharge',
  'elemental_mastery',
  'hp_percent',
  'def_percent',
  'atk_flat',
  'hp_flat',
  'def_flat',
];

export function ArtifactFormModal({
  isOpen,
  onClose,
  onSave,
  editingArtifact,
  characters,
}: ArtifactFormModalProps) {
  const [slot, setSlot] = useState<ArtifactSlot>('flower');
  const [setId, setSetId] = useState<string>('emblem_of_severed_fate');
  const [rarity, setRarity] = useState<4 | 5>(5);
  const [level, setLevel] = useState<number>(20);
  const [mainStatType, setMainStatType] = useState<MainStatType>('hp_flat');
  const [mainStatValue, setMainStatValue] = useState<number>(4780);
  const [equippedTo, setEquippedTo] = useState<string>('');

  const [subStats, setSubStats] = useState<
    { type: SubStatType; value: number }[]
  >([
    { type: 'crit_rate', value: 7.0 },
    { type: 'crit_damage', value: 14.0 },
    { type: 'atk_percent', value: 5.0 },
    { type: 'energy_recharge', value: 5.5 },
  ]);

  // 編集データの初期化
  useEffect(() => {
    if (editingArtifact) {
      setSlot(editingArtifact.slot);
      setSetId(editingArtifact.setId);
      setRarity(editingArtifact.rarity);
      setLevel(editingArtifact.level);
      setMainStatType(editingArtifact.mainStat.type);
      setMainStatValue(editingArtifact.mainStat.value);
      setEquippedTo(editingArtifact.equippedToCharacterId || '');
      setSubStats(editingArtifact.subStats);
    } else {
      // 新規登録時のリセット
      setSlot('flower');
      setSetId('marechaussee_hunter');
      setRarity(5);
      setLevel(20);
      setMainStatType('hp_flat');
      setMainStatValue(4780);
      setEquippedTo('');
      setSubStats([
        { type: 'crit_rate', value: 7.0 },
        { type: 'crit_damage', value: 14.0 },
        { type: 'atk_percent', value: 5.0 },
        { type: 'energy_recharge', value: 5.5 },
      ]);
    }
  }, [editingArtifact, isOpen]);

  // 部位変更時にメインステータスを自動更新
  const handleSlotChange = (newSlot: ArtifactSlot) => {
    setSlot(newSlot);
    const available = AVAILABLE_MAIN_STATS[newSlot];
    const defaultType = available[0];
    setMainStatType(defaultType);
    setMainStatValue(DEFAULT_MAIN_STAT_VALUES[defaultType] || 0);
  };

  const handleMainStatTypeChange = (type: MainStatType) => {
    setMainStatType(type);
    setMainStatValue(DEFAULT_MAIN_STAT_VALUES[type] || 0);
  };

  const updateSubStat = (
    index: number,
    field: 'type' | 'value',
    val: string | number
  ) => {
    const updated = [...subStats];
    if (field === 'type') {
      updated[index].type = val as SubStatType;
    } else {
      updated[index].value = Number(val) || 0;
    }
    setSubStats(updated);
  };

  const addSubStat = () => {
    if (subStats.length < 4) {
      const unused = ALL_SUB_STAT_TYPES.find(
        (t) => !subStats.some((s) => s.type === t)
      );
      setSubStats([...subStats, { type: unused || 'atk_flat', value: 0 }]);
    }
  };

  const removeSubStat = (index: number) => {
    setSubStats(subStats.filter((_, i) => i !== index));
  };

  // リアルタイムCVプレビュー
  const tempArtifact: Artifact = {
    id: 'preview',
    setId,
    slot,
    rarity,
    level,
    mainStat: { type: mainStatType, value: mainStatValue },
    subStats,
    createdAt: 0,
  };
  const previewCV = calculateSubStatCV(tempArtifact);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalArtifact: Artifact = {
      id: editingArtifact ? editingArtifact.id : `art-${Date.now()}`,
      setId,
      slot,
      rarity,
      level,
      mainStat: {
        type: mainStatType,
        value: Number(mainStatValue),
      },
      subStats: subStats.filter((s) => s.value > 0),
      equippedToCharacterId: equippedTo || undefined,
      score: previewCV,
      createdAt: editingArtifact ? editingArtifact.createdAt : Date.now(),
    };
    onSave(finalArtifact);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 sticky top-0 bg-slate-900/95 backdrop-blur z-10">
          <div>
            <h3 className="text-lg font-bold text-slate-100">
              {editingArtifact ? '聖遺物の編集' : '聖遺物の新規登録'}
            </h3>
            <p className="text-xs text-slate-400">
              所持している聖遺物のステータスを入力してください
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* 部位選択 */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              部位を選択
            </label>
            <div className="grid grid-cols-5 gap-2">
              {(
                ['flower', 'plume', 'sands', 'goblet', 'circlet'] as ArtifactSlot[]
              ).map((s) => {
                const info = ARTIFACT_SLOT_NAMES[s];
                const active = slot === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleSlotChange(s)}
                    className={`py-2 px-1 text-center rounded-xl border transition flex flex-col items-center gap-1 ${
                      active
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-xl">{info.icon}</span>
                    <span className="text-[11px] truncate w-full">
                      {info.ja}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* セットとレア度/レベル */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                聖遺物セット
              </label>
              <select
                value={setId}
                onChange={(e) => setSetId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-400"
              >
                {Object.values(ARTIFACT_SETS).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  レアリティ
                </label>
                <select
                  value={rarity}
                  onChange={(e) => setRarity(Number(e.target.value) as 4 | 5)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-amber-300 focus:outline-none focus:border-amber-400 font-semibold"
                >
                  <option value={5}>★5 (金)</option>
                  <option value={4}>★4 (紫)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  レベル (+0〜20)
                </label>
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={level}
                  onChange={(e) => setLevel(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>
            </div>
          </div>

          {/* メインステータス */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-2">
            <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              メインステータス
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select
                value={mainStatType}
                onChange={(e) =>
                  handleMainStatTypeChange(e.target.value as MainStatType)
                }
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-400"
              >
                {AVAILABLE_MAIN_STATS[slot].map((type) => (
                  <option key={type} value={type}>
                    {STAT_DISPLAY_NAMES[type]?.label || type}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  value={mainStatValue}
                  onChange={(e) => setMainStatValue(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-400 font-mono font-bold"
                />
                <span className="text-xs text-slate-400 min-w-[20px]">
                  {STAT_DISPLAY_NAMES[mainStatType]?.unit}
                </span>
              </div>
            </div>
          </div>

          {/* サブステータス (最大4つ) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                サブステータス ({subStats.length} / 4)
              </label>
              {subStats.length < 4 && (
                <button
                  type="button"
                  onClick={addSubStat}
                  className="text-xs text-amber-400 hover:text-amber-300 font-medium"
                >
                  + サブステ枠を追加
                </button>
              )}
            </div>

            <div className="space-y-2">
              {subStats.map((sub, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <select
                    value={sub.type}
                    onChange={(e) =>
                      updateSubStat(idx, 'type', e.target.value)
                    }
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                  >
                    {ALL_SUB_STAT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {STAT_DISPLAY_NAMES[type]?.label || type}
                      </option>
                    ))}
                  </select>

                  <div className="w-28 flex items-center gap-1">
                    <input
                      type="number"
                      step="0.1"
                      value={sub.value}
                      onChange={(e) =>
                        updateSubStat(idx, 'value', e.target.value)
                      }
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-400"
                    />
                    <span className="text-xs text-slate-400 w-4">
                      {STAT_DISPLAY_NAMES[sub.type]?.unit}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeSubStat(idx)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* 会心スコアのライブプレビュー */}
            <div className="flex items-center justify-between px-3 py-2 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400">
                この聖遺物のサブステ会心スコア (CV)
              </span>
              <span className="text-sm font-bold text-amber-300 font-mono">
                {previewCV} CV
              </span>
            </div>
          </div>

          {/* 装備先キャラクター */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              装備するキャラクター（任意）
            </label>
            <select
              value={equippedTo}
              onChange={(e) => setEquippedTo(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-400"
            >
              <option value="">(未装備にする)</option>
              {characters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.japaneseName} ({c.name})
                </option>
              ))}
            </select>
          </div>

          {/* 保存ボタン */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-sm font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 transition shadow-lg shadow-amber-500/20"
            >
              {editingArtifact ? '変更を保存' : '聖遺物を追加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

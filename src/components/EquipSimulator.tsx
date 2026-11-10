'use client';

import React, { useState, useMemo } from 'react';
import { Character, Artifact, ArtifactSlot, WeaponConfig } from '@/types/genshin';
import {
  ARTIFACT_SETS,
  ARTIFACT_SLOT_NAMES,
  STAT_DISPLAY_NAMES,
} from '@/data/artifactSets';
import {
  calculateCharacterTotalStats,
  analyzeStatGaps,
  getActiveSetBonuses,
} from '@/utils/artifactCalculator';
import { getDefaultWeaponForCharacter, WEAPON_SUBSTAT_NAMES } from '@/data/weapons';
import { WeaponConfigModal } from './WeaponConfigModal';
import { recommendBestArtifactSet } from '@/utils/autoEquip';
import { ArtifactCard } from './ArtifactCard';
import { StatGapAnalysis } from './StatGapAnalysis';
import {
  Wand2,
  X,
  Plus,
  Sparkles,
  ArrowRightLeft,
  ChevronDown,
  Sword,
  Settings,
} from 'lucide-react';

interface EquipSimulatorProps {
  characters: Character[];
  selectedCharacterId: string;
  onSelectCharacter: (id: string) => void;
  artifacts: Artifact[];
  onUpdateArtifacts: (artifacts: Artifact[]) => void;
  satisfiedCharacterIds?: string[];
  onToggleSatisfied?: (charId: string) => void;
  ownedCharacterIds?: string[];
  onlyOwnedFilter?: boolean;
  characterWeapons?: Record<string, WeaponConfig>;
  onUpdateWeapon?: (charId: string, weapon: WeaponConfig) => void;
}

const SLOTS: ArtifactSlot[] = ['flower', 'plume', 'sands', 'goblet', 'circlet'];

export function EquipSimulator({
  characters,
  selectedCharacterId,
  onSelectCharacter,
  artifacts,
  onUpdateArtifacts,
  satisfiedCharacterIds = [],
  onToggleSatisfied,
  ownedCharacterIds = [],
  onlyOwnedFilter = false,
  characterWeapons = {},
  onUpdateWeapon,
}: EquipSimulatorProps) {
  // 表示候補キャラクター（所持フィルター適用時）
  const selectableCharacters = useMemo(() => {
    if (onlyOwnedFilter && ownedCharacterIds.length > 0) {
      return characters.filter((c) => ownedCharacterIds.includes(c.id));
    }
    return characters;
  }, [characters, onlyOwnedFilter, ownedCharacterIds]);

  // 現在選択中のキャラ
  const character = useMemo(() => {
    return (
      selectableCharacters.find((c) => c.id === selectedCharacterId) ||
      characters.find((c) => c.id === selectedCharacterId) ||
      selectableCharacters[0] ||
      characters[0]
    );
  }, [characters, selectableCharacters, selectedCharacterId]);

  const isSatisfied = character ? satisfiedCharacterIds.includes(character.id) : false;

  // モーダルで変更するスロット
  const [slotToEquip, setSlotToEquip] = useState<ArtifactSlot | null>(null);
  const [isWeaponModalOpen, setIsWeaponModalOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  // 現在選択中のキャラの装備武器
  const currentWeapon = useMemo(() => {
    if (!character) return undefined;
    if (characterWeapons && characterWeapons[character.id]) {
      return characterWeapons[character.id];
    }
    return getDefaultWeaponForCharacter(character.weapon);
  }, [character, characterWeapons]);

  // キャラクターに現在装備されている聖遺物（5部位）
  const equippedArtifacts = useMemo(() => {
    if (!character) return [];
    return artifacts.filter((a) => a.equippedToCharacterId === character.id);
  }, [artifacts, character]);

  const equippedBySlot = useMemo(() => {
    const map: Record<ArtifactSlot, Artifact | undefined> = {
      flower: undefined,
      plume: undefined,
      sands: undefined,
      goblet: undefined,
      circlet: undefined,
    };
    for (const art of equippedArtifacts) {
      map[art.slot] = art;
    }
    return map;
  }, [equippedArtifacts]);

  // 最終ステータス計算（武器の基礎攻撃力とサブステータスを反映）
  const calculatedStats = useMemo(() => {
    if (!character) {
      return {
        hp: 0,
        atk: 0,
        def: 0,
        critRate: 0,
        critDamage: 0,
        energyRecharge: 0,
        elementalMastery: 0,
        elementalDmg: 0,
        healingBonus: 0,
        cv: 0,
      };
    }
    return calculateCharacterTotalStats(character, equippedArtifacts, currentWeapon);
  }, [character, equippedArtifacts, currentWeapon]);

  // ギャップ分析 & アドバイス
  const gapAnalysis = useMemo(() => {
    if (!character) {
      return { gaps: [], overallScore: 0, recommendations: [] };
    }
    return analyzeStatGaps(character, calculatedStats, equippedArtifacts);
  }, [character, calculatedStats, equippedArtifacts]);

  // 発動セット効果
  const activeBonuses = useMemo(() => {
    return getActiveSetBonuses(equippedArtifacts);
  }, [equippedArtifacts]);

  // 特定スロットに聖遺物を装備
  const handleEquip = (artifactToEquip: Artifact) => {
    const updated = artifacts.map((art) => {
      // 以前このキャラの同じ部位に装備されていたものは解除
      if (
        art.equippedToCharacterId === character.id &&
        art.slot === artifactToEquip.slot
      ) {
        return { ...art, equippedToCharacterId: undefined };
      }
      // 新しく選ばれた聖遺物をこのキャラに装備
      if (art.id === artifactToEquip.id) {
        return { ...art, equippedToCharacterId: character.id };
      }
      return art;
    });

    onUpdateArtifacts(updated);
    setSlotToEquip(null);
  };

  // 聖遺物を解除
  const handleUnequip = (slot: ArtifactSlot) => {
    const updated = artifacts.map((art) => {
      if (
        art.equippedToCharacterId === character.id &&
        art.slot === slot
      ) {
        return { ...art, equippedToCharacterId: undefined };
      }
      return art;
    });
    onUpdateArtifacts(updated);
  };

  // おすすめ自動装備
  const handleAutoEquip = () => {
    const best = recommendBestArtifactSet(character, artifacts, true);
    const updated = artifacts.map((art) => {
      let equipToThis = art.equippedToCharacterId;
      if (equipToThis === character.id) {
        equipToThis = undefined;
      }
      for (const slot of SLOTS) {
        if (best[slot] && best[slot]?.id === art.id) {
          equipToThis = character.id;
        }
      }
      return { ...art, equippedToCharacterId: equipToThis };
    });

    onUpdateArtifacts(updated);
  };

  // 全解除
  const handleClearAll = () => {
    if (!confirm(`${character.japaneseName} の全聖遺物を解除しますか？`)) return;
    const updated = artifacts.map((art) => {
      if (art.equippedToCharacterId === character.id) {
        return { ...art, equippedToCharacterId: undefined };
      }
      return art;
    });
    onUpdateArtifacts(updated);
  };

  if (!character) return null;

  return (
    <div className="space-y-6">
      {/* キャラクター選択＆アクションヘッダー */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* キャラクター情報 & セレクター */}
          <div className="flex items-center gap-3.5 w-full lg:w-auto">
            {/* キャラクター公式アバター写真 */}
            <div
              className={`relative w-14 h-14 rounded-2xl overflow-hidden border-2 flex items-center justify-center flex-shrink-0 shadow-lg ${
                character.rarity === 5
                  ? 'border-amber-400/80 bg-gradient-to-tr from-amber-900/80 to-amber-700/40 shadow-amber-500/20'
                  : 'border-purple-400/80 bg-gradient-to-tr from-purple-900/80 to-purple-700/40 shadow-purple-500/20'
              }`}
            >
              {character.avatarUrl && !avatarError ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={character.avatarUrl}
                  alt={character.japaneseName}
                  onError={() => setAvatarError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xl font-black text-amber-300">
                  {character.japaneseName.slice(0, 1)}
                </span>
              )}
            </div>

            <div className="flex-1 sm:w-auto">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-slate-400 font-semibold">
                  対象キャラ ({selectableCharacters.length}人表示中):
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                  {character.role}
                </span>
                {isSatisfied && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 flex items-center gap-1">
                    <span>👑</span>
                    <span>厳選満足</span>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:w-72">
                  <select
                    value={character.id}
                    onChange={(e) => onSelectCharacter(e.target.value)}
                    className="bg-slate-950 border border-slate-700 hover:border-amber-400 rounded-xl px-3 py-2 text-sm text-slate-100 font-bold focus:outline-none focus:border-amber-400 w-full appearance-none pr-8 cursor-pointer"
                  >
                    {selectableCharacters.map((c) => (
                      <option key={c.id} value={c.id}>
                        {satisfiedCharacterIds.includes(c.id) ? '👑 ' : ''}
                        {c.japaneseName} ({c.name}) - ★{c.rarity} {c.role}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-3 top-3 text-slate-400 pointer-events-none" />
                </div>

                {/* 満足マークトグルボタン */}
                {onToggleSatisfied && (
                  <button
                    type="button"
                    onClick={() => onToggleSatisfied(character.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition border flex items-center gap-1.5 whitespace-nowrap ${
                      isSatisfied
                        ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-md shadow-amber-400/20'
                        : 'bg-slate-950 text-slate-400 hover:text-amber-300 border-slate-800'
                    }`}
                    title={
                      isSatisfied
                        ? '厳選満足マーク（クリックで解除）'
                        : 'このキャラに満足・厳選完了マークをつける'
                    }
                  >
                    <span>👑</span>
                    <span>{isSatisfied ? '満足中' : '満足印'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 自動装備 & 全解除ボタン */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={handleAutoEquip}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 transition whitespace-nowrap"
              title="推奨メインステータスとサブステ優先度から最適な聖遺物を自動選定して装備します"
            >
              <Wand2 className="w-4 h-4" />
              <span>所持品から最適自動装備</span>
            </button>

            {equippedArtifacts.length > 0 && (
              <button
                onClick={handleClearAll}
                className="px-3 py-2.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 rounded-xl text-xs font-medium transition"
              >
                全解除
              </button>
            )}
          </div>
        </div>

        {/* 発動中のセット効果バッジ */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">発動セットボーナス:</span>
          {activeBonuses.length === 0 ? (
            <span className="text-slate-500 italic">なし（キメラ構成）</span>
          ) : (
            activeBonuses.map((bonus) => (
              <span
                key={bonus.set.id}
                className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 font-semibold flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {bonus.set.name} ({bonus.count}セット:{' '}
                  {bonus.has4Piece ? '4P効果発動中' : '2P効果発動中'})
                </span>
              </span>
            ))
          )}
        </div>
      </div>

      {/* 装備武器ステータス設定パネル */}
      {currentWeapon && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0 shadow-sm">
              <Sword className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  装備武器
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-100">
                  {currentWeapon.name}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-300 flex-wrap">
                <span className="text-amber-300 font-mono font-bold">
                  基礎ATK: {currentWeapon.baseAtk}
                </span>
                {currentWeapon.subStatType !== 'none' && currentWeapon.subStatValue > 0 && (
                  <>
                    <span className="text-slate-600">/</span>
                    <span className="text-sky-300 font-medium">
                      {WEAPON_SUBSTAT_NAMES[currentWeapon.subStatType]?.label}: {currentWeapon.subStatValue}
                      {WEAPON_SUBSTAT_NAMES[currentWeapon.subStatType]?.unit}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsWeaponModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-950 hover:bg-slate-800 text-amber-300 border border-amber-500/30 hover:border-amber-400 rounded-xl text-xs font-bold transition shadow-sm w-full sm:w-auto justify-center"
          >
            <Settings className="w-3.5 h-3.5 text-amber-400" />
            <span>武器・ステータスを変更</span>
          </button>
        </div>
      )}

      {/* 5部位の聖遺物装備スロットグリッド (スマホは2列で見やすく、PCは5列) */}
      <div>
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <h3 className="text-xs sm:text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <span>聖遺物スロット (5部位)</span>
            <span className="text-[11px] text-slate-400 font-normal hidden sm:inline">
              - タップで手持ちから付け替え
            </span>
          </h3>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3.5">
          {SLOTS.map((slot, idx) => {
            const art = equippedBySlot[slot];
            const slotInfo = ARTIFACT_SLOT_NAMES[slot];
            const isLastOnMobile = idx === 4; // 冠
            const recMain =
              slot === 'sands'
                ? character.recommendedBuild.recommendedMainStats.sands
                : slot === 'goblet'
                ? character.recommendedBuild.recommendedMainStats.goblet
                : slot === 'circlet'
                ? character.recommendedBuild.recommendedMainStats.circlet
                : [];

            return (
              <div
                key={slot}
                className={`bg-slate-900/90 border border-slate-800 rounded-2xl p-2 sm:p-3 flex flex-col justify-between hover:border-slate-700 transition ${
                  isLastOnMobile ? 'col-span-2 lg:col-span-1 max-w-sm mx-auto w-full lg:max-w-none' : ''
                }`}
              >
                {/* スロットヘッダー */}
                <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                    <span className="text-base">{slotInfo.icon}</span>
                    <span>{slotInfo.ja}</span>
                  </div>

                  {art && (
                    <button
                      onClick={() => handleUnequip(slot)}
                      className="text-[10px] sm:text-[11px] text-slate-500 hover:text-rose-400 transition"
                      title="この聖遺物を外す"
                    >
                      外す
                    </button>
                  )}
                </div>

                {/* 装備中カード or 空きスロット */}
                {art ? (
                  <div className="flex-1 flex flex-col justify-between">
                    <ArtifactCard
                      artifact={art}
                      characters={characters}
                      onSelect={() => setSlotToEquip(slot)}
                    />
                    <button
                      onClick={() => setSlotToEquip(slot)}
                      className="w-full mt-1.5 py-1 text-center text-xs text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg font-semibold transition flex items-center justify-center gap-1"
                    >
                      <ArrowRightLeft className="w-3 h-3" />
                      <span>付け替え</span>
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => setSlotToEquip(slot)}
                    className="flex-1 min-h-[150px] sm:min-h-[180px] rounded-xl border border-dashed border-slate-800 hover:border-amber-400/50 hover:bg-slate-950/60 transition cursor-pointer flex flex-col items-center justify-center p-3 text-center group"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-800/80 group-hover:bg-amber-500/20 flex items-center justify-center text-slate-400 group-hover:text-amber-300 transition mb-1.5">
                      <Plus className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-300 group-hover:text-amber-300 transition">
                      装備する
                    </span>
                    {recMain.length > 0 && (
                      <span className="text-[9px] sm:text-[10px] text-slate-500 mt-1 max-w-[130px] truncate">
                        推奨: {recMain.map((m) => STAT_DISPLAY_NAMES[m]?.label || m).join('/')}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 現在の総合ステータスサマリーカード */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 sm:p-5 shadow-xl">
        <h4 className="text-[11px] sm:text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 sm:mb-3 flex items-center gap-1.5">
          <span>現在の合算ステータス (Lv90+適正武器+聖遺物+2P効果)</span>
        </h4>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-1.5 sm:gap-2.5">
          <div className="bg-slate-950 p-2 sm:p-2.5 rounded-xl border border-slate-850">
            <div className="text-[10px] sm:text-[11px] text-slate-400 truncate">最大HP</div>
            <div className="text-xs sm:text-base font-bold text-slate-100 font-mono truncate">
              {calculatedStats.hp.toLocaleString()}
            </div>
          </div>
          <div className="bg-slate-950 p-2 sm:p-2.5 rounded-xl border border-slate-850">
            <div className="text-[10px] sm:text-[11px] text-slate-400 truncate">攻撃力</div>
            <div className="text-xs sm:text-base font-bold text-slate-100 font-mono truncate">
              {calculatedStats.atk.toLocaleString()}
            </div>
          </div>
          <div className="bg-slate-950 p-2 sm:p-2.5 rounded-xl border border-slate-850">
            <div className="text-[10px] sm:text-[11px] text-slate-400 truncate">会心率</div>
            <div className="text-xs sm:text-base font-bold text-amber-300 font-mono truncate">
              {calculatedStats.critRate}%
            </div>
          </div>
          <div className="bg-slate-950 p-2 sm:p-2.5 rounded-xl border border-slate-850">
            <div className="text-[10px] sm:text-[11px] text-slate-400 truncate">会心ダメ</div>
            <div className="text-xs sm:text-base font-bold text-amber-300 font-mono truncate">
              {calculatedStats.critDamage}%
            </div>
          </div>
          <div className="bg-slate-950 p-2 sm:p-2.5 rounded-xl border border-slate-850">
            <div className="text-[10px] sm:text-[11px] text-slate-400 truncate">チャージ効率</div>
            <div className="text-xs sm:text-base font-bold text-sky-400 font-mono truncate">
              {calculatedStats.energyRecharge}%
            </div>
          </div>
          <div className="bg-slate-950 p-2 sm:p-2.5 rounded-xl border border-slate-850">
            <div className="text-[10px] sm:text-[11px] text-slate-400 truncate">元素熟知</div>
            <div className="text-xs sm:text-base font-bold text-emerald-400 font-mono truncate">
              {calculatedStats.elementalMastery}
            </div>
          </div>
          <div className="bg-slate-950 p-2 sm:p-2.5 rounded-xl border border-slate-850 col-span-3 sm:col-span-1">
            <div className="text-[10px] sm:text-[11px] text-slate-400 truncate">会心スコア(CV)</div>
            <div className="text-xs sm:text-base font-bold text-purple-400 font-mono truncate">
              {calculatedStats.cv} CV
            </div>
          </div>
        </div>
      </div>

      {/* 不足ステータス・ギャップ分析セクション */}
      <StatGapAnalysis
        character={character}
        currentStats={calculatedStats}
        gaps={gapAnalysis.gaps}
        overallScore={gapAnalysis.overallScore}
        recommendations={gapAnalysis.recommendations}
      />

      {/* 聖遺物選択モーダル */}
      {slotToEquip && (
        <ArtifactSelectionModal
          slot={slotToEquip}
          character={character}
          artifacts={artifacts}
          onSelect={handleEquip}
          onClose={() => setSlotToEquip(null)}
          characters={characters}
        />
      )}

      {/* 武器ステータス設定モーダル */}
      {isWeaponModalOpen && character && (
        <WeaponConfigModal
          isOpen={isWeaponModalOpen}
          onClose={() => setIsWeaponModalOpen(false)}
          character={character}
          currentWeapon={currentWeapon}
          onSaveWeapon={(weapon) => {
            if (onUpdateWeapon) {
              onUpdateWeapon(character.id, weapon);
            }
          }}
        />
      )}
    </div>
  );
}

interface ArtifactSelectionModalProps {
  slot: ArtifactSlot;
  character: Character;
  artifacts: Artifact[];
  characters: Character[];
  onSelect: (art: Artifact) => void;
  onClose: () => void;
}

function ArtifactSelectionModal({
  slot,
  character,
  artifacts,
  characters,
  onSelect,
  onClose,
}: ArtifactSelectionModalProps) {
  const slotInfo = ARTIFACT_SLOT_NAMES[slot];
  const pool = artifacts.filter((a) => a.slot === slot);

  const rec = character.recommendedBuild;
  const isRecommendedMain = (type: string) => {
    if (slot === 'sands') return rec.recommendedMainStats.sands.includes(type as any);
    if (slot === 'goblet') return rec.recommendedMainStats.goblet.includes(type as any);
    if (slot === 'circlet') return rec.recommendedMainStats.circlet.includes(type as any);
    return true;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* モーダルヘッダー */}
        <div className="flex items-center justify-between p-3.5 sm:p-5 border-b border-slate-800 sticky top-0 bg-slate-900/95 backdrop-blur z-10">
          <div>
            <h3 className="text-sm sm:text-lg font-bold text-slate-100 flex items-center gap-1.5">
              <span>{slotInfo.icon}</span>
              <span>{character.japaneseName} に装備する {slotInfo.ja} を選択</span>
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
              所持聖遺物一覧（推奨メインにはマーク表示）
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 聖遺物グリッド */}
        <div className="p-3 sm:p-5 flex-1">
          {pool.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              所持している {slotInfo.ja} がありません。「聖遺物管理」タブから新しく登録してください。
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3.5">
              {pool.map((art) => {
                const isRecMain = isRecommendedMain(art.mainStat.type);
                const isEquippedHere = art.equippedToCharacterId === character.id;

                return (
                  <div
                    key={art.id}
                    className={`relative rounded-xl border p-1 transition ${
                      isEquippedHere
                        ? 'border-emerald-500/50 bg-emerald-500/5'
                        : isRecMain
                        ? 'border-amber-500/40'
                        : 'border-slate-800'
                    }`}
                  >
                    {isRecMain && (
                      <span className="absolute -top-2 left-3 z-10 text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-bold shadow-md">
                        推奨メインステータス
                      </span>
                    )}
                    <ArtifactCard
                      artifact={art}
                      characters={characters}
                      onSelect={() => onSelect(art)}
                    />
                    <button
                      onClick={() => onSelect(art)}
                      className={`w-full mt-1.5 py-1.5 text-xs font-bold rounded-lg transition ${
                        isEquippedHere
                          ? 'bg-slate-800 text-slate-400 cursor-default'
                          : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                      }`}
                    >
                      {isEquippedHere ? '現在装備中' : 'この聖遺物を装備する'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

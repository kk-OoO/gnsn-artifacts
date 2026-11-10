'use client';

import React, { useState, useMemo } from 'react';
import { Artifact, ArtifactSlot, Character } from '@/types/genshin';
import { ARTIFACT_SETS, ARTIFACT_SLOT_NAMES } from '@/data/artifactSets';
import { ArtifactCard } from './ArtifactCard';
import { calculateSubStatCV } from '@/utils/artifactCalculator';
import { Plus, Search, Filter, Sparkles, Layers } from 'lucide-react';

interface ArtifactListProps {
  artifacts: Artifact[];
  characters: Character[];
  onAddNew: () => void;
  onEdit: (artifact: Artifact) => void;
  onDelete: (id: string) => void;
}

export function ArtifactList({
  artifacts,
  characters,
  onAddNew,
  onEdit,
  onDelete,
}: ArtifactListProps) {
  const [selectedSlot, setSelectedSlot] = useState<ArtifactSlot | 'all'>('all');
  const [selectedSet, setSelectedSet] = useState<string>('all');
  const [equipFilter, setEquipFilter] = useState<'all' | 'unassigned' | 'equipped'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'cv' | 'level' | 'date'>('cv');

  // フィルタリング & ソート
  const filteredArtifacts = useMemo(() => {
    return artifacts
      .filter((art) => {
        // 部位
        if (selectedSlot !== 'all' && art.slot !== selectedSlot) return false;
        // セット
        if (selectedSet !== 'all' && art.setId !== selectedSet) return false;
        // 装備状態
        if (equipFilter === 'unassigned' && art.equippedToCharacterId) return false;
        if (equipFilter === 'equipped' && !art.equippedToCharacterId) return false;
        // 検索クエリ
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const setName = ARTIFACT_SETS[art.setId]?.name.toLowerCase() || '';
          const charName =
            characters
              .find((c) => c.id === art.equippedToCharacterId)
              ?.japaneseName.toLowerCase() || '';
          const slotJa = ARTIFACT_SLOT_NAMES[art.slot]?.ja.toLowerCase() || '';
          if (
            !setName.includes(q) &&
            !charName.includes(q) &&
            !slotJa.includes(q) &&
            !art.mainStat.type.toLowerCase().includes(q)
          ) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'cv') {
          return calculateSubStatCV(b) - calculateSubStatCV(a);
        }
        if (sortBy === 'level') {
          return b.level - a.level;
        }
        return b.createdAt - a.createdAt;
      });
  }, [
    artifacts,
    selectedSlot,
    selectedSet,
    equipFilter,
    searchQuery,
    sortBy,
    characters,
  ]);

  // 統計情報
  const stats = useMemo(() => {
    const total = artifacts.length;
    const godCount = artifacts.filter(
      (a) => calculateSubStatCV(a) >= 40
    ).length;
    const goodCount = artifacts.filter((a) => {
      const cv = calculateSubStatCV(a);
      return cv >= 30 && cv < 40;
    }).length;
    const unequippedCount = artifacts.filter(
      (a) => !a.equippedToCharacterId
    ).length;
    return { total, godCount, goodCount, unequippedCount };
  }, [artifacts]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 統計バナー */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 sm:p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[11px] sm:text-xs text-slate-400">登録聖遺物</div>
            <div className="text-lg sm:text-xl font-black text-slate-100">{stats.total} 個</div>
          </div>
          <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 sm:p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[11px] sm:text-xs text-amber-400/90 font-medium">神聖遺物 (CV 40+)</div>
            <div className="text-lg sm:text-xl font-black text-amber-300">{stats.godCount} 個</div>
          </div>
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 sm:p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[11px] sm:text-xs text-purple-400/90 font-medium">優秀 (CV 30-39)</div>
            <div className="text-lg sm:text-xl font-black text-purple-300">{stats.goodCount} 個</div>
          </div>
          <span className="text-base sm:text-lg">💎</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 sm:p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[11px] sm:text-xs text-emerald-400/90 font-medium">未装備（フリー）</div>
            <div className="text-lg sm:text-xl font-black text-emerald-300">
              {stats.unequippedCount} 個
            </div>
          </div>
          <span className="text-base sm:text-lg">🎒</span>
        </div>
      </div>

      {/* フィルター＆検索ツールバー */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:p-4 space-y-3 sm:space-y-4 shadow-lg">
        {/* 上段：部位タブ & 新規登録ボタン */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
          {/* 部位切り替えピル */}
          <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none -mx-1 px-1">
            <button
              onClick={() => setSelectedSlot('all')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                selectedSlot === 'all'
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              すべて ({artifacts.length})
            </button>
            {(
              ['flower', 'plume', 'sands', 'goblet', 'circlet'] as ArtifactSlot[]
            ).map((s) => {
              const info = ARTIFACT_SLOT_NAMES[s];
              const count = artifacts.filter((a) => a.slot === s).length;
              const active = selectedSlot === s;
              return (
                <button
                  key={s}
                  onClick={() => setSelectedSlot(s)}
                  className={`px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition flex items-center gap-1 ${
                    active
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  <span>{info.icon}</span>
                  <span className="hidden xs:inline">{info.ja}</span>
                  <span className="xs:hidden">{info.ja.slice(0, 1)}</span>
                  <span className="text-[10px] opacity-75 font-mono">({count})</span>
                </button>
              );
            })}
          </div>

          {/* 新規登録ボタン */}
          <button
            onClick={onAddNew}
            className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-amber-500/20 transition whitespace-nowrap w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            <span>聖遺物を登録</span>
          </button>
        </div>

        {/* 下段：詳細絞り込み＆ソート */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5 pt-2 border-t border-slate-800/80">
          {/* 検索入力 */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="セット・キャラ名等で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 sm:py-1.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* セット選択 */}
          <select
            value={selectedSet}
            onChange={(e) => setSelectedSet(e.target.value)}
            className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 sm:py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
          >
            <option value="all">すべてのセット</option>
            {Object.values(ARTIFACT_SETS).map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* 装備状態 */}
          <select
            value={equipFilter}
            onChange={(e) =>
              setEquipFilter(e.target.value as 'all' | 'unassigned' | 'equipped')
            }
            className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 sm:py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
          >
            <option value="all">装備状態: すべて</option>
            <option value="unassigned">未装備のみ</option>
            <option value="equipped">キャラ装備中のみ</option>
          </select>

          {/* ソート順 */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'cv' | 'level' | 'date')}
            className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 sm:py-1.5 text-xs text-amber-300 font-medium focus:outline-none focus:border-amber-400"
          >
            <option value="cv">会心スコア(CV) 降順</option>
            <option value="level">強化レベル 降順</option>
            <option value="date">登録日時 新しい順</option>
          </select>
        </div>
      </div>

      {/* 聖遺物カードグリッド */}
      {filteredArtifacts.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl">
          <p className="text-slate-400 text-sm">
            条件に一致する聖遺物が見つかりませんでした。
          </p>
          <button
            onClick={() => {
              setSelectedSlot('all');
              setSelectedSet('all');
              setEquipFilter('all');
              setSearchQuery('');
            }}
            className="mt-3 text-xs text-amber-400 hover:underline"
          >
            フィルターをリセット
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {filteredArtifacts.map((art) => (
            <ArtifactCard
              key={art.id}
              artifact={art}
              characters={characters}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { Character, ElementType } from '@/types/genshin';
import {
  Users,
  CheckCircle2,
  Circle,
  Search,
  Crown,
  Sparkles,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';

interface CharacterOwnershipSettingsProps {
  characters: Character[];
  ownedCharacterIds: string[];
  onUpdateOwnedCharacters: (ids: string[]) => void;
  satisfiedCharacterIds: string[];
  onToggleSatisfied: (charId: string) => void;
  onlyOwnedFilter: boolean;
  onToggleOnlyOwnedFilter: (enabled: boolean) => void;
}

const ELEMENT_INFO: Record<
  ElementType,
  { ja: string; color: string; border: string; bg: string }
> = {
  pyro: { ja: '炎', color: 'text-red-400', border: 'border-red-500/40', bg: 'bg-red-500/10' },
  hydro: { ja: '水', color: 'text-sky-400', border: 'border-sky-500/40', bg: 'bg-sky-500/10' },
  anemo: { ja: '風', color: 'text-teal-400', border: 'border-teal-500/40', bg: 'bg-teal-500/10' },
  electro: { ja: '雷', color: 'text-purple-400', border: 'border-purple-500/40', bg: 'bg-purple-500/10' },
  dendro: { ja: '草', color: 'text-emerald-400', border: 'border-emerald-500/40', bg: 'bg-emerald-500/10' },
  cryo: { ja: '氷', color: 'text-cyan-300', border: 'border-cyan-400/40', bg: 'bg-cyan-500/10' },
  geo: { ja: '岩', color: 'text-amber-400', border: 'border-amber-500/40', bg: 'bg-amber-500/10' },
};

export function CharacterOwnershipSettings({
  characters,
  ownedCharacterIds,
  onUpdateOwnedCharacters,
  satisfiedCharacterIds,
  onToggleSatisfied,
  onlyOwnedFilter,
  onToggleOnlyOwnedFilter,
}: CharacterOwnershipSettingsProps) {
  const [selectedElement, setSelectedElement] = useState<ElementType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [rarityFilter, setRarityFilter] = useState<'all' | '5' | '4'>('all');

  // 単一キャラの所持切り替え
  const toggleOwnership = (charId: string) => {
    if (ownedCharacterIds.includes(charId)) {
      onUpdateOwnedCharacters(ownedCharacterIds.filter((id) => id !== charId));
    } else {
      onUpdateOwnedCharacters([...ownedCharacterIds, charId]);
    }
  };

  // 全選択
  const selectAll = () => {
    onUpdateOwnedCharacters(characters.map((c) => c.id));
  };

  // 全解除
  const deselectAll = () => {
    onUpdateOwnedCharacters([]);
  };

  // 特定元素の一括トグル
  const toggleElementAll = (element: ElementType) => {
    const elementCharIds = characters
      .filter((c) => c.element === element)
      .map((c) => c.id);
    const allSelected = elementCharIds.every((id) =>
      ownedCharacterIds.includes(id)
    );

    if (allSelected) {
      // その元素をすべて解除
      onUpdateOwnedCharacters(
        ownedCharacterIds.filter((id) => !elementCharIds.includes(id))
      );
    } else {
      // その元素をすべて追加
      const newIds = new Set([...ownedCharacterIds, ...elementCharIds]);
      onUpdateOwnedCharacters(Array.from(newIds));
    }
  };

  // フィルタリング
  const filteredCharacters = characters.filter((c) => {
    if (selectedElement !== 'all' && c.element !== selectedElement) return false;
    if (rarityFilter !== 'all' && c.rarity.toString() !== rarityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (
        !c.japaneseName.toLowerCase().includes(q) &&
        !c.name.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 設定概要 & 操作ツールバー */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-amber-500/20 text-amber-300 rounded-lg">
                <Users className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold text-slate-100">
                所持キャラクター設定
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              持っているキャラにチェックを入れることで、装備シミュレーターやガイドに未所持キャラが出ないように設定できます
            </p>
          </div>

          {/* 所持カウンター */}
          <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">所持キャラ数:</span>
            <span className="text-xl font-black text-amber-300">
              {ownedCharacterIds.length}{' '}
              <span className="text-xs text-slate-500 font-normal">
                / {characters.length}人
              </span>
            </span>
          </div>
        </div>

        {/* 表示連動設定トグル */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-slate-950/80 rounded-xl border border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <SlidersHorizontal className="w-4 h-4 text-amber-400" />
            <div>
              <span className="text-xs font-bold text-slate-200">
                「所持キャラクターのみ表示」フィルター
              </span>
              <p className="text-[11px] text-slate-400">
                ONにすると、装備シミュレーターのキャラ選択やビルドガイドに所持キャラのみが表示されます
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={onlyOwnedFilter}
              onChange={(e) => onToggleOnlyOwnedFilter(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-400"></div>
            <span className="ml-2 text-xs font-bold text-slate-300">
              {onlyOwnedFilter ? '有効' : '無効'}
            </span>
          </label>
        </div>

        {/* フィルター＆一括操作 */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          {/* 元素フィルター */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedElement('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                selectedElement === 'all'
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              全元素
            </button>
            {(Object.keys(ELEMENT_INFO) as ElementType[]).map((el) => {
              const info = ELEMENT_INFO[el];
              const active = selectedElement === el;
              return (
                <button
                  key={el}
                  onClick={() => setSelectedElement(el)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition border ${
                    active
                      ? `${info.bg} ${info.border} ${info.color} ring-1 ring-amber-400`
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {info.ja}
                </button>
              );
            })}
          </div>

          {/* 検索入力 */}
          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="キャラ名で絞り込み..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* 一括選択ボタン */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80 flex-wrap text-xs">
          <button
            onClick={selectAll}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition"
          >
            全員を所持にする
          </button>
          <button
            onClick={deselectAll}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 font-medium transition"
          >
            すべてのチェックを外す
          </button>
          {selectedElement !== 'all' && (
            <button
              onClick={() => toggleElementAll(selectedElement)}
              className="px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 font-medium transition"
            >
              {ELEMENT_INFO[selectedElement].ja}元素キャラを一括選択/解除
            </button>
          )}
        </div>
      </div>

      {/* キャラクター選択グリッド */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {filteredCharacters.map((char) => {
          const isOwned = ownedCharacterIds.includes(char.id);
          const isSatisfied = satisfiedCharacterIds.includes(char.id);
          const elInfo = ELEMENT_INFO[char.element] || ELEMENT_INFO.anemo;

          return (
            <div
              key={char.id}
              onClick={() => toggleOwnership(char.id)}
              className={`relative rounded-2xl border p-3 flex flex-col items-center justify-between cursor-pointer transition-all duration-200 group select-none ${
                isOwned
                  ? 'bg-slate-900 border-slate-700 hover:border-amber-400 shadow-md'
                  : 'bg-slate-950/60 border-slate-800/60 opacity-45 hover:opacity-75'
              }`}
            >
              {/* 所持チェックアイコン */}
              <div className="absolute top-2.5 left-2.5 z-10">
                {isOwned ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 drop-shadow" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-600" />
                )}
              </div>

              {/* 満足マーク（王冠）トグルボタン */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSatisfied(char.id);
                }}
                className={`absolute top-2.5 right-2.5 z-10 p-1 rounded-lg transition ${
                  isSatisfied
                    ? 'text-amber-300 bg-amber-500/20 shadow-md ring-1 ring-amber-400/50'
                    : 'text-slate-600 hover:text-slate-400 hover:bg-slate-800'
                }`}
                title={
                  isSatisfied
                    ? '育成・厳選満足マーク（クリックで解除）'
                    : 'このキャラに満足・厳選完了マークを付ける'
                }
              >
                <Crown className="w-4 h-4" />
              </button>

              {/* キャラクター公式アバター写真 */}
              <div
                className={`relative w-16 h-16 rounded-2xl overflow-hidden border-2 mt-2 mb-2 shadow-inner flex items-center justify-center ${
                  char.rarity === 5
                    ? 'border-amber-400/80 bg-gradient-to-tr from-amber-900/80 to-amber-700/40'
                    : 'border-purple-400/80 bg-gradient-to-tr from-purple-900/80 to-purple-700/40'
                } ${isOwned ? 'group-hover:scale-105 transition duration-200' : 'grayscale'}`}
              >
                {char.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={char.avatarUrl}
                    alt={char.japaneseName}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xl font-black text-amber-300">
                    {char.japaneseName.slice(0, 1)}
                  </span>
                )}
              </div>

              {/* 名前 & バッジ */}
              <div className="text-center w-full">
                <div className="font-bold text-xs text-slate-100 truncate w-full">
                  {char.japaneseName}
                </div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-semibold border ${elInfo.bg} ${elInfo.border} ${elInfo.color}`}
                  >
                    {elInfo.ja}
                  </span>
                  <span className="text-[9px] text-slate-400">
                    ★{char.rarity}
                  </span>
                </div>
                {isSatisfied && (
                  <div className="mt-1 flex items-center justify-center gap-1 text-[9px] font-bold text-amber-300 bg-amber-500/10 rounded py-0.5 border border-amber-500/20">
                    <Crown className="w-3 h-3 text-amber-400" />
                    <span>厳選満足</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

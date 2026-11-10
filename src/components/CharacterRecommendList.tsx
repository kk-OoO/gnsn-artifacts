'use client';

import React, { useState } from 'react';
import { Character, ElementType } from '@/types/genshin';
import { ARTIFACT_SETS, STAT_DISPLAY_NAMES } from '@/data/artifactSets';
import {
  Sparkles,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface CharacterRecommendListProps {
  characters: Character[];
  onSelectCharacterForEquip: (charId: string) => void;
}

const ELEMENT_INFO: Record<ElementType, { ja: string; color: string; border: string; bg: string }> = {
  pyro: { ja: '炎', color: 'text-red-400', border: 'border-red-500/40', bg: 'bg-red-500/10' },
  hydro: { ja: '水', color: 'text-sky-400', border: 'border-sky-500/40', bg: 'bg-sky-500/10' },
  anemo: { ja: '風', color: 'text-teal-400', border: 'border-teal-500/40', bg: 'bg-teal-500/10' },
  electro: { ja: '雷', color: 'text-purple-400', border: 'border-purple-500/40', bg: 'bg-purple-500/10' },
  dendro: { ja: '草', color: 'text-emerald-400', border: 'border-emerald-500/40', bg: 'bg-emerald-500/10' },
  cryo: { ja: '氷', color: 'text-cyan-300', border: 'border-cyan-400/40', bg: 'bg-cyan-500/10' },
  geo: { ja: '岩', color: 'text-amber-400', border: 'border-amber-500/40', bg: 'bg-amber-500/10' },
};

export function CharacterRecommendList({
  characters,
  onSelectCharacterForEquip,
}: CharacterRecommendListProps) {
  const [selectedElement, setSelectedElement] = useState<ElementType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCharId, setExpandedCharId] = useState<string | null>(null);

  const filteredCharacters = characters.filter((c) => {
    if (selectedElement !== 'all' && c.element !== selectedElement) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!c.japaneseName.toLowerCase().includes(q) && !c.name.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  const toggleExpand = (id: string) => {
    setExpandedCharId(expandedCharId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* フィルターバー */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* 元素フィルター */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedElement('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                selectedElement === 'all'
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              全元素 ({characters.length})
            </button>
            {(Object.keys(ELEMENT_INFO) as ElementType[]).map((el) => {
              const info = ELEMENT_INFO[el];
              const active = selectedElement === el;
              const count = characters.filter((c) => c.element === el).length;
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
                  {info.ja} ({count})
                </button>
              );
            })}
          </div>

          {/* 検索バー */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="キャラ名で検索 (全126人)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>
      </div>

      {/* キャラクター推奨ガイドカード一覧 */}
      <div className="grid grid-cols-1 gap-3.5">
        {filteredCharacters.map((char) => {
          const elInfo = ELEMENT_INFO[char.element] || ELEMENT_INFO.anemo;
          const isExpanded = expandedCharId === char.id;
          const rec = char.recommendedBuild;
          const bestSet = ARTIFACT_SETS[rec.recommendedSets[0]?.setId];

          return (
            <div
              key={char.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden shadow-xl transition-all"
            >
              {/* カードヘッダー */}
              <div
                onClick={() => toggleExpand(char.id)}
                className="p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-850/50 transition"
              >
                <div className="flex items-center gap-3">
                  {/* アバター写真 */}
                  <div
                    className={`relative w-12 h-12 rounded-xl overflow-hidden border-2 flex items-center justify-center flex-shrink-0 shadow-md ${
                      char.rarity === 5
                        ? 'border-amber-400/80 bg-gradient-to-tr from-amber-900/80 to-amber-700/40'
                        : 'border-purple-400/80 bg-gradient-to-tr from-purple-900/80 to-purple-700/40'
                    }`}
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
                      <span className="font-black text-amber-300">
                        {char.japaneseName.slice(0, 1)}
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm sm:text-base font-bold text-slate-100">
                        {char.japaneseName}
                      </h3>
                      <span className="text-xs text-slate-400 font-normal">
                        ({char.name})
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${elInfo.bg} ${elInfo.border} ${elInfo.color}`}
                      >
                        {elInfo.ja}元素
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                        {char.role}
                      </span>
                    </div>

                    {/* 最適聖遺物セットの要約 */}
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                      <span className="text-amber-400 font-semibold flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        おすすめセット:
                      </span>
                      <span className="text-slate-200 font-medium">
                        {bestSet?.name || rec.recommendedSets[0]?.setId}
                      </span>
                      {rec.recommendedSets[1] && (
                        <span className="text-slate-400 text-[11px] hidden sm:inline">
                          / 次点:{' '}
                          {ARTIFACT_SETS[rec.recommendedSets[1].setId]?.name ||
                            rec.recommendedSets[1].setId}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCharacterForEquip(char.id);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-xl text-xs font-bold transition shadow-sm"
                  >
                    <span>装備・分析へ</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    className="p-1.5 text-slate-400 hover:text-slate-200"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* 展開された詳細情報 */}
              {isExpanded && (
                <div className="p-4 sm:p-5 border-t border-slate-800/80 bg-slate-950/60 space-y-4 animate-in slide-in-from-top-2 duration-200">
                  {/* 推奨聖遺物セットの詳細（写真付き） */}
                  <div>
                    <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      推奨聖遺物セット詳細
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {rec.recommendedSets.map((s, idx) => {
                        const setDef = ARTIFACT_SETS[s.setId];
                        const artImg =
                          setDef?.images?.flower ||
                          setDef?.images?.circlet ||
                          setDef?.images?.plume;

                        return (
                          <div
                            key={s.setId}
                            className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex gap-3"
                          >
                            {/* 聖遺物の写真 */}
                            {artImg && (
                              <div className="w-12 h-12 rounded-lg bg-slate-950 border border-slate-800 p-0.5 flex-shrink-0 flex items-center justify-center">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={artImg}
                                  alt={setDef?.name || s.setId}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                            )}

                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-slate-100 text-sm">
                                  {idx === 0 ? '👑 最適: ' : '🥈 次点: '}
                                  {setDef?.name || s.setId}
                                </span>
                              </div>
                              <p className="text-xs text-amber-200/80 mb-2">
                                {s.description}
                              </p>
                              {setDef && (
                                <div className="space-y-1 text-[11px] text-slate-400 bg-slate-950/60 p-2 rounded-lg border border-slate-850">
                                  <div>
                                    <span className="text-slate-300 font-semibold">
                                      [2P]
                                    </span>{' '}
                                    {setDef.piece2}
                                  </div>
                                  <div>
                                    <span className="text-slate-300 font-semibold">
                                      [4P]
                                    </span>{' '}
                                    {setDef.piece4}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 推奨メインステータス & 優先サブステ */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* メインステータス */}
                    <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                        推奨メインステータス (時計・杯・冠)
                      </h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-850">
                          <span className="text-slate-400">⏳ 時の砂</span>
                          <span className="font-semibold text-amber-300">
                            {rec.recommendedMainStats.sands
                              .map((m) => STAT_DISPLAY_NAMES[m]?.label || m)
                              .join(' / ')}
                          </span>
                        </div>
                        <div className="flex items-center justify-between bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-850">
                          <span className="text-slate-400">🍷 空の杯</span>
                          <span className="font-semibold text-amber-300">
                            {rec.recommendedMainStats.goblet
                              .map((m) => STAT_DISPLAY_NAMES[m]?.label || m)
                              .join(' / ')}
                          </span>
                        </div>
                        <div className="flex items-center justify-between bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-850">
                          <span className="text-slate-400">👑 理の冠</span>
                          <span className="font-semibold text-amber-300">
                            {rec.recommendedMainStats.circlet
                              .map((m) => STAT_DISPLAY_NAMES[m]?.label || m)
                              .join(' / ')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 優先サブステータス */}
                    <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                        優先サブステータス
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {rec.subStatPriority.map((sub, idx) => {
                          const subInfo = STAT_DISPLAY_NAMES[sub];
                          return (
                            <span
                              key={sub}
                              className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 ${
                                idx < 2
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                                  : 'bg-slate-950 text-slate-300 border border-slate-800'
                              }`}
                            >
                              <span className="text-[10px] text-slate-400">
                                #{idx + 1}
                              </span>
                              <span>{subInfo?.label || sub}</span>
                            </span>
                          );
                        })}
                      </div>

                      {/* 目標ステータス指標 */}
                      <div className="mt-3 pt-2.5 border-t border-slate-800">
                        <span className="text-[11px] font-semibold text-slate-400">
                          ビルド目標目安:
                        </span>
                        <div className="grid grid-cols-2 gap-1.5 mt-1.5 text-[11px]">
                          {Object.entries(rec.targetStats).map(([key, target]) => {
                            if (!target) return null;
                            const statLabel =
                              key === 'hp'
                                ? 'HP'
                                : key === 'atk'
                                ? '攻撃力'
                                : key === 'critRate'
                                ? '会心率'
                                : key === 'critDamage'
                                ? '会心ダメージ'
                                : key === 'energyRecharge'
                                ? '元チャ'
                                : key === 'elementalMastery'
                                ? '熟知'
                                : key;
                            return (
                              <div
                                key={key}
                                className="bg-slate-950/80 px-2 py-1 rounded border border-slate-850 flex justify-between"
                              >
                                <span className="text-slate-400">{statLabel}</span>
                                <span className="text-slate-200 font-mono font-bold">
                                  {target.min}
                                  {target.unit} 〜 {target.ideal}
                                  {target.unit}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 育成・運用のコツ */}
                  {rec.buildTips.length > 0 && (
                    <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                        💡 ビルド・運用のポイント
                      </h4>
                      <ul className="space-y-1 text-xs text-slate-400">
                        {rec.buildTips.map((tip, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-amber-400">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { StatGap, Character, CalculatedStats } from '@/types/genshin';
import { StatGapRadar } from './StatGapRadar';
import {
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  Lightbulb,
} from 'lucide-react';

interface StatGapAnalysisProps {
  character: Character;
  currentStats: CalculatedStats;
  gaps: StatGap[];
  overallScore: number;
  recommendations: string[];
}

export function StatGapAnalysis({
  character,
  currentStats,
  gaps,
  overallScore,
  recommendations,
}: StatGapAnalysisProps) {
  // 不足ステータスと達成ステータスを分類
  const insufficientGaps = gaps.filter((g) => g.status === 'insufficient');
  const excessiveGaps = gaps.filter((g) => g.status === 'excessive');
  const goodGaps = gaps.filter(
    (g) => g.status === 'good' || g.status === 'optimal'
  );

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10';
    if (score >= 70) return 'text-yellow-400 border-yellow-500/50 bg-yellow-500/10';
    if (score >= 50) return 'text-amber-400 border-amber-500/50 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/50 bg-rose-500/10';
  };

  return (
    <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-5 shadow-xl backdrop-blur-md">
      {/* ヘッダー＆総合スコア */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-yellow-500/20 text-yellow-400 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-bold text-slate-100">
              ステータス達成度 & ギャップ分析
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {character.japaneseName} の理想ビルド目標との比較・過不足ステータス
          </p>
        </div>

        {/* 総合ビルドスコアバッジ */}
        <div
          className={`flex items-center gap-3 px-4 py-2 rounded-xl border ${getScoreColor(
            overallScore
          )}`}
        >
          <div className="text-right">
            <div className="text-xs font-medium uppercase tracking-wider opacity-80">
              目標達成スコア
            </div>
            <div className="text-2xl font-black">{overallScore} / 100</div>
          </div>
          <div className="text-2xl font-bold">
            {overallScore >= 90
              ? '👑'
              : overallScore >= 75
              ? '✨'
              : overallScore >= 50
              ? '👍'
              : '⚠️'}
          </div>
        </div>
      </div>

      {/* レーダーチャート & 不足サマリー */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-5 items-center">
        {/* レーダーチャート (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center bg-slate-950/40 rounded-xl p-3 border border-slate-800/80">
          <div className="text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            ステータスバランス・レーダー
          </div>
          <StatGapRadar gaps={gaps} size={280} />
        </div>

        {/* 重要不足ステータス通知 (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          {insufficientGaps.length === 0 && excessiveGaps.length === 0 ? (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-emerald-300 text-sm">
                  すべての主要目標ステータスを達成しています！
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  現在の聖遺物構成でキャラクターの性能を極めて高く引き出せています。さらなる理想値を目指してサブステの厳選を進めましょう。
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {insufficientGaps.length > 0 && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-xs mb-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>目標未達ステータス ({insufficientGaps.length}件)</span>
                  </div>
                  <div className="space-y-1.5">
                    {insufficientGaps.map((g) => (
                      <div
                        key={g.statKey}
                        className="flex items-center justify-between text-xs bg-slate-950/50 px-2.5 py-1.5 rounded-lg border border-rose-500/20"
                      >
                        <span className="font-medium text-slate-200">
                          {g.statName}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">
                            現在 {g.current}
                            {g.unit} / 目標 {g.targetMin}
                            {g.unit}
                          </span>
                          <span className="text-rose-400 font-bold bg-rose-500/20 px-1.5 py-0.5 rounded">
                            -{(g.targetMin - g.current).toFixed(g.unit === '%' ? 1 : 0)}
                            {g.unit} 不足
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {excessiveGaps.length > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs mb-1.5">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>過剰・溢れ注意ステータス</span>
                  </div>
                  {excessiveGaps.map((g) => (
                    <p key={g.statKey} className="text-xs text-amber-200/90 leading-relaxed">
                      {g.advice}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 会心スコアサマリー */}
          <div className="flex items-center justify-between bg-slate-950/60 px-4 py-2.5 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400">聖遺物合計会心スコア (CV)</span>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400 font-semibold">
                {currentStats.cv >= 200
                  ? '神聖遺物 (200+)'
                  : currentStats.cv >= 160
                  ? '良ビルド (160+)'
                  : '厳選途中'}
              </span>
              <span className="text-base font-black text-amber-300">
                {currentStats.cv} CV
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 各ステータスの詳細ゲージ一覧 */}
      <div className="mt-6">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          各ステータスの達成度詳細
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {gaps.map((g) => {
            const isInsufficient = g.status === 'insufficient';
            const isExcessive = g.status === 'excessive';
            const isOptimal = g.status === 'optimal';

            return (
              <div
                key={g.statKey}
                className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 hover:border-slate-700 transition"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-slate-200">
                      {g.statName}
                    </span>
                    {isInsufficient && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                        不足
                      </span>
                    )}
                    {isOptimal && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        理想達成
                      </span>
                    )}
                    {isExcessive && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        過剰
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-bold text-slate-300">
                    <span
                      className={
                        isInsufficient
                          ? 'text-rose-400'
                          : isOptimal
                          ? 'text-emerald-400'
                          : 'text-amber-400'
                      }
                    >
                      {g.current}
                      {g.unit}
                    </span>
                    <span className="text-slate-500 text-[11px] font-normal ml-1">
                      / 目標 {g.targetMin}
                      {g.unit} (理想: {g.targetIdeal}
                      {g.unit})
                    </span>
                  </div>
                </div>

                {/* プログレスバー */}
                <div className="w-full bg-slate-800/80 rounded-full h-2 relative overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isInsufficient
                        ? 'bg-rose-500'
                        : isOptimal
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        : isExcessive
                        ? 'bg-amber-500'
                        : 'bg-gradient-to-r from-yellow-500 to-amber-400'
                    }`}
                    style={{
                      width: `${Math.min(100, (g.current / g.targetIdeal) * 100)}%`,
                    }}
                  />
                  {/* 最低目標ライン（targetMin / targetIdeal の位置） */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-yellow-300 shadow-sm"
                    style={{
                      left: `${Math.min(95, (g.targetMin / g.targetIdeal) * 100)}%`,
                    }}
                    title={`最低目標: ${g.targetMin}${g.unit}`}
                  />
                </div>

                <div className="text-[11px] text-slate-400 mt-1.5 leading-snug">
                  {g.advice}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 改善アドバイス・推奨事項 */}
      {recommendations.length > 0 && (
        <div className="mt-5 p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30">
          <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs mb-2">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span>ビルド改善のための具体的なアドバイス</span>
          </div>
          <ul className="space-y-1.5">
            {recommendations.map((rec, idx) => (
              <li
                key={idx}
                className="text-xs text-slate-300 flex items-start gap-2"
              >
                <span className="text-indigo-400 font-bold mt-0.5">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* キャラの固有育成ヒント */}
      {character.recommendedBuild.buildTips.length > 0 && (
        <div className="mt-4 p-4 rounded-xl bg-slate-950/40 border border-slate-800">
          <h5 className="text-xs font-bold text-yellow-400/90 mb-2">
            💡 {character.japaneseName} の育成ワンポイントメモ
          </h5>
          <ul className="space-y-1">
            {character.recommendedBuild.buildTips.map((tip, idx) => (
              <li key={idx} className="text-xs text-slate-400 flex items-start gap-1.5">
                <span className="text-yellow-500/80">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

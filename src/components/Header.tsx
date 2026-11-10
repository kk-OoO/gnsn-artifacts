'use client';

import React from 'react';
import {
  Sparkles,
  Layers,
  BookOpen,
  UserCheck,
  RotateCcw,
  Download,
  Upload,
  Users,
} from 'lucide-react';
import { Artifact } from '@/types/genshin';

export type ActiveTab = 'manage' | 'recommend' | 'equip' | 'characters';

interface HeaderProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onResetData: () => void;
  onLoadSamples?: () => void;
  artifacts: Artifact[];
  onImportData: (artifacts: Artifact[]) => void;
  ownedCount?: number;
  satisfiedCount?: number;
}

export function Header({
  activeTab,
  onSelectTab,
  onResetData,
  onLoadSamples,
  artifacts,
  onImportData,
  ownedCount,
  satisfiedCount,
}: HeaderProps) {
  // JSONエクスポート
  const handleExport = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(artifacts, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `genshin_artifacts_backup_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // JSONインポート
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          onImportData(imported);
          alert(`${imported.length}件の聖遺物データをインポートしました！`);
        } else {
          alert('不正なデータ形式です。');
        }
      } catch {
        alert('JSONファイルの読み込みに失敗しました。');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* ロゴ & タイトル */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20 text-lg">
              ✨
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400">
                原神 聖遺物マネージャー
              </h1>
              <p className="text-[10px] text-slate-400 font-medium">
                聖遺物管理・最適ビルド推奨・装備シミュレーター & ギャップ分析
              </p>
            </div>
          </div>

          {/* 右側アクション：データ保存・初期化 */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={handleExport}
              className="p-2 sm:px-2.5 sm:py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-slate-800 transition flex items-center gap-1.5"
              title="聖遺物データをJSONでエクスポート"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">書き出し</span>
            </button>

            <label
              className="p-2 sm:px-2.5 sm:py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-slate-800 transition flex items-center gap-1.5 cursor-pointer"
              title="JSONから聖遺物データを復元"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">読み込み</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>

            {onLoadSamples && artifacts.length === 0 && (
              <button
                onClick={onLoadSamples}
                className="p-2 sm:px-2.5 sm:py-1.5 rounded-lg text-xs text-amber-300 hover:bg-amber-500/10 border border-amber-500/30 transition flex items-center gap-1.5"
                title="テスト用のサンプル聖遺物を読み込む"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">サンプル読込</span>
              </button>
            )}

            <button
              onClick={() => {
                if (confirm('聖遺物データをすべてクリア（削除）しますか？')) {
                  onResetData();
                }
              }}
              className="p-2 sm:px-2.5 sm:py-1.5 rounded-lg text-xs text-slate-400 hover:text-rose-400 hover:bg-slate-900 border border-slate-800 transition flex items-center gap-1.5"
              title="聖遺物データをすべて削除"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">全クリア</span>
            </button>
          </div>
        </div>

        {/* ナビゲーションタブ */}
        <div className="flex items-center gap-2 border-t border-slate-850 pt-2 pb-2">
          <button
            onClick={() => onSelectTab('equip')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
              activeTab === 'equip'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>キャラ装備 & ギャップ分析</span>
          </button>

          <button
            onClick={() => onSelectTab('manage')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
              activeTab === 'manage'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>所持聖遺物の一覧・管理</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeTab === 'manage'
                  ? 'bg-slate-950 text-amber-300'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {artifacts.length}
            </span>
          </button>

          <button
            onClick={() => onSelectTab('recommend')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
              activeTab === 'recommend'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>キャラ最適聖遺物ガイド</span>
          </button>

          <button
            onClick={() => onSelectTab('characters')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
              activeTab === 'characters'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>所持キャラ設定</span>
            {ownedCount !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  activeTab === 'characters'
                    ? 'bg-slate-950 text-amber-300'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {ownedCount}人
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

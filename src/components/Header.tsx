'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Layers,
  BookOpen,
  UserCheck,
  RotateCcw,
  Download,
  Upload,
  Users,
  Database,
  MoreVertical,
} from 'lucide-react';
import { Artifact } from '@/types/genshin';
import { DbInfo } from '@/utils/storage';

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
  dbInfo?: DbInfo | null;
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
  dbInfo,
}: HeaderProps) {
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);

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
    setShowMenuDropdown(false);
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
    setShowMenuDropdown(false);
  };

  return (
    <>
      {/* トップヘッダー */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
            {/* ロゴ & タイトル */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20 text-base sm:text-lg flex-shrink-0">
                ✨
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-sm sm:text-lg font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 truncate">
                    原神 聖遺物マネージャー
                  </h1>
                  {dbInfo && (
                    <span
                      className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold flex-shrink-0"
                      title={dbInfo.type}
                    >
                      <Database className="w-2.5 h-2.5" />
                      <span>{dbInfo.isExternal ? 'Cloud DB' : 'Local DB'}</span>
                    </span>
                  )}
                </div>
                <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium truncate hidden sm:block">
                  聖遺物管理・最適ビルド推奨・装備シミュレーター & ギャップ分析
                </p>
              </div>
            </div>

            {/* 右側アクション：PCは全ボタン表示、スマホはドロップダウン */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {/* PC用アクションボタン */}
              <div className="hidden sm:flex items-center gap-1.5">
                <button
                  onClick={handleExport}
                  className="px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-slate-800 transition flex items-center gap-1"
                  title="聖遺物データをJSONでエクスポート"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>書き出し</span>
                </button>

                <label
                  className="px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-slate-800 transition flex items-center gap-1 cursor-pointer"
                  title="JSONから聖遺物データを復元"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>読み込み</span>
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
                    className="px-2.5 py-1.5 rounded-lg text-xs text-amber-300 hover:bg-amber-500/10 border border-amber-500/30 transition flex items-center gap-1"
                    title="テスト用のサンプル聖遺物を読み込む"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>サンプル読込</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    if (confirm('聖遺物データをすべてクリア（削除）しますか？')) {
                      onResetData();
                    }
                  }}
                  className="px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-rose-400 hover:bg-slate-900 border border-slate-800 transition flex items-center gap-1"
                  title="聖遺物データをすべて削除"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>全クリア</span>
                </button>
              </div>

              {/* スマホ用メニューボタン (ドロップダウン) */}
              <div className="relative sm:hidden">
                <button
                  onClick={() => setShowMenuDropdown(!showMenuDropdown)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800"
                  aria-label="メニュー"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {showMenuDropdown && (
                  <div className="absolute right-0 top-full mt-1 w-44 bg-slate-900 border border-slate-700 rounded-xl shadow-xl py-1 z-50 animate-in fade-in">
                    <button
                      onClick={handleExport}
                      className="w-full px-3 py-2 text-left text-xs text-slate-300 hover:bg-slate-800 flex items-center gap-2"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-400" />
                      <span>JSON書き出し</span>
                    </button>
                    <label className="w-full px-3 py-2 text-left text-xs text-slate-300 hover:bg-slate-800 flex items-center gap-2 cursor-pointer">
                      <Upload className="w-3.5 h-3.5 text-slate-400" />
                      <span>JSON読み込み</span>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImport}
                        className="hidden"
                      />
                    </label>
                    {onLoadSamples && (
                      <button
                        onClick={() => {
                          onLoadSamples();
                          setShowMenuDropdown(false);
                        }}
                        className="w-full px-3 py-2 text-left text-xs text-amber-300 hover:bg-slate-800 flex items-center gap-2"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>サンプル読込</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setShowMenuDropdown(false);
                        if (confirm('聖遺物データをすべてクリアしますか？')) {
                          onResetData();
                        }
                      }}
                      className="w-full px-3 py-2 text-left text-xs text-rose-400 hover:bg-slate-800 flex items-center gap-2 border-t border-slate-800"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>聖遺物全クリア</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* PC・タブレット用ナビゲーションタブ */}
          <div className="hidden sm:flex items-center gap-2 border-t border-slate-850 pt-2 pb-2 overflow-x-auto scrollbar-none">
            <button
              onClick={() => onSelectTab('equip')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
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
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
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

      {/* スマホ専用ボトム固定ナビゲーションバー (親指でワンタップ) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/90 pb-[env(safe-area-inset-bottom)] shadow-2xl">
        <div className="grid grid-cols-4 h-14">
          <button
            onClick={() => onSelectTab('equip')}
            className={`flex flex-col items-center justify-center gap-1 transition ${
              activeTab === 'equip'
                ? 'text-amber-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-5 h-5" />
            <span className="text-[10px]">装備・分析</span>
          </button>

          <button
            onClick={() => onSelectTab('manage')}
            className={`flex flex-col items-center justify-center gap-1 relative transition ${
              activeTab === 'manage'
                ? 'text-amber-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-5 h-5" />
            <span className="text-[10px]">聖遺物</span>
            {artifacts.length > 0 && (
              <span className="absolute top-1 right-5 text-[9px] font-mono px-1 rounded-full bg-amber-400 text-slate-950 font-bold">
                {artifacts.length}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('recommend')}
            className={`flex flex-col items-center justify-center gap-1 transition ${
              activeTab === 'recommend'
                ? 'text-amber-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-[10px]">ガイド</span>
          </button>

          <button
            onClick={() => onSelectTab('characters')}
            className={`flex flex-col items-center justify-center gap-1 transition ${
              activeTab === 'characters'
                ? 'text-amber-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px]">所持設定</span>
          </button>
        </div>
      </nav>

    </>
  );
}

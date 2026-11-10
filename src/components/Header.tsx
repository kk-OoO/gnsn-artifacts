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
  Smartphone,
  Database,
  X,
  Copy,
  Check,
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
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const copyMobileUrl = () => {
    if (dbInfo?.mobileUrl) {
      navigator.clipboard.writeText(dbInfo.mobileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* ロゴ & タイトル */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20 text-lg flex-shrink-0">
                ✨
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400">
                    原神 聖遺物マネージャー
                  </h1>
                  {dbInfo && (
                    <button
                      onClick={() => setShowMobileModal(true)}
                      className="hidden md:flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold hover:bg-emerald-500/20 transition"
                      title="DB保存中・携帯からアクセス可能"
                    >
                      <Database className="w-2.5 h-2.5" />
                      <span>{dbInfo.isExternal ? 'Cloud DB' : 'SQLite DB'}</span>
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 font-medium">
                  聖遺物管理・最適ビルド推奨・装備シミュレーター & ギャップ分析
                </p>
              </div>
            </div>

            {/* 右側アクション：スマホ連携・データ保存・初期化 */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* スマホ連携ボタン */}
              <button
                onClick={() => setShowMobileModal(true)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition flex items-center gap-1.5"
                title="携帯（スマホ）からアクセスする方法"
              >
                <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">携帯で使う</span>
              </button>

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
          <div className="flex items-center gap-2 border-t border-slate-850 pt-2 pb-2 overflow-x-auto scrollbar-none">
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

      {/* 携帯（スマホ）連携モーダル */}
      {showMobileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-amber-500/20 text-amber-300 rounded-lg">
                  <Smartphone className="w-5 h-5" />
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-100">
                  携帯（スマホ）から利用する方法
                </h3>
              </div>
              <button
                onClick={() => setShowMobileModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-300">
              {/* 方法1: 同一Wi-Fi (ローカルSQLite) */}
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-300 flex items-center gap-1.5">
                    <span>📡</span>
                    <span>方法1: 同じWi-Fi（自宅内）からアクセス</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                    設定不要・即利用可
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  PCと同じWi-Fiにスマホを接続し、スマホのブラウザ（SafariやChrome）で以下のURLを開いてください。PCとスマホで同じデータベース（`data/genshin.db`）が共有されます！
                </p>

                {dbInfo?.mobileUrl && (
                  <div className="flex items-center gap-2 mt-2 bg-slate-900 p-2.5 rounded-lg border border-slate-700">
                    <span className="font-mono text-amber-300 font-bold flex-1 select-all break-all">
                      {dbInfo.mobileUrl}
                    </span>
                    <button
                      onClick={copyMobileUrl}
                      className="px-2.5 py-1 rounded bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 flex-shrink-0 hover:bg-amber-300 transition"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'コピー済' : 'コピー'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* 方法2: 外部クラウドDB (Turso / Vercel等) */}
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <span className="font-bold text-sky-300 flex items-center gap-1.5">
                  <span>☁️</span>
                  <span>方法2: 外出先からも使う（外部クラウドDB）</span>
                </span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  無料のクラウドDB（Tursoなど）を使う場合、`.env.local` に以下を設定するだけで、自動的にクラウドDBに切り替わります：
                </p>
                <div className="bg-slate-900 p-2 rounded-lg font-mono text-[11px] text-slate-300 border border-slate-850 select-all">
                  TURSO_DATABASE_URL=libsql://your-db.turso.io<br />
                  TURSO_AUTH_TOKEN=your-token
                </div>
                <p className="text-[11px] text-slate-500">
                  現在の保存先: <span className="text-slate-300 font-semibold">{dbInfo?.type || 'SQLite File'}</span>
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowMobileModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

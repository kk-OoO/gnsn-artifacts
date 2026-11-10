import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '原神 聖遺物マネージャー | 聖遺物管理 & ビルドギャップ分析',
  description:
    '原神の所持聖遺物を管理し、キャラクターに最適な聖遺物の推奨確認や実際の装備シミュレーション、不足ステータスのギャップ分析を行えるWebアプリケーションです。',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 font-sans">
        {children}
      </body>
    </html>
  );
}

import { createClient } from '@libsql/client';
import path from 'path';
import fs from 'fs';

// 外部クラウドDB（Tursoなど）またはローカルSQLiteファイル
// Vercelサーバーレス環境では /tmp/genshin.db、ローカル開発環境では data/genshin.db を利用
const isVercel = !!process.env.VERCEL;
const defaultDbPath = isVercel
  ? path.join('/tmp', 'genshin.db')
  : path.join(process.cwd(), 'data', 'genshin.db');

const dbUrl =
  process.env.TURSO_DATABASE_URL || `file:${defaultDbPath}`;
const authToken = process.env.TURSO_AUTH_TOKEN;

// data ディレクトリが存在しない場合は自動作成（Vercelの読込専用エラーを防止）
if (!process.env.TURSO_DATABASE_URL) {
  try {
    const dataDir = path.dirname(defaultDbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  } catch (e) {
    console.warn('Failed to ensure db directory:', e);
  }
}

export const db = createClient({
  url: dbUrl,
  authToken: authToken,
});

let initialized = false;

// テーブルの初期化
export async function initDatabase() {
  if (initialized) return;

  // 聖遺物テーブル
  await db.execute(`
    CREATE TABLE IF NOT EXISTS artifacts (
      id TEXT PRIMARY KEY,
      setId TEXT NOT NULL,
      slot TEXT NOT NULL,
      rarity INTEGER NOT NULL,
      level INTEGER NOT NULL,
      mainStatType TEXT NOT NULL,
      mainStatValue REAL NOT NULL,
      subStats TEXT NOT NULL,
      equippedToCharacterId TEXT,
      score REAL,
      createdAt INTEGER NOT NULL
    )
  `);

  // ユーザー設定テーブル（所持キャラ・満足マーク等）
  await db.execute(`
    CREATE TABLE IF NOT EXISTS user_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updatedAt INTEGER NOT NULL
    )
  `);

  initialized = true;
}

export function isExternalDb(): boolean {
  return !!process.env.TURSO_DATABASE_URL;
}

import { createClient } from '@libsql/client';
import path from 'path';
import fs from 'fs';

// 外部クラウドDB（Tursoなど）またはローカルSQLiteファイル
const dbUrl = process.env.TURSO_DATABASE_URL || `file:${path.join(process.cwd(), 'data', 'genshin.db')}`;
const authToken = process.env.TURSO_AUTH_TOKEN;

// data ディレクトリが存在しない場合は自動作成
if (!process.env.TURSO_DATABASE_URL) {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
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

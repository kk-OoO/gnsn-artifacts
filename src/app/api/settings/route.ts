import { NextRequest, NextResponse } from 'next/server';
import { db, initDatabase, isExternalDb } from '@/lib/db';

// GET: 設定情報と接続ステータス取得
export async function GET() {
  try {
    await initDatabase();
    const result = await db.execute('SELECT * FROM user_settings');
    const settings: Record<string, any> = {};

    for (const row of result.rows as any[]) {
      try {
        settings[row.key] = JSON.parse(row.value);
      } catch {
        settings[row.key] = row.value;
      }
    }

    return NextResponse.json({
      success: true,
      settings,
      dbInfo: {
        isExternal: isExternalDb(),
        type: isExternalDb() ? 'Turso Cloud DB' : 'SQLite (Local)',
      },
    });
  } catch (err: any) {
    console.error('Failed to get settings from DB:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST: 設定の保存
export async function POST(req: NextRequest) {
  try {
    await initDatabase();
    const body = await req.json();
    const { key, value } = body;

    if (!key) {
      return NextResponse.json({ success: false, error: 'Key is required' }, { status: 400 });
    }

    await db.execute({
      sql: `
        INSERT OR REPLACE INTO user_settings (key, value, updatedAt)
        VALUES (?, ?, ?)
      `,
      args: [key, JSON.stringify(value), Date.now()],
    });

    return NextResponse.json({ success: true, key, value });
  } catch (err: any) {
    console.error('Failed to save settings to DB:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

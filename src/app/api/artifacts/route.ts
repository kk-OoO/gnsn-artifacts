import { NextRequest, NextResponse } from 'next/server';
import { db, initDatabase } from '@/lib/db';
import { Artifact } from '@/types/genshin';

// GET: 聖遺物一覧取得
export async function GET() {
  try {
    await initDatabase();
    const result = await db.execute('SELECT * FROM artifacts ORDER BY createdAt DESC');
    const artifacts: Artifact[] = result.rows.map((row: any) => ({
      id: row.id,
      setId: row.setId,
      slot: row.slot,
      rarity: Number(row.rarity) as 4 | 5,
      level: Number(row.level),
      mainStat: {
        type: row.mainStatType,
        value: Number(row.mainStatValue),
      },
      subStats: JSON.parse(row.subStats || '[]'),
      equippedToCharacterId: row.equippedToCharacterId || undefined,
      score: row.score ? Number(row.score) : undefined,
      createdAt: Number(row.createdAt),
    }));

    return NextResponse.json({ success: true, artifacts });
  } catch (err: any) {
    console.error('Failed to get artifacts from DB:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST: 聖遺物の作成・更新（単一）
export async function POST(req: NextRequest) {
  try {
    await initDatabase();
    const artifact: Artifact = await req.json();

    await db.execute({
      sql: `
        INSERT OR REPLACE INTO artifacts (
          id, setId, slot, rarity, level, mainStatType, mainStatValue, subStats, equippedToCharacterId, score, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        artifact.id,
        artifact.setId,
        artifact.slot,
        artifact.rarity,
        artifact.level,
        artifact.mainStat.type,
        artifact.mainStat.value,
        JSON.stringify(artifact.subStats),
        artifact.equippedToCharacterId || null,
        artifact.score || null,
        artifact.createdAt || Date.now(),
      ],
    });

    return NextResponse.json({ success: true, artifact });
  } catch (err: any) {
    console.error('Failed to save artifact to DB:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PUT: 聖遺物の一括更新・全置換（インポートや一括付け替え）
export async function PUT(req: NextRequest) {
  try {
    await initDatabase();
    const artifacts: Artifact[] = await req.json();

    // トランザクション処理
    await db.batch(
      [
        { sql: 'DELETE FROM artifacts', args: [] },
        ...artifacts.map((a) => ({
          sql: `
            INSERT INTO artifacts (
              id, setId, slot, rarity, level, mainStatType, mainStatValue, subStats, equippedToCharacterId, score, createdAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          args: [
            a.id,
            a.setId,
            a.slot,
            a.rarity,
            a.level,
            a.mainStat.type,
            a.mainStat.value,
            JSON.stringify(a.subStats),
            a.equippedToCharacterId || null,
            a.score || null,
            a.createdAt || Date.now(),
          ],
        })),
      ],
      'write'
    );

    return NextResponse.json({ success: true, count: artifacts.length });
  } catch (err: any) {
    console.error('Failed to bulk update artifacts in DB:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE: 聖遺物の削除
export async function DELETE(req: NextRequest) {
  try {
    await initDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const all = searchParams.get('all');

    if (all === 'true') {
      await db.execute('DELETE FROM artifacts');
      return NextResponse.json({ success: true, message: 'All artifacts cleared' });
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }

    await db.execute({
      sql: 'DELETE FROM artifacts WHERE id = ?',
      args: [id],
    });

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    console.error('Failed to delete artifact from DB:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

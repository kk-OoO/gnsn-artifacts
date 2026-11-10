import { Artifact, ArtifactSlot, Character } from '@/types/genshin';
import { calculateSubStatCV } from './artifactCalculator';

/**
 * 聖遺物が特定のキャラにとってどれだけ適しているかをスコア化
 */
function scoreArtifactForCharacter(
  artifact: Artifact,
  character: Character
): number {
  let score = 0;
  const rec = character.recommendedBuild;

  // 1. レベル補正 (Lv20が最高)
  score += artifact.level * 2;

  // 2. セット効果マッチング (推奨セットなら大幅加点)
  const isRecommendedSet = rec.recommendedSets.some(
    (s) => s.setId === artifact.setId
  );
  if (isRecommendedSet) {
    score += 40;
    if (rec.recommendedSets[0]?.setId === artifact.setId) {
      score += 20; // 第1推奨ならさらに加点
    }
  }

  // 3. メインステータスマッチング
  if (artifact.slot === 'sands') {
    if (rec.recommendedMainStats.sands.includes(artifact.mainStat.type)) {
      score += 50;
    }
  } else if (artifact.slot === 'goblet') {
    if (rec.recommendedMainStats.goblet.includes(artifact.mainStat.type)) {
      score += 60;
    }
  } else if (artifact.slot === 'circlet') {
    if (rec.recommendedMainStats.circlet.includes(artifact.mainStat.type)) {
      score += 50;
    }
  } else {
    // 花と羽は固定なので加点
    score += 30;
  }

  // 4. サブステータスマッチング
  const subCv = calculateSubStatCV(artifact);
  score += subCv * 1.5;

  for (const sub of artifact.subStats) {
    const priorityIndex = rec.subStatPriority.indexOf(sub.type);
    if (priorityIndex !== -1) {
      // 優先度が高いほど高得点 (0番目が最も高い)
      const weight = Math.max(1, 5 - priorityIndex);
      score += weight * 4;
    }
  }

  return score;
}

/**
 * 手持ちの聖遺物プールから、対象キャラクターに最も適した5部位の組み合わせを自動選定
 * includeEquipped: trueの場合、他のキャラが装備している聖遺物も候補に含める
 */
export function recommendBestArtifactSet(
  character: Character,
  allArtifacts: Artifact[],
  includeEquipped: boolean = false
): Record<ArtifactSlot, Artifact | null> {
  const slots: ArtifactSlot[] = ['flower', 'plume', 'sands', 'goblet', 'circlet'];
  const result: Record<ArtifactSlot, Artifact | null> = {
    flower: null,
    plume: null,
    sands: null,
    goblet: null,
    circlet: null,
  };

  const pool = allArtifacts.filter((art) => {
    if (includeEquipped) return true;
    return !art.equippedToCharacterId || art.equippedToCharacterId === character.id;
  });

  for (const slot of slots) {
    const slotPool = pool.filter((art) => art.slot === slot);
    if (slotPool.length === 0) continue;

    // 最もスコアの高いものを選択
    let bestArt: Artifact | null = null;
    let bestScore = -Infinity;

    for (const art of slotPool) {
      const score = scoreArtifactForCharacter(art, character);
      if (score > bestScore) {
        bestScore = score;
        bestArt = art;
      }
    }

    result[slot] = bestArt;
  }

  return result;
}

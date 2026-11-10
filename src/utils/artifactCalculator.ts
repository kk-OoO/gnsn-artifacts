import {
  Artifact,
  Character,
  CalculatedStats,
  StatGap,
  TargetStats,
  ArtifactSlot,
  WeaponConfig,
} from '@/types/genshin';
import { ARTIFACT_SETS } from '@/data/artifactSets';

/**
 * 聖遺物の会心スコア(CV: Crit Value)を計算
 * CV = 会心率 * 2 + 会心ダメージ
 */
export function calculateArtifactCV(artifact: Artifact): number {
  let cv = 0;
  if (artifact.mainStat.type === 'crit_rate') {
    // メインステが会心の場合も考慮
    cv += artifact.mainStat.value * 2;
  } else if (artifact.mainStat.type === 'crit_damage') {
    cv += artifact.mainStat.value;
  }

  for (const sub of artifact.subStats) {
    if (sub.type === 'crit_rate') {
      cv += sub.value * 2;
    } else if (sub.type === 'crit_damage') {
      cv += sub.value;
    }
  }
  return Math.round(cv * 10) / 10;
}

/**
 * サブステータスのみのCVを計算（一般的なスコア基準）
 */
export function calculateSubStatCV(artifact: Artifact): number {
  let cv = 0;
  for (const sub of artifact.subStats) {
    if (sub.type === 'crit_rate') {
      cv += sub.value * 2;
    } else if (sub.type === 'crit_damage') {
      cv += sub.value;
    }
  }
  return Math.round(cv * 10) / 10;
}

export interface ActiveSetBonus {
  set: (typeof ARTIFACT_SETS)[string];
  count: number;
  has2Piece: boolean;
  has4Piece: boolean;
}

/**
 * 装備中の聖遺物から発動しているセット効果を検出
 */
export function getActiveSetBonuses(artifacts: Artifact[]): ActiveSetBonus[] {
  const setCounts: Record<string, number> = {};
  for (const art of artifacts) {
    if (art && art.setId) {
      setCounts[art.setId] = (setCounts[art.setId] || 0) + 1;
    }
  }

  const results: ActiveSetBonus[] = [];
  for (const [setId, count] of Object.entries(setCounts)) {
    const setDef = ARTIFACT_SETS[setId];
    if (setDef && count >= 2) {
      results.push({
        set: setDef,
        count,
        has2Piece: count >= 2,
        has4Piece: count >= 4,
      });
    }
  }
  return results;
}

/**
 * キャラクターと装備聖遺物、装備武器から合計ステータスを計算
 */
export function calculateCharacterTotalStats(
  character: Character,
  artifacts: Artifact[],
  weapon?: WeaponConfig
): CalculatedStats {
  const base = character.baseStats;
  // 武器の基礎攻撃力（未指定時は標準の608）を加算した基礎攻撃力で計算
  const weaponBaseAtk = weapon && weapon.baseAtk > 0 ? weapon.baseAtk : 608;
  const totalBaseAtk = base.atk + weaponBaseAtk;

  let hpFlat = 0;
  let hpPercent = 0;
  let atkFlat = 0;
  let atkPercent = 0;
  let defFlat = 0;
  let defPercent = 0;
  let critRate = base.critRate;
  let critDamage = base.critDamage;
  let energyRecharge = base.energyRecharge;
  let elementalMastery = base.elementalMastery;
  let elementalDmg = base.elementalDmg;
  let healingBonus = 0;
  let totalCV = 0;

  // 0. 装備武器のサブステータスを加算
  if (weapon && weapon.subStatType && weapon.subStatValue > 0) {
    switch (weapon.subStatType) {
      case 'crit_rate':
        critRate += weapon.subStatValue;
        break;
      case 'crit_damage':
        critDamage += weapon.subStatValue;
        break;
      case 'atk_percent':
        atkPercent += weapon.subStatValue;
        break;
      case 'energy_recharge':
        energyRecharge += weapon.subStatValue;
        break;
      case 'elemental_mastery':
        elementalMastery += weapon.subStatValue;
        break;
      case 'hp_percent':
        hpPercent += weapon.subStatValue;
        break;
      case 'def_percent':
        defPercent += weapon.subStatValue;
        break;
    }
  }

  // 1. 聖遺物のメインステータスとサブステータスを加算
  for (const art of artifacts) {
    if (!art) continue;
    totalCV += calculateSubStatCV(art);

    const applyStat = (type: string, value: number) => {
      switch (type) {
        case 'hp_flat':
          hpFlat += value;
          break;
        case 'hp_percent':
          hpPercent += value;
          break;
        case 'atk_flat':
          atkFlat += value;
          break;
        case 'atk_percent':
          atkPercent += value;
          break;
        case 'def_flat':
          defFlat += value;
          break;
        case 'def_percent':
          defPercent += value;
          break;
        case 'elemental_mastery':
          elementalMastery += value;
          break;
        case 'energy_recharge':
          energyRecharge += value;
          break;
        case 'crit_rate':
          critRate += value;
          break;
        case 'crit_damage':
          critDamage += value;
          break;
        case 'healing_bonus':
          healingBonus += value;
          break;
        // 該当元素ダメージ
        case 'pyro_dmg':
          if (character.element === 'pyro') elementalDmg += value;
          break;
        case 'hydro_dmg':
          if (character.element === 'hydro') elementalDmg += value;
          break;
        case 'anemo_dmg':
          if (character.element === 'anemo') elementalDmg += value;
          break;
        case 'electro_dmg':
          if (character.element === 'electro') elementalDmg += value;
          break;
        case 'dendro_dmg':
          if (character.element === 'dendro') elementalDmg += value;
          break;
        case 'cryo_dmg':
          if (character.element === 'cryo') elementalDmg += value;
          break;
        case 'geo_dmg':
          if (character.element === 'geo') elementalDmg += value;
          break;
      }
    };

    applyStat(art.mainStat.type, art.mainStat.value);
    for (const sub of art.subStats) {
      applyStat(sub.type, sub.value);
    }
  }

  // 2. 2セット効果のステータス加算
  const activeBonuses = getActiveSetBonuses(artifacts);
  for (const bonus of activeBonuses) {
    if (bonus.has2Piece && bonus.set.piece2Stats) {
      for (const [statType, val] of Object.entries(bonus.set.piece2Stats)) {
        if (!val) continue;
        if (statType === 'energy_recharge') energyRecharge += val;
        if (statType === 'elemental_mastery') elementalMastery += val;
        if (statType === 'hp_percent') hpPercent += val;
        if (statType === 'atk_percent') atkPercent += val;
        if (statType === 'healing_bonus') healingBonus += val;
        if (
          (statType === 'pyro_dmg' && character.element === 'pyro') ||
          (statType === 'hydro_dmg' && character.element === 'hydro') ||
          (statType === 'anemo_dmg' && character.element === 'anemo') ||
          (statType === 'electro_dmg' && character.element === 'electro') ||
          (statType === 'dendro_dmg' && character.element === 'dendro') ||
          (statType === 'cryo_dmg' && character.element === 'cryo') ||
          (statType === 'geo_dmg' && character.element === 'geo')
        ) {
          elementalDmg += val;
        }
      }
    }
  }

  const finalHp = Math.round(base.hp * (1 + hpPercent / 100) + hpFlat);
  const finalAtk = Math.round(totalBaseAtk * (1 + atkPercent / 100) + atkFlat);
  const finalDef = Math.round(base.def * (1 + defPercent / 100) + defFlat);

  return {
    hp: finalHp,
    atk: finalAtk,
    def: finalDef,
    critRate: Math.round(critRate * 10) / 10,
    critDamage: Math.round(critDamage * 10) / 10,
    energyRecharge: Math.round(energyRecharge * 10) / 10,
    elementalMastery: Math.round(elementalMastery),
    elementalDmg: Math.round(elementalDmg * 10) / 10,
    healingBonus: Math.round(healingBonus * 10) / 10,
    cv: Math.round(totalCV * 10) / 10,
  };
}

/**
 * 現在のステータスと目標ステータスを比較し、ギャップとアドバイスを算出
 */
export function analyzeStatGaps(
  character: Character,
  currentStats: CalculatedStats,
  equippedArtifacts: Artifact[]
): {
  gaps: StatGap[];
  overallScore: number;
  recommendations: string[];
} {
  const targetStats = character.recommendedBuild.targetStats;
  const gaps: StatGap[] = [];
  const recommendations: string[] = [];

  const checkStat = (
    statKey: keyof TargetStats,
    statName: string,
    currentVal: number
  ) => {
    const target = targetStats[statKey];
    if (!target) return;

    const diff = currentVal - target.min;
    const percentAchieved = Math.min(
      200,
      Math.round((currentVal / target.min) * 100)
    );

    let status: StatGap['status'] = 'good';
    let advice = '';

    if (currentVal < target.min) {
      status = 'insufficient';
      const shortage = (target.min - currentVal).toFixed(
        target.unit === '%' ? 1 : 0
      );
      advice = `${statName}があと ${shortage}${target.unit} 不足しています（目標: ${target.min}${target.unit}以上）。`;
    } else if (currentVal >= target.ideal) {
      status = 'optimal';
      advice = `${statName}は理想値（${target.ideal}${target.unit}）を達成しており十分です！`;
    } else {
      status = 'good';
      const toIdeal = (target.ideal - currentVal).toFixed(
        target.unit === '%' ? 1 : 0
      );
      advice = `最低目標をクリア！理想値（${target.ideal}${target.unit}）まであと ${toIdeal}${target.unit} です。`;
    }

    // 特殊チェック：ファントムハンターや黒曜の秘典による会心率あふれ判定
    const activeBonuses = getActiveSetBonuses(equippedArtifacts);
    const hasMarechaussee4 = activeBonuses.some(
      (b) => b.set.id === 'marechaussee_hunter' && b.has4Piece
    );
    const hasObsidian4 = activeBonuses.some(
      (b) => b.set.id === 'obsidian_codex' && b.has4Piece
    );

    if (statKey === 'critRate') {
      if (hasMarechaussee4 && currentVal > 64) {
        status = 'excessive';
        advice = `⚠️ ファントム4セットの会心率+36%を加えると、戦闘中に会心率が100%を超えて溢れます（現在${currentVal}%）。会心率を抑えて会心ダメージやHP/攻撃力を伸ばしましょう。`;
      } else if (hasObsidian4 && currentVal > 60) {
        status = 'excessive';
        advice = `⚠️ 黒曜4セットの会心率+40%を加えると戦闘中に会心率が100%を超えて溢れます。会心率を60%以下に調整しましょう。`;
      }
    }

    gaps.push({
      statName,
      statKey,
      current: currentVal,
      targetMin: target.min,
      targetIdeal: target.ideal,
      unit: target.unit,
      diff,
      percentAchieved,
      status,
      advice,
    });
  };

  checkStat('hp', 'HP', currentStats.hp);
  checkStat('atk', '攻撃力', currentStats.atk);
  checkStat('def', '防御力', currentStats.def);
  checkStat('critRate', '会心率', currentStats.critRate);
  checkStat('critDamage', '会心ダメージ', currentStats.critDamage);
  checkStat('energyRecharge', '元素チャージ効率', currentStats.energyRecharge);
  checkStat('elementalMastery', '元素熟知', currentStats.elementalMastery);
  checkStat('elementalDmg', '元素ダメージ', currentStats.elementalDmg);

  // 聖遺物部位ごとのメインステータス適切性チェック
  const sands = equippedArtifacts.find((a) => a.slot === 'sands');
  const goblet = equippedArtifacts.find((a) => a.slot === 'goblet');
  const circlet = equippedArtifacts.find((a) => a.slot === 'circlet');

  const recMain = character.recommendedBuild.recommendedMainStats;

  if (sands && !recMain.sands.includes(sands.mainStat.type)) {
    recommendations.push(
      `時の砂のメインステータスが現在「${sands.mainStat.type}」です。推奨される【${recMain.sands.join(' / ')}】に変更するとステータスが大きく改善します。`
    );
  }
  if (goblet && !recMain.goblet.includes(goblet.mainStat.type)) {
    recommendations.push(
      `空の杯のメインステータスが現在「${goblet.mainStat.type}」です。推奨される【${recMain.goblet.join(' / ')}】を装備することを強く推奨します。`
    );
  }
  if (circlet && !recMain.circlet.includes(circlet.mainStat.type)) {
    recommendations.push(
      `理の冠のメインステータスが現在「${circlet.mainStat.type}」です。推奨される【${recMain.circlet.join(' / ')}】を検討してください。`
    );
  }

  // 会心バランスチェック（1:2の黄金比）
  if (currentStats.critRate > 0 && currentStats.critDamage > 0) {
    const ratio = currentStats.critDamage / currentStats.critRate;
    if (currentStats.critRate < 50 && currentStats.critDamage > 140) {
      recommendations.push(
        `会心率が${currentStats.critRate}%と低く、会心ダメージ（${currentStats.critDamage}%）の期待値を活かせていません。冠を会心率にするなど、会心率を優先して確保しましょう。`
      );
    } else if (ratio < 1.4 && currentStats.critRate > 70) {
      recommendations.push(
        `会心率は十分に高いため、冠やサブステータスで会心ダメージを重点的に伸ばすと総合火力が飛躍的にアップします。`
      );
    }
  }

  // セット効果チェック
  const activeBonuses = getActiveSetBonuses(equippedArtifacts);
  const bestSetId = character.recommendedBuild.recommendedSets[0]?.setId;
  const hasBest4 = activeBonuses.some(
    (b) => b.set.id === bestSetId && b.has4Piece
  );
  if (!hasBest4 && bestSetId) {
    const bestSetName = ARTIFACT_SETS[bestSetId]?.name || bestSetId;
    recommendations.push(
      `最適聖遺物である「${bestSetName}」の4セット効果が未発動です。セットを揃えることで大幅な火力・使い勝手の向上が見込めます。`
    );
  }

  // 総合達成度スコア (100点満点換算)
  let totalAchieved = 0;
  let totalWeight = 0;
  for (const gap of gaps) {
    const target = targetStats[gap.statKey];
    const weight = target?.weight || 3;
    totalWeight += weight;
    const scorePortion = Math.min(100, gap.percentAchieved);
    totalAchieved += scorePortion * weight;
  }
  const overallScore =
    totalWeight > 0 ? Math.round(totalAchieved / totalWeight) : 0;

  return {
    gaps,
    overallScore,
    recommendations,
  };
}

export type ArtifactSlot = 'flower' | 'plume' | 'sands' | 'goblet' | 'circlet';

export type ElementType = 'pyro' | 'hydro' | 'anemo' | 'electro' | 'dendro' | 'cryo' | 'geo';

export type WeaponType = 'sword' | 'claymore' | 'polearm' | 'bow' | 'catalyst';

export type WeaponSubType =
  | 'none'
  | 'crit_damage'
  | 'crit_rate'
  | 'atk_percent'
  | 'energy_recharge'
  | 'elemental_mastery'
  | 'hp_percent'
  | 'def_percent'
  | 'physical_dmg';

export interface WeaponConfig {
  name: string; // 武器名（自由入力またはプリセット名）
  baseAtk: number; // 基礎攻撃力 (Lv90時: 例 510, 608, 674, 542, 454)
  subStatType: WeaponSubType; // サブステータス種別
  subStatValue: number; // サブステータス値 (Lv90時: 例 66.2, 33.1, 165)
}

export type MainStatType =
  | 'hp_flat' // 花固定
  | 'atk_flat' // 羽固定
  | 'hp_percent'
  | 'atk_percent'
  | 'def_percent'
  | 'elemental_mastery'
  | 'energy_recharge'
  | 'crit_rate'
  | 'crit_damage'
  | 'healing_bonus'
  | 'pyro_dmg'
  | 'hydro_dmg'
  | 'anemo_dmg'
  | 'electro_dmg'
  | 'dendro_dmg'
  | 'cryo_dmg'
  | 'geo_dmg'
  | 'physical_dmg';

export type SubStatType =
  | 'hp_flat'
  | 'hp_percent'
  | 'atk_flat'
  | 'atk_percent'
  | 'def_flat'
  | 'def_percent'
  | 'elemental_mastery'
  | 'energy_recharge'
  | 'crit_rate'
  | 'crit_damage';

export interface SubStat {
  type: SubStatType;
  value: number;
}

export interface Artifact {
  id: string;
  setId: string;
  slot: ArtifactSlot;
  rarity: 4 | 5;
  level: number; // 0 - 20
  mainStat: {
    type: MainStatType;
    value: number;
  };
  subStats: SubStat[];
  equippedToCharacterId?: string; // 装備しているキャラID
  locked?: boolean;
  score?: number; // CV (Crit Value) or Total Score
  createdAt: number;
}

export interface ArtifactSet {
  id: string;
  name: string;
  piece2: string;
  piece4: string;
  piece2Stats?: Partial<Record<MainStatType, number>>;
  icon?: string;
  images?: {
    flower?: string;
    plume?: string;
    sands?: string;
    goblet?: string;
    circlet?: string;
  };
}

export interface StatTarget {
  min: number;
  ideal: number;
  unit: '%' | '';
  weight: number; // 重要度 1-5
}

export interface TargetStats {
  hp?: StatTarget;
  atk?: StatTarget;
  def?: StatTarget;
  critRate?: StatTarget;
  critDamage?: StatTarget;
  energyRecharge?: StatTarget;
  elementalMastery?: StatTarget;
  elementalDmg?: StatTarget;
}

export interface RecommendedBuild {
  recommendedSets: {
    setId: string;
    description: string;
    priority: number;
  }[];
  recommendedMainStats: {
    sands: MainStatType[];
    goblet: MainStatType[];
    circlet: MainStatType[];
  };
  subStatPriority: SubStatType[];
  targetStats: TargetStats;
  buildTips: string[];
}

export interface BaseStats {
  hp: number;
  atk: number;
  def: number;
  critRate: number; // % (初期5)
  critDamage: number; // % (初期50)
  energyRecharge: number; // % (初期100)
  elementalMastery: number; // 0
  elementalDmg: number; // % (初期0)
}

export interface Character {
  id: string;
  name: string;
  japaneseName: string;
  element: ElementType;
  weapon: WeaponType;
  rarity: 4 | 5;
  role: 'Main DPS' | 'Sub DPS' | 'Support' | 'Healer' | 'Shielder';
  avatarUrl?: string;
  baseStats: BaseStats; // Lv90 + 代表武器換算
  recommendedBuild: RecommendedBuild;
  equippedArtifacts?: {
    flower?: string; // artifact id
    plume?: string;
    sands?: string;
    goblet?: string;
    circlet?: string;
  };
}

export interface CalculatedStats {
  hp: number;
  atk: number;
  def: number;
  critRate: number;
  critDamage: number;
  energyRecharge: number;
  elementalMastery: number;
  elementalDmg: number;
  healingBonus: number;
  cv: number; // 合計会心スコア
}

export interface StatGap {
  statName: string;
  statKey: keyof TargetStats;
  current: number;
  targetMin: number;
  targetIdeal: number;
  unit: string;
  diff: number; // current - targetMin (マイナスなら不足)
  percentAchieved: number; // %
  status: 'insufficient' | 'good' | 'optimal' | 'excessive';
  advice: string;
}

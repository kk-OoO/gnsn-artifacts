import { ArtifactSet } from '@/types/genshin';
import generatedSets from './generatedArtifactSets.json';

// 全63聖遺物セットデータ
export const ARTIFACT_SETS: Record<string, ArtifactSet> = {
  ...(generatedSets as Record<string, ArtifactSet>),
  // 互換性エイリアス
  scroll_of_the_hero: {
    ...(generatedSets as Record<string, any>)['scroll_of_the_hero_of_cinder_city'],
    id: 'scroll_of_the_hero',
  },
  crimson_witch: {
    ...(generatedSets as Record<string, any>)['crimson_witch_of_flames'],
    id: 'crimson_witch',
  },
  harmonic_whimsy: {
    ...(generatedSets as Record<string, any>)['fragment_of_harmonic_whimsy'],
    id: 'harmonic_whimsy',
  },
};

export const ARTIFACT_SLOT_NAMES: Record<string, { ja: string; icon: string }> = {
  flower: { ja: '生の花', icon: '🌸' },
  plume: { ja: '死の羽', icon: '🪶' },
  sands: { ja: '時の砂', icon: '⏳' },
  goblet: { ja: '空の杯', icon: '🍷' },
  circlet: { ja: '理の冠', icon: '👑' },
};

export const STAT_DISPLAY_NAMES: Record<string, { label: string; unit: '%' | '' }> = {
  hp_flat: { label: 'HP (実数)', unit: '' },
  atk_flat: { label: '攻撃力 (実数)', unit: '' },
  def_flat: { label: '防御力 (実数)', unit: '' },
  hp_percent: { label: 'HP%', unit: '%' },
  atk_percent: { label: '攻撃力%', unit: '%' },
  def_percent: { label: '防御力%', unit: '%' },
  elemental_mastery: { label: '元素熟知', unit: '' },
  energy_recharge: { label: '元素チャージ効率', unit: '%' },
  crit_rate: { label: '会心率', unit: '%' },
  crit_damage: { label: '会心ダメージ', unit: '%' },
  healing_bonus: { label: '与える治療効果', unit: '%' },
  pyro_dmg: { label: '炎元素ダメージ', unit: '%' },
  hydro_dmg: { label: '水元素ダメージ', unit: '%' },
  anemo_dmg: { label: '風元素ダメージ', unit: '%' },
  electro_dmg: { label: '雷元素ダメージ', unit: '%' },
  dendro_dmg: { label: '草元素ダメージ', unit: '%' },
  cryo_dmg: { label: '氷元素ダメージ', unit: '%' },
  geo_dmg: { label: '岩元素ダメージ', unit: '%' },
  physical_dmg: { label: '物理ダメージ', unit: '%' },
};

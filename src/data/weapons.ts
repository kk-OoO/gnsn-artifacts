import { WeaponType, WeaponConfig, WeaponSubType } from '@/types/genshin';

export interface WeaponPresetItem {
  id: string;
  name: string;
  weaponType: WeaponType;
  rarity: 4 | 5;
  baseAtk: number;
  subStatType: WeaponSubType;
  subStatValue: number;
}

export const WEAPON_SUBSTAT_NAMES: Record<WeaponSubType, { label: string; unit: string }> = {
  none: { label: 'サブステなし', unit: '' },
  crit_damage: { label: '会心ダメージ', unit: '%' },
  crit_rate: { label: '会心率', unit: '%' },
  atk_percent: { label: '攻撃力%', unit: '%' },
  energy_recharge: { label: '元素チャージ効率', unit: '%' },
  elemental_mastery: { label: '元素熟知', unit: '' },
  hp_percent: { label: 'HP%', unit: '%' },
  def_percent: { label: '防御力%', unit: '%' },
  physical_dmg: { label: '物理ダメージバフ', unit: '%' },
};

// 各武器種の人気定番武器プリセット (Lv90基準)
export const POPULAR_WEAPON_PRESETS: Record<WeaponType, WeaponPresetItem[]> = {
  sword: [
    { id: 'foliated_incision', name: '萃光の裁葉', weaponType: 'sword', rarity: 5, baseAtk: 542, subStatType: 'crit_damage', subStatValue: 88.2 },
    { id: 'mistsplitter_reforged', name: '霧切の回光', weaponType: 'sword', rarity: 5, baseAtk: 674, subStatType: 'crit_damage', subStatValue: 44.1 },
    { id: 'primordial_jade_cutter', name: '磐岩結緑', weaponType: 'sword', rarity: 5, baseAtk: 542, subStatType: 'crit_rate', subStatValue: 44.1 },
    { id: 'key_of_khaj_nisut', name: '聖顕の鍵', weaponType: 'sword', rarity: 5, baseAtk: 542, subStatType: 'hp_percent', subStatValue: 66.2 },
    { id: 'splendor_of_tranquil_waters', name: '静水流転の輝き', weaponType: 'sword', rarity: 5, baseAtk: 542, subStatType: 'crit_damage', subStatValue: 88.2 },
    { id: 'absolution', name: '赦罪', weaponType: 'sword', rarity: 5, baseAtk: 674, subStatType: 'crit_damage', subStatValue: 44.1 },
    { id: 'favonius_sword', name: '西風剣', weaponType: 'sword', rarity: 4, baseAtk: 454, subStatType: 'energy_recharge', subStatValue: 61.3 },
    { id: 'sacrificial_sword', name: '祭礼の剣', weaponType: 'sword', rarity: 4, baseAtk: 454, subStatType: 'energy_recharge', subStatValue: 61.3 },
    { id: 'iron_sting', name: '鉄蜂の刺し', weaponType: 'sword', rarity: 4, baseAtk: 510, subStatType: 'elemental_mastery', subStatValue: 165 },
    { id: 'the_wolf_fang', name: '狼牙', weaponType: 'sword', rarity: 4, baseAtk: 510, subStatType: 'crit_rate', subStatValue: 27.6 },
    { id: 'amenoma_kageuchi', name: '天目影打', weaponType: 'sword', rarity: 4, baseAtk: 454, subStatType: 'atk_percent', subStatValue: 55.1 },
  ],
  claymore: [
    { id: 'beacon_of_the_reed_sea', name: '葦海の標', weaponType: 'claymore', rarity: 5, baseAtk: 608, subStatType: 'crit_rate', subStatValue: 33.1 },
    { id: 'redhorn_stonethresher', name: '赤角石塵滅砕', weaponType: 'claymore', rarity: 5, baseAtk: 542, subStatType: 'crit_damage', subStatValue: 88.2 },
    { id: 'verdict', name: '裁断', weaponType: 'claymore', rarity: 5, baseAtk: 674, subStatType: 'crit_rate', subStatValue: 22.1 },
    { id: 'mountain_bracing_bolt', name: '山王の牙', weaponType: 'claymore', rarity: 5, baseAtk: 608, subStatType: 'crit_rate', subStatValue: 33.1 },
    { id: 'wolfs_gravestone', name: '狼の末路', weaponType: 'claymore', rarity: 5, baseAtk: 608, subStatType: 'atk_percent', subStatValue: 49.6 },
    { id: 'serpent_spine', name: '螭龍の剣', weaponType: 'claymore', rarity: 4, baseAtk: 510, subStatType: 'crit_rate', subStatValue: 27.6 },
    { id: 'favonius_greatsword', name: '西風大剣', weaponType: 'claymore', rarity: 4, baseAtk: 454, subStatType: 'energy_recharge', subStatValue: 61.3 },
    { id: 'whiteblind', name: '白影の剣', weaponType: 'claymore', rarity: 4, baseAtk: 510, subStatType: 'def_percent', subStatValue: 51.7 },
    { id: 'tidal_shadow', name: 'タイダル・シャドー', weaponType: 'claymore', rarity: 4, baseAtk: 510, subStatType: 'atk_percent', subStatValue: 41.3 },
  ],
  polearm: [
    { id: 'staff_of_homa', name: '護摩の杖', weaponType: 'polearm', rarity: 5, baseAtk: 608, subStatType: 'crit_damage', subStatValue: 66.2 },
    { id: 'engulfing_lightning', name: '草薙の稲光', weaponType: 'polearm', rarity: 5, baseAtk: 608, subStatType: 'energy_recharge', subStatValue: 55.1 },
    { id: 'staff_of_the_scarlet_sands', name: '赤砂の杖', weaponType: 'polearm', rarity: 5, baseAtk: 542, subStatType: 'crit_rate', subStatValue: 44.1 },
    { id: 'primordial_jade_winged_spear', name: '和璞鳶', weaponType: 'polearm', rarity: 5, baseAtk: 674, subStatType: 'crit_rate', subStatValue: 22.1 },
    { id: 'crimson_moons_semblance', name: '赤月のシルエット', weaponType: 'polearm', rarity: 5, baseAtk: 674, subStatType: 'crit_rate', subStatValue: 22.1 },
    { id: 'favonius_lance', name: '西風長槍', weaponType: 'polearm', rarity: 4, baseAtk: 565, subStatType: 'energy_recharge', subStatValue: 30.6 },
    { id: 'the_catch', name: '「漁獲」', weaponType: 'polearm', rarity: 4, baseAtk: 510, subStatType: 'energy_recharge', subStatValue: 45.9 },
    { id: 'deathmatch', name: '死闘の槍', weaponType: 'polearm', rarity: 4, baseAtk: 454, subStatType: 'crit_rate', subStatValue: 36.8 },
    { id: 'dragons_bane', name: '匣中滅龍', weaponType: 'polearm', rarity: 4, baseAtk: 454, subStatType: 'elemental_mastery', subStatValue: 221 },
    { id: 'black_tassel', name: '黒纓槍', weaponType: 'polearm', rarity: 4, baseAtk: 354, subStatType: 'hp_percent', subStatValue: 46.9 },
  ],
  bow: [
    { id: 'aqua_simulacra', name: '若水', weaponType: 'bow', rarity: 5, baseAtk: 542, subStatType: 'crit_damage', subStatValue: 88.2 },
    { id: 'thundering_pulse', name: '飛雷の鳴弦', weaponType: 'bow', rarity: 5, baseAtk: 608, subStatType: 'crit_damage', subStatValue: 66.2 },
    { id: 'polar_star', name: '冬極の白星', weaponType: 'bow', rarity: 5, baseAtk: 608, subStatType: 'crit_rate', subStatValue: 33.1 },
    { id: 'the_first_great_magic', name: '始まりの大魔術', weaponType: 'bow', rarity: 5, baseAtk: 608, subStatType: 'crit_damage', subStatValue: 66.2 },
    { id: 'astral_vultures_crimson_plumage', name: '星鷲の紅き羽', weaponType: 'bow', rarity: 5, baseAtk: 608, subStatType: 'crit_damage', subStatValue: 66.2 },
    { id: 'elegy_for_the_end', name: '終焉を嘆く詩', weaponType: 'bow', rarity: 5, baseAtk: 608, subStatType: 'energy_recharge', subStatValue: 55.1 },
    { id: 'favonius_warbow', name: '西風猟弓', weaponType: 'bow', rarity: 4, baseAtk: 454, subStatType: 'energy_recharge', subStatValue: 61.3 },
    { id: 'the_stringless', name: '絶弦', weaponType: 'bow', rarity: 4, baseAtk: 510, subStatType: 'elemental_mastery', subStatValue: 165 },
    { id: 'sacrificial_bow', name: '祭礼の弓', weaponType: 'bow', rarity: 4, baseAtk: 565, subStatType: 'energy_recharge', subStatValue: 30.6 },
    { id: 'scion_of_the_blazing_sun', name: '烈日の後継', weaponType: 'bow', rarity: 4, baseAtk: 565, subStatType: 'crit_rate', subStatValue: 18.4 },
    { id: 'rust', name: '弓蔵', weaponType: 'bow', rarity: 4, baseAtk: 510, subStatType: 'atk_percent', subStatValue: 41.3 },
  ],
  catalyst: [
    { id: 'tome_of_the_eternal_flow', name: '久遠流転の大典', weaponType: 'catalyst', rarity: 5, baseAtk: 542, subStatType: 'crit_damage', subStatValue: 88.2 },
    { id: 'kaguras_verity', name: '神楽の真意', weaponType: 'catalyst', rarity: 5, baseAtk: 608, subStatType: 'crit_damage', subStatValue: 66.2 },
    { id: 'lost_prayer_to_the_sacred_winds', name: '四風原典', weaponType: 'catalyst', rarity: 5, baseAtk: 608, subStatType: 'crit_rate', subStatValue: 33.1 },
    { id: 'a_thousand_floating_dreams', name: '千夜に浮かぶ夢', weaponType: 'catalyst', rarity: 5, baseAtk: 542, subStatType: 'elemental_mastery', subStatValue: 265 },
    { id: 'surf_sup', name: 'サーフィン・サップ', weaponType: 'catalyst', rarity: 5, baseAtk: 542, subStatType: 'crit_damage', subStatValue: 88.2 },
    { id: 'the_widsith', name: '流浪楽章', weaponType: 'catalyst', rarity: 4, baseAtk: 510, subStatType: 'crit_damage', subStatValue: 55.1 },
    { id: 'sacrificial_fragments', name: '祭礼の断片', weaponType: 'catalyst', rarity: 4, baseAtk: 454, subStatType: 'elemental_mastery', subStatValue: 221 },
    { id: 'favonius_codex', name: '西風秘典', weaponType: 'catalyst', rarity: 4, baseAtk: 510, subStatType: 'energy_recharge', subStatValue: 45.9 },
    { id: 'prototype_amber', name: '金珀・試作', weaponType: 'catalyst', rarity: 4, baseAtk: 510, subStatType: 'hp_percent', subStatValue: 41.3 },
    { id: 'ballad_of_the_boundless_blue', name: '果てなき紺碧の唄', weaponType: 'catalyst', rarity: 4, baseAtk: 565, subStatType: 'energy_recharge', subStatValue: 30.6 },
  ],
};

// キャラクターに初期適用されるおすすめデフォルト武器
export function getDefaultWeaponForCharacter(weaponType: WeaponType): WeaponConfig {
  const presets = POPULAR_WEAPON_PRESETS[weaponType] || POPULAR_WEAPON_PRESETS.sword;
  const first = presets[0];
  return {
    name: first.name,
    baseAtk: first.baseAtk,
    subStatType: first.subStatType,
    subStatValue: first.subStatValue,
  };
}

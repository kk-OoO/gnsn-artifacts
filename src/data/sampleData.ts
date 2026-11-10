import { Artifact } from '@/types/genshin';

// 初期状態は空（ユーザーが自分の聖遺物を登録して管理）
export const INITIAL_ARTIFACTS: Artifact[] = [];

// サンプルデータが必要な場合に備えたプリセット
export const PRESET_SAMPLE_ARTIFACTS: Artifact[] = [
  {
    id: 'art-mh-flower-1',
    setId: 'marechaussee_hunter',
    slot: 'flower',
    rarity: 5,
    level: 20,
    mainStat: { type: 'hp_flat', value: 4780 },
    subStats: [
      { type: 'crit_rate', value: 7.0 },
      { type: 'crit_damage', value: 21.0 },
      { type: 'hp_percent', value: 10.5 },
      { type: 'energy_recharge', value: 5.8 },
    ],
    equippedToCharacterId: 'neuvillette',
    score: 35.0,
    createdAt: 1740000000000,
  },
  {
    id: 'art-mh-plume-1',
    setId: 'marechaussee_hunter',
    slot: 'plume',
    rarity: 5,
    level: 20,
    mainStat: { type: 'atk_flat', value: 311 },
    subStats: [
      { type: 'crit_rate', value: 3.9 },
      { type: 'crit_damage', value: 28.0 },
      { type: 'hp_percent', value: 14.6 },
      { type: 'energy_recharge', value: 6.5 },
    ],
    equippedToCharacterId: 'neuvillette',
    score: 35.8,
    createdAt: 1740000000000,
  },
  {
    id: 'art-mh-sands-1',
    setId: 'marechaussee_hunter',
    slot: 'sands',
    rarity: 5,
    level: 20,
    mainStat: { type: 'hp_percent', value: 46.6 },
    subStats: [
      { type: 'crit_rate', value: 10.5 },
      { type: 'crit_damage', value: 14.8 },
      { type: 'energy_recharge', value: 11.0 },
      { type: 'def_flat', value: 39 },
    ],
    equippedToCharacterId: 'neuvillette',
    score: 35.8,
    createdAt: 1740000000000,
  },
  {
    id: 'art-mh-goblet-1',
    setId: 'marechaussee_hunter',
    slot: 'goblet',
    rarity: 5,
    level: 20,
    mainStat: { type: 'hydro_dmg', value: 46.6 },
    subStats: [
      { type: 'crit_rate', value: 9.7 },
      { type: 'crit_damage', value: 19.4 },
      { type: 'hp_percent', value: 9.9 },
      { type: 'atk_flat', value: 16 },
    ],
    equippedToCharacterId: 'neuvillette',
    score: 38.8,
    createdAt: 1740000000000,
  },
  {
    id: 'art-mh-circlet-1',
    setId: 'marechaussee_hunter',
    slot: 'circlet',
    rarity: 5,
    level: 20,
    mainStat: { type: 'crit_damage', value: 62.2 },
    subStats: [
      { type: 'crit_rate', value: 10.1 },
      { type: 'hp_percent', value: 14.0 },
      { type: 'energy_recharge', value: 6.5 },
      { type: 'def_percent', value: 6.6 },
    ],
    equippedToCharacterId: 'neuvillette',
    score: 20.2,
    createdAt: 1740000000000,
  },
];

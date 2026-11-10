const fs = require('fs');
const path = require('path');
const genshindb = require('genshin-db');

genshindb.setOptions({ queryLanguages: ['Japanese', 'English'], resultLanguage: 'Japanese' });

// 1. 全聖遺物セットの抽出 (enka.network CDNの画像URLを優先)
const artifactNames = genshindb.artifacts('names', { matchCategories: true });
console.log(`Extracting ${artifactNames.length} artifact sets...`);

const artifactSets = {};

function parsePiece2Stats(text) {
  if (!text) return undefined;
  const stats = {};
  if (text.includes('攻撃力+18%') || text.includes('攻撃力+ 18%')) stats.atk_percent = 18;
  if (text.includes('元素チャージ効率+20%')) stats.energy_recharge = 20;
  if (text.includes('元素熟知+80')) stats.elemental_mastery = 80;
  if (text.includes('HP+20%')) stats.hp_percent = 20;
  if (text.includes('防御力+30%')) stats.def_percent = 30;
  if (text.includes('与える治療効果+15%')) stats.healing_bonus = 15;
  if (text.includes('炎元素ダメージ+15%')) stats.pyro_dmg = 15;
  if (text.includes('水元素ダメージ+15%')) stats.hydro_dmg = 15;
  if (text.includes('風元素ダメージ+15%')) stats.anemo_dmg = 15;
  if (text.includes('雷元素ダメージ+15%')) stats.electro_dmg = 15;
  if (text.includes('草元素ダメージ+15%')) stats.dendro_dmg = 15;
  if (text.includes('氷元素ダメージ+15%')) stats.cryo_dmg = 15;
  if (text.includes('岩元素ダメージ+15%')) stats.geo_dmg = 15;
  if (text.includes('物理ダメージ+25%')) stats.physical_dmg = 25;
  return Object.keys(stats).length > 0 ? stats : undefined;
}

function getRelicUrl(filename, fallbackUrl) {
  if (filename) return `https://enka.network/ui/${filename}.png`;
  return fallbackUrl || '';
}

for (const name of artifactNames) {
  const art = genshindb.artifacts(name);
  if (!art) continue;

  const engArt = genshindb.artifacts(name, { resultLanguage: 'English' });
  let id = (engArt?.name || name)
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_');

  if (!id) id = `set_${art.id}`;

  const piece2 = art.effect2Pc || '';
  const piece4 = art.effect4Pc || '';
  const piece2Stats = parsePiece2Stats(piece2);

  const imgs = art.images || {};
  const flowerImg = getRelicUrl(imgs.filename_flower, imgs.mihoyo_flower || imgs.flower);
  const plumeImg = getRelicUrl(imgs.filename_plume, imgs.mihoyo_plume || imgs.plume);
  const sandsImg = getRelicUrl(imgs.filename_sands, imgs.mihoyo_sands || imgs.sands);
  const gobletImg = getRelicUrl(imgs.filename_goblet, imgs.mihoyo_goblet || imgs.goblet);
  const circletImg = getRelicUrl(imgs.filename_circlet, imgs.mihoyo_circlet || imgs.circlet);

  artifactSets[id] = {
    id,
    name: art.name,
    piece2: piece2 || '2セット効果なし',
    piece4: piece4 || '4セット効果なし',
    piece2Stats,
    images: {
      flower: flowerImg,
      plume: plumeImg,
      sands: sandsImg,
      goblet: gobletImg,
      circlet: circletImg,
    }
  };
}

console.log(`Generated ${Object.keys(artifactSets).length} artifact sets.`);

// 2. 全キャラクターの抽出
const charNames = genshindb.characters('names', { matchCategories: true });
console.log(`Extracting ${charNames.length} characters...`);

const ELEMENT_MAP = {
  '炎': 'pyro',
  '水': 'hydro',
  '風': 'anemo',
  '雷': 'electro',
  '草': 'dendro',
  '氷': 'cryo',
  '岩': 'geo',
};

const WEAPON_MAP = {
  'WEAPON_SWORD_ONE_HAND': 'sword',
  'WEAPON_CLAYMORE': 'claymore',
  'WEAPON_POLE': 'polearm',
  'WEAPON_BOW': 'bow',
  'WEAPON_CATALYST': 'catalyst',
};

const characters = [];

for (const name of charNames) {
  const c = genshindb.characters(name);
  if (!c || !c.rarity || !c.weaponType) continue;

  const engChar = genshindb.characters(name, { resultLanguage: 'English' });
  const engName = engChar?.name || c.name;
  let id = engName
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_');

  if (id === 'traveler' && c.name.includes('風')) id = 'traveler_anemo';
  else if (id === 'traveler' && c.name.includes('岩')) id = 'traveler_geo';
  else if (id === 'traveler' && c.name.includes('雷')) id = 'traveler_electro';
  else if (id === 'traveler' && c.name.includes('草')) id = 'traveler_dendro';
  else if (id === 'traveler' && c.name.includes('水')) id = 'traveler_hydro';
  else if (id === 'traveler' && c.name.includes('炎')) id = 'traveler_pyro';

  const element = ELEMENT_MAP[c.elementText] || 'anemo';
  const weapon = WEAPON_MAP[c.weaponType] || 'sword';
  const rarity = c.rarity === 4 ? 4 : 5;

  // enka.networkのアイコンURLを優先
  let avatarUrl = '';
  if (c.images?.filename_icon) {
    avatarUrl = `https://enka.network/ui/${c.images.filename_icon}.png`;
  } else if (c.images?.mihoyo_icon) {
    avatarUrl = c.images.mihoyo_icon;
  }

  // デフォルトロール推論
  let role = 'Main DPS';
  if (['白朮', 'バーバラ', 'ベネット', 'ディオナ', '久岐忍', '早柚', 'シャルロット', '閑雲', 'シグウィン'].some(n => c.name.includes(n))) {
    role = 'Healer';
  } else if (['鍾離', 'トーマ', 'レイラ', 'キララ'].some(n => c.name.includes(n))) {
    role = 'Shielder';
  } else if (['楓原万葉', 'スクロース', 'ウェンティ', 'ナヒーダ', 'ゴロー', '雲菫', 'ファルザン', 'シェヴルーズ', 'シロネン'].some(n => c.name.includes(n))) {
    role = 'Support';
  } else if (['フリーナ', '夜蘭', '行秋', '香菱', 'フィッシュル', '八重神子', 'アルベド', '千織', 'エミリエ'].some(n => c.name.includes(n))) {
    role = 'Sub DPS';
  }

  let recSet1 = 'gladiators_finale';
  let recSet2 = 'noblesse_oblige';
  let sandsRec = ['atk_percent'];
  let gobletRec = [`${element}_dmg`];
  let circletRec = ['crit_rate', 'crit_damage'];
  let subPriority = ['crit_rate', 'crit_damage', 'atk_percent', 'energy_recharge'];
  let targetStats = {
    atk: { min: 1800, ideal: 2200, unit: '', weight: 4 },
    critRate: { min: 65, ideal: 75, unit: '%', weight: 5 },
    critDamage: { min: 130, ideal: 180, unit: '%', weight: 5 },
    energyRecharge: { min: 120, ideal: 140, unit: '%', weight: 3 },
  };

  if (role === 'Healer') {
    recSet1 = 'ocean_hued_clam';
    recSet2 = 'maiden_beloved';
    sandsRec = ['hp_percent', 'energy_recharge'];
    gobletRec = ['hp_percent'];
    circletRec = ['healing_bonus', 'hp_percent'];
    subPriority = ['energy_recharge', 'hp_percent', 'hp_flat'];
    targetStats = {
      hp: { min: 28000, ideal: 35000, unit: '', weight: 5 },
      energyRecharge: { min: 180, ideal: 220, unit: '%', weight: 5 },
    };
  } else if (role === 'Shielder') {
    recSet1 = 'tenacity_of_the_millelith';
    recSet2 = 'noblesse_oblige';
    sandsRec = ['hp_percent'];
    gobletRec = ['hp_percent'];
    circletRec = ['hp_percent', 'crit_rate'];
    subPriority = ['hp_percent', 'energy_recharge', 'hp_flat'];
    targetStats = {
      hp: { min: 38000, ideal: 48000, unit: '', weight: 5 },
      energyRecharge: { min: 130, ideal: 150, unit: '%', weight: 3 },
    };
  } else if (role === 'Support' && element === 'anemo') {
    recSet1 = 'viridescent_venerer';
    recSet2 = 'noblesse_oblige';
    sandsRec = ['elemental_mastery', 'energy_recharge'];
    gobletRec = ['elemental_mastery'];
    circletRec = ['elemental_mastery'];
    subPriority = ['elemental_mastery', 'energy_recharge', 'crit_rate'];
    targetStats = {
      elementalMastery: { min: 700, ideal: 900, unit: '', weight: 5 },
      energyRecharge: { min: 160, ideal: 190, unit: '%', weight: 5 },
    };
  } else if (role === 'Support') {
    recSet1 = 'noblesse_oblige';
    recSet2 = 'tenacity_of_the_millelith';
    sandsRec = ['energy_recharge', 'hp_percent'];
    gobletRec = ['hp_percent', `${element}_dmg`];
    circletRec = ['crit_rate', 'hp_percent'];
    subPriority = ['energy_recharge', 'crit_rate', 'hp_percent'];
    targetStats = {
      energyRecharge: { min: 190, ideal: 230, unit: '%', weight: 5 },
      critRate: { min: 40, ideal: 60, unit: '%', weight: 3 },
    };
  } else if (role === 'Sub DPS') {
    recSet1 = 'emblem_of_severed_fate';
    recSet2 = 'golden_troupe';
    sandsRec = ['atk_percent', 'energy_recharge'];
    gobletRec = [`${element}_dmg`];
    circletRec = ['crit_rate', 'crit_damage'];
    subPriority = ['crit_rate', 'crit_damage', 'energy_recharge', 'atk_percent'];
    targetStats = {
      energyRecharge: { min: 170, ideal: 200, unit: '%', weight: 5 },
      critRate: { min: 65, ideal: 75, unit: '%', weight: 5 },
      critDamage: { min: 130, ideal: 160, unit: '%', weight: 4 },
    };
  }

  characters.push({
    id,
    name: engName,
    japaneseName: c.name,
    element,
    weapon,
    rarity,
    role,
    avatarUrl,
    baseStats: {
      hp: rarity === 5 ? 13000 : 10500,
      atk: rarity === 5 ? 310 : 220,
      def: 700,
      critRate: 5.0,
      critDamage: 50.0,
      energyRecharge: 100,
      elementalMastery: 0,
      elementalDmg: 0,
    },
    recommendedBuild: {
      recommendedSets: [
        { setId: recSet1, description: `${c.name} の基本性能とマッチするおすすめ聖遺物。`, priority: 1 },
        { setId: recSet2, description: '汎用性が高く扱いやすい次点聖遺物。', priority: 2 },
      ],
      recommendedMainStats: {
        sands: sandsRec,
        goblet: gobletRec,
        circlet: circletRec,
      },
      subStatPriority: subPriority,
      targetStats,
      buildTips: [
        `${c.name} の役割（${role}）に合わせたステータス調整が推奨されます。`,
        '役割に応じた必要元素チャージ効率を確保した上で、会心やメインステータスを伸ばしましょう。',
      ],
    },
  });
}

console.log(`Generated ${characters.length} characters.`);

fs.writeFileSync(
  path.join(__dirname, '../src/data/generatedArtifactSets.json'),
  JSON.stringify(artifactSets, null, 2)
);

fs.writeFileSync(
  path.join(__dirname, '../src/data/generatedCharacters.json'),
  JSON.stringify(characters, null, 2)
);

console.log('Successfully saved generatedArtifactSets.json and generatedCharacters.json');

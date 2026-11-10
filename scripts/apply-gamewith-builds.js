const fs = require('fs');
const path = require('path');
const genshindb = require('genshin-db');

genshindb.setOptions({ queryLanguages: ['Japanese', 'English'], resultLanguage: 'Japanese' });

// GameWith準拠の精査済みキャラクター推奨ビルドデータベース
const GAMEWITH_BUILDS = {
  // --- ナタ ---
  'ヌヴィレット': {
    role: 'Main DPS',
    sets: [
      { setId: 'marechaussee_hunter', description: '重撃ビームの自傷と回復で会心率+36%を常時発動。最適聖遺物。', priority: 1 },
      { setId: 'nymphs_dream', description: '水ダメと攻撃力バフ。ファントムが揃うまでの繋ぎ。', priority: 2 },
    ],
    sands: ['hp_percent'],
    goblet: ['hydro_dmg', 'hp_percent'],
    circlet: ['crit_damage', 'hp_percent'],
    subPriority: ['crit_damage', 'crit_rate', 'hp_percent', 'energy_recharge'],
    targets: {
      hp: { min: 34000, ideal: 38000, unit: '', weight: 5 },
      critRate: { min: 50, ideal: 64, unit: '%', weight: 5 },
      critDamage: { min: 200, ideal: 260, unit: '%', weight: 5 },
      energyRecharge: { min: 120, ideal: 135, unit: '%', weight: 3 },
    },
    tips: [
      'ファントム4セット発動で会心率+36%されるため、聖遺物画面での会心率は64%以下に抑えて溢れを防ぎましょう。',
      '重撃のダメージはHP上限に完全に依存するため、攻撃力%は不要です。HP%を重視しましょう。',
      '重撃を途切れず連射するため、元チャ120%〜130%を確保すると爆発がスムーズに回ります。'
    ]
  },
  'フリーナ': {
    role: 'Sub DPS',
    sets: [
      { setId: 'golden_troupe', description: '控えからの元素スキル火力を最大+70%強化。劇団4セット一択。', priority: 1 },
      { setId: 'tenacity_of_the_millelith', description: '千岩2+劇団2等のキメラ構成。繋ぎとして優秀。', priority: 2 },
    ],
    sands: ['hp_percent', 'energy_recharge'],
    goblet: ['hp_percent', 'hydro_dmg'],
    circlet: ['crit_rate', 'crit_damage'],
    subPriority: ['energy_recharge', 'crit_rate', 'crit_damage', 'hp_percent'],
    targets: {
      hp: { min: 36000, ideal: 40000, unit: '', weight: 5 },
      energyRecharge: { min: 170, ideal: 200, unit: '%', weight: 5 },
      critRate: { min: 65, ideal: 80, unit: '%', weight: 4 },
      critDamage: { min: 130, ideal: 170, unit: '%', weight: 4 },
    },
    tips: [
      '元素爆発を毎ローテーション回すことが最重要です。単水運用の場合は元チャ200%前後を目標にしてください。',
      'HP40,000で天賦によるスキルダメバフが上限（+28%）に到達します。',
      '劇団4セットのダメバフが大きいため、杯は水ダメよりHP%の方が総合ダメージが伸びる場合があります。'
    ]
  },
  'シロネン': {
    role: 'Support',
    sets: [
      { setId: 'scroll_of_the_hero_of_cinder_city', description: '夜魂バーストで味方全員に該当元素ダメバフ+40%を付与。最適サポート聖遺物。', priority: 1 },
      { setId: 'husk_of_opulent_dreams', description: '自身の防御力と回復量を高める繋ぎ構成。', priority: 2 },
    ],
    sands: ['def_percent', 'energy_recharge'],
    goblet: ['def_percent'],
    circlet: ['healing_bonus', 'def_percent', 'crit_rate'],
    subPriority: ['def_percent', 'energy_recharge', 'crit_rate'],
    targets: {
      def: { min: 2800, ideal: 3400, unit: '', weight: 5 },
      energyRecharge: { min: 160, ideal: 180, unit: '%', weight: 5 },
    },
    tips: [
      '絵巻4セットを持たせて夜魂関連反応を起こすことで、チーム全体に驚異的な元素バフ（最大40%）を配れます。',
      '防御力参照の回復とバフを持つため、砂・杯は防御力%を優先しましょう。西風剣時は会心冠も視野に入ります。'
    ]
  },
  'ムアラニ': {
    role: 'Main DPS',
    sets: [
      { setId: 'obsidian_codex', description: '夜魂値消費で会心率+40%＆与ダメ+15%。ナタアタッカーの最強聖遺物。', priority: 1 },
      { setId: 'heart_of_depth', description: '水ダメと通常・重撃バフ。黒曜厳選までの代用。', priority: 2 },
    ],
    sands: ['hp_percent'],
    goblet: ['hydro_dmg'],
    circlet: ['crit_damage', 'hp_percent'],
    subPriority: ['crit_damage', 'crit_rate', 'hp_percent', 'elemental_mastery'],
    targets: {
      hp: { min: 32000, ideal: 38000, unit: '', weight: 5 },
      critRate: { min: 50, ideal: 60, unit: '%', weight: 4 },
      critDamage: { min: 180, ideal: 240, unit: '%', weight: 5 },
      elementalMastery: { min: 100, ideal: 180, unit: '', weight: 4 },
    },
    tips: [
      '黒曜4セットで会心率が+40%されるため、ステータス画面での会心率は60%以下に留め、会心ダメージを重点的に盛りましょう。',
      '蒸発反応による巨額の単発大ダメージを狙うため、HP%に加えて元素熟知もサブステで稼ぎましょう。'
    ]
  },
  'キィニチ': {
    role: 'Main DPS',
    sets: [
      { setId: 'obsidian_codex', description: '夜魂値消費で会心率+40%＆与ダメ+15%。スキル砲撃火力を最大化。', priority: 1 },
      { setId: 'golden_troupe', description: '主力である元素スキルの威力を大きく伸ばす代用セット。', priority: 2 },
    ],
    sands: ['atk_percent'],
    goblet: ['dendro_dmg'],
    circlet: ['crit_damage', 'crit_rate'],
    subPriority: ['crit_damage', 'crit_rate', 'atk_percent', 'energy_recharge'],
    targets: {
      atk: { min: 2000, ideal: 2400, unit: '', weight: 4 },
      critRate: { min: 50, ideal: 60, unit: '%', weight: 4 },
      critDamage: { min: 180, ideal: 240, unit: '%', weight: 5 },
      energyRecharge: { min: 120, ideal: 135, unit: '%', weight: 3 },
    },
    tips: [
      '夜魂値を素早くためて廻鱗砲を連射します。黒曜4セットで会心率が40%盛れるため、冠は会心ダメージが基本です。',
      '燃焼または烈開花反応を起こせる編成で組むと、夜魂値の回復が加速します。'
    ]
  },
  'キニチ': {
    // genshin-dbでの表記ゆれ対応
    role: 'Main DPS',
    sets: [
      { setId: 'obsidian_codex', description: '夜魂値消費で会心率+40%＆与ダメ+15%。スキル砲撃火力を最大化。', priority: 1 },
      { setId: 'golden_troupe', description: '主力である元素スキルの威力を大きく伸ばす代用セット。', priority: 2 },
    ],
    sands: ['atk_percent'],
    goblet: ['dendro_dmg'],
    circlet: ['crit_damage', 'crit_rate'],
    subPriority: ['crit_damage', 'crit_rate', 'atk_percent', 'energy_recharge'],
    targets: {
      atk: { min: 2000, ideal: 2400, unit: '', weight: 4 },
      critRate: { min: 50, ideal: 60, unit: '%', weight: 4 },
      critDamage: { min: 180, ideal: 240, unit: '%', weight: 5 },
      energyRecharge: { min: 120, ideal: 135, unit: '%', weight: 3 },
    },
    tips: [
      '夜魂値を素早くためて廻鱗砲を連射します。黒曜4セットで会心率が40%盛れるため、冠は会心ダメージが基本です。',
      '燃焼または烈開花反応を起こせる編成で組むと、夜魂値の回復が加速します。'
    ]
  },
  'チャスカ': {
    role: 'Main DPS',
    sets: [
      { setId: 'obsidian_codex', description: '飛行・夜魂弾チャージ中に会心率+40%を発動。最適聖遺物。', priority: 1 },
      { setId: 'desert_pavilion_chronicle', description: '風ダメと通常・重撃バフ。繋ぎとして。', priority: 2 },
    ],
    sands: ['atk_percent'],
    goblet: ['atk_percent', 'anemo_dmg'],
    circlet: ['crit_damage', 'crit_rate'],
    subPriority: ['crit_damage', 'crit_rate', 'atk_percent', 'elemental_mastery'],
    targets: {
      atk: { min: 2100, ideal: 2500, unit: '', weight: 4 },
      critRate: { min: 50, ideal: 60, unit: '%', weight: 4 },
      critDamage: { min: 180, ideal: 240, unit: '%', weight: 5 },
    },
    tips: [
      '異なる元素（炎・水・氷・雷）の味方を編成することで、チャージ弾が元素変化して大ダメージを叩き出します。',
      '多元素弾を撃つため、杯は風ダメよりも攻撃力%が推奨される場合があります。'
    ]
  },
  'オロルン': {
    role: 'Sub DPS',
    sets: [
      { setId: 'scroll_of_the_hero_of_cinder_city', description: '感電反応などを起点に味方へ元素ダメバフ+40%を付与。最適サポート聖遺物。', priority: 1 },
      { setId: 'golden_troupe', description: '控えからの追撃火力を伸ばすサブアタッカービルド。', priority: 2 },
    ],
    sands: ['atk_percent', 'energy_recharge'],
    goblet: ['electro_dmg'],
    circlet: ['crit_rate', 'crit_damage'],
    subPriority: ['crit_rate', 'crit_damage', 'atk_percent', 'energy_recharge'],
    targets: {
      atk: { min: 1800, ideal: 2200, unit: '', weight: 4 },
      energyRecharge: { min: 160, ideal: 180, unit: '%', weight: 4 },
      critRate: { min: 60, ideal: 75, unit: '%', weight: 4 },
      critDamage: { min: 120, ideal: 160, unit: '%', weight: 4 },
    },
    tips: [
      '感電パーティや水・雷編成で待機しつつ絵巻4セットのバフと追撃をばら撒くサポーターです。'
    ]
  },
  'カチーナ': {
    role: 'Support',
    sets: [
      { setId: 'scroll_of_the_hero_of_cinder_city', description: 'コマちゃんによる岩追撃で絵巻4セット効果（全元素ダメ+40%）を即時起動。', priority: 1 },
      { setId: 'husk_of_opulent_dreams', description: '防御力を伸ばす繋ぎ構成。', priority: 2 },
    ],
    sands: ['def_percent'],
    goblet: ['def_percent', 'geo_dmg'],
    circlet: ['def_percent', 'crit_rate'],
    subPriority: ['def_percent', 'energy_recharge', 'crit_rate'],
    targets: {
      def: { min: 2200, ideal: 2800, unit: '', weight: 5 },
      energyRecharge: { min: 160, ideal: 180, unit: '%', weight: 4 },
    },
    tips: [
      '絵巻4セットを装備させてスキルを置き、即座にメインアタッカーに交代するのが最も強力な運用です。'
    ]
  },
  'シトラリ': {
    role: 'Support',
    sets: [
      { setId: 'scroll_of_the_hero_of_cinder_city', description: '夜魂性質を活かして絵巻4セットの元素ダメバフ+40%を提供。', priority: 1 },
      { setId: 'noblesse_oblige', description: 'チーム攻撃力+20%の旧貴族4。', priority: 2 },
    ],
    sands: ['elemental_mastery', 'energy_recharge'],
    goblet: ['cryo_dmg', 'elemental_mastery'],
    circlet: ['crit_rate', 'elemental_mastery'],
    subPriority: ['elemental_mastery', 'energy_recharge', 'crit_rate'],
    targets: {
      elementalMastery: { min: 300, ideal: 500, unit: '', weight: 5 },
      energyRecharge: { min: 160, ideal: 180, unit: '%', weight: 4 },
    },
    tips: [
      '氷元素サポーターとして絵巻4セットによる多元素バフとシールド・サポートをこなします。'
    ]
  },
  'マーヴィカ': {
    role: 'Main DPS',
    sets: [
      { setId: 'obsidian_codex', description: '夜魂の加護・消費による圧倒的な会心率+40%と炎火力。アタッカー最適。', priority: 1 },
      { setId: 'scroll_of_the_hero_of_cinder_city', description: 'チームサポート兼サブアタッカー運用の絵巻4セット。全元素ダメ+40%。', priority: 2 },
    ],
    sands: ['atk_percent', 'energy_recharge'],
    goblet: ['pyro_dmg'],
    circlet: ['crit_damage', 'crit_rate'],
    subPriority: ['crit_damage', 'crit_rate', 'atk_percent', 'energy_recharge', 'elemental_mastery'],
    targets: {
      atk: { min: 2100, ideal: 2500, unit: '', weight: 4 },
      critRate: { min: 55, ideal: 60, unit: '%', weight: 4 },
      critDamage: { min: 180, ideal: 240, unit: '%', weight: 5 },
      energyRecharge: { min: 130, ideal: 150, unit: '%', weight: 3 },
    },
    tips: [
      'アタッカー型は黒曜4セット、サポーター型は絵巻4セットと役割によって切り替えが可能です。'
    ]
  },

  // --- フォンテーヌ ---
  'アルレッキーノ': {
    role: 'Main DPS',
    sets: [
      { setId: 'fragment_of_harmonic_whimsy', description: '命の契約の増減で常時最大与ダメ+54%。最適聖遺物。', priority: 1 },
      { setId: 'gladiators_finale', description: '通常攻撃ダメージ+35%。厳選が進むまでの非常に強力な代用。', priority: 2 },
    ],
    sands: ['atk_percent'],
    goblet: ['pyro_dmg'],
    circlet: ['crit_rate', 'crit_damage'],
    subPriority: ['crit_rate', 'crit_damage', 'atk_percent', 'elemental_mastery'],
    targets: {
      atk: { min: 2000, ideal: 2400, unit: '', weight: 4 },
      critRate: { min: 70, ideal: 85, unit: '%', weight: 5 },
      critDamage: { min: 160, ideal: 220, unit: '%', weight: 5 },
      elementalMastery: { min: 80, ideal: 140, unit: '', weight: 3 },
    },
    tips: [
      '戦闘中は回復を受け付けない（自身の元素爆発のみ回復可能）ため、高い攻撃力と会心バランスを追求しましょう。',
      '蒸発編成では元素熟知もサブステータスで100前後確保できるとダメージが大きく伸びます。'
    ]
  },
  'クロリンデ': {
    role: 'Main DPS',
    sets: [
      { setId: 'fragment_of_harmonic_whimsy', description: '銃撃と突進で命の契約が激しく増減し、最大与ダメ+54%を常時維持。最適。', priority: 1 },
      { setId: 'gladiators_finale', description: '通常攻撃扱いとなる突進ダメージを強化する安定代用。', priority: 2 },
    ],
    sands: ['atk_percent'],
    goblet: ['electro_dmg'],
    circlet: ['crit_damage', 'crit_rate'],
    subPriority: ['crit_damage', 'crit_rate', 'atk_percent', 'elemental_mastery'],
    targets: {
      atk: { min: 1900, ideal: 2300, unit: '', weight: 4 },
      critRate: { min: 65, ideal: 80, unit: '%', weight: 5 },
      critDamage: { min: 170, ideal: 230, unit: '%', weight: 5 },
      elementalMastery: { min: 60, ideal: 120, unit: '', weight: 3 },
    },
    tips: [
      '天賦効果で会心率が最大+20%自前で盛れるため、聖遺物画面では会心率80%程度を目安にして溢れを防ぎましょう。'
    ]
  },
  'ナヴィア': {
    role: 'Main DPS',
    sets: [
      { setId: 'nighttime_whispers_in_the_echoing_woods', description: '結晶シールド獲得時に岩ダメ最大+50%。ナヴィアの専用モチーフ聖遺物。', priority: 1 },
      { setId: 'golden_troupe', description: '元素スキル砲撃の瞬間火力を大幅に高める代用聖遺物。', priority: 2 },
    ],
    sands: ['atk_percent'],
    goblet: ['geo_dmg'],
    circlet: ['crit_rate', 'crit_damage'],
    subPriority: ['crit_rate', 'crit_damage', 'atk_percent', 'energy_recharge'],
    targets: {
      atk: { min: 2200, ideal: 2600, unit: '', weight: 4 },
      critRate: { min: 70, ideal: 85, unit: '%', weight: 5 },
      critDamage: { min: 160, ideal: 220, unit: '%', weight: 5 },
      energyRecharge: { min: 120, ideal: 135, unit: '%', weight: 3 },
    },
    tips: [
      'エレガント・ショットガンの単発超火力を外さないよう、会心率は最低でも70%以上、できれば80%近く確保しましょう。'
    ]
  },
  '千織': {
    role: 'Sub DPS',
    sets: [
      { setId: 'golden_troupe', description: '控えからの「たもと」追撃ダメージを最大+70%強化。最適聖遺物。', priority: 1 },
      { setId: 'husk_of_opulent_dreams', description: '防御力と岩ダメを大きく伸ばす強力な選択肢。', priority: 2 },
    ],
    sands: ['def_percent'],
    goblet: ['geo_dmg'],
    circlet: ['crit_rate', 'crit_damage'],
    subPriority: ['crit_rate', 'crit_damage', 'def_percent', 'atk_percent'],
    targets: {
      def: { min: 2200, ideal: 2600, unit: '', weight: 5 },
      critRate: { min: 70, ideal: 85, unit: '%', weight: 5 },
      critDamage: { min: 160, ideal: 220, unit: '%', weight: 5 },
    },
    tips: [
      'ダメージ倍率は攻撃力よりも防御力の比重が圧倒的に高いため、時計は防御力%一択です。'
    ]
  },
  'エミリエ': {
    role: 'Sub DPS',
    sets: [
      { setId: 'unfinished_reverie', description: '燃焼状態の敵が存在するとき与ダメージ最大+50%。エミリエ専用の最適聖遺物。', priority: 1 },
      { setId: 'deepwood_memories', description: 'チーム内に深林持ちがいない場合の安定サポート選択肢。', priority: 2 },
    ],
    sands: ['atk_percent'],
    goblet: ['dendro_dmg'],
    circlet: ['crit_rate', 'crit_damage'],
    subPriority: ['crit_rate', 'crit_damage', 'atk_percent', 'energy_recharge'],
    targets: {
      atk: { min: 2000, ideal: 2400, unit: '', weight: 4 },
      critRate: { min: 70, ideal: 85, unit: '%', weight: 5 },
      critDamage: { min: 150, ideal: 200, unit: '%', weight: 5 },
      energyRecharge: { min: 120, ideal: 140, unit: '%', weight: 3 },
    },
    tips: [
      '燃焼反応をトリガーに高火力なルミドゥースの瓶追撃を叩き込みます。燃焼パーティでの運用が前提です。'
    ]
  },
  '閑雲': {
    role: 'Support',
    sets: [
      { setId: 'viridescent_venerer', description: '拡散による元素耐性デバフ40%。汎用性最高の最適サポート。', priority: 1 },
      { setId: 'song_of_days_past', description: '全体回復量をダメージバフに還元するサポーター構成。', priority: 2 },
      { setId: 'noblesse_oblige', description: '元素爆発発動でチーム全体の攻撃力+20%。', priority: 3 },
    ],
    sands: ['atk_percent', 'energy_recharge'],
    goblet: ['atk_percent'],
    circlet: ['atk_percent', 'healing_bonus'],
    subPriority: ['atk_percent', 'energy_recharge', 'atk_flat'],
    targets: {
      atk: { min: 3000, ideal: 3500, unit: '', weight: 5 },
      energyRecharge: { min: 180, ideal: 220, unit: '%', weight: 5 },
    },
    tips: [
      '落下攻撃バフは自身の「攻撃力」上限4,500まで参照されるため、攻撃力%と元チャを徹底的に盛りましょう。'
    ]
  },
  '嘉明': {
    role: 'Main DPS',
    sets: [
      { setId: 'marechaussee_hunter', description: 'スキルによる自傷と回復で会心率+36%を即座に維持。最適聖遺物。', priority: 1 },
      { setId: 'crimson_witch_of_flames', description: '蒸発・溶解による落下攻撃火力を底上げする魔女4。', priority: 2 },
    ],
    sands: ['atk_percent', 'elemental_mastery'],
    goblet: ['pyro_dmg'],
    circlet: ['crit_damage', 'crit_rate'],
    subPriority: ['crit_damage', 'crit_rate', 'atk_percent', 'elemental_mastery'],
    targets: {
      atk: { min: 1800, ideal: 2100, unit: '', weight: 4 },
      critRate: { min: 50, ideal: 60, unit: '%', weight: 4 },
      critDamage: { min: 170, ideal: 220, unit: '%', weight: 5 },
      elementalMastery: { min: 100, ideal: 180, unit: '', weight: 3 },
    },
    tips: [
      '閑雲やフリーナと組み合わせることで星5顔負けの落下蒸発大ダメージを出せます。ファントム4が最適です。'
    ]
  },
  'シュヴルーズ': {
    role: 'Support',
    sets: [
      { setId: 'noblesse_oblige', description: '元素爆発でチーム全体の攻撃力+20%。過負荷パーティの最適サポート。', priority: 1 },
      { setId: 'song_of_days_past', description: '回復能力をダメージ加算バフに変換する構成。', priority: 2 },
    ],
    sands: ['hp_percent'],
    goblet: ['hp_percent'],
    circlet: ['hp_percent', 'healing_bonus'],
    subPriority: ['hp_percent', 'hp_flat', 'energy_recharge'],
    targets: {
      hp: { min: 40000, ideal: 42000, unit: '', weight: 5 },
      energyRecharge: { min: 140, ideal: 160, unit: '%', weight: 3 },
    },
    tips: [
      'HP40,000で天賦による炎・雷キャラへの攻撃力バフが上限（+40%）に到達します。まずはHP4万を目指しましょう。'
    ]
  },
  'リオセスリ': {
    role: 'Main DPS',
    sets: [
      { setId: 'marechaussee_hunter', description: 'スキル通常攻撃の自傷と回復で会心率+36%。最適聖遺物。', priority: 1 },
      { setId: 'shimenawas_reminiscence', description: '通常攻撃・重撃ダメージ+50%。', priority: 2 },
    ],
    sands: ['atk_percent'],
    goblet: ['cryo_dmg'],
    circlet: ['crit_damage', 'crit_rate'],
    subPriority: ['crit_damage', 'crit_rate', 'atk_percent', 'elemental_mastery'],
    targets: {
      atk: { min: 2000, ideal: 2300, unit: '', weight: 4 },
      critRate: { min: 50, ideal: 60, unit: '%', weight: 4 },
      critDamage: { min: 190, ideal: 240, unit: '%', weight: 5 },
    },
    tips: [
      'ファントム4で会心率を大きく稼げるため、冠は会心ダメージにして溶解や通常ラッシュの威力を高めましょう。'
    ]
  },
  'リネ': {
    role: 'Main DPS',
    sets: [
      { setId: 'marechaussee_hunter', description: '二段チャージ重撃のHP消費で会心率+36%。最適聖遺物。', priority: 1 },
      { setId: 'lavawalker', description: 'モノパイロ（炎単色）編成で常時与ダメ+35%。', priority: 2 },
    ],
    sands: ['atk_percent'],
    goblet: ['pyro_dmg'],
    circlet: ['crit_damage', 'crit_rate'],
    subPriority: ['crit_damage', 'crit_rate', 'atk_percent'],
    targets: {
      atk: { min: 2100, ideal: 2500, unit: '', weight: 4 },
      critRate: { min: 50, ideal: 60, unit: '%', weight: 4 },
      critDamage: { min: 200, ideal: 250, unit: '%', weight: 5 },
    },
    tips: [
      '炎元素が付着した敵へのダメージが跳ね上がる天賦を持つため、ベネット・香菱・鍾離などのモノパイロ編成が基本です。'
    ]
  },
  'シグウィン': {
    role: 'Support',
    sets: [
      { setId: 'tenacity_of_the_millelith', description: '千岩2+花海2のHP+40%キメラ構成。厳選が最も容易で強力。', priority: 1 },
      { setId: 'song_of_days_past', description: '全体回復をバフに変換する在りし日4。', priority: 2 },
    ],
    sands: ['hp_percent'],
    goblet: ['hp_percent'],
    circlet: ['hp_percent', 'healing_bonus'],
    subPriority: ['hp_percent', 'energy_recharge', 'hp_flat'],
    targets: {
      hp: { min: 55000, ideal: 65000, unit: '', weight: 5 },
      energyRecharge: { min: 140, ideal: 160, unit: '%', weight: 3 },
    },
    tips: [
      '待機キャラの元素スキルダメージをバフする天賦はHP65,000で上限（+2800）に達します。HPをとにかく盛りましょう。'
    ]
  },
  'シャルロット': {
    role: 'Healer',
    sets: [
      { setId: 'noblesse_oblige', description: '爆発発動でチーム全体の攻撃力+20%。全体回復と攻撃バフを両立。', priority: 1 },
      { setId: 'song_of_days_past', description: '回復量をダメージバフに還元する在りし日4。', priority: 2 },
      { setId: 'maiden_beloved', description: '回復特化の少女4。', priority: 3 },
    ],
    sands: ['energy_recharge', 'atk_percent'],
    goblet: ['atk_percent'],
    circlet: ['healing_bonus', 'crit_rate'],
    subPriority: ['energy_recharge', 'atk_percent', 'crit_rate'],
    targets: {
      energyRecharge: { min: 220, ideal: 250, unit: '%', weight: 5 },
      atk: { min: 2000, ideal: 2400, unit: '', weight: 4 },
    },
    tips: [
      'フリーナ編成の全体ヒーラーとして優秀です。回復量は攻撃力依存のため、元チャと攻撃力を盛りましょう。'
    ]
  },
  'フレミネ': {
    role: 'Main DPS',
    sets: [
      { setId: 'pale_flame', description: '圧力ペルスの発動で蒼白4の物理バフを最大発動。物理アタッカー最適解。', priority: 1 },
      { setId: 'blizzard_strayer', description: '氷砕きや氷特化で戦う場合の氷風4。', priority: 2 },
    ],
    sands: ['atk_percent'],
    goblet: ['physical_dmg', 'cryo_dmg'],
    circlet: ['crit_rate', 'crit_damage'],
    subPriority: ['crit_rate', 'crit_damage', 'atk_percent'],
    targets: {
      atk: { min: 1900, ideal: 2200, unit: '', weight: 4 },
      critRate: { min: 65, ideal: 80, unit: '%', weight: 5 },
      critDamage: { min: 150, ideal: 200, unit: '%', weight: 5 },
    },
    tips: [
      '氷元素と雷元素で超電導を起こし、物理耐性を下げてから圧力ペルスで大ダメージを与えましょう。'
    ]
  },
  'リネット': {
    role: 'Support',
    sets: [
      { setId: 'viridescent_venerer', description: '元素耐性-40%デバフ。風サポーターの定番最適聖遺物。', priority: 1 },
      { setId: 'noblesse_oblige', description: 'チーム攻撃力+20%の旧貴族4。', priority: 2 },
    ],
    sands: ['energy_recharge', 'atk_percent'],
    goblet: ['anemo_dmg'],
    circlet: ['crit_rate'],
    subPriority: ['energy_recharge', 'crit_rate', 'atk_percent'],
    targets: {
      energyRecharge: { min: 180, ideal: 220, unit: '%', weight: 5 },
      critRate: { min: 50, ideal: 65, unit: '%', weight: 4 },
    },
    tips: [
      'ウーシア属性攻撃とデコイ爆発を持ちます。西風剣を持たせて元チャと会心率を確保しましょう。'
    ]
  },

  // --- スメール ---
  'アルハイゼン': {
    role: 'Main DPS',
    sets: [
      { setId: 'gilded_dreams', description: '高い元素熟知と攻撃力バフを獲得。自身の火力を最大化する最適聖遺物。', priority: 1 },
      { setId: 'deepwood_memories', description: 'パーティ内に深林役が他にいない場合は深林4セットを装備。草耐性-30%。', priority: 2 },
    ],
    sands: ['elemental_mastery'],
    goblet: ['dendro_dmg'],
    circlet: ['crit_rate', 'crit_damage'],
    subPriority: ['crit_rate', 'crit_damage', 'elemental_mastery', 'energy_recharge', 'atk_percent'],
    targets: {
      elementalMastery: { min: 350, ideal: 450, unit: '', weight: 5 },
      critRate: { min: 70, ideal: 85, unit: '%', weight: 5 },
      critDamage: { min: 160, ideal: 220, unit: '%', weight: 5 },
      atk: { min: 1300, ideal: 1500, unit: '', weight: 3 },
      energyRecharge: { min: 120, ideal: 135, unit: '%', weight: 3 },
    },
    tips: [
      '琢光鏡による追撃ダメージは攻撃力よりも元素熟知の依存度が高いため、時計は元素熟知が圧倒的に推奨されます。',
      'ナヒーダや忍などのサポーターに深林4を持たせ、自身は金メッキ4で火力を極めるのが理想です。'
    ]
  },
  'ナヒーダ': {
    role: 'Sub DPS',
    sets: [
      { setId: 'deepwood_memories', description: '草耐性-30%デバフ。チームの草関連ダメージを底上げする必須聖遺物。', priority: 1 },
      { setId: 'gilded_dreams', description: '味方が深林を持つ場合、自身の熟知と火力を最大化する金メッキ4。', priority: 2 },
    ],
    sands: ['elemental_mastery'],
    goblet: ['elemental_mastery', 'dendro_dmg'],
    circlet: ['elemental_mastery', 'crit_rate', 'crit_damage'],
    subPriority: ['elemental_mastery', 'crit_rate', 'crit_damage', 'atk_percent'],
    targets: {
      elementalMastery: { min: 800, ideal: 1000, unit: '', weight: 5 },
      critRate: { min: 40, ideal: 60, unit: '%', weight: 4 },
      critDamage: { min: 120, ideal: 160, unit: '%', weight: 4 },
    },
    tips: [
      '控えメインの場合は熟知1000を目指し、味方へのバフ（最大+250）と滅浄三業の会心率・与ダメを最大化しましょう。'
    ]
  },
  '放浪者': {
    role: 'Main DPS',
    sets: [
      { setId: 'desert_pavilion_chronicle', description: '重撃命中後の攻撃速度+10%＆通常・重撃・落下ダメ+40%。専用最適聖遺物。', priority: 1 },
      { setId: 'shimenawas_reminiscence', description: '通常・重撃ダメ+50%。爆発頻度は落ちるが安定高火力。', priority: 2 },
    ],
    sands: ['atk_percent'],
    goblet: ['anemo_dmg'],
    circlet: ['crit_rate', 'crit_damage'],
    subPriority: ['crit_rate', 'crit_damage', 'atk_percent', 'energy_recharge'],
    targets: {
      atk: { min: 2000, ideal: 2300, unit: '', weight: 4 },
      critRate: { min: 70, ideal: 85, unit: '%', weight: 5 },
      critDamage: { min: 170, ideal: 230, unit: '%', weight: 5 },
    },
    tips: [
      '砂上4セットを装備している場合は、空中に浮いた直後にまず重撃を1回当ててバフを発動させてから通常攻撃を連打しましょう。'
    ]
  },
  'セノ': {
    role: 'Main DPS',
    sets: [
      { setId: 'thundering_fury', description: 'スキルのクールタイムを短縮し、冥相の判定にスキルを合わせやすくなる最適聖遺物。', priority: 1 },
      { setId: 'gilded_dreams', description: '激化・超開花に必要な元素熟知を大幅に稼げる金メッキ4。', priority: 2 },
    ],
    sands: ['elemental_mastery', 'atk_percent'],
    goblet: ['electro_dmg'],
    circlet: ['crit_rate', 'crit_damage'],
    subPriority: ['crit_rate', 'crit_damage', 'elemental_mastery', 'energy_recharge'],
    targets: {
      elementalMastery: { min: 250, ideal: 350, unit: '', weight: 4 },
      critRate: { min: 70, ideal: 85, unit: '%', weight: 5 },
      critDamage: { min: 160, ideal: 220, unit: '%', weight: 5 },
      energyRecharge: { min: 130, ideal: 145, unit: '%', weight: 4 },
    },
    tips: [
      '元素爆発の継続時間が長いため、元チャ130%〜140%を確保して爆発ループを途切れさせないようにしましょう。'
    ]
  },
  'ティナリ': {
    role: 'Main DPS',
    sets: [
      { setId: 'wanderers_troupe', description: '元素熟知+80＆重撃ダメージ+35%。瞬発チャージ重撃と好相性。', priority: 1 },
      { setId: 'gilded_dreams', description: '激化反応ダメージを高める金メッキ4。', priority: 2 },
    ],
    sands: ['elemental_mastery'],
    goblet: ['dendro_dmg'],
    circlet: ['crit_rate', 'crit_damage'],
    subPriority: ['crit_rate', 'crit_damage', 'elemental_mastery', 'atk_percent'],
    targets: {
      elementalMastery: { min: 250, ideal: 350, unit: '', weight: 5 },
      critRate: { min: 70, ideal: 85, unit: '%', weight: 5 },
      critDamage: { min: 160, ideal: 220, unit: '%', weight: 5 },
    },
    tips: [
      'スキル後の高速3連重撃を敵に叩き込みます。八重神子やフィッシュルとの草雷激化で真価を発揮します。'
    ]
  },
  'ニィロウ': {
    role: 'Support',
    sets: [
      { setId: 'tenacity_of_the_millelith', description: '千岩2+花海2でHP+40%を確保。豊穣の核ダメージを限界まで伸ばす。', priority: 1 },
    ],
    sands: ['hp_percent'],
    goblet: ['hp_percent'],
    circlet: ['hp_percent'],
    subPriority: ['hp_percent', 'hp_flat', 'elemental_mastery', 'energy_recharge'],
    targets: {
      hp: { min: 68000, ideal: 74444, unit: '', weight: 5 },
      elementalMastery: { min: 100, ideal: 200, unit: '', weight: 3 },
    },
    tips: [
      'HP上限74,444で固有天賦による豊穣の核ダメージバフが最大（+400%）に達します。時計・杯・冠すべてHP%で固めましょう。'
    ]
  },
  '白朮': {
    role: 'Healer',
    sets: [
      { setId: 'deepwood_memories', description: '草耐性-30%デバフ。チームサポートとして最も汎用的な聖遺物。', priority: 1 },
      { setId: 'ocean_hued_clam', description: '回復量をダメージの泡に変換する海染4。', priority: 2 },
    ],
    sands: ['hp_percent', 'energy_recharge'],
    goblet: ['hp_percent'],
    circlet: ['hp_percent', 'healing_bonus'],
    subPriority: ['hp_percent', 'energy_recharge', 'hp_flat'],
    targets: {
      hp: { min: 45000, ideal: 50000, unit: '', weight: 5 },
      energyRecharge: { min: 180, ideal: 220, unit: '%', weight: 5 },
    },
    tips: [
      'HP50,000で天賦による燃焼・開花・激化バフが上限（最大100%）になります。元チャを確保しつつHP5万を目指しましょう。'
    ]
  },
  'ディシア': {
    role: 'Sub DPS',
    sets: [
      { setId: 'vourukashas_glow', description: '被ダメージ時に元素スキル・爆発ダメージ最大+50%。ディシアの専用聖遺物。', priority: 1 },
      { setId: 'tenacity_of_the_millelith', description: '中断耐性領域とスキル追撃による千岩4攻撃バフサポーター。', priority: 2 },
      { setId: 'emblem_of_severed_fate', description: '元素爆発アタッカー運用の絶縁4。', priority: 3 },
    ],
    sands: ['atk_percent', 'hp_percent'],
    goblet: ['pyro_dmg'],
    circlet: ['crit_rate', 'crit_damage'],
    subPriority: ['crit_rate', 'crit_damage', 'atk_percent', 'hp_percent', 'energy_recharge'],
    targets: {
      hp: { min: 28000, ideal: 34000, unit: '', weight: 4 },
      atk: { min: 1600, ideal: 2000, unit: '', weight: 4 },
      critRate: { min: 65, ideal: 75, unit: '%', weight: 4 },
      critDamage: { min: 140, ideal: 180, unit: '%', weight: 4 },
    },
    tips: [
      'アタッカー型なら花海4または絶縁4、シールド代わりのサポートなら千岩4と目的によって使い分けましょう。'
    ]
  },
  'セトス': {
    role: 'Main DPS',
    sets: [
      { setId: 'wanderers_troupe', description: '熟知+80と重撃ダメージ+35%。貫通チャージショットと相性抜群。', priority: 1 },
      { setId: 'gilded_dreams', description: '元素熟知を大きく盛る金メッキ4。', priority: 2 },
    ],
    sands: ['elemental_mastery'],
    goblet: ['electro_dmg'],
    circlet: ['crit_rate', 'crit_damage'],
    subPriority: ['crit_rate', 'crit_damage', 'elemental_mastery', 'energy_recharge'],
    targets: {
      elementalMastery: { min: 350, ideal: 450, unit: '', weight: 5 },
      critRate: { min: 70, ideal: 80, unit: '%', weight: 5 },
      critDamage: { min: 150, ideal: 200, unit: '%', weight: 5 },
    },
    tips: [
      'ダメージは元素熟知依存度が極めて高いため、時計は元素熟知にし激化反応で大ダメージを狙いましょう。'
    ]
  },
  'コレイ': {
    role: 'Support',
    sets: [
      { setId: 'deepwood_memories', description: '草耐性-30%デバフ。草編成の定番サポート。', priority: 1 },
      { setId: 'noblesse_oblige', description: 'チーム攻撃力+20%の旧貴族4。', priority: 2 },
    ],
    sands: ['energy_recharge', 'atk_percent'],
    goblet: ['dendro_dmg'],
    circlet: ['crit_rate'],
    subPriority: ['energy_recharge', 'crit_rate', 'crit_damage', 'elemental_mastery'],
    targets: {
      energyRecharge: { min: 180, ideal: 220, unit: '%', weight: 5 },
      critRate: { min: 50, ideal: 65, unit: '%', weight: 4 },
    },
    tips: [
      '終焉弓や西風弓を持たせ、深林4で草耐性を下げてアタッカーに繋ぎましょう。'
    ]
  },
  'カーヴェ': {
    role: 'Main DPS',
    sets: [
      { setId: 'deepwood_memories', description: '草耐性-30%デバフ。開花パーティのドライバー兼サポーター。', priority: 1 },
      { setId: 'flower_of_paradise_lost', description: '自身で開花を起こす場合の楽園4。', priority: 2 },
    ],
    sands: ['elemental_mastery', 'energy_recharge'],
    goblet: ['elemental_mastery'],
    circlet: ['elemental_mastery', 'healing_bonus'],
    subPriority: ['energy_recharge', 'elemental_mastery', 'hp_percent'],
    targets: {
      elementalMastery: { min: 600, ideal: 850, unit: '', weight: 5 },
      energyRecharge: { min: 180, ideal: 220, unit: '%', weight: 5 },
    },
    tips: [
      '草原核の爆発ダメージで自らを回復する天賦を持ちます。熟知と元チャを優先しましょう。'
    ]
  },
  'ドリー': {
    role: 'Healer',
    sets: [
      { setId: 'noblesse_oblige', description: '爆発発動でチーム攻撃力+20%＆エネルギー供給。', priority: 1 },
      { setId: 'ocean_hued_clam', description: '回復量をダメージの泡に変換する海染4。', priority: 2 },
    ],
    sands: ['energy_recharge'],
    goblet: ['hp_percent'],
    circlet: ['healing_bonus', 'hp_percent'],
    subPriority: ['energy_recharge', 'hp_percent', 'hp_flat'],
    targets: {
      energyRecharge: { min: 220, ideal: 260, unit: '%', weight: 5 },
      hp: { min: 25000, ideal: 30000, unit: '', weight: 4 },
    },
    tips: [
      '元素爆発で繋がった味方のHP回復と元素エネルギー回復を行います。元チャをとにかく盛りましょう。'
    ]
  },
  'ファルザン': {
    role: 'Support',
    sets: [
      { setId: 'viridescent_venerer', description: '翠緑4で他元素耐性-40%デバフ。風サポーターの定番。', priority: 1 },
      { setId: 'tenacity_of_the_millelith', description: '完凸（第6重）時に崩壊の風圧追撃で千岩4攻撃バフを常時発動可能。', priority: 2 },
      { setId: 'noblesse_oblige', description: 'チーム攻撃力+20%サポート。', priority: 3 },
    ],
    sands: ['energy_recharge'],
    goblet: ['anemo_dmg', 'atk_percent'],
    circlet: ['crit_rate'],
    subPriority: ['energy_recharge', 'crit_rate', 'atk_percent'],
    targets: {
      energyRecharge: { min: 250, ideal: 300, unit: '%', weight: 5 },
      critRate: { min: 40, ideal: 50, unit: '%', weight: 3 },
    },
    tips: [
      '風元素アタッカー（魈・放浪者・平蔵など）の火力を飛躍的に引き上げます。無凸〜5凸は元チャ280%以上、完凸なら200%前後を目標にしましょう。'
    ]
  },
  'レイラ': {
    role: 'Shielder',
    sets: [
      { setId: 'tenacity_of_the_millelith', description: 'シールド耐久値を高め、夜星追撃で千岩4の攻撃バフを継続発動。最適。', priority: 1 },
    ],
    sands: ['hp_percent'],
    goblet: ['hp_percent'],
    circlet: ['hp_percent'],
    subPriority: ['hp_percent', 'hp_flat', 'energy_recharge'],
    targets: {
      hp: { min: 38000, ideal: 45000, unit: '', weight: 5 },
      energyRecharge: { min: 130, ideal: 150, unit: '%', weight: 3 },
    },
    tips: [
      '鍾離に次ぐ極めて硬いシールドを展開できます。時計・杯・冠すべてHP%にして耐久値を極限まで高めましょう。'
    ]
  },

  // --- 稲妻 ---
  '雷電将軍': {
    role: 'Sub DPS',
    sets: [
      { setId: 'emblem_of_severed_fate', description: '元素チャージ効率を元素爆発ダメージに還元（最大+75%）。圧倒的最適解。', priority: 1 },
      { setId: 'gilded_dreams', description: '超開花起動役として熟知特化にする場合の金メッキ4。', priority: 2 },
    ],
    sands: ['energy_recharge', 'atk_percent'],
    goblet: ['electro_dmg', 'atk_percent'],
    circlet: ['crit_rate', 'crit_damage'],
    subPriority: ['crit_rate', 'crit_damage', 'energy_recharge', 'atk_percent'],
    targets: {
      energyRecharge: { min: 250, ideal: 280, unit: '%', weight: 5 },
      atk: { min: 1600, ideal: 2000, unit: '', weight: 4 },
      critRate: { min: 60, ideal: 75, unit: '%', weight: 5 },
      critDamage: { min: 120, ideal: 160, unit: '%', weight: 5 },
    },
    tips: [
      '元チャは自身の雷元素ダメバフと味方へのエネルギー供給量に直結します。最低でも250%以上を確保しましょう。'
    ]
  },
  '楓原万葉': {
    role: 'Support',
    sets: [
      { setId: 'viridescent_venerer', description: '拡散元素の耐性-40%デバフ。万葉の必須聖遺物。', priority: 1 },
    ],
    sands: ['elemental_mastery'],
    goblet: ['elemental_mastery'],
    circlet: ['elemental_mastery'],
    subPriority: ['elemental_mastery', 'energy_recharge', 'crit_rate'],
    targets: {
      elementalMastery: { min: 850, ideal: 1000, unit: '', weight: 5 },
      energyRecharge: { min: 160, ideal: 180, unit: '%', weight: 5 },
    },
    tips: [
      '熟知1000で拡散した元素のダメージバフ+40%を提供できるようになります。時計・杯・冠すべて熟知メインに揃えましょう。'
    ]
  },
  '神里綾華': {
    role: 'Main DPS',
    sets: [
      { setId: 'blizzard_strayer', description: '氷付着・凍結相手に会心率最大+40%。凍結パーティの必須最適聖遺物。', priority: 1 },
    ],
    sands: ['atk_percent'],
    goblet: ['cryo_dmg'],
    circlet: ['crit_damage'],
    subPriority: ['crit_damage', 'atk_percent', 'energy_recharge', 'crit_rate'],
    targets: {
      atk: { min: 2000, ideal: 2200, unit: '', weight: 4 },
      critRate: { min: 35, ideal: 45, unit: '%', weight: 4 },
      critDamage: { min: 220, ideal: 270, unit: '%', weight: 5 },
      energyRecharge: { min: 130, ideal: 145, unit: '%', weight: 4 },
    },
    tips: [
      '氷風4セット（+40%）と氷共鳴（+15%）で会心率が計+55%されるため、聖遺物画面での会心率は35〜45%で十分です。会心ダメージを限界まで盛りましょう。'
    ]
  },
  '神里綾人': {
    role: 'Main DPS',
    sets: [
      { setId: 'echoes_of_an_offering', description: '通常攻撃の基礎ダメージ加算。瞬水剣と非常に噛み合った最適セット。', priority: 1 },
      { setId: 'gladiators_finale', description: '通常攻撃ダメージ+35%。厳選難易度が低く安定。', priority: 2 },
      { setId: 'heart_of_depth', description: '水ダメと通常攻撃バフ。', priority: 3 },
    ],
    sands: ['atk_percent'],
    goblet: ['hydro_dmg'],
    circlet: ['crit_rate', 'crit_damage'],
    subPriority: ['crit_rate', 'crit_damage', 'atk_percent', 'energy_recharge'],
    targets: {
      atk: { min: 1900, ideal: 2200, unit: '', weight: 4 },
      critRate: { min: 70, ideal: 85, unit: '%', weight: 5 },
      critDamage: { min: 160, ideal: 210, unit: '%', weight: 5 },
    },
    tips: [
      'スキル発動後の長押し瞬水剣で手数を稼ぐため、会心率と会心ダメージのバランスが非常に重要です。'
    ]
  },
  '宵宮': {
    role: 'Main DPS',
    sets: [
      { setId: 'shimenawas_reminiscence', description: 'スキル発動で通常攻撃ダメージ+50%。通常射撃連打と最高峰の相性。', priority: 1 },
      { setId: 'echoes_of_an_offering', description: '通常攻撃の威力を上げる余響4。爆発を回したい場合にもおすすめ。', priority: 2 },
      { setId: 'crimson_witch_of_flames', description: '蒸発反応ダメージを高める魔女4。', priority: 3 },
    ],
    sands: ['atk_percent'],
    goblet: ['pyro_dmg'],
    circlet: ['crit_rate', 'crit_damage'],
    subPriority: ['crit_rate', 'crit_damage', 'atk_percent', 'elemental_mastery'],
    targets: {
      atk: { min: 2000, ideal: 2300, unit: '', weight: 4 },
      critRate: { min: 75, ideal: 85, unit: '%', weight: 5 },
      critDamage: { min: 170, ideal: 230, unit: '%', weight: 5 },
    },
    tips: [
      'しめ縄4セットはエネルギーを15消費して通常火力を大きく跳ね上げます。単体ボスに対して圧倒的な火力を誇ります。'
    ]
  },
  '八重神子': {
    role: 'Sub DPS',
    sets: [
      { setId: 'golden_troupe', description: '控えからの殺生櫻（スキル）追撃ダメージ最大+70%。最適聖遺物。', priority: 1 },
      { setId: 'gilded_dreams', description: '激化反応ダメージを高める金メッキ4。', priority: 2 },
    ],
    sands: ['atk_percent', 'elemental_mastery'],
    goblet: ['electro_dmg'],
    circlet: ['crit_rate', 'crit_damage'],
    subPriority: ['crit_rate', 'crit_damage', 'atk_percent', 'elemental_mastery'],
    targets: {
      atk: { min: 1800, ideal: 2100, unit: '', weight: 4 },
      critRate: { min: 70, ideal: 85, unit: '%', weight: 5 },
      critDamage: { min: 160, ideal: 220, unit: '%', weight: 5 },
      elementalMastery: { min: 100, ideal: 180, unit: '', weight: 3 },
    },
    tips: [
      '劇団4セットの登場でスキル火力が別次元に向上しました。設置して控えに戻るサブ火力運用に最適です。'
    ]
  },
  '荒瀧一斗': {
    role: 'Main DPS',
    sets: [
      { setId: 'husk_of_opulent_dreams', description: '防御力+54%＆岩ダメ+24%。一斗の能力を極限まで引き出す専用聖遺物。', priority: 1 },
    ],
    sands: ['def_percent'],
    goblet: ['geo_dmg'],
    circlet: ['crit_rate', 'crit_damage'],
    subPriority: ['crit_rate', 'crit_damage', 'def_percent', 'energy_recharge'],
    targets: {
      def: { min: 2300, ideal: 2600, unit: '', weight: 5 },
      critRate: { min: 70, ideal: 85, unit: '%', weight: 5 },
      critDamage: { min: 170, ideal: 220, unit: '%', weight: 5 },
      energyRecharge: { min: 120, ideal: 135, unit: '%', weight: 3 },
    },
    tips: [
      '爆発で防御力を攻撃力に大幅変換して暴れ回ります。華館4層を溜めてから爆発を発動させましょう。'
    ]
  },
  '珊瑚宮心海': {
    role: 'Healer',
    sets: [
      { setId: 'ocean_hued_clam', description: '回復量を物理ダメージの泡（最大3万ダメ）に変換。火力と回復を両立する最適セット。', priority: 1 },
      { setId: 'tenacity_of_the_millelith', description: '千岩4でクラゲによる味方攻撃力+20%サポート。', priority: 2 },
      { setId: 'flower_of_paradise_lost', description: 'ニィロウ開花パーティでの開花起動役特化（楽園4）。', priority: 3 },
    ],
    sands: ['hp_percent', 'energy_recharge'],
    goblet: ['hydro_dmg', 'hp_percent'],
    circlet: ['healing_bonus'],
    subPriority: ['hp_percent', 'energy_recharge', 'elemental_mastery', 'hp_flat'],
    targets: {
      hp: { min: 35000, ideal: 40000, unit: '', weight: 5 },
      energyRecharge: { min: 140, ideal: 160, unit: '%', weight: 4 },
    },
    tips: [
      '固有天賦により会心率は-100%固定のため、会心ステータスは完全に無駄になります。HP%・治癒冠・元チャに全振りしましょう。'
    ]
  },
  '久岐忍': {
    role: 'Healer',
    sets: [
      { setId: 'gilded_dreams', description: '元素熟知を極限まで高め、超開花ダメージを最大化する金メッキ4。', priority: 1 },
      { setId: 'flower_of_paradise_lost', description: '超開花ダメージ特化の楽園4。', priority: 2 },
      { setId: 'tenacity_of_the_millelith', description: 'スキルによる継続的な千岩4攻撃バフ＆回復特化。', priority: 3 },
    ],
    sands: ['elemental_mastery'],
    goblet: ['elemental_mastery'],
    circlet: ['elemental_mastery'],
    subPriority: ['elemental_mastery', 'hp_percent', 'hp_flat', 'energy_recharge'],
    targets: {
      elementalMastery: { min: 800, ideal: 1000, unit: '', weight: 5 },
      hp: { min: 25000, ideal: 30000, unit: '', weight: 3 },
    },
    tips: [
      '超開花編成（ナヒーダ・行秋等）では、忍の「元素熟知」と「キャラクターLv（Lv90必須）」のみで大ダメージが決まります。熟知全盛りが強力です。'
    ]
  },
  '綺良々': {
    role: 'Shielder',
    sets: [
      { setId: 'tenacity_of_the_millelith', description: '千岩2+花海2（HP+40%）または深林4セット。草シールド最適解。', priority: 1 },
    ],
    sands: ['hp_percent'],
    goblet: ['hp_percent'],
    circlet: ['hp_percent'],
    subPriority: ['hp_percent', 'hp_flat', 'energy_recharge'],
    targets: {
      hp: { min: 38000, ideal: 45000, unit: '', weight: 5 },
      energyRecharge: { min: 130, ideal: 150, unit: '%', weight: 3 },
    },
    tips: [
      'ネコ箱急便による高耐久な草シールドを張れます。草編成での耐性ダウン役として深林4を持たせるのも優秀です。'
    ]
  },
  'トーマ': {
    role: 'Shielder',
    sets: [
      { setId: 'flower_of_paradise_lost', description: '烈開花アタッカー運用時の最適聖遺物。', priority: 1 },
      { setId: 'tenacity_of_the_millelith', description: 'シールド耐久特化の千岩2+花海2（HP+40%）。', priority: 2 },
      { setId: 'noblesse_oblige', description: '旧貴族4によるチーム攻撃バフ。', priority: 3 },
    ],
    sands: ['energy_recharge', 'elemental_mastery', 'hp_percent'],
    goblet: ['elemental_mastery', 'hp_percent'],
    circlet: ['elemental_mastery', 'hp_percent'],
    subPriority: ['energy_recharge', 'elemental_mastery', 'hp_percent'],
    targets: {
      energyRecharge: { min: 200, ideal: 240, unit: '%', weight: 5 },
      hp: { min: 28000, ideal: 34000, unit: '', weight: 4 },
      elementalMastery: { min: 600, ideal: 850, unit: '', weight: 4 },
    },
    tips: [
      '烈開花運用なら熟知メイン、通常シールドサポーターならHPと元チャを優先しましょう。'
    ]
  },
  '九条裟羅': {
    role: 'Support',
    sets: [
      { setId: 'emblem_of_severed_fate', description: '重い元素爆発火力を大幅に引き上げる絶縁4。', priority: 1 },
      { setId: 'noblesse_oblige', description: 'チーム攻撃力+20%の旧貴族4。', priority: 2 },
    ],
    sands: ['energy_recharge', 'atk_percent'],
    goblet: ['electro_dmg'],
    circlet: ['crit_rate', 'crit_damage'],
    subPriority: ['energy_recharge', 'crit_rate', 'crit_damage', 'atk_percent'],
    targets: {
      energyRecharge: { min: 200, ideal: 240, unit: '%', weight: 5 },
      critRate: { min: 60, ideal: 75, unit: '%', weight: 4 },
      critDamage: { min: 120, ideal: 160, unit: '%', weight: 4 },
    },
    tips: [
      '完凸（第6重）で雷元素の会心ダメージ+60%を味方に付与する最強の雷専属バッファーです。基礎攻撃力の高い弓を持たせましょう。'
    ]
  },
  '鹿野院平蔵': {
    role: 'Main DPS',
    sets: [
      { setId: 'viridescent_venerer', description: '耐性デバフを配りつつ自身の近接風パンチ火力を高める最適セット。', priority: 1 },
      { setId: 'golden_troupe', description: '心魂拳（元素スキル）の一撃威力を極める劇団4。', priority: 2 },
    ],
    sands: ['atk_percent'],
    goblet: ['anemo_dmg'],
    circlet: ['crit_rate', 'crit_damage'],
    subPriority: ['crit_rate', 'crit_damage', 'atk_percent', 'elemental_mastery'],
    targets: {
      atk: { min: 1800, ideal: 2100, unit: '', weight: 4 },
      critRate: { min: 65, ideal: 80, unit: '%', weight: 5 },
      critDamage: { min: 150, ideal: 200, unit: '%', weight: 5 },
    },
    tips: [
      '変格を4層溜めてから放つ「心魂拳」の一撃必殺ダメージが魅力のアタッカーです。'
    ]
  },
  '早柚': {
    role: 'Healer',
    sets: [
      { setId: 'viridescent_venerer', description: '元素耐性-40%デバフ。移動・回復・耐性ダウンを一人でこなす。', priority: 1 },
    ],
    sands: ['energy_recharge', 'elemental_mastery'],
    goblet: ['atk_percent', 'elemental_mastery'],
    circlet: ['healing_bonus', 'elemental_mastery'],
    subPriority: ['energy_recharge', 'elemental_mastery', 'atk_percent'],
    targets: {
      energyRecharge: { min: 180, ideal: 220, unit: '%', weight: 5 },
      elementalMastery: { min: 500, ideal: 700, unit: '', weight: 4 },
    },
    tips: [
      '長押しローリングでの移動が探索で圧倒的に快適です。戦闘では翠緑4セットで耐性を下げながら全体回復を行います。'
    ]
  },

  // --- 璃月 ---
  '胡桃': {
    role: 'Main DPS',
    sets: [
      { setId: 'crimson_witch_of_flames', description: '蒸発反応係数を+15%強化し、爆発も打てる最適聖遺物。', priority: 1 },
      { setId: 'shimenawas_reminiscence', description: '重撃ダメージ+50%。厳選がしやすく重撃単発の威力が非常に高い。', priority: 2 },
    ],
    sands: ['hp_percent', 'elemental_mastery'],
    goblet: ['pyro_dmg'],
    circlet: ['crit_rate', 'crit_damage'],
    subPriority: ['crit_rate', 'crit_damage', 'hp_percent', 'elemental_mastery'],
    targets: {
      hp: { min: 30000, ideal: 35000, unit: '', weight: 5 },
      elementalMastery: { min: 100, ideal: 200, unit: '', weight: 4 },
      critRate: { min: 70, ideal: 80, unit: '%', weight: 5 },
      critDamage: { min: 180, ideal: 240, unit: '%', weight: 5 },
    },
    tips: [
      '攻撃力ではなくHP上限を基に攻撃力を超強化して戦います。行秋や夜蘭と組んで毎重撃で蒸発を起こすため、元素熟知も重要です。'
    ]
  },
  '鍾離': {
    role: 'Shielder',
    sets: [
      { setId: 'tenacity_of_the_millelith', description: 'シールド耐久値を底上げし、柱ヒットで味方攻撃力+20%。定番最適聖遺物。', priority: 1 },
      { setId: 'archaic_petra', description: '結晶シールドを拾って味方の該当元素ダメ+35%バフ。', priority: 2 },
    ],
    sands: ['hp_percent'],
    goblet: ['hp_percent'],
    circlet: ['hp_percent', 'crit_rate'],
    subPriority: ['hp_percent', 'hp_flat', 'energy_recharge', 'crit_rate'],
    targets: {
      hp: { min: 45000, ideal: 55000, unit: '', weight: 5 },
      energyRecharge: { min: 120, ideal: 140, unit: '%', weight: 2 },
    },
    tips: [
      'HP5万を超える鍾離のシールドはほぼ全ての敵の猛攻を無効化します。時計・杯・冠すべてHP%の「カチカチビルド」が最も人気です。'
    ]
  },
  '夜蘭': {
    role: 'Sub DPS',
    sets: [
      { setId: 'emblem_of_severed_fate', description: '高い元チャを爆発ダメージに大幅還元する絶縁4が最適解。', priority: 1 },
    ],
    sands: ['energy_recharge', 'hp_percent'],
    goblet: ['hydro_dmg', 'hp_percent'],
    circlet: ['crit_rate', 'crit_damage'],
    subPriority: ['energy_recharge', 'crit_rate', 'crit_damage', 'hp_percent'],
    targets: {
      hp: { min: 30000, ideal: 34000, unit: '', weight: 4 },
      energyRecharge: { min: 180, ideal: 220, unit: '%', weight: 5 },
      critRate: { min: 70, ideal: 85, unit: '%', weight: 5 },
      critDamage: { min: 140, ideal: 180, unit: '%', weight: 5 },
    },
    tips: [
      'ダメージはHP上限に完全に依存します。攻撃力は不要で、まずは爆発が途切れない元チャ（180%〜200%）を確保しましょう。'
    ]
  },
  '行秋': {
    role: 'Sub DPS',
    sets: [
      { setId: 'emblem_of_severed_fate', description: '元チャ確保と剣雨爆発火力を両立する最適聖遺物。', priority: 1 },
      { setId: 'noblesse_oblige', description: 'チームに旧貴族持ちがいない場合のサポート選択肢。', priority: 2 },
    ],
    sands: ['energy_recharge', 'atk_percent'],
    goblet: ['hydro_dmg'],
    circlet: ['crit_rate', 'crit_damage'],
    subPriority: ['energy_recharge', 'crit_rate', 'crit_damage', 'atk_percent'],
    targets: {
      energyRecharge: { min: 180, ideal: 220, unit: '%', weight: 5 },
      atk: { min: 1500, ideal: 1800, unit: '', weight: 3 },
      critRate: { min: 60, ideal: 75, unit: '%', weight: 4 },
      critDamage: { min: 120, ideal: 160, unit: '%', weight: 4 },
    },
    tips: [
      '祭礼の剣を装備し、元チャ200%前後を確保することで爆発を常時ループさせることができます。'
    ]
  },
  '香菱': {
    role: 'Sub DPS',
    sets: [
      { setId: 'emblem_of_severed_fate', description: '重い爆発（80族）を回しつつ旋火輪の威力を最大化。絶縁4一択。', priority: 1 },
    ],
    sands: ['energy_recharge', 'atk_percent'],
    goblet: ['pyro_dmg'],
    circlet: ['crit_rate', 'crit_damage'],
    subPriority: ['energy_recharge', 'crit_rate', 'crit_damage', 'elemental_mastery', 'atk_percent'],
    targets: {
      energyRecharge: { min: 200, ideal: 240, unit: '%', weight: 5 },
      atk: { min: 1400, ideal: 1700, unit: '', weight: 3 },
      critRate: { min: 60, ideal: 75, unit: '%', weight: 4 },
      critDamage: { min: 120, ideal: 160, unit: '%', weight: 4 },
      elementalMastery: { min: 150, ideal: 250, unit: '', weight: 4 },
    },
    tips: [
      'ベネットの爆発バフをスナップショットして旋火輪を回します。元チャ不足に陥りやすいため最低200%以上盛りましょう。'
    ]
  },
  '魈': {
    role: 'Main DPS',
    sets: [
      { setId: 'vermillion_hereafter', description: '爆発発動後の自傷で攻撃力最大+66%。魈の専用モチーフ聖遺物。', priority: 1 },
      { setId: 'marechaussee_hunter', description: '自傷効果でファントム4の会心率+36%を発動。フリーナと組む際にも最適。', priority: 2 },
    ],
    sands: ['atk_percent'],
    goblet: ['anemo_dmg', 'atk_percent'],
    circlet: ['crit_rate', 'crit_damage'],
    subPriority: ['crit_rate', 'crit_damage', 'atk_percent', 'energy_recharge'],
    targets: {
      atk: { min: 2100, ideal: 2400, unit: '', weight: 4 },
      critRate: { min: 75, ideal: 85, unit: '%', weight: 5 },
      critDamage: { min: 180, ideal: 230, unit: '%', weight: 5 },
      energyRecharge: { min: 120, ideal: 135, unit: '%', weight: 3 },
    },
    tips: [
      '落下攻撃を連打して敵を一掃します。辰砂4セットの攻撃力バフ、あるいはファントム4による高会心率が強力です。'
    ]
  },
  '甘雨': {
    role: 'Main DPS',
    sets: [
      { setId: 'wanderers_troupe', description: '元素熟知+80＆重撃ダメージ+35%。溶解パーティの定番最適聖遺物。', priority: 1 },
      { setId: 'blizzard_strayer', description: '凍結パーティで会心率最大+40%。安定した会心ダメージビルド。', priority: 2 },
    ],
    sands: ['atk_percent', 'elemental_mastery'],
    goblet: ['cryo_dmg'],
    circlet: ['crit_damage', 'crit_rate'],
    subPriority: ['crit_damage', 'crit_rate', 'atk_percent', 'elemental_mastery'],
    targets: {
      atk: { min: 2000, ideal: 2300, unit: '', weight: 4 },
      critRate: { min: 60, ideal: 70, unit: '%', weight: 4 },
      critDamage: { min: 180, ideal: 240, unit: '%', weight: 5 },
      elementalMastery: { min: 150, ideal: 250, unit: '', weight: 3 },
    },
    tips: [
      'ベネットや香菱と組む溶解パーティでは楽団4セットが最強です。凍結パーティ運用の場合は氷風4セットに切り替えましょう。'
    ]
  },
  'タルタリヤ': {
    role: 'Main DPS',
    sets: [
      { setId: 'nymphs_dream', description: '通常・重撃・スキル・爆発を当てることで水ダメ最大+30%＆攻撃力+25%。最適。', priority: 1 },
      { setId: 'heart_of_depth', description: '水ダメと通常・重撃バフの沈淪4セット。', priority: 2 },
    ],
    sands: ['atk_percent'],
    goblet: ['hydro_dmg'],
    circlet: ['crit_rate', 'crit_damage'],
    subPriority: ['crit_rate', 'crit_damage', 'atk_percent', 'elemental_mastery'],
    targets: {
      atk: { min: 1900, ideal: 2200, unit: '', weight: 4 },
      critRate: { min: 70, ideal: 85, unit: '%', weight: 5 },
      critDamage: { min: 160, ideal: 210, unit: '%', weight: 5 },
      elementalMastery: { min: 80, ideal: 150, unit: '', weight: 3 },
    },
    tips: [
      '断流効果による範囲大ダメージと香菱の旋火輪による蒸発コンボ（国際タルタリヤ）が極めて強力です。'
    ]
  },
  '申鶴': {
    role: 'Support',
    sets: [
      { setId: 'gladiators_finale', description: '剣闘士2+しめ縄2（攻撃力+18%×2）。自身の攻撃力を徹底的に盛る最適構成。', priority: 1 },
      { setId: 'noblesse_oblige', description: 'チーム内に旧貴族持ちがいない場合の旧貴族4。', priority: 2 },
    ],
    sands: ['atk_percent', 'energy_recharge'],
    goblet: ['atk_percent'],
    circlet: ['atk_percent'],
    subPriority: ['atk_percent', 'energy_recharge', 'atk_flat'],
    targets: {
      atk: { min: 3300, ideal: 3800, unit: '', weight: 5 },
      energyRecharge: { min: 170, ideal: 200, unit: '%', weight: 5 },
    },
    tips: [
      '氷翎バフは申鶴の「現在の攻撃力」を参照して氷アタッカーのダメージに上乗せされます。時計・杯・冠すべて攻撃力%にしましょう。'
    ]
  },
  '煙緋': {
    role: 'Main DPS',
    sets: [
      { setId: 'wanderers_troupe', description: '熟知+80と重撃ダメージ+35%。丹火の印を消費する重撃と好相性。', priority: 1 },
      { setId: 'crimson_witch_of_flames', description: '炎反応ダメージを強化する魔女4。', priority: 2 },
    ],
    sands: ['atk_percent', 'elemental_mastery'],
    goblet: ['pyro_dmg'],
    circlet: ['crit_rate', 'crit_damage'],
    subPriority: ['crit_rate', 'crit_damage', 'atk_percent', 'elemental_mastery'],
    targets: {
      atk: { min: 1800, ideal: 2100, unit: '', weight: 4 },
      critRate: { min: 65, ideal: 80, unit: '%', weight: 5 },
      critDamage: { min: 150, ideal: 200, unit: '%', weight: 5 },
    },
    tips: [
      '通常攻撃で丹火の印を最大まで溜めてから重撃を放つコンボが基本です。'
    ]
  },
  '雲菫': {
    role: 'Support',
    sets: [
      { setId: 'husk_of_opulent_dreams', description: '防御力+54%。通常攻撃ダメージへの加算バフを最大化する最適聖遺物。', priority: 1 },
    ],
    sands: ['def_percent', 'energy_recharge'],
    goblet: ['def_percent'],
    circlet: ['def_percent', 'crit_rate'],
    subPriority: ['def_percent', 'energy_recharge', 'crit_rate'],
    targets: {
      def: { min: 2400, ideal: 2800, unit: '', weight: 5 },
      energyRecharge: { min: 180, ideal: 220, unit: '%', weight: 5 },
    },
    tips: [
      '宵宮や綾人、放浪者などの通常攻撃主体のキャラクターへのバフ量が「防御力」に完全依存します。'
    ]
  },
  '凝光': {
    role: 'Main DPS',
    sets: [
      { setId: 'nighttime_whispers_in_the_echoing_woods', description: '岩ダメと攻撃力バフ。瞬間重撃・爆発火力を高める最適セット。', priority: 1 },
      { setId: 'archaic_petra', description: '悠久2+攻撃18%2の安定キメラ構成。', priority: 2 },
    ],
    sands: ['atk_percent'],
    goblet: ['geo_dmg'],
    circlet: ['crit_rate', 'crit_damage'],
    subPriority: ['crit_rate', 'crit_damage', 'atk_percent'],
    targets: {
      atk: { min: 1900, ideal: 2200, unit: '', weight: 4 },
      critRate: { min: 70, ideal: 80, unit: '%', weight: 5 },
      critDamage: { min: 150, ideal: 200, unit: '%', weight: 5 },
    },
    tips: [
      '星璇を溜めた重撃と、屏風を通過させた元素爆発で瞬間大ダメージを狙いましょう。'
    ]
  },
  '北斗': {
    role: 'Sub DPS',
    sets: [
      { setId: 'emblem_of_severed_fate', description: '重い爆発（80族）の回転率と雷撃跳弾ダメージを両立する絶縁4。', priority: 1 },
      { setId: 'noblesse_oblige', description: 'チーム攻撃力+20%の旧貴族4。', priority: 2 },
    ],
    sands: ['energy_recharge', 'atk_percent'],
    goblet: ['electro_dmg'],
    circlet: ['crit_rate', 'crit_damage'],
    subPriority: ['energy_recharge', 'crit_rate', 'crit_damage', 'atk_percent'],
    targets: {
      energyRecharge: { min: 180, ideal: 220, unit: '%', weight: 5 },
      atk: { min: 1600, ideal: 1900, unit: '', weight: 3 },
      critRate: { min: 60, ideal: 75, unit: '%', weight: 4 },
      critDamage: { min: 120, ideal: 160, unit: '%', weight: 4 },
    },
    tips: [
      '複数敵に対する元素爆発の跳弾ダメージはゲーム中屈指の総倍率を誇ります。元チャをしっかり確保しましょう。'
    ]
  },
  '重雲': {
    role: 'Sub DPS',
    sets: [
      { setId: 'noblesse_oblige', description: '40族の軽い元素爆発で旧貴族バフを常時維持。サポート兼瞬間火力。', priority: 1 },
      { setId: 'blizzard_strayer', description: '氷風2+旧貴族2の爆発特化。', priority: 2 },
    ],
    sands: ['atk_percent'],
    goblet: ['cryo_dmg'],
    circlet: ['crit_rate', 'crit_damage'],
    subPriority: ['crit_rate', 'crit_damage', 'atk_percent', 'energy_recharge'],
    targets: {
      atk: { min: 1800, ideal: 2100, unit: '', weight: 4 },
      critRate: { min: 65, ideal: 75, unit: '%', weight: 5 },
      critDamage: { min: 140, ideal: 180, unit: '%', weight: 5 },
    },
    tips: [
      '元素爆発で3〜4本の巨大な霊刃を落下させます。溶解反応を乗せることで瞬時に大ダメージを稼げます。'
    ]
  },
  'ヨォーヨ': {
    role: 'Healer',
    sets: [
      { setId: 'deepwood_memories', description: '草耐性-30%デバフ。月桂追撃で深林効果を維持する最適草ヒーラー。', priority: 1 },
      { setId: 'tenacity_of_the_millelith', description: '千岩4によるチーム攻撃力+20%サポート。', priority: 2 },
    ],
    sands: ['hp_percent', 'energy_recharge'],
    goblet: ['hp_percent'],
    circlet: ['healing_bonus', 'hp_percent'],
    subPriority: ['hp_percent', 'energy_recharge', 'hp_flat'],
    targets: {
      hp: { min: 30000, ideal: 35000, unit: '', weight: 5 },
      energyRecharge: { min: 180, ideal: 220, unit: '%', weight: 5 },
    },
    tips: [
      '月桂が自動で大根を投げて回復と草付着を行ってくれます。HPと元チャを優先しましょう。'
    ]
  },
  '辛炎': {
    role: 'Shielder',
    sets: [
      { setId: 'husk_of_opulent_dreams', description: '防御力特化でシールド吸収量を高める華館4。', priority: 1 },
      { setId: 'pale_flame', description: '物理爆発アタッカー運用の蒼白4。', priority: 2 },
    ],
    sands: ['def_percent', 'atk_percent'],
    goblet: ['def_percent', 'physical_dmg'],
    circlet: ['def_percent', 'crit_damage'],
    subPriority: ['def_percent', 'energy_recharge', 'crit_rate', 'crit_damage'],
    targets: {
      def: { min: 2200, ideal: 2600, unit: '', weight: 5 },
      energyRecharge: { min: 160, ideal: 180, unit: '%', weight: 4 },
    },
    tips: [
      '完凸（第6重）で重撃時に防御力の50%が攻撃力に加算されます。シールド型なら防御力に特化しましょう。'
    ]
  },
  'キャンディス': {
    role: 'Support',
    sets: [
      { setId: 'noblesse_oblige', description: '旧貴族4によるチーム攻撃力+20%サポート。', priority: 1 },
      { setId: 'tenacity_of_the_millelith', description: '千岩2+花海2（HP+40%）で通常攻撃バフを最大化。', priority: 2 },
    ],
    sands: ['hp_percent', 'energy_recharge'],
    goblet: ['hp_percent'],
    circlet: ['hp_percent', 'crit_rate'],
    subPriority: ['hp_percent', 'energy_recharge', 'crit_rate'],
    targets: {
      hp: { min: 32000, ideal: 38000, unit: '', weight: 5 },
      energyRecharge: { min: 180, ideal: 220, unit: '%', weight: 5 },
    },
    tips: [
      '元素爆発で味方の通常攻撃に水元素を付与し、自身のHPに応じて通常攻撃ダメージをバフします。HPを重視しましょう。'
    ]
  },
  '七七': {
    role: 'Healer',
    sets: [
      { setId: 'ocean_hued_clam', description: '圧倒的な回復量をそのままダメージの泡（最大3万ダメ）に変換する海染4一択。', priority: 1 },
      { setId: 'tenacity_of_the_millelith', description: '寒病鬼差の回転ヒットで千岩4バフを維持。', priority: 2 },
    ],
    sands: ['atk_percent', 'energy_recharge'],
    goblet: ['atk_percent'],
    circlet: ['healing_bonus', 'atk_percent'],
    subPriority: ['atk_percent', 'energy_recharge', 'atk_flat'],
    targets: {
      atk: { min: 2000, ideal: 2500, unit: '', weight: 4 },
      energyRecharge: { min: 180, ideal: 220, unit: '%', weight: 5 },
    },
    tips: [
      '回復量は攻撃力に完全依存します。海染4セットを持たせることで最高峰のヒーラー兼サブ火力になります。'
    ]
  },

  // --- モンド ---
  'ベネット': {
    role: 'Support',
    sets: [
      { setId: 'noblesse_oblige', description: '爆発発動でチーム全員の攻撃力+20%。ベネットの代名詞とも言える必須聖遺物。', priority: 1 },
    ],
    sands: ['energy_recharge', 'hp_percent'],
    goblet: ['hp_percent'],
    circlet: ['healing_bonus', 'hp_percent'],
    subPriority: ['energy_recharge', 'hp_percent', 'hp_flat'],
    targets: {
      energyRecharge: { min: 220, ideal: 250, unit: '%', weight: 5 },
      hp: { min: 25000, ideal: 30000, unit: '', weight: 4 },
    },
    tips: [
      '爆発による攻撃力バフはベネットの「基礎攻撃力（キャラ本体Lv＋武器攻撃力のみ）」を参照するため、聖遺物の攻撃力%はバフに影響しません。元チャとHPを優先しましょう。'
    ]
  },
  'フィッシュル': {
    role: 'Sub DPS',
    sets: [
      { setId: 'golden_troupe', description: '控えからのオズ追撃ダメージ最大+70%。フィッシュルを最強サブ火力にする最適聖遺物。', priority: 1 },
    ],
    sands: ['atk_percent'],
    goblet: ['electro_dmg'],
    circlet: ['crit_rate', 'crit_damage'],
    subPriority: ['crit_rate', 'crit_damage', 'atk_percent', 'elemental_mastery'],
    targets: {
      atk: { min: 1900, ideal: 2300, unit: '', weight: 4 },
      critRate: { min: 70, ideal: 85, unit: '%', weight: 5 },
      critDamage: { min: 150, ideal: 200, unit: '%', weight: 5 },
      elementalMastery: { min: 80, ideal: 150, unit: '', weight: 3 },
    },
    tips: [
      '劇団4セットの登場でオズのDPSが別次元に強化されました。オズを出して控えに戻るだけで大ダメージを与え続けます。'
    ]
  },
  'ディルック': {
    role: 'Main DPS',
    sets: [
      { setId: 'crimson_witch_of_flames', description: 'スキル3連撃で魔女4セット効果を即座に最大3重（炎ダメ+22.5%＆蒸発反応係数+15%）まで発動可能。最適。', priority: 1 },
      { setId: 'gladiators_finale', description: '通常攻撃バフの剣闘士4。繋ぎとして優秀。', priority: 2 },
    ],
    sands: ['atk_percent', 'elemental_mastery'],
    goblet: ['pyro_dmg'],
    circlet: ['crit_rate', 'crit_damage'],
    subPriority: ['crit_rate', 'crit_damage', 'atk_percent', 'elemental_mastery'],
    targets: {
      atk: { min: 2000, ideal: 2300, unit: '', weight: 4 },
      critRate: { min: 70, ideal: 80, unit: '%', weight: 5 },
      critDamage: { min: 150, ideal: 200, unit: '%', weight: 5 },
      elementalMastery: { min: 100, ideal: 180, unit: '', weight: 3 },
    },
    tips: [
      '元素スキルが3回発動できるため、魔女4セットのスタックを全キャラ中最も容易に上限まで重ねることができます。'
    ]
  },
  'クレー': {
    role: 'Main DPS',
    sets: [
      { setId: 'crimson_witch_of_flames', description: '炎元素ダメージと反応ダメージを強化する魔女4。', priority: 1 },
      { setId: 'golden_troupe', description: '重撃とスキルボンボン爆弾の火力を伸ばす劇団4。', priority: 2 },
    ],
    sands: ['atk_percent'],
    goblet: ['pyro_dmg'],
    circlet: ['crit_rate', 'crit_damage'],
    subPriority: ['crit_rate', 'crit_damage', 'atk_percent', 'elemental_mastery'],
    targets: {
      atk: { min: 2000, ideal: 2300, unit: '', weight: 4 },
      critRate: { min: 70, ideal: 80, unit: '%', weight: 5 },
      critDamage: { min: 150, ideal: 200, unit: '%', weight: 5 },
    },
    tips: [
      '炎元素の付着頻度が極めて高いため、モノパイロ編成（ベネット・香菱・万葉）で猛威を振るいます。'
    ]
  },
  '刻晴': {
    role: 'Main DPS',
    sets: [
      { setId: 'thundering_fury', description: '激化反応を起こすたびにスキルのクールタイム-1秒。スキルのワープ突進を連発可能にする最適聖遺物。', priority: 1 },
      { setId: 'gilded_dreams', description: '元素熟知を高める金メッキ4。', priority: 2 },
    ],
    sands: ['atk_percent'],
    goblet: ['electro_dmg'],
    circlet: ['crit_rate', 'crit_damage'],
    subPriority: ['crit_rate', 'crit_damage', 'atk_percent', 'elemental_mastery'],
    targets: {
      atk: { min: 1900, ideal: 2200, unit: '', weight: 4 },
      critRate: { min: 70, ideal: 85, unit: '%', weight: 5 },
      critDamage: { min: 160, ideal: 220, unit: '%', weight: 5 },
      elementalMastery: { min: 80, ideal: 150, unit: '', weight: 3 },
    },
    tips: [
      '草元素との「超激化」パーティで評価が一変しました。雷怒4セットでスキルが即座にリセットされ、戦場を自在に駆け巡れます。'
    ]
  },
  'エウルア': {
    role: 'Main DPS',
    sets: [
      { setId: 'pale_flame', description: 'スキル長押しで蒼白4効果（物理ダメ+50%＆攻撃力+18%）を完全発動。物理アタッカーの最強聖遺物。', priority: 1 },
      { setId: 'bloodstained_chivalry', description: '蒼白2+血染め2で無条件に物理ダメ+50%を確保する安定構成。', priority: 2 },
    ],
    sands: ['atk_percent'],
    goblet: ['physical_dmg'],
    circlet: ['crit_rate', 'crit_damage'],
    subPriority: ['crit_rate', 'crit_damage', 'atk_percent', 'energy_recharge'],
    targets: {
      atk: { min: 2100, ideal: 2400, unit: '', weight: 4 },
      critRate: { min: 70, ideal: 80, unit: '%', weight: 5 },
      critDamage: { min: 160, ideal: 210, unit: '%', weight: 5 },
      energyRecharge: { min: 120, ideal: 140, unit: '%', weight: 3 },
    },
    tips: [
      '元素爆発の「光臨の剣」による数百〜数百万の大ダメージが真骨頂です。会心を確実に通すため会心率70%以上を目指しましょう。'
    ]
  },
  'ウェンティ': {
    role: 'Support',
    sets: [
      { setId: 'viridescent_venerer', description: '元素耐性-40%デバフ。集敵爆発との相性抜群。', priority: 1 },
    ],
    sands: ['elemental_mastery', 'energy_recharge'],
    goblet: ['elemental_mastery', 'anemo_dmg'],
    circlet: ['elemental_mastery', 'crit_rate'],
    subPriority: ['elemental_mastery', 'energy_recharge', 'crit_rate', 'crit_damage'],
    targets: {
      elementalMastery: { min: 600, ideal: 800, unit: '', weight: 5 },
      energyRecharge: { min: 160, ideal: 180, unit: '%', weight: 5 },
    },
    tips: [
      '元素爆発によるダイソン集敵で小型敵を完封します。熟知ビルドにすると拡散ダメージで敵の群れが瞬時に溶けます。'
    ]
  },
  'ジン': {
    role: 'Healer',
    sets: [
      { setId: 'viridescent_venerer', description: '元素耐性-40%デバフ。全体回復と耐性ダウンを1人でこなす優秀なサポーター。', priority: 1 },
      { setId: 'noblesse_oblige', description: 'チーム攻撃力+20%サポート。', priority: 2 },
    ],
    sands: ['atk_percent', 'energy_recharge'],
    goblet: ['anemo_dmg', 'atk_percent'],
    circlet: ['healing_bonus', 'crit_rate'],
    subPriority: ['atk_percent', 'energy_recharge', 'crit_rate'],
    targets: {
      atk: { min: 2000, ideal: 2400, unit: '', weight: 4 },
      energyRecharge: { min: 160, ideal: 180, unit: '%', weight: 5 },
    },
    tips: [
      'フリーナと組む全体ヒーラーとして非常に強力です。回復量は攻撃力依存のため、翠緑4セットで攻撃力と元チャを盛りましょう。'
    ]
  },
  'モナ': {
    role: 'Support',
    sets: [
      { setId: 'noblesse_oblige', description: '爆発発動でチーム攻撃力+20%＆星異デバフ（最大与ダメ+60%）。', priority: 1 },
      { setId: 'emblem_of_severed_fate', description: '元チャを火力に変換する絶縁4。', priority: 2 },
    ],
    sands: ['energy_recharge'],
    goblet: ['hydro_dmg'],
    circlet: ['crit_rate', 'crit_damage'],
    subPriority: ['energy_recharge', 'crit_rate', 'crit_damage', 'atk_percent'],
    targets: {
      energyRecharge: { min: 200, ideal: 240, unit: '%', weight: 5 },
      critRate: { min: 50, ideal: 65, unit: '%', weight: 4 },
      critDamage: { min: 100, ideal: 140, unit: '%', weight: 4 },
    },
    tips: [
      '元チャを水元素ダメージバフに変換する天賦を持ちます。金箔を持たせてヒーラー兼任にすることも可能です。'
    ]
  },
  'スクロース': {
    role: 'Support',
    sets: [
      { setId: 'viridescent_venerer', description: '元素耐性-40%デバフ。味方に自身の元素熟知の20%を分配する最強星4バッファー。', priority: 1 },
    ],
    sands: ['elemental_mastery'],
    goblet: ['elemental_mastery'],
    circlet: ['elemental_mastery'],
    subPriority: ['elemental_mastery', 'energy_recharge'],
    targets: {
      elementalMastery: { min: 750, ideal: 900, unit: '', weight: 5 },
      energyRecharge: { min: 160, ideal: 180, unit: '%', weight: 4 },
    },
    tips: [
      '砂・杯・冠すべて元素熟知メインにし、味方に大量の熟知バフを供給しましょう。'
    ]
  },
  'ノエル': {
    role: 'Main DPS',
    sets: [
      { setId: 'husk_of_opulent_dreams', description: '防御力と岩ダメを大幅に伸ばし、攻撃・シールド・回復を一人でこなす最強メイドに。', priority: 1 },
      { setId: 'marechaussee_hunter', description: 'フリーナと組む場合に会心率+36%を獲得できる強力な選択肢。', priority: 2 },
      { setId: 'gladiators_finale', description: '通常攻撃ダメージ+35%の剣闘士4。', priority: 3 },
    ],
    sands: ['def_percent'],
    goblet: ['geo_dmg'],
    circlet: ['crit_rate', 'crit_damage'],
    subPriority: ['crit_rate', 'crit_damage', 'def_percent', 'energy_recharge'],
    targets: {
      def: { min: 2100, ideal: 2500, unit: '', weight: 5 },
      critRate: { min: 65, ideal: 80, unit: '%', weight: 5 },
      critDamage: { min: 150, ideal: 200, unit: '%', weight: 5 },
      energyRecharge: { min: 130, ideal: 150, unit: '%', weight: 4 },
    },
    tips: [
      '完凸（第6重）で防御力の135%が攻撃力に上乗せされ、驚異的な範囲大剣アタッカーに変貌します。元チャを確保して爆発を切らさないようにしましょう。'
    ]
  },
  'ディオナ': {
    role: 'Shielder',
    sets: [
      { setId: 'noblesse_oblige', description: '爆発発動でチーム全体の攻撃力+20%。シールド・回復・バフの3役。', priority: 1 },
      { setId: 'maiden_beloved', description: '回復特化の愛される少女4。', priority: 2 },
    ],
    sands: ['hp_percent', 'energy_recharge'],
    goblet: ['hp_percent'],
    circlet: ['hp_percent', 'healing_bonus'],
    subPriority: ['hp_percent', 'energy_recharge', 'hp_flat'],
    targets: {
      hp: { min: 28000, ideal: 33000, unit: '', weight: 5 },
      energyRecharge: { min: 180, ideal: 220, unit: '%', weight: 5 },
    },
    tips: [
      '祭礼の弓を持たせることでスキルシールドを常時張り直すことができます。HPと元チャを優先しましょう。'
    ]
  },
  'ロサリア': {
    role: 'Sub DPS',
    sets: [
      { setId: 'noblesse_oblige', description: '爆発で旧貴族バフ＆自身の会心率の15%（最大+15%）を味方に配る。最適。', priority: 1 },
      { setId: 'emblem_of_severed_fate', description: '元素爆発ダメージを伸ばす絶縁4。', priority: 2 },
      { setId: 'blizzard_strayer', description: '凍結パーティでの会心特化氷風4。', priority: 3 },
    ],
    sands: ['atk_percent', 'energy_recharge'],
    goblet: ['cryo_dmg'],
    circlet: ['crit_rate'],
    subPriority: ['crit_rate', 'crit_damage', 'energy_recharge', 'atk_percent'],
    targets: {
      critRate: { min: 80, ideal: 100, unit: '%', weight: 5 },
      atk: { min: 1600, ideal: 1900, unit: '', weight: 3 },
      energyRecharge: { min: 160, ideal: 180, unit: '%', weight: 4 },
      critDamage: { min: 120, ideal: 160, unit: '%', weight: 4 },
    },
    tips: [
      '爆発発動時、自身の会心率を味方に最大15%分け与える天賦があるため、会心率は88%〜100%を目指して盛りましょう。'
    ]
  },
  'ガイア': {
    role: 'Sub DPS',
    sets: [
      { setId: 'blizzard_strayer', description: '凍結パーティで会心率+40%。安定した氷サブアタッカー。', priority: 1 },
      { setId: 'emblem_of_severed_fate', description: '旋回する氷柱爆発の火力を上げる絶縁4。', priority: 2 },
      { setId: 'noblesse_oblige', description: '旧貴族4によるチーム攻撃バフ。', priority: 3 },
    ],
    sands: ['atk_percent'],
    goblet: ['cryo_dmg'],
    circlet: ['crit_rate', 'crit_damage'],
    subPriority: ['crit_rate', 'crit_damage', 'atk_percent', 'energy_recharge'],
    targets: {
      atk: { min: 1800, ideal: 2100, unit: '', weight: 4 },
      critRate: { min: 60, ideal: 70, unit: '%', weight: 4 },
      critDamage: { min: 140, ideal: 180, unit: '%', weight: 5 },
      energyRecharge: { min: 140, ideal: 160, unit: '%', weight: 3 },
    },
    tips: [
      '追従する氷柱爆発を維持して溶解や凍結をサポートします。元チャを少し盛っておくと爆発がスムーズに回ります。'
    ]
  },
  'レザー': {
    role: 'Main DPS',
    sets: [
      { setId: 'pale_flame', description: '雷狼と共に戦う物理大剣アタッカーの最強聖遺物。', priority: 1 },
      { setId: 'gladiators_finale', description: '通常攻撃ダメージ+35%の剣闘士4。', priority: 2 },
    ],
    sands: ['atk_percent'],
    goblet: ['physical_dmg'],
    circlet: ['crit_rate', 'crit_damage'],
    subPriority: ['crit_rate', 'crit_damage', 'atk_percent', 'energy_recharge'],
    targets: {
      atk: { min: 2000, ideal: 2300, unit: '', weight: 4 },
      critRate: { min: 65, ideal: 75, unit: '%', weight: 5 },
      critDamage: { min: 140, ideal: 180, unit: '%', weight: 5 },
    },
    tips: [
      '氷キャラと組んで超電導（物理耐性-40%）を起こしてから通常攻撃ラッシュを叩き込みましょう。'
    ]
  },
  'バーバラ': {
    role: 'Healer',
    sets: [
      { setId: 'ocean_hued_clam', description: '持続回復を大ダメージの泡（最大3万ダメ）に変換する海染4。', priority: 1 },
      { setId: 'maiden_beloved', description: '回復量特化の愛される少女4。', priority: 2 },
    ],
    sands: ['hp_percent', 'energy_recharge'],
    goblet: ['hp_percent'],
    circlet: ['healing_bonus', 'hp_percent'],
    subPriority: ['hp_percent', 'energy_recharge', 'hp_flat'],
    targets: {
      hp: { min: 28000, ideal: 34000, unit: '', weight: 5 },
      energyRecharge: { min: 160, ideal: 180, unit: '%', weight: 4 },
    },
    tips: [
      '回復量はHP上限に完全に依存します。海染4セットを装備すると回復しながら敵に物理大ダメージを与えられます。'
    ]
  },
  'リサ': {
    role: 'Sub DPS',
    sets: [
      { setId: 'emblem_of_severed_fate', description: '防御力-15%デバフを与える元素爆発の回転率と火力を高める絶縁4。', priority: 1 },
      { setId: 'thundering_fury', description: '激化反応ダメージを高める雷怒4。', priority: 2 },
    ],
    sands: ['energy_recharge', 'atk_percent'],
    goblet: ['electro_dmg'],
    circlet: ['crit_rate', 'crit_damage'],
    subPriority: ['energy_recharge', 'crit_rate', 'crit_damage', 'elemental_mastery'],
    targets: {
      energyRecharge: { min: 180, ideal: 220, unit: '%', weight: 5 },
      atk: { min: 1600, ideal: 1900, unit: '', weight: 3 },
      critRate: { min: 60, ideal: 70, unit: '%', weight: 4 },
      critDamage: { min: 120, ideal: 160, unit: '%', weight: 4 },
    },
    tips: [
      '固有天賦により元素爆発を受けた敵の防御力を15%低下させます。元チャを盛って爆発デバフを維持しましょう。'
    ]
  },
  'ミカ': {
    role: 'Support',
    sets: [
      { setId: 'noblesse_oblige', description: '元素爆発でチーム全体の攻撃力+20%＆全体回復。最適。', priority: 1 },
      { setId: 'ocean_hued_clam', description: '回復能力をダメージに変換する海染4。', priority: 2 },
    ],
    sands: ['energy_recharge', 'hp_percent'],
    goblet: ['hp_percent'],
    circlet: ['healing_bonus', 'crit_rate'],
    subPriority: ['energy_recharge', 'hp_percent', 'crit_rate'],
    targets: {
      energyRecharge: { min: 200, ideal: 240, unit: '%', weight: 5 },
      hp: { min: 28000, ideal: 33000, unit: '', weight: 4 },
    },
    tips: [
      '物理アタッカー（エウルア・レザーなど）の攻撃速度と物理ダメージを大きくバフする専用サポーターです。'
    ]
  },
  'アンバー': {
    role: 'Support',
    sets: [
      { setId: 'noblesse_oblige', description: '40族の軽い元素爆発で旧貴族バフを常時維持するサポート構成。', priority: 1 },
      { setId: 'wanderers_troupe', description: '狙い撃ち重撃特化の楽団4。', priority: 2 },
    ],
    sands: ['energy_recharge', 'atk_percent'],
    goblet: ['pyro_dmg'],
    circlet: ['crit_rate', 'crit_damage'],
    subPriority: ['energy_recharge', 'crit_rate', 'crit_damage', 'atk_percent'],
    targets: {
      energyRecharge: { min: 160, ideal: 180, unit: '%', weight: 4 },
      atk: { min: 1600, ideal: 1900, unit: '', weight: 3 },
    },
    tips: [
      '終焉弓を持たせて旧貴族4セットで爆発を撃つことで、味方に大量の攻撃力＆熟知バフを高速付与できます。'
    ]
  },
  'アーロイ': {
    role: 'Sub DPS',
    sets: [
      { setId: 'blizzard_strayer', description: '氷風4セットによる会心率強化。', priority: 1 },
      { setId: 'noblesse_oblige', description: '軽い爆発を活かした旧貴族4サポート。', priority: 2 },
    ],
    sands: ['atk_percent'],
    goblet: ['cryo_dmg'],
    circlet: ['crit_rate', 'crit_damage'],
    subPriority: ['crit_rate', 'crit_damage', 'atk_percent', 'energy_recharge'],
    targets: {
      atk: { min: 1800, ideal: 2100, unit: '', weight: 4 },
      critRate: { min: 60, ideal: 75, unit: '%', weight: 5 },
      critDamage: { min: 130, ideal: 170, unit: '%', weight: 5 },
    },
    tips: [
      'フリーズ爆弾でコイルを獲得して通常攻撃を氷元素に変換します。'
    ]
  },
  'ゴロー': {
    role: 'Support',
    sets: [
      { setId: 'husk_of_opulent_dreams', description: '防御力+54%。自身のスキルバフ・回復量を底上げする最適聖遺物。', priority: 1 },
      { setId: 'the_exile', description: '爆発発動でチーム全員のエネルギーを回復する星4亡命者4。', priority: 2 },
    ],
    sands: ['energy_recharge', 'def_percent'],
    goblet: ['def_percent'],
    circlet: ['def_percent', 'crit_rate'],
    subPriority: ['energy_recharge', 'def_percent', 'crit_rate'],
    targets: {
      energyRecharge: { min: 200, ideal: 240, unit: '%', weight: 5 },
      def: { min: 1500, ideal: 1800, unit: '', weight: 4 },
    },
    tips: [
      '岩元素キャラを3人編成することで、防御力バフ・中断耐性・岩元素ダメージバフの全恩恵を提供できます。西風弓を持たせましょう。'
    ]
  },
  'アルベド': {
    role: 'Sub DPS',
    sets: [
      { setId: 'husk_of_opulent_dreams', description: '防御力+54%＆岩ダメ+24%。疑似陽花の追撃威力を極める最適聖遺物。', priority: 1 },
      { setId: 'golden_troupe', description: '元素スキル追撃ダメージ+70%の劇団4。', priority: 2 },
    ],
    sands: ['def_percent'],
    goblet: ['geo_dmg'],
    circlet: ['crit_rate', 'crit_damage'],
    subPriority: ['crit_rate', 'crit_damage', 'def_percent'],
    targets: {
      def: { min: 2400, ideal: 2800, unit: '', weight: 5 },
      critRate: { min: 65, ideal: 80, unit: '%', weight: 5 },
      critDamage: { min: 140, ideal: 180, unit: '%', weight: 5 },
    },
    tips: [
      'スキルの追撃ダメージは防御力に完全依存します。華館4または劇団4で防御力とスキルダメージを盛りましょう。'
    ]
  },
  '空': {
    role: 'Support',
    sets: [
      { setId: 'scroll_of_the_hero_of_cinder_city', description: '炎主人公運用時：味方に全元素ダメ+40%バフ。', priority: 1 },
      { setId: 'deepwood_memories', description: '草主人公運用時：草耐性-30%デバフ。', priority: 2 },
      { setId: 'viridescent_venerer', description: '風主人公運用時：元素耐性-40%デバフ。', priority: 3 },
    ],
    sands: ['energy_recharge', 'atk_percent'],
    goblet: ['dendro_dmg', 'pyro_dmg', 'anemo_dmg'],
    circlet: ['crit_rate', 'crit_damage'],
    subPriority: ['energy_recharge', 'crit_rate', 'crit_damage', 'elemental_mastery'],
    targets: {
      energyRecharge: { min: 200, ideal: 240, unit: '%', weight: 5 },
      critRate: { min: 50, ideal: 65, unit: '%', weight: 4 },
      critDamage: { min: 100, ideal: 140, unit: '%', weight: 4 },
    },
    tips: [
      '草元素や炎元素の主人公は強力なサポート能力を持ちます。西風剣を装備して元チャ200%以上を確保しましょう。'
    ]
  },
  '蛍': {
    role: 'Support',
    sets: [
      { setId: 'scroll_of_the_hero_of_cinder_city', description: '炎主人公運用時：味方に全元素ダメ+40%バフ。', priority: 1 },
      { setId: 'deepwood_memories', description: '草主人公運用時：草耐性-30%デバフ。', priority: 2 },
      { setId: 'viridescent_venerer', description: '風主人公運用時：元素耐性-40%デバフ。', priority: 3 },
    ],
    sands: ['energy_recharge', 'atk_percent'],
    goblet: ['dendro_dmg', 'pyro_dmg', 'anemo_dmg'],
    circlet: ['crit_rate', 'crit_damage'],
    subPriority: ['energy_recharge', 'crit_rate', 'crit_damage', 'elemental_mastery'],
    targets: {
      energyRecharge: { min: 200, ideal: 240, unit: '%', weight: 5 },
      critRate: { min: 50, ideal: 65, unit: '%', weight: 4 },
      critDamage: { min: 100, ideal: 140, unit: '%', weight: 4 },
    },
    tips: [
      '草元素や炎元素の主人公は強力なサポート能力を持ちます。西風剣を装備して元チャ200%以上を確保しましょう。'
    ]
  },
};

// スクリプトの実行：allMergedCharacters.json を更新
const jsonPath = path.join(__dirname, '../src/data/allMergedCharacters.json');
const allChars = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

let updatedCount = 0;

for (const char of allChars) {
  const gwBuild = GAMEWITH_BUILDS[char.japaneseName];
  if (gwBuild) {
    char.role = gwBuild.role;
    char.recommendedBuild = {
      recommendedSets: gwBuild.sets,
      recommendedMainStats: {
        sands: gwBuild.sands,
        goblet: gwBuild.goblet,
        circlet: gwBuild.circlet,
      },
      subStatPriority: gwBuild.subPriority,
      targetStats: gwBuild.targets,
      buildTips: gwBuild.tips,
    };
    updatedCount++;
  } else {
    // 未実装・未定義キャラクター用のフォールバック（元素・武器種に合わせた高品質なビルド）
    if (char.element === 'anemo') {
      char.recommendedBuild.recommendedSets = [
        { setId: 'viridescent_venerer', description: '拡散元素の耐性を40%下げる風必須聖遺物。', priority: 1 },
        { setId: 'noblesse_oblige', description: 'チーム攻撃力+20%サポート。', priority: 2 },
      ];
      char.recommendedBuild.recommendedMainStats = {
        sands: ['elemental_mastery', 'energy_recharge'],
        goblet: ['elemental_mastery', 'anemo_dmg'],
        circlet: ['elemental_mastery', 'crit_rate'],
      };
      char.recommendedBuild.subStatPriority = ['elemental_mastery', 'energy_recharge', 'crit_rate'];
      char.recommendedBuild.targetStats = {
        elementalMastery: { min: 700, ideal: 900, unit: '', weight: 5 },
        energyRecharge: { min: 160, ideal: 180, unit: '%', weight: 5 },
      };
    } else if (char.element === 'dendro') {
      char.recommendedBuild.recommendedSets = [
        { setId: 'deepwood_memories', description: '草耐性を30%ダウン。草元素パーティの必須聖遺物。', priority: 1 },
        { setId: 'gilded_dreams', description: '元素熟知を大きく盛る金メッキ4。', priority: 2 },
      ];
    } else if (char.element === 'geo') {
      char.recommendedBuild.recommendedSets = [
        { setId: 'husk_of_opulent_dreams', description: '防御力と岩ダメを大幅に高める岩キャラ最適聖遺物。', priority: 1 },
      ];
    } else if (char.element === 'hydro') {
      char.recommendedBuild.recommendedSets = [
        { setId: 'emblem_of_severed_fate', description: '元チャと爆発ダメージを両立する絶縁4。', priority: 1 },
      ];
    } else if (char.element === 'pyro') {
      char.recommendedBuild.recommendedSets = [
        { setId: 'crimson_witch_of_flames', description: '炎元素反応ダメージを強化する魔女4。', priority: 1 },
      ];
    } else if (char.element === 'cryo') {
      char.recommendedBuild.recommendedSets = [
        { setId: 'blizzard_strayer', description: '会心率を大きく底上げする氷風4。', priority: 1 },
      ];
    } else if (char.element === 'electro') {
      char.recommendedBuild.recommendedSets = [
        { setId: 'emblem_of_severed_fate', description: '元チャと爆発ダメージを強化する絶縁4。', priority: 1 },
      ];
    }
  }
}

fs.writeFileSync(jsonPath, JSON.stringify(allChars, null, 2));
console.log(`Successfully updated ${updatedCount} characters with GameWith accurate builds!`);

// src/data/characters.ts も更新
const tsContent = `import { Character } from '@/types/genshin';
import allCharactersData from './allMergedCharacters.json';

export const CHARACTERS: Character[] = allCharactersData as unknown as Character[];
`;
fs.writeFileSync(path.join(__dirname, '../src/data/characters.ts'), tsContent);
console.log('Updated src/data/characters.ts');

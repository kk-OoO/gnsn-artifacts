const fs = require('fs');
const path = require('path');
const genshindb = require('genshin-db');

genshindb.setOptions({ queryLanguages: ['Japanese', 'English'], resultLanguage: 'Japanese' });

// 先ほど生成した全キャラデータ
const generatedChars = require('../src/data/generatedCharacters.json');

// 詳細チューニング済み主要キャラクター
const manualDetailedChars = [
  {
    id: 'neuvillette',
    name: 'Neuvillette',
    japaneseName: 'ヌヴィレット',
    element: 'hydro',
    weapon: 'catalyst',
    rarity: 5,
    role: 'Main DPS',
    baseStats: {
      hp: 14695,
      atk: 208,
      def: 576,
      critRate: 5.0,
      critDamage: 88.4,
      energyRecharge: 100,
      elementalMastery: 0,
      elementalDmg: 0,
    },
    recommendedBuild: {
      recommendedSets: [
        { setId: 'marechaussee_hunter', description: '自傷と回復で4セット効果（会心率+36%）を常時維持可能。最適解。', priority: 1 },
        { setId: 'nymphs_dream', description: '水ダメと攻撃力バフ。ファントムが揃うまでの繋ぎ。', priority: 2 },
      ],
      recommendedMainStats: {
        sands: ['hp_percent'],
        goblet: ['hydro_dmg', 'hp_percent'],
        circlet: ['crit_damage', 'hp_percent'],
      },
      subStatPriority: ['crit_damage', 'crit_rate', 'hp_percent', 'energy_recharge'],
      targetStats: {
        hp: { min: 34000, ideal: 38000, unit: '', weight: 5 },
        critRate: { min: 50, ideal: 64, unit: '%', weight: 5 },
        critDamage: { min: 200, ideal: 260, unit: '%', weight: 5 },
        energyRecharge: { min: 120, ideal: 135, unit: '%', weight: 3 },
        elementalDmg: { min: 46.6, ideal: 70, unit: '%', weight: 4 },
      },
      buildTips: [
        'ファントムハンター4セット発動時、会心率が+36%されるため、聖遺物画面での会心率は64%以下に抑えて溢れないようにしましょう。',
        'ダメージ源はHP上限に完全に依存するため、攻撃力%は一切不要です。HP%を優先しましょう。',
        '重撃の使いやすさのために元チャ120%〜130%程度あると元素爆発がスムーズに回ります。',
      ],
    },
  },
  {
    id: 'furina',
    name: 'Furina',
    japaneseName: 'フリーナ',
    element: 'hydro',
    weapon: 'sword',
    rarity: 5,
    role: 'Sub DPS',
    baseStats: {
      hp: 15307,
      atk: 244,
      def: 696,
      critRate: 24.2,
      critDamage: 50.0,
      energyRecharge: 100,
      elementalMastery: 0,
      elementalDmg: 0,
    },
    recommendedBuild: {
      recommendedSets: [
        { setId: 'golden_troupe', description: '控えからの元素スキル火力を最大+70%強化。劇団4セット一択。', priority: 1 },
        { setId: 'tenacity_of_the_millelith', description: '千岩2+劇団2等のキメラ構成。繋ぎとして優秀。', priority: 2 },
      ],
      recommendedMainStats: {
        sands: ['hp_percent', 'energy_recharge'],
        goblet: ['hp_percent', 'hydro_dmg'],
        circlet: ['crit_rate', 'crit_damage'],
      },
      subStatPriority: ['energy_recharge', 'crit_rate', 'crit_damage', 'hp_percent'],
      targetStats: {
        hp: { min: 36000, ideal: 40000, unit: '', weight: 5 },
        energyRecharge: { min: 170, ideal: 200, unit: '%', weight: 5 },
        critRate: { min: 65, ideal: 80, unit: '%', weight: 4 },
        critDamage: { min: 130, ideal: 170, unit: '%', weight: 4 },
      },
      buildTips: [
        '爆発を毎ローテーション回すことが最重要です。単水運用の場合は元素チャージ効率200%前後を目標にしてください。',
        'HPが40,000に達すると固有天賦によるスキルダメアップが上限（+28%）になります。',
        '劇団4セットのダメージバフが大きいため、杯は水元素ダメよりHP%の方が総合ダメージが伸びる場合があります。',
      ],
    },
  },
  {
    id: 'kazuha',
    name: 'Kaedehara Kazuha',
    japaneseName: '楓原万葉',
    element: 'anemo',
    weapon: 'sword',
    rarity: 5,
    role: 'Support',
    baseStats: {
      hp: 13348,
      atk: 297,
      def: 807,
      critRate: 5.0,
      critDamage: 50.0,
      energyRecharge: 100,
      elementalMastery: 115.2,
      elementalDmg: 0,
    },
    recommendedBuild: {
      recommendedSets: [
        { setId: 'viridescent_venerer', description: '耐性デバフ40%が非常に強力。翠緑4セット以外は考えにくい。', priority: 1 },
      ],
      recommendedMainStats: {
        sands: ['elemental_mastery'],
        goblet: ['elemental_mastery'],
        circlet: ['elemental_mastery'],
      },
      subStatPriority: ['elemental_mastery', 'energy_recharge', 'crit_rate'],
      targetStats: {
        elementalMastery: { min: 850, ideal: 1000, unit: '', weight: 5 },
        energyRecharge: { min: 160, ideal: 180, unit: '%', weight: 5 },
        critRate: { min: 30, ideal: 45, unit: '%', weight: 2 },
      },
      buildTips: [
        '砂・杯・冠すべて元素熟知メインに揃えるのが基本です。',
        '西風剣を持たせる場合は、パッシブ粒子生成のために会心率30%〜40%程度をサブステで確保しましょう。',
        '熟知1000で拡散元素のダメージバフ+40%を提供できるようになります。',
      ],
    },
  },
  {
    id: 'raiden',
    name: 'Raiden Shogun',
    japaneseName: '雷電将軍',
    element: 'electro',
    weapon: 'polearm',
    rarity: 5,
    role: 'Sub DPS',
    baseStats: {
      hp: 12907,
      atk: 337,
      def: 789,
      critRate: 5.0,
      critDamage: 50.0,
      energyRecharge: 132.0,
      elementalMastery: 0,
      elementalDmg: 0,
    },
    recommendedBuild: {
      recommendedSets: [
        { setId: 'emblem_of_severed_fate', description: '元チャを爆発ダメに変換する絶縁4セットと圧倒的なシナジー。', priority: 1 },
      ],
      recommendedMainStats: {
        sands: ['energy_recharge', 'atk_percent'],
        goblet: ['electro_dmg', 'atk_percent'],
        circlet: ['crit_rate', 'crit_damage'],
      },
      subStatPriority: ['crit_rate', 'crit_damage', 'energy_recharge', 'atk_percent'],
      targetStats: {
        energyRecharge: { min: 250, ideal: 280, unit: '%', weight: 5 },
        atk: { min: 1600, ideal: 2000, unit: '', weight: 4 },
        critRate: { min: 60, ideal: 75, unit: '%', weight: 5 },
        critDamage: { min: 120, ideal: 160, unit: '%', weight: 5 },
      },
      buildTips: [
        '元素チャージ効率は天賦により雷元素ダメージと味方へのエネルギー配分量に直結します。最低250%を目指しましょう。',
        '草神との超開花起動役として使う場合は、楽園4または金メッキ4で熟知特化（熟知1000目標）にする別ビルドもあります。',
      ],
    },
  },
  {
    id: 'nahida',
    name: 'Nahida',
    japaneseName: 'ナヒーダ',
    element: 'dendro',
    weapon: 'catalyst',
    rarity: 5,
    role: 'Sub DPS',
    baseStats: {
      hp: 10331,
      atk: 299,
      def: 630,
      critRate: 5.0,
      critDamage: 50.0,
      energyRecharge: 100,
      elementalMastery: 115.2,
      elementalDmg: 0,
    },
    recommendedBuild: {
      recommendedSets: [
        { setId: 'deepwood_memories', description: 'チームに森林持ちが他にいない場合は深林4セットが必須。草耐性-30%。', priority: 1 },
        { setId: 'gilded_dreams', description: '深林役が別にいる場合、自身の火力を最大化する金メッキ4。', priority: 2 },
      ],
      recommendedMainStats: {
        sands: ['elemental_mastery'],
        goblet: ['elemental_mastery', 'dendro_dmg'],
        circlet: ['elemental_mastery', 'crit_rate', 'crit_damage'],
      },
      subStatPriority: ['elemental_mastery', 'crit_rate', 'crit_damage', 'atk_percent'],
      targetStats: {
        elementalMastery: { min: 800, ideal: 1000, unit: '', weight: 5 },
        critRate: { min: 40, ideal: 60, unit: '%', weight: 4 },
        critDamage: { min: 120, ideal: 160, unit: '%', weight: 4 },
        energyRecharge: { min: 120, ideal: 130, unit: '%', weight: 2 },
      },
      buildTips: [
        '控えメインの場合は熟知1000を目指し、味方へのバフ（最大+250）と自身の会心バフを最大化しましょう。',
        '表で殴るドライバー運用の場合は、熟知800程度で止めて草ダメ杯や会心冠でダメージを伸ばすのが強力です。',
      ],
    },
  },
  {
    id: 'yelan',
    name: 'Yelan',
    japaneseName: '夜蘭',
    element: 'hydro',
    weapon: 'bow',
    rarity: 5,
    role: 'Sub DPS',
    baseStats: {
      hp: 14450,
      atk: 244,
      def: 547,
      critRate: 24.2,
      critDamage: 50.0,
      energyRecharge: 100,
      elementalMastery: 0,
      elementalDmg: 0,
    },
    recommendedBuild: {
      recommendedSets: [
        { setId: 'emblem_of_severed_fate', description: '高い元チャを爆発ダメージに還元できる絶縁4が最適解。', priority: 1 },
      ],
      recommendedMainStats: {
        sands: ['energy_recharge', 'hp_percent'],
        goblet: ['hydro_dmg', 'hp_percent'],
        circlet: ['crit_rate', 'crit_damage'],
      },
      subStatPriority: ['energy_recharge', 'crit_rate', 'crit_damage', 'hp_percent'],
      targetStats: {
        hp: { min: 30000, ideal: 34000, unit: '', weight: 4 },
        energyRecharge: { min: 180, ideal: 220, unit: '%', weight: 5 },
        critRate: { min: 70, ideal: 85, unit: '%', weight: 5 },
        critDamage: { min: 140, ideal: 180, unit: '%', weight: 5 },
      },
      buildTips: [
        '1凸未満（無凸）かつ単水編成では元チャ200%〜220%以上が必要です。西風猟弓またはチャージ時計を推奨。',
        '攻撃力は一切ダメージに寄与しないため、サブステータスはHP%、会心、元チャに絞りましょう。',
      ],
    },
  },
  {
    id: 'arlecchino',
    name: 'Arlecchino',
    japaneseName: 'アルレッキーノ',
    element: 'pyro',
    weapon: 'polearm',
    rarity: 5,
    role: 'Main DPS',
    baseStats: {
      hp: 13103,
      atk: 342,
      def: 765,
      critRate: 5.0,
      critDamage: 88.4,
      energyRecharge: 100,
      elementalMastery: 0,
      elementalDmg: 0,
    },
    recommendedBuild: {
      recommendedSets: [
        { setId: 'fragment_of_harmonic_whimsy', description: '命の契約を活用して常時ダメバフ+54%を獲得する専用聖遺物。', priority: 1 },
        { setId: 'gladiators_finale', description: '通常攻撃バフ+35%が得られ、集めやすい剣闘士4セット。繋ぎとして極めて優秀。', priority: 2 },
      ],
      recommendedMainStats: {
        sands: ['atk_percent'],
        goblet: ['pyro_dmg'],
        circlet: ['crit_rate', 'crit_damage'],
      },
      subStatPriority: ['crit_rate', 'crit_damage', 'atk_percent', 'elemental_mastery'],
      targetStats: {
        atk: { min: 2000, ideal: 2400, unit: '', weight: 4 },
        critRate: { min: 75, ideal: 85, unit: '%', weight: 5 },
        critDamage: { min: 160, ideal: 220, unit: '%', weight: 5 },
        elementalMastery: { min: 80, ideal: 150, unit: '', weight: 3 },
      },
      buildTips: [
        '命の契約によって通常攻撃を炎元素化して戦います。攻撃力と会心バランスが最も重要です。',
        '蒸発編成で使う場合は元素熟知が100前後あると蒸発ダメージが大幅に伸びます。',
      ],
    },
  },
  {
    id: 'hutao',
    name: 'Hu Tao',
    japaneseName: '胡桃',
    element: 'pyro',
    weapon: 'polearm',
    rarity: 5,
    role: 'Main DPS',
    baseStats: {
      hp: 15552,
      atk: 106,
      def: 876,
      critRate: 5.0,
      critDamage: 88.4,
      energyRecharge: 100,
      elementalMastery: 0,
      elementalDmg: 0,
    },
    recommendedBuild: {
      recommendedSets: [
        { setId: 'crimson_witch_of_flames', description: '蒸発ダメージと炎バフを高める魔女4セット。胡桃の定番。', priority: 1 },
        { setId: 'shimenawas_reminiscence', description: '重撃ダメージ+50%の瞬間火力特化しめ縄4。', priority: 2 },
      ],
      recommendedMainStats: {
        sands: ['hp_percent', 'elemental_mastery'],
        goblet: ['pyro_dmg'],
        circlet: ['crit_rate', 'crit_damage'],
      },
      subStatPriority: ['crit_rate', 'crit_damage', 'elemental_mastery', 'hp_percent'],
      targetStats: {
        hp: { min: 30000, ideal: 34000, unit: '', weight: 5 },
        critRate: { min: 70, ideal: 80, unit: '%', weight: 5 },
        critDamage: { min: 180, ideal: 230, unit: '%', weight: 5 },
        elementalMastery: { min: 120, ideal: 200, unit: '', weight: 4 },
      },
      buildTips: [
        'スキル発動でHP上限に応じて攻撃力が跳ね上がるため、時計はHP%が基本ですが、蒸発運用なら熟知時計も非常に強力です。',
        '蒸発反応を常時起こすキャラなので、元素熟知150程度は必須級です。',
      ],
    },
  },
  {
    id: 'zhongli',
    name: 'Zhongli',
    japaneseName: '鍾離',
    element: 'geo',
    weapon: 'polearm',
    rarity: 5,
    role: 'Shielder',
    baseStats: {
      hp: 14695,
      atk: 251,
      def: 738,
      critRate: 5.0,
      critDamage: 50.0,
      energyRecharge: 100,
      elementalMastery: 0,
      elementalDmg: 28.8,
    },
    recommendedBuild: {
      recommendedSets: [
        { setId: 'tenacity_of_the_millelith', description: '柱の共鳴で攻撃力バフとシールド強化を維持できる千岩4。', priority: 1 },
      ],
      recommendedMainStats: {
        sands: ['hp_percent'],
        goblet: ['hp_percent'],
        circlet: ['hp_percent', 'crit_rate'],
      },
      subStatPriority: ['hp_percent', 'hp_flat', 'energy_recharge', 'crit_rate'],
      targetStats: {
        hp: { min: 45000, ideal: 52000, unit: '', weight: 5 },
        energyRecharge: { min: 120, ideal: 140, unit: '%', weight: 2 },
      },
      buildTips: [
        '完全なシールド特化（カチカチ鍾離）を目指すなら、黒纓槍（スライム槍）＋HP%聖遺物でHP50000超えを目指しましょう。',
        '西風長槍を持たせる場合は会心冠などで会心率30%以上を確保すると粒子サポートが安定します。',
      ],
    },
  },
  {
    id: 'bennett',
    name: 'Bennett',
    japaneseName: 'ベネット',
    element: 'pyro',
    weapon: 'sword',
    rarity: 4,
    role: 'Healer',
    baseStats: {
      hp: 12397,
      atk: 191,
      def: 771,
      critRate: 5.0,
      critDamage: 50.0,
      energyRecharge: 126.7,
      elementalMastery: 0,
      elementalDmg: 0,
    },
    recommendedBuild: {
      recommendedSets: [
        { setId: 'noblesse_oblige', description: '爆発発動でチーム全体の攻撃力+20%。ベネットの鉄板聖遺物。', priority: 1 },
      ],
      recommendedMainStats: {
        sands: ['energy_recharge', 'hp_percent'],
        goblet: ['hp_percent'],
        circlet: ['healing_bonus', 'hp_percent'],
      },
      subStatPriority: ['energy_recharge', 'hp_percent', 'hp_flat'],
      targetStats: {
        energyRecharge: { min: 220, ideal: 250, unit: '%', weight: 5 },
        hp: { min: 28000, ideal: 32000, unit: '', weight: 4 },
      },
      buildTips: [
        '爆発による攻撃力バフはベネットの【基礎攻撃力】（Lvと武器の攻撃力のみ）を参照します。聖遺物の攻撃力%はバフに乗りません！',
        'そのため聖遺物は「元素チャージ効率」と「HP（回復量）」に全振りするのが基本です。',
      ],
    },
  },
  {
    id: 'xiangling',
    name: 'Xiangling',
    japaneseName: '香菱',
    element: 'pyro',
    weapon: 'polearm',
    rarity: 4,
    role: 'Sub DPS',
    baseStats: {
      hp: 10875,
      atk: 225,
      def: 669,
      critRate: 5.0,
      critDamage: 50.0,
      energyRecharge: 100,
      elementalMastery: 96.0,
      elementalDmg: 0,
    },
    recommendedBuild: {
      recommendedSets: [
        { setId: 'emblem_of_severed_fate', description: '重い必要エネルギー80を補いつつ爆発火力を大幅強化する絶縁4一択。', priority: 1 },
      ],
      recommendedMainStats: {
        sands: ['energy_recharge', 'elemental_mastery', 'atk_percent'],
        goblet: ['pyro_dmg'],
        circlet: ['crit_rate', 'crit_damage'],
      },
      subStatPriority: ['energy_recharge', 'crit_rate', 'crit_damage', 'elemental_mastery', 'atk_percent'],
      targetStats: {
        energyRecharge: { min: 200, ideal: 240, unit: '%', weight: 5 },
        critRate: { min: 60, ideal: 70, unit: '%', weight: 5 },
        critDamage: { min: 120, ideal: 150, unit: '%', weight: 5 },
        elementalMastery: { min: 150, ideal: 250, unit: '', weight: 4 },
        atk: { min: 1300, ideal: 1600, unit: '', weight: 3 },
      },
      buildTips: [
        '元素爆発がダメージ源ですが、必要エネルギーが80と極めて重いため、元チャ200%以上は絶対に確保しましょう。',
        '「漁獲」との相性が抜群。ベネットのバフに乗せて爆発をスナップショットして使います。',
      ],
    },
  },
  {
    id: 'mualani',
    name: 'Mualani',
    japaneseName: 'ムアラニ',
    element: 'hydro',
    weapon: 'catalyst',
    rarity: 5,
    role: 'Main DPS',
    baseStats: {
      hp: 15185,
      atk: 191,
      def: 603,
      critRate: 24.2,
      critDamage: 50.0,
      energyRecharge: 100,
      elementalMastery: 0,
      elementalDmg: 0,
    },
    recommendedBuild: {
      recommendedSets: [
        { setId: 'obsidian_codex', description: '夜魂値消費で会心率+40%。ナタのアタッカーに最適な新聖遺物。', priority: 1 },
      ],
      recommendedMainStats: {
        sands: ['hp_percent', 'elemental_mastery'],
        goblet: ['hydro_dmg', 'hp_percent'],
        circlet: ['crit_damage'],
      },
      subStatPriority: ['crit_damage', 'elemental_mastery', 'hp_percent', 'crit_rate'],
      targetStats: {
        hp: { min: 32000, ideal: 36000, unit: '', weight: 5 },
        critRate: { min: 45, ideal: 60, unit: '%', weight: 4 },
        critDamage: { min: 180, ideal: 240, unit: '%', weight: 5 },
        elementalMastery: { min: 150, ideal: 250, unit: '', weight: 4 },
      },
      buildTips: [
        '黒曜の秘典4セット効果で会心率が+40%されるため、会心率は60%以下に留めて会心ダメージとHP・熟知に寄せましょう。',
        '蒸発反応の一撃が極めて重いアタッカーのため、元素熟知の重要度がとても高いです。',
      ],
    },
  },
  {
    id: 'kinich',
    name: 'Kinich',
    japaneseName: 'キニチ',
    element: 'dendro',
    weapon: 'claymore',
    rarity: 5,
    role: 'Main DPS',
    baseStats: {
      hp: 12858,
      atk: 332,
      def: 814,
      critRate: 5.0,
      critDamage: 88.4,
      energyRecharge: 100,
      elementalMastery: 0,
      elementalDmg: 0,
    },
    recommendedBuild: {
      recommendedSets: [
        { setId: 'obsidian_codex', description: '夜魂値を頻繁に消費するスキル砲撃と好相性。会心率+40%。', priority: 1 },
        { setId: 'golden_troupe', description: '強力な元素スキルダメージを大きく強化する劇団4。', priority: 2 },
      ],
      recommendedMainStats: {
        sands: ['atk_percent'],
        goblet: ['dendro_dmg'],
        circlet: ['crit_damage', 'crit_rate'],
      },
      subStatPriority: ['crit_damage', 'crit_rate', 'atk_percent', 'energy_recharge'],
      targetStats: {
        atk: { min: 2000, ideal: 2300, unit: '', weight: 4 },
        critRate: { min: 50, ideal: 60, unit: '%', weight: 4 },
        critDamage: { min: 180, ideal: 240, unit: '%', weight: 5 },
        energyRecharge: { min: 120, ideal: 135, unit: '%', weight: 3 },
      },
      buildTips: [
        '燃焼や烈開花反応を起こしながら大ダメージの廻鱗砲を連射します。黒曜4セットで会心率を大きく補えます。',
        'ダメージは攻撃力依存です。草元素ダメージ杯と攻撃力%砂を装備しましょう。',
      ],
    },
  },
  {
    id: 'mavuika',
    name: 'Mavuika',
    japaneseName: 'マーヴィカ',
    element: 'pyro',
    weapon: 'claymore',
    rarity: 5,
    role: 'Main DPS',
    baseStats: {
      hp: 13500,
      atk: 350,
      def: 750,
      critRate: 24.2,
      critDamage: 50.0,
      energyRecharge: 100,
      elementalMastery: 0,
      elementalDmg: 0,
    },
    recommendedBuild: {
      recommendedSets: [
        { setId: 'obsidian_codex', description: 'ナタの炎神として夜魂の加護・消費を駆使。会心率+40%と与ダメ+15%。', priority: 1 },
        { setId: 'scroll_of_the_hero_of_cinder_city', description: 'サポート兼サブアタッカー運用時に強力な灰燼4セット。味方に全元素ダメ+40%。', priority: 2 },
      ],
      recommendedMainStats: {
        sands: ['atk_percent', 'energy_recharge'],
        goblet: ['pyro_dmg'],
        circlet: ['crit_damage', 'crit_rate'],
      },
      subStatPriority: ['crit_damage', 'crit_rate', 'atk_percent', 'energy_recharge', 'elemental_mastery'],
      targetStats: {
        atk: { min: 2100, ideal: 2500, unit: '', weight: 4 },
        critRate: { min: 55, ideal: 60, unit: '%', weight: 4 },
        critDamage: { min: 180, ideal: 240, unit: '%', weight: 5 },
        energyRecharge: { min: 130, ideal: 150, unit: '%', weight: 3 },
      },
      buildTips: [
        'アタッカー型の場合は黒曜4セット、チームサポート型の場合は灰燼4セットと役割によって切り替えが可能です。',
        '高火力な元素爆発とスキル追撃を持つため、攻撃力と会心ダメージを重点的に育成しましょう。',
      ],
    },
  },
];

// マージ処理
const allCharacters = [];
const processedNames = new Set();

// 1. まず詳細チューニング済みキャラを追加（公式画像URLを付加）
for (const char of manualDetailedChars) {
  const dbChar = genshindb.characters(char.japaneseName);
  const avatarUrl = dbChar?.images?.mihoyo_icon || dbChar?.images?.icon || '';
  allCharacters.push({
    ...char,
    avatarUrl,
  });
  processedNames.add(char.japaneseName);
  processedNames.add(char.name);
  processedNames.add(char.id);
}

// 2. 残りの全キャラクターを追加
for (const char of generatedChars) {
  if (
    processedNames.has(char.japaneseName) ||
    processedNames.has(char.name) ||
    processedNames.has(char.id)
  ) {
    continue;
  }
  allCharacters.push(char);
  processedNames.add(char.japaneseName);
}

console.log(`Merged ${allCharacters.length} total characters!`);

fs.writeFileSync(
  path.join(__dirname, '../src/data/allMergedCharacters.json'),
  JSON.stringify(allCharacters, null, 2)
);
console.log('Saved allMergedCharacters.json');

'use client';

import React, { useState, useEffect } from 'react';
import { Character, WeaponConfig, WeaponSubType } from '@/types/genshin';
import {
  POPULAR_WEAPON_PRESETS,
  WEAPON_SUBSTAT_NAMES,
  WeaponPresetItem,
} from '@/data/weapons';
import { X, Sword, Sparkles, Check } from 'lucide-react';

interface WeaponConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: Character;
  currentWeapon?: WeaponConfig;
  onSaveWeapon: (weapon: WeaponConfig) => void;
}

const COMMON_BASE_ATKS = [741, 674, 608, 565, 542, 510, 454];

export function WeaponConfigModal({
  isOpen,
  onClose,
  character,
  currentWeapon,
  onSaveWeapon,
}: WeaponConfigModalProps) {
  const [name, setName] = useState<string>('');
  const [baseAtk, setBaseAtk] = useState<number>(608);
  const [subStatType, setSubStatType] = useState<WeaponSubType>('crit_damage');
  const [subStatValue, setSubStatValue] = useState<number>(66.2);

  // 初期化
  useEffect(() => {
    if (currentWeapon) {
      setName(currentWeapon.name || '');
      setBaseAtk(currentWeapon.baseAtk || 608);
      setSubStatType(currentWeapon.subStatType || 'none');
      setSubStatValue(currentWeapon.subStatValue || 0);
    } else {
      const presets = POPULAR_WEAPON_PRESETS[character.weapon] || [];
      const defaultP = presets[0];
      if (defaultP) {
        setName(defaultP.name);
        setBaseAtk(defaultP.baseAtk);
        setSubStatType(defaultP.subStatType);
        setSubStatValue(defaultP.subStatValue);
      } else {
        setName('モチーフ武器');
        setBaseAtk(608);
        setSubStatType('crit_damage');
        setSubStatValue(66.2);
      }
    }
  }, [currentWeapon, character, isOpen]);

  if (!isOpen) return null;

  const presets = POPULAR_WEAPON_PRESETS[character.weapon] || [];

  const handleSelectPreset = (p: WeaponPresetItem) => {
    setName(p.name);
    setBaseAtk(p.baseAtk);
    setSubStatType(p.subStatType);
    setSubStatValue(p.subStatValue);
  };

  const handleSubStatTypeChange = (type: WeaponSubType) => {
    setSubStatType(type);
    if (type === 'none') {
      setSubStatValue(0);
    } else if (subStatValue === 0) {
      if (type === 'crit_damage') setSubStatValue(66.2);
      else if (type === 'crit_rate') setSubStatValue(33.1);
      else if (type === 'elemental_mastery') setSubStatValue(165);
      else if (type === 'energy_recharge') setSubStatValue(55.1);
      else if (type === 'atk_percent') setSubStatValue(49.6);
      else if (type === 'hp_percent') setSubStatValue(41.3);
      else if (type === 'def_percent') setSubStatValue(51.7);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveWeapon({
      name: name.trim() || '装備武器',
      baseAtk: Number(baseAtk) || 510,
      subStatType,
      subStatValue: subStatType === 'none' ? 0 : Number(subStatValue) || 0,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 sticky top-0 bg-slate-900/95 backdrop-blur z-10">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
              <Sword className="w-5 h-5 text-amber-400" />
              <span>{character.japaneseName} の装備武器設定</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              武器の基礎攻撃力とサブステータスを入力して最終ステータスに反映
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-5">
          {/* 定番プリセットクイック選択 */}
          {presets.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-amber-300 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>定番武器からクイック選択</span>
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 bg-slate-950/60 rounded-xl border border-slate-800/80">
                {presets.map((p) => {
                  const isSelected =
                    name === p.name &&
                    baseAtk === p.baseAtk &&
                    subStatType === p.subStatType;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectPreset(p)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1 border ${
                        isSelected
                          ? 'bg-amber-400 text-slate-950 font-bold border-amber-400 shadow-sm shadow-amber-400/20'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-slate-100'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                      <span>{p.name}</span>
                      <span className="text-[10px] opacity-75 font-mono">
                        ({p.baseAtk})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 武器名入力 */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              武器名
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: 護摩の杖、西風剣など"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* 武器メインステータス: 基礎攻撃力 (Base ATK) */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200">
                メインステータス: 基礎攻撃力 (Lv90)
              </label>
              <span className="text-[11px] text-slate-400">
                キャラ基礎ATKと合算されます
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <input
                  type="number"
                  min={100}
                  max={1000}
                  value={baseAtk}
                  onChange={(e) => setBaseAtk(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-base font-black text-amber-300 font-mono focus:outline-none focus:border-amber-400"
                />
              </div>
              <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
                Base ATK
              </span>
            </div>

            {/* 定番の基礎攻撃力ピル */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[10px] text-slate-500">目安:</span>
              {COMMON_BASE_ATKS.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setBaseAtk(val)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium transition ${
                    baseAtk === val
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* 武器サブステータス */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
            <label className="text-xs font-bold text-slate-200 block">
              サブステータス (Lv90)
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  ステータス種別
                </label>
                <select
                  value={subStatType}
                  onChange={(e) =>
                    handleSubStatTypeChange(e.target.value as WeaponSubType)
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                >
                  {Object.entries(WEAPON_SUBSTAT_NAMES).map(([key, info]) => (
                    <option key={key} value={key}>
                      {info.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  ステータス数値
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    min={0}
                    disabled={subStatType === 'none'}
                    value={subStatType === 'none' ? 0 : subStatValue}
                    onChange={(e) => setSubStatValue(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-slate-100 font-mono focus:outline-none focus:border-amber-400 disabled:opacity-50"
                  />
                  <span className="text-xs text-slate-400 min-w-[20px]">
                    {WEAPON_SUBSTAT_NAMES[subStatType]?.unit}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ボタン */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 transition shadow-lg shadow-amber-500/20"
            >
              設定を保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

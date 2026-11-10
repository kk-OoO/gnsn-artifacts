import { Artifact } from '@/types/genshin';
import { INITIAL_ARTIFACTS, PRESET_SAMPLE_ARTIFACTS } from '@/data/sampleData';

const ARTIFACTS_KEY = 'genshin_artifacts_data_v1';
const OWNED_CHARACTERS_KEY = 'genshin_owned_characters_v2';
const SATISFIED_CHARACTERS_KEY = 'genshin_satisfied_characters_v1';
const ONLY_OWNED_FILTER_KEY = 'genshin_only_owned_filter_v1';

export function loadStoredArtifacts(): Artifact[] {
  if (typeof window === 'undefined') return INITIAL_ARTIFACTS;
  try {
    const raw = localStorage.getItem(ARTIFACTS_KEY);
    if (!raw) {
      localStorage.setItem(ARTIFACTS_KEY, JSON.stringify(INITIAL_ARTIFACTS));
      return INITIAL_ARTIFACTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load artifacts from localStorage', err);
    return INITIAL_ARTIFACTS;
  }
}

export function saveStoredArtifacts(artifacts: Artifact[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ARTIFACTS_KEY, JSON.stringify(artifacts));
  } catch (err) {
    console.error('Failed to save artifacts to localStorage', err);
  }
}

export function resetToEmptyData(): Artifact[] {
  if (typeof window !== 'undefined') {
    localStorage.setItem(ARTIFACTS_KEY, JSON.stringify([]));
  }
  return [];
}

export function loadPresetSamples(): Artifact[] {
  if (typeof window !== 'undefined') {
    localStorage.setItem(ARTIFACTS_KEY, JSON.stringify(PRESET_SAMPLE_ARTIFACTS));
  }
  return PRESET_SAMPLE_ARTIFACTS;
}

// 所持キャラクターIDリストの読み込み
export function loadOwnedCharacterIds(allIds: string[] = []): string[] {
  if (typeof window === 'undefined') return allIds;
  try {
    const raw = localStorage.getItem(OWNED_CHARACTERS_KEY);
    if (!raw) {
      // 初回は全キャラを所持状態として登録
      localStorage.setItem(OWNED_CHARACTERS_KEY, JSON.stringify(allIds));
      return allIds;
    }
    return JSON.parse(raw);
  } catch {
    return allIds;
  }
}

export function saveOwnedCharacterIds(ids: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(OWNED_CHARACTERS_KEY, JSON.stringify(ids));
  } catch (err) {
    console.error('Failed to save owned character ids', err);
  }
}

// 満足・厳選完了したキャラクターIDリストの読み込み
export function loadSatisfiedCharacterIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SATISFIED_CHARACTERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveSatisfiedCharacterIds(ids: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SATISFIED_CHARACTERS_KEY, JSON.stringify(ids));
  } catch (err) {
    console.error('Failed to save satisfied character ids', err);
  }
}

// 「所持キャラのみ表示」設定フラグ
export function loadOnlyOwnedFilter(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(ONLY_OWNED_FILTER_KEY);
    if (raw === null) return true; // デフォルトは所持キャラのみ表示
    return JSON.parse(raw);
  } catch {
    return false;
  }
}

export function saveOnlyOwnedFilter(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ONLY_OWNED_FILTER_KEY, JSON.stringify(enabled));
  } catch (err) {
    console.error('Failed to save only owned filter', err);
  }
}

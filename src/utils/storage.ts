import { Artifact, WeaponConfig } from '@/types/genshin';
import { INITIAL_ARTIFACTS, PRESET_SAMPLE_ARTIFACTS } from '@/data/sampleData';

const ARTIFACTS_KEY = 'genshin_artifacts_data_v1';
const OWNED_CHARACTERS_KEY = 'genshin_owned_characters_v2';
const SATISFIED_CHARACTERS_KEY = 'genshin_satisfied_characters_v1';
const ONLY_OWNED_FILTER_KEY = 'genshin_only_owned_filter_v1';
const CHARACTER_WEAPONS_KEY = 'genshin_character_weapons_v1';

/* ------------------------------------------------------------------
   サーバーDB API 通信レイヤー (PC・スマホ間共通)
------------------------------------------------------------------ */

export interface DbInfo {
  isExternal: boolean;
  type: string;
}

// サーバーDBから聖遺物を全件取得
export async function fetchArtifactsFromDb(): Promise<Artifact[] | null> {
  try {
    const res = await fetch('/api/artifacts');
    if (!res.ok) return null;
    const data = await res.json();
    if (data.success && Array.isArray(data.artifacts)) {
      // ローカルストレージにもキャッシュ保存
      saveStoredArtifacts(data.artifacts);
      return data.artifacts;
    }
    return null;
  } catch (err) {
    console.warn('Failed to fetch artifacts from DB API, using local cache:', err);
    return null;
  }
}

// サーバーDBへ聖遺物を1件保存
export async function saveArtifactToDb(artifact: Artifact): Promise<boolean> {
  try {
    const res = await fetch('/api/artifacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(artifact),
    });
    return res.ok;
  } catch (err) {
    console.warn('Failed to save artifact to DB:', err);
    return false;
  }
}

// サーバーDBへ聖遺物を一括保存（全置換・インポート・付け替え）
export async function bulkSaveArtifactsToDb(artifacts: Artifact[]): Promise<boolean> {
  // ローカルキャッシュ即時反映
  saveStoredArtifacts(artifacts);
  try {
    const res = await fetch('/api/artifacts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(artifacts),
    });
    return res.ok;
  } catch (err) {
    console.warn('Failed to bulk save artifacts to DB:', err);
    return false;
  }
}

// サーバーDBから聖遺物を削除
export async function deleteArtifactFromDb(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/artifacts?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    console.warn('Failed to delete artifact from DB:', err);
    return false;
  }
}

// サーバーDBの聖遺物を全クリア
export async function clearAllArtifactsFromDb(): Promise<boolean> {
  saveStoredArtifacts([]);
  try {
    const res = await fetch('/api/artifacts?all=true', {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    console.warn('Failed to clear artifacts in DB:', err);
    return false;
  }
}

// サーバーDBから設定情報を取得
export async function fetchSettingsFromDb(): Promise<{
  settings: Record<string, any>;
  dbInfo: DbInfo;
} | null> {
  try {
    const res = await fetch('/api/settings');
    if (!res.ok) return null;
    const data = await res.json();
    if (data.success) {
      return {
        settings: data.settings || {},
        dbInfo: data.dbInfo,
      };
    }
    return null;
  } catch (err) {
    console.warn('Failed to fetch settings from DB API:', err);
    return null;
  }
}

// サーバーDBへ設定を保存
export async function saveSettingToDb(key: string, value: any): Promise<boolean> {
  try {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value }),
    });
    return res.ok;
  } catch (err) {
    console.warn('Failed to save setting to DB:', err);
    return false;
  }
}

/* ------------------------------------------------------------------
   ローカルキャッシュ（フォールバック用）
------------------------------------------------------------------ */

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

export function loadOwnedCharacterIds(allIds: string[] = []): string[] {
  if (typeof window === 'undefined') return allIds;
  try {
    const raw = localStorage.getItem(OWNED_CHARACTERS_KEY);
    if (!raw) {
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

export function loadOnlyOwnedFilter(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(ONLY_OWNED_FILTER_KEY);
    if (raw === null) return true;
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

export function loadCharacterWeapons(): Record<string, WeaponConfig> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(CHARACTER_WEAPONS_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function saveCharacterWeapons(weapons: Record<string, WeaponConfig>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CHARACTER_WEAPONS_KEY, JSON.stringify(weapons));
  } catch (err) {
    console.error('Failed to save character weapons', err);
  }
}

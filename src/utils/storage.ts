import { Artifact } from '@/types/genshin';
import { INITIAL_ARTIFACTS } from '@/data/sampleData';

const ARTIFACTS_KEY = 'genshin_artifacts_data_v1';
const OWNED_CHARACTERS_KEY = 'genshin_owned_characters_v1';

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

export function loadOwnedCharacterIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(OWNED_CHARACTERS_KEY);
    if (!raw) {
      // 初期は全キャラまたは代表キャラを所持状態に
      const defaultOwned = ['neuvillette', 'furina', 'kazuha', 'raiden', 'nahida', 'mualani', 'bennett'];
      localStorage.setItem(OWNED_CHARACTERS_KEY, JSON.stringify(defaultOwned));
      return defaultOwned;
    }
    return JSON.parse(raw);
  } catch {
    return [];
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

export function resetToSampleData(): Artifact[] {
  if (typeof window !== 'undefined') {
    localStorage.setItem(ARTIFACTS_KEY, JSON.stringify(INITIAL_ARTIFACTS));
  }
  return INITIAL_ARTIFACTS;
}

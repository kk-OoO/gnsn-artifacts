import { Artifact } from '@/types/genshin';
import { INITIAL_ARTIFACTS, PRESET_SAMPLE_ARTIFACTS } from '@/data/sampleData';

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

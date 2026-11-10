import { Character } from '@/types/genshin';
import allCharactersData from './allMergedCharacters.json';

export const CHARACTERS: Character[] = allCharactersData as unknown as Character[];

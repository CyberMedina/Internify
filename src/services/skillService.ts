import { api } from './api';

export interface Skill {
  id: number;
  name: string;
  type?: 'popular' | 'catalog';
}

export const skillService = {
  searchSkills: async (token: string, query: string): Promise<Skill[]> => {
    if (query.length < 2) return [];
    return api.get<Skill[]>(`/skills?query=${encodeURIComponent(query)}`, { token });
  },

  getSuggestedSkills: async (token: string): Promise<Skill[]> => {
    return api.get<Skill[]>('/skills/suggested', { token });
  }
};

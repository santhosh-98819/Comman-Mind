import { Experience, ProblemInput, SolutionAnalysis, PlatformStats, UserProfile, WritingAssistResponse } from '../types';
import { SEED_EXPERIENCES } from '../data/seedExperiences';

const USER_STORAGE_KEY = 'common_mind_user';
const SAVED_SOLUTIONS_KEY = 'common_mind_saved_solutions';
const ACTIVE_SOLUTIONS_KEY = 'common_mind_active_solutions';
const AI_WRITING_ASSIST_KEY = 'common_mind_ai_writing_assist_enabled';

export function getAiWritingAssistPreference(): boolean {
  try {
    const saved = localStorage.getItem(AI_WRITING_ASSIST_KEY);
    if (saved !== null) {
      return saved === 'true';
    }
  } catch (e) {}
  return true; // Default ON as requested
}

export function setAiWritingAssistPreference(enabled: boolean) {
  try {
    localStorage.setItem(AI_WRITING_ASSIST_KEY, String(enabled));
  } catch (e) {}
}

export function getLocalUser(): UserProfile {
  try {
    const saved = localStorage.getItem(USER_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Storage error:', e);
  }

  const defaultUser: UserProfile = {
    id: `guest-${Math.random().toString(36).substring(2, 9)}`,
    name: 'Guest Explorer',
    isGuest: true,
    joinedAt: new Date().toISOString(),
    experiencesShared: 0,
    solutionsTested: 0,
    peopleHelped: 0,
    savedSolutionIds: [],
  };
  saveLocalUser(defaultUser);
  return defaultUser;
}

export function saveLocalUser(user: UserProfile) {
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } catch (e) {
    console.error('Storage error:', e);
  }
}

export async function fetchExperiences(params?: {
  category?: string;
  outcome?: string;
  query?: string;
  sort?: string;
  limit?: number;
  includeDemo?: boolean;
  mode?: 'community' | 'demo' | 'all';
}): Promise<{ count: number; realCount?: number; demoCount?: number; experiences: Experience[] }> {
  try {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.set('category', params.category);
    if (params?.outcome) queryParams.set('outcome', params.outcome);
    if (params?.query) queryParams.set('query', params.query);
    if (params?.sort) queryParams.set('sort', params.sort);
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.includeDemo) queryParams.set('includeDemo', 'true');
    if (params?.mode) queryParams.set('mode', params.mode);

    const res = await fetch(`/api/experiences?${queryParams.toString()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return {
      count: data.count,
      realCount: data.realCount,
      demoCount: data.demoCount,
      experiences: data.experiences || [],
    };
  } catch (e) {
    console.warn('API error fetching experiences:', e);
    // If demo mode was explicitly requested, allow demo seeds in offline fallback
    if (params?.mode === 'demo') {
      const exps = params?.limit ? SEED_EXPERIENCES.slice(0, params.limit) : SEED_EXPERIENCES;
      return { count: SEED_EXPERIENCES.length, demoCount: SEED_EXPERIENCES.length, realCount: 0, experiences: exps };
    }
    // Production default: starts strictly with ZERO real community experiences
    return { count: 0, realCount: 0, demoCount: SEED_EXPERIENCES.length, experiences: [] };
  }
}

export async function submitExperience(exp: Partial<Experience>): Promise<Experience> {
  const res = await fetch('/api/experiences', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(exp),
  });
  if (!res.ok) throw new Error('Failed to submit experience');
  const data = await res.json();

  // Increment user count
  const user = getLocalUser();
  user.experiencesShared += 1;
  user.peopleHelped += 1;
  saveLocalUser(user);

  return data.experience;
}

export async function voteExperience(id: string, vote: 'useful' | 'not_useful'): Promise<boolean> {
  try {
    const res = await fetch(`/api/experiences/${id}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vote }),
    });
    return res.ok;
  } catch (e) {
    console.error('Voting error:', e);
    return false;
  }
}

export async function analyzeProblem(problemInput: ProblemInput): Promise<SolutionAnalysis> {
  const res = await fetch('/api/analyze-problem', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(problemInput),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Failed to analyze situation.' }));
    throw new Error(err.message || 'Analysis failed');
  }
  const data = await res.json();
  const solution: SolutionAnalysis = data.solution;

  // Auto-track in local active list
  saveActiveSolution(solution);
  return solution;
}

export async function fetchSolutions(): Promise<SolutionAnalysis[]> {
  try {
    const res = await fetch('/api/solutions');
    if (!res.ok) throw new Error('Failed to fetch solutions');
    const data = await res.json();
    return data.solutions || [];
  } catch (e) {
    return getLocalActiveSolutions();
  }
}

export async function reportOutcomeFeedback(
  solutionId: string,
  payload: {
    result: 'worked' | 'partially_worked' | 'did_not_work';
    whatHappened: string;
    whatLearned: string;
    whatWouldChange: string;
    isAnonymous: boolean;
    authorName?: string;
    shareAsPublicExperience?: boolean;
  }
): Promise<{ success: boolean; generatedExperience?: Experience }> {
  const res = await fetch(`/api/solutions/${solutionId}/outcome`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to report outcome');
  const data = await res.json();

  // Update local user stats
  const user = getLocalUser();
  user.solutionsTested += 1;
  if (payload.shareAsPublicExperience !== false) {
    user.experiencesShared += 1;
  }
  saveLocalUser(user);

  return data;
}

export async function fetchPlatformStats(): Promise<PlatformStats> {
  try {
    const res = await fetch('/api/dashboard/stats');
    if (!res.ok) throw new Error('Failed to fetch stats');
    const data = await res.json();
    return data.stats;
  } catch (e) {
    return {
      totalRealExperiences: 0,
      totalDemoExperiences: SEED_EXPERIENCES.length,
      totalExperiences: 0,
      totalOutcomesReported: 0,
      successfulSolutionsRatio: 0,
      activeCategories: 0,
      communityContributors: 0,
    };
  }
}

// Local Storage helpers for fast client state
export function getLocalSavedSolutions(): SolutionAnalysis[] {
  try {
    const saved = localStorage.getItem(SAVED_SOLUTIONS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
}

export function saveSolutionLocally(solution: SolutionAnalysis): boolean {
  try {
    const list = getLocalSavedSolutions();
    const existingIndex = list.findIndex((s) => s.id === solution.id);
    if (existingIndex >= 0) {
      list.splice(existingIndex, 1);
      localStorage.setItem(SAVED_SOLUTIONS_KEY, JSON.stringify(list));
      return false; // un-bookmarked
    } else {
      list.unshift(solution);
      localStorage.setItem(SAVED_SOLUTIONS_KEY, JSON.stringify(list));
      return true; // bookmarked
    }
  } catch (e) {
    return false;
  }
}

export function getLocalActiveSolutions(): SolutionAnalysis[] {
  try {
    const saved = localStorage.getItem(ACTIVE_SOLUTIONS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
}

export function saveActiveSolution(solution: SolutionAnalysis) {
  try {
    const list = getLocalActiveSolutions();
    const existingIndex = list.findIndex((s) => s.id === solution.id);
    if (existingIndex >= 0) {
      list[existingIndex] = solution;
    } else {
      list.unshift(solution);
    }
    localStorage.setItem(ACTIVE_SOLUTIONS_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save active solution:', e);
  }
}

export async function assistWriting(
  text: string,
  fieldName?: string,
  context?: string
): Promise<WritingAssistResponse> {
  try {
    if (!text || text.trim().length < 3) {
      return { hasSuggestions: false, suggestions: [] };
    }
    const res = await fetch('/api/assist-writing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, fieldName, context }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return {
      hasSuggestions: !!data.hasSuggestions,
      suggestions: data.suggestions || [],
      cleanText: data.cleanText,
    };
  } catch (e) {
    console.warn('Writing assist request error, falling back locally:', e);
    return { hasSuggestions: false, suggestions: [] };
  }
}

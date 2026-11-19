export type GameCategory =
  | 'Jogo principal'
  | 'Spin-off'
  | 'Especial';

export type GameStatus =
  | 'unanswered'
  | 'not_played'
  | 'played_unfinished'
  | 'playing'
  | 'completed'
  | 'completed_100';

export interface ZeldaGame {
  id: string;
  number: number;
  category: GameCategory;
  title: string;
  timeline: string;
  /** Plataforma de lançamento original (usada como dado complementar e para contagem única) */
  console: string;
  /** Todas as plataformas em que o título foi lançado ou relançado */
  platforms: string[];
  /** Versões, remakes, remasterizações e edições vinculadas a este título único */
  linkedEditions?: string[];
  releaseYear: number | null;
  coverUrl?: string | null;
  coverSource?: string | null;
  wikiTitle?: string | null;
  isCustom?: boolean;
}

export type LastPlayedOption =
  | ''
  | 'Hoje'
  | 'Esta semana'
  | 'Este mês'
  | 'Nos últimos 6 meses'
  | 'Há mais de 6 meses'
  | 'Há mais de 1 ano'
  | 'Nunca joguei';

export type ReplayHabitOption =
  | ''
  | 'Sim, frequentemente'
  | 'Às vezes'
  | 'Raramente'
  | 'Não costumo';

export interface AdditionalQuestions {
  firstGame: string;
  favoriteGame: string;
  mostUsedConsole: string;
  lastPlayed: LastPlayedOption;
  daysPlayedLast30: number | null;
  replaysGames: ReplayHabitOption;
  favoriteTimeline: string;
}

export type ClassificationTitle =
  | 'Novato de Hyrule'
  | 'Explorador de Hyrule'
  | 'Aventureiro de Hyrule'
  | 'Guardião de Hyrule'
  | 'Lenda de Hyrule';

export interface ZeldaScoreBreakdown {
  totalScore: number;
  mainCoveragePoints: number; // max 35
  mainProgressPoints: number; // max 25
  recentActivityPoints: number; // max 20
  extraCategoriesPoints: number; // max 15
  timelineDiversityPoints: number; // max 5
  mainGamesStartedCount: number;
  mainGamesTotalCount: number; // 21
  exploredBranches: string[];
  exploredExtraGroups: {
    spinoffs: boolean;
    especiais: boolean;
  };
  classification: ClassificationTitle;
  description: string;
}

export interface ConsoleStat {
  console: string;
  played: number;
  completed: number;
  totalInCatalog: number;
}

export interface CategoryStat {
  category: GameCategory;
  label: string;
  played: number;
  completed: number;
  total: number;
  color: string;
}

export interface TimelineStat {
  timeline: string;
  played: number;
  completed: number;
  total: number;
  percentage: number;
}

export interface PlayerMetrics {
  // Experience (all based on unique titles)
  totalPlayed: number;
  mainExplored: number;
  mainCompleted: number;
  mainCompleted100: number;
  totalCompleted: number;
  totalCompleted100: number;
  totalNotStarted: number;
  totalUnanswered: number;
  totalExplicitNotPlayed: number;
  totalPlaying: number;
  totalPlayedUnfinished: number;
  totalEvaluated: number;

  // Exploration
  catalogCompletionPercent: number;
  catalogExploredPercent: number;
  mostExploredTimeline: string;
  leastExploredTimeline: string;
  topConsole: string;
  mostExploredCategory: string;
  uniqueConsolesCount: number;

  // Charts data
  consoleStats: ConsoleStat[];
  categoryStats: CategoryStat[];
  timelineStats: TimelineStat[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  conditionText: string;
  iconKey:
    | 'footprints'
    | 'compass'
    | 'gem'
    | 'shield'
    | 'crown'
    | 'gamepad'
    | 'flame'
    | 'award'
    | 'scroll'
    | 'map';
  unlocked: boolean;
  progressText: string;
}

export interface AttemptSnapshot {
  id: string;
  savedAt: string;
  score: number;
  classification: ClassificationTitle;
  totalPlayed: number;
  totalCompleted: number;
  favoriteGame: string;
  statuses: Record<string, GameStatus>;
  questions: AdditionalQuestions;
}

export type AppView = 'home' | 'quiz' | 'questions' | 'results';

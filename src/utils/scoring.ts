import { MAIN_TIMELINE_BRANCHES } from '../data/zeldaGames';
import {
  Achievement,
  AdditionalQuestions,
  CategoryStat,
  ClassificationTitle,
  ConsoleStat,
  GameCategory,
  GameStatus,
  PlayerMetrics,
  TimelineStat,
  ZeldaGame,
  ZeldaScoreBreakdown,
} from '../types/zelda';

export const STATUS_WEIGHTS: Record<GameStatus, number> = {
  unanswered: 0,
  not_played: 0,
  played_unfinished: 0.25,
  playing: 0.5,
  completed: 0.8,
  completed_100: 1.0,
};

export function isPlayedStatus(status?: GameStatus): boolean {
  return (
    status === 'played_unfinished' ||
    status === 'playing' ||
    status === 'completed' ||
    status === 'completed_100'
  );
}

export function isCompletedStatus(status?: GameStatus): boolean {
  return status === 'completed' || status === 'completed_100';
}

export function getStatusLabel(status?: GameStatus): string {
  switch (status) {
    case 'not_played':
      return 'Não joguei';
    case 'played_unfinished':
      return 'Já joguei, mas não terminei';
    case 'playing':
      return 'Estou jogando atualmente';
    case 'completed':
      return 'Zerei';
    case 'completed_100':
      return 'Completei 100%';
    default:
      return 'Não informado';
  }
}

export function getClassification(score: number): ClassificationTitle {
  if (score <= 20) return 'Novato de Hyrule';
  if (score <= 40) return 'Explorador de Hyrule';
  if (score <= 60) return 'Aventureiro de Hyrule';
  if (score <= 80) return 'Guardião de Hyrule';
  return 'Lenda de Hyrule';
}

export function getClassificationDescription(
  classification: ClassificationTitle,
  mainStarted: number,
  totalCompleted: number,
  favoriteGame: string
): string {
  const favMention = favoriteGame
    ? ` com carinho especial por ${favoriteGame}`
    : '';

  switch (classification) {
    case 'Novato de Hyrule':
      return mainStarted === 0
        ? 'Sua jornada por Hyrule está prestes a começar. Escolha sua primeira espada e dê o primeiro passo pelas terras do reino.'
        : `Você acaba de atravessar os portões de Hyrule${favMention}. Cada masmorra e coração conquistado a partir daqui fará sua lenda crescer.`;
    case 'Explorador de Hyrule':
      return `Você já conhece os caminhos iniciais do reino${favMention} e soma ${totalCompleted} ${
        totalCompleted === 1 ? 'título único concluído' : 'títulos únicos concluídos'
      }. Há muitos santuários e eras ainda esperando sua visita.`;
    case 'Aventureiro de Hyrule':
      return `Com experiência sólida entre eras${favMention}, você já domina enigmas clássicos e acumula ${totalCompleted} ${
        totalCompleted === 1 ? 'aventura concluída' : 'aventuras concluídas'
      } na bagagem.`;
    case 'Guardião de Hyrule':
      return `Veterano respeitado pelos sábios${favMention}! Você atravessou múltiplas linhas do tempo e provou seu valor em boa parte dos títulos centrais da saga.`;
    case 'Lenda de Hyrule':
      return `Seu nome ecoa pela Triforce${favMention}! Com domínio profundo dos jogos principais, categorias extras e atividade constante, você alcançou o patamar lendário.`;
  }
}

export function getRecentActivityPoints(daysPlayed: number | null): number {
  if (daysPlayed === null || daysPlayed <= 0) return 0;
  if (daysPlayed <= 2) return 5;
  if (daysPlayed <= 5) return 10;
  if (daysPlayed <= 10) return 15;
  return 20;
}

export function calculateZeldaScore(
  games: ZeldaGame[],
  statuses: Record<string, GameStatus>,
  questions: AdditionalQuestions
): ZeldaScoreBreakdown {
  // Base 21 main unique games
  const mainGames = games.filter((g) => g.category === 'Jogo principal');
  const mainDenominator = 21;
  const canonicalMainGames = mainGames.slice(0, mainDenominator);

  let mainStartedCount = 0;
  let mainWeightSum = 0;

  for (const game of canonicalMainGames) {
    const st = statuses[game.id] ?? 'unanswered';
    if (isPlayedStatus(st)) {
      mainStartedCount += 1;
    }
    mainWeightSum += STATUS_WEIGHTS[st] ?? 0;
  }

  // 1. Cobertura dos 21 jogos principais — 35 pontos
  const mainCoveragePoints = (mainStartedCount / mainDenominator) * 35;

  // 2. Progresso e conclusão dos jogos principais — 25 pontos
  const mainProgressPoints = (mainWeightSum / mainDenominator) * 25;

  // 3. Atividade recente nos últimos 30 dias — 20 pontos
  const recentActivityPoints = getRecentActivityPoints(questions.daysPlayedLast30);

  // 4. Exploração de categorias extras — 15 pontos (7.5 pts Spin-offs + 7.5 pts Especiais)
  const hasSpinoff = games.some(
    (g) => g.category === 'Spin-off' && isPlayedStatus(statuses[g.id])
  );
  const hasEspecial = games.some(
    (g) => g.category === 'Especial' && isPlayedStatus(statuses[g.id])
  );
  const extraCategoriesPoints = (hasSpinoff ? 7.5 : 0) + (hasEspecial ? 7.5 : 0);

  // 5. Diversidade das linhas do tempo — 5 pontos divididos pelas 4 ramificações
  const exploredBranches = MAIN_TIMELINE_BRANCHES.filter((branch) =>
    games.some((g) => g.timeline === branch && isPlayedStatus(statuses[g.id]))
  );
  const timelineDiversityPoints = (exploredBranches.length / 4) * 5;

  const rawTotal =
    mainCoveragePoints +
    mainProgressPoints +
    recentActivityPoints +
    extraCategoriesPoints +
    timelineDiversityPoints;

  const totalScore = Math.round(Math.max(0, Math.min(100, rawTotal)));
  const classification = getClassification(totalScore);

  const totalCompleted = games.filter((g) => isCompletedStatus(statuses[g.id])).length;
  const description = getClassificationDescription(
    classification,
    mainStartedCount,
    totalCompleted,
    questions.favoriteGame
  );

  return {
    totalScore,
    mainCoveragePoints: Number(mainCoveragePoints.toFixed(1)),
    mainProgressPoints: Number(mainProgressPoints.toFixed(1)),
    recentActivityPoints,
    extraCategoriesPoints,
    timelineDiversityPoints: Number(timelineDiversityPoints.toFixed(2)),
    mainGamesStartedCount: mainStartedCount,
    mainGamesTotalCount: mainDenominator,
    exploredBranches: [...exploredBranches],
    exploredExtraGroups: {
      spinoffs: hasSpinoff,
      especiais: hasEspecial,
    },
    classification,
    description,
  };
}

export function calculatePlayerMetrics(
  games: ZeldaGame[],
  statuses: Record<string, GameStatus>
): PlayerMetrics {
  let totalPlayed = 0;
  let mainExplored = 0;
  let mainCompleted = 0;
  let mainCompleted100 = 0;
  let totalCompleted = 0;
  let totalCompleted100 = 0;
  let totalNotStarted = 0;
  let totalUnanswered = 0;
  let totalExplicitNotPlayed = 0;
  let totalPlaying = 0;
  let totalPlayedUnfinished = 0;
  let totalEvaluated = 0;

  const consoleMap = new Map<string, ConsoleStat>();
  const timelineMap = new Map<string, TimelineStat>();

  const categoryConfigs: { category: GameCategory; label: string; color: string }[] = [
    { category: 'Jogo principal', label: 'Jogos principais', color: '#1B4332' },
    { category: 'Spin-off', label: 'Spin-offs', color: '#3E6B52' },
    { category: 'Especial', label: 'Especiais', color: '#C59B38' },
  ];

  const categoryMap = new Map<GameCategory, CategoryStat>();
  for (const cfg of categoryConfigs) {
    categoryMap.set(cfg.category, {
      category: cfg.category,
      label: cfg.label,
      played: 0,
      completed: 0,
      total: 0,
      color: cfg.color,
    });
  }

  for (const game of games) {
    const st = statuses[game.id] ?? 'unanswered';
    const played = isPlayedStatus(st);
    const completed = isCompletedStatus(st);

    if (st !== 'unanswered') totalEvaluated += 1;
    if (st === 'unanswered') totalUnanswered += 1;
    if (st === 'not_played') totalExplicitNotPlayed += 1;
    if (!played) totalNotStarted += 1;
    if (st === 'playing') totalPlaying += 1;
    if (st === 'played_unfinished') totalPlayedUnfinished += 1;
    if (played) totalPlayed += 1;
    if (completed) totalCompleted += 1;
    if (st === 'completed_100') totalCompleted100 += 1;

    if (game.category === 'Jogo principal') {
      if (played) mainExplored += 1;
      if (completed) mainCompleted += 1;
      if (st === 'completed_100') mainCompleted100 += 1;
    }

    // Count each unique game ONCE under its original launch console (never double counting)
    const existingConsole = consoleMap.get(game.console) ?? {
      console: game.console,
      played: 0,
      completed: 0,
      totalInCatalog: 0,
    };
    existingConsole.totalInCatalog += 1;
    if (played) existingConsole.played += 1;
    if (completed) existingConsole.completed += 1;
    consoleMap.set(game.console, existingConsole);

    // Category tracking
    const catStat = categoryMap.get(game.category);
    if (catStat) {
      catStat.total += 1;
      if (played) catStat.played += 1;
      if (completed) catStat.completed += 1;
    }

    // Timeline tracking
    const existingTimeline = timelineMap.get(game.timeline) ?? {
      timeline: game.timeline,
      played: 0,
      completed: 0,
      total: 0,
      percentage: 0,
    };
    existingTimeline.total += 1;
    if (played) existingTimeline.played += 1;
    if (completed) existingTimeline.completed += 1;
    timelineMap.set(game.timeline, existingTimeline);
  }

  const timelineStats: TimelineStat[] = Array.from(timelineMap.values()).map((t) => ({
    ...t,
    percentage: t.total > 0 ? Math.round((t.played / t.total) * 100) : 0,
  }));

  const consoleStats = Array.from(consoleMap.values()).sort(
    (a, b) => b.played - a.played || b.completed - a.completed || b.totalInCatalog - a.totalInCatalog
  );

  const categoryStats = Array.from(categoryMap.values());

  const playedConsoles = consoleStats.filter((c) => c.played > 0);
  const uniqueConsolesCount = playedConsoles.length;
  const topConsole =
    playedConsoles.length > 0
      ? `${playedConsoles[0].console} (${playedConsoles[0].played})`
      : 'Não informado';

  const playedCategories = [...categoryStats]
    .filter((c) => c.played > 0)
    .sort((a, b) => b.played - a.played);
  const mostExploredCategory =
    playedCategories.length > 0
      ? `${playedCategories[0].label} (${playedCategories[0].played})`
      : 'Não informado';

  let mostExploredTimeline = 'Não informado';
  let leastExploredTimeline = 'Não informado';

  if (totalPlayed > 0 && timelineStats.length > 0) {
    const sortedByPlayedDesc = [...timelineStats].sort(
      (a, b) => b.played - a.played || b.percentage - a.percentage
    );
    mostExploredTimeline = `${sortedByPlayedDesc[0].timeline} (${sortedByPlayedDesc[0].played}/${sortedByPlayedDesc[0].total})`;

    const mainTimelines = timelineStats.filter((t) =>
      ['Antes da divisão', 'Herói Caído', 'Herói Criança', 'Herói Adulto', 'Era Selvagem'].includes(
        t.timeline
      )
    );
    const pool = mainTimelines.length > 0 ? mainTimelines : timelineStats;
    const sortedAsc = [...pool].sort(
      (a, b) => a.played - b.played || a.percentage - b.percentage
    );
    leastExploredTimeline = `${sortedAsc[0].timeline} (${sortedAsc[0].played}/${sortedAsc[0].total})`;
  }

  const totalCatalog = games.length || 1;
  const catalogCompletionPercent = Math.round((totalCompleted / totalCatalog) * 100);
  const catalogExploredPercent = Math.round((totalPlayed / totalCatalog) * 100);

  return {
    totalPlayed,
    mainExplored,
    mainCompleted,
    mainCompleted100,
    totalCompleted,
    totalCompleted100,
    totalNotStarted,
    totalUnanswered,
    totalExplicitNotPlayed,
    totalPlaying,
    totalPlayedUnfinished,
    totalEvaluated,
    catalogCompletionPercent,
    catalogExploredPercent,
    mostExploredTimeline,
    leastExploredTimeline,
    topConsole,
    mostExploredCategory,
    uniqueConsolesCount,
    consoleStats,
    categoryStats,
    timelineStats,
  };
}

export function calculateAchievements(
  games: ZeldaGame[],
  statuses: Record<string, GameStatus>,
  questions: AdditionalQuestions,
  metrics: PlayerMetrics,
  score: ZeldaScoreBreakdown
): Achievement[] {
  const mainGames = games.filter((g) => g.category === 'Jogo principal');
  const mainTotal = Math.min(21, mainGames.length) || 21;
  const specialPlayedCount = games.filter(
    (g) => g.category === 'Especial' && isPlayedStatus(statuses[g.id])
  ).length;
  const categoriesPlayedCount = [
    metrics.mainExplored > 0,
    score.exploredExtraGroups.spinoffs,
    score.exploredExtraGroups.especiais,
  ].filter(Boolean).length;

  const days = questions.daysPlayedLast30 ?? 0;

  return [
    {
      id: 'first_step',
      name: 'Primeiro Passo em Hyrule',
      description: 'Deu início à sua jornada jogando seu primeiro título único da franquia.',
      conditionText: 'Jogar pelo menos 1 título do catálogo',
      iconKey: 'footprints',
      unlocked: metrics.totalPlayed >= 1,
      progressText: `${Math.min(metrics.totalPlayed, 1)} / 1 jogo`,
    },
    {
      id: 'time_explorer',
      name: 'Explorador Temporal',
      description: 'Visitou as quatro grandes ramificações da cronologia de Hyrule.',
      conditionText: 'Explorar Herói Caído, Herói Criança, Herói Adulto e Era Selvagem',
      iconKey: 'compass',
      unlocked: score.exploredBranches.length === 4,
      progressText: `${score.exploredBranches.length} / 4 eras`,
    },
    {
      id: 'triforce_collector',
      name: 'Colecionador da Triforce',
      description: 'Aventurou-se por todas as 3 categorias do catálogo único de Zelda.',
      conditionText: 'Jogar títulos em Principais, Spin-offs e Especiais',
      iconKey: 'gem',
      unlocked: categoriesPlayedCount === 3,
      progressText: `${categoriesPlayedCount} / 3 categorias`,
    },
    {
      id: 'complete_hero',
      name: 'Herói Completo',
      description: 'Superou dez capítulos centrais da lenda até os créditos finais.',
      conditionText: 'Concluir (Zerei ou 100%) 10 jogos principais',
      iconKey: 'shield',
      unlocked: metrics.mainCompleted >= 10,
      progressText: `${Math.min(metrics.mainCompleted, 10)} / 10 concluídos`,
    },
    {
      id: 'hyrule_legend',
      name: 'Lenda de Hyrule',
      description: 'Completou todos os 21 jogos principais da linha oficial.',
      conditionText: 'Concluir todos os 21 jogos principais',
      iconKey: 'crown',
      unlocked: metrics.mainCompleted >= mainTotal,
      progressText: `${metrics.mainCompleted} / ${mainTotal} principais`,
    },
    {
      id: 'console_master',
      name: 'Mestre das Gerações',
      description: 'Explorou jogos originários de cinco gerações ou plataformas diferentes.',
      conditionText: 'Jogar títulos de pelo menos 5 gerações/plataformas originais',
      iconKey: 'gamepad',
      unlocked: metrics.uniqueConsolesCount >= 5,
      progressText: `${Math.min(metrics.uniqueConsolesCount, 5)} / 5 plataformas`,
    },
    {
      id: 'tireless_adventurer',
      name: 'Aventureiro Incansável',
      description: 'Manteve o espírito de exploração vivo com alta frequência recente.',
      conditionText: 'Jogar Zelda em 11 ou mais dias nos últimos 30 dias',
      iconKey: 'flame',
      unlocked: days >= 11,
      progressText:
        questions.daysPlayedLast30 === null
          ? 'Não informado'
          : `${Math.min(days, 11)} / 11 dias`,
    },
    {
      id: 'perfectionist',
      name: 'Perfeccionista',
      description: 'Não deixou nenhum Korok, peça de coração ou segredo para trás.',
      conditionText: 'Completar pelo menos 1 jogo em 100%',
      iconKey: 'award',
      unlocked: metrics.totalCompleted100 >= 1,
      progressText: `${Math.min(metrics.totalCompleted100, 1)} / 1 em 100%`,
    },
    {
      id: 'relic_guardian',
      name: 'Guardião das Relíquias',
      description: 'Explorou raridades e edições históricas fora do caminho comum.',
      conditionText: 'Jogar pelo menos 3 títulos da categoria Especial',
      iconKey: 'scroll',
      unlocked: specialPlayedCount >= 3,
      progressText: `${Math.min(specialPlayedCount, 3)} / 3 especiais`,
    },
    {
      id: 'era_traveler',
      name: 'Viajante das Eras',
      description: 'Construiu um acervo respeitável explorando quinze títulos únicos da saga.',
      conditionText: 'Explorar pelo menos 15 títulos únicos do catálogo',
      iconKey: 'map',
      unlocked: metrics.totalPlayed >= 15,
      progressText: `${Math.min(metrics.totalPlayed, 15)} / 15 jogos`,
    },
  ];
}

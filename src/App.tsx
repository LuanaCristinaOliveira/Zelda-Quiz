import { useEffect, useMemo, useState } from 'react';
import {
  INITIAL_ZELDA_GAMES,
  CATEGORY_SECTIONS,
  LEGACY_DUPLICATE_ID_MAP,
} from './data/zeldaGames';
import {
  AdditionalQuestions,
  AppView,
  AttemptSnapshot,
  GameStatus,
  ZeldaGame,
} from './types/zelda';
import {
  STATUS_WEIGHTS,
  calculateAchievements,
  calculatePlayerMetrics,
  calculateZeldaScore,
} from './utils/scoring';
import { exportProfileToCsv } from './utils/exportCsv';
import { TriforceEmblem } from './components/HyruleMark';
import { HomeView } from './components/HomeView';
import { QuizCatalogView } from './components/QuizCatalogView';
import { AdditionalQuestionsView } from './components/AdditionalQuestionsView';
import { ResultsDashboardView } from './components/ResultsDashboardView';
import { GameEditModal } from './components/GameEditModal';

const STORAGE_KEYS = {
  games: 'zgp_games_v2',
  statuses: 'zgp_statuses_v2',
  legacyGames: 'zgp_games_v1',
  legacyStatuses: 'zgp_statuses_v1',
  questions: 'zgp_questions_v1',
  history: 'zgp_history_v1',
  playerName: 'zgp_player_name_v1',
  customPhrase: 'zgp_custom_phrase_v1',
  view: 'zgp_active_view_v1',
};

const EMPTY_QUESTIONS: AdditionalQuestions = {
  firstGame: '',
  favoriteGame: '',
  mostUsedConsole: '',
  lastPlayed: '',
  daysPlayedLast30: null,
  replaysGames: '',
  favoriteTimeline: '',
};

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function loadInitialUniqueGames(): ZeldaGame[] {
  const v2 = readStorage<ZeldaGame[] | null>(STORAGE_KEYS.games, null);
  if (v2 && Array.isArray(v2) && v2.length > 0) {
    return v2;
  }
  // Preserve any custom user-added games from v1 while replacing canonical entries with unique v2 catalog
  const legacyGames = readStorage<ZeldaGame[]>(STORAGE_KEYS.legacyGames, []);
  const customOnly = legacyGames.filter((g) => g.isCustom);
  return [...INITIAL_ZELDA_GAMES, ...customOnly];
}

function loadInitialUniqueStatuses(validIds: Set<string>): Record<string, GameStatus> {
  const v2 = readStorage<Record<string, GameStatus> | null>(STORAGE_KEYS.statuses, null);
  if (v2 && Object.keys(v2).length > 0) {
    return v2;
  }

  // Migrate legacy v1 statuses (merging remakes/ports into the highest progress status on the parent unique title)
  const legacy = readStorage<Record<string, GameStatus>>(STORAGE_KEYS.legacyStatuses, {});
  const migrated: Record<string, GameStatus> = {};

  for (const [oldId, status] of Object.entries(legacy)) {
    const targetId = LEGACY_DUPLICATE_ID_MAP[oldId] ?? oldId;
    if (!validIds.has(targetId)) continue;

    const current = migrated[targetId];
    if (!current || STATUS_WEIGHTS[status] > STATUS_WEIGHTS[current]) {
      migrated[targetId] = status;
    } else if (current === 'unanswered' && status === 'not_played') {
      migrated[targetId] = status;
    }
  }

  return migrated;
}

export default function App() {
  const [games, setGames] = useState<ZeldaGame[]>(() => loadInitialUniqueGames());
  const [statuses, setStatuses] = useState<Record<string, GameStatus>>(() => {
    const initialGames = loadInitialUniqueGames();
    return loadInitialUniqueStatuses(new Set(initialGames.map((g) => g.id)));
  });
  const [questions, setQuestions] = useState<AdditionalQuestions>(() =>
    readStorage<AdditionalQuestions>(STORAGE_KEYS.questions, EMPTY_QUESTIONS)
  );
  const [attemptHistory, setAttemptHistory] = useState<AttemptSnapshot[]>(() =>
    readStorage<AttemptSnapshot[]>(STORAGE_KEYS.history, [])
  );
  const [playerName, setPlayerName] = useState<string>(() =>
    readStorage<string>(STORAGE_KEYS.playerName, '')
  );
  const [customPhrase, setCustomPhrase] = useState<string>(() =>
    readStorage<string>(STORAGE_KEYS.customPhrase, '')
  );
  const [activeView, setActiveView] = useState<AppView>(() =>
    readStorage<AppView>(STORAGE_KEYS.view, 'home')
  );

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [gameToEdit, setGameToEdit] = useState<ZeldaGame | null>(null);
  const [isSyncingCovers, setIsSyncingCovers] = useState(false);

  // Auto-save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.games, JSON.stringify(games));
    } catch {
      // Ignore storage quota errors
    }
  }, [games]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.statuses, JSON.stringify(statuses));
    } catch {
      // Ignore
    }
  }, [statuses]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.questions, JSON.stringify(questions));
    } catch {
      // Ignore
    }
  }, [questions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(attemptHistory));
    } catch {
      // Ignore
    }
  }, [attemptHistory]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.playerName, JSON.stringify(playerName));
    } catch {
      // Ignore
    }
  }, [playerName]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.customPhrase, JSON.stringify(customPhrase));
    } catch {
      // Ignore
    }
  }, [customPhrase]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.view, JSON.stringify(activeView));
    } catch {
      // Ignore
    }
  }, [activeView]);

  // Dynamic Calculations (strictly on unique titles)
  const score = useMemo(
    () => calculateZeldaScore(games, statuses, questions),
    [games, statuses, questions]
  );

  const metrics = useMemo(
    () => calculatePlayerMetrics(games, statuses),
    [games, statuses]
  );

  const achievements = useMemo(
    () => calculateAchievements(games, statuses, questions, metrics, score),
    [games, statuses, questions, metrics, score]
  );

  const hasStarted = metrics.totalEvaluated > 0 || questions.daysPlayedLast30 !== null;

  const existingConsoles = useMemo(
    () => Array.from(new Set(games.flatMap((g) => (g.platforms?.length ? g.platforms : [g.console])))),
    [games]
  );
  const existingTimelines = useMemo(
    () => Array.from(new Set(games.map((g) => g.timeline))),
    [games]
  );

  const navigateTo = (view: AppView) => {
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStatusChange = (gameId: string, nextStatus: GameStatus) => {
    setStatuses((prev) => ({
      ...prev,
      [gameId]: nextStatus,
    }));
  };

  const handleSaveGame = (saved: ZeldaGame) => {
    setGames((prev) => {
      const exists = prev.some((g) => g.id === saved.id);
      if (exists) {
        return prev.map((g) => (g.id === saved.id ? saved : g));
      }
      return [...prev, saved];
    });
  };

  const handleSyncWikiCovers = async (): Promise<number> => {
    setIsSyncingCovers(true);
    let updatedCount = 0;
    const updates = new Map<string, { url: string; source: string }>();

    const candidates = games.filter((g) => g.wikiTitle && !g.coverUrl);
    for (const game of candidates) {
      if (!game.wikiTitle) continue;
      try {
        const res = await fetch(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${game.wikiTitle}`
        );
        if (!res.ok) continue;
        const data = (await res.json()) as {
          title?: string;
          thumbnail?: { source?: string };
        };
        const thumb = data.thumbnail?.source;
        const canonical = game.wikiTitle.replace(/_/g, ' ').replace(/%27/g, "'");
        if (
          thumb &&
          data.title &&
          (data.title.toLowerCase() === canonical.toLowerCase() ||
            data.title.toLowerCase().includes(game.title.toLowerCase().slice(0, 18)))
        ) {
          const cleanUrl = thumb.split('?')[0];
          updates.set(game.id, {
            url: cleanUrl,
            source: `Wikipedia (en.wikipedia.org) — Capa oficial`,
          });
          updatedCount += 1;
        }
      } catch {
        // Ignore individual network failures cleanly
      }
      await new Promise((r) => setTimeout(r, 220));
    }

    if (updates.size > 0) {
      setGames((prev) =>
        prev.map((g) => {
          const match = updates.get(g.id);
          if (!match) return g;
          return {
            ...g,
            coverUrl: match.url,
            coverSource: match.source,
          };
        })
      );
    }

    setIsSyncingCovers(false);
    return updatedCount;
  };

  const handleRedoSaveHistoryAndReset = () => {
    const snapshot: AttemptSnapshot = {
      id: `attempt-${Date.now()}`,
      savedAt: new Date().toISOString(),
      score: score.totalScore,
      classification: score.classification,
      totalPlayed: metrics.totalPlayed,
      totalCompleted: metrics.totalCompleted,
      favoriteGame: questions.favoriteGame,
      statuses: { ...statuses },
      questions: { ...questions },
    };
    setAttemptHistory((prev) => [snapshot, ...prev]);
    setStatuses({});
    setQuestions(EMPTY_QUESTIONS);
    navigateTo('quiz');
  };

  const handleResetAll = (resetCustomGames: boolean) => {
    setStatuses({});
    setQuestions(EMPTY_QUESTIONS);
    if (resetCustomGames) {
      setGames(INITIAL_ZELDA_GAMES);
    }
    navigateTo('home');
  };

  const handleRestoreHistoryItem = (snapshot: AttemptSnapshot) => {
    const validIds = new Set(games.map((g) => g.id));
    const cleaned: Record<string, GameStatus> = {};
    for (const [id, st] of Object.entries(snapshot.statuses)) {
      const targetId = LEGACY_DUPLICATE_ID_MAP[id] ?? id;
      if (!validIds.has(targetId)) continue;
      const cur = cleaned[targetId];
      if (!cur || STATUS_WEIGHTS[st] > STATUS_WEIGHTS[cur]) {
        cleaned[targetId] = st;
      }
    }
    setStatuses(cleaned);
    setQuestions(snapshot.questions);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteHistoryItem = (id: string) => {
    setAttemptHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const handleExportCsv = () => {
    exportProfileToCsv(games, statuses, questions, score, metrics, playerName);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* 3-Zone Top Navigation Bar */}
      <header className="border-b border-[#DED7C4] bg-[#FBF9F3]/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark (single line) */}
          <button
            type="button"
            onClick={() => navigateTo('home')}
            className="inline-flex items-center gap-2.5 text-left cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B4332]"
          >
            <TriforceEmblem className="w-5 h-5 text-[#C59B38]" />
            <span className="font-display text-base sm:text-lg font-bold tracking-tight text-[#142D21]">
              Zelda Gamer Profile
            </span>
          </button>

          {/* Zone 2: 4 Single-line Text Navigation Links */}
          <nav
            aria-label="Navegação principal"
            className="hidden md:flex items-center gap-6 text-sm font-medium"
          >
            <button
              type="button"
              onClick={() => navigateTo('home')}
              className={`py-1 border-b-2 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                activeView === 'home'
                  ? 'border-[#1B4332] text-[#142D21] font-semibold'
                  : 'border-transparent text-[#5A574C] hover:text-[#142D21]'
              }`}
            >
              Início
            </button>
            <button
              type="button"
              onClick={() => navigateTo('quiz')}
              className={`py-1 border-b-2 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                activeView === 'quiz'
                  ? 'border-[#1B4332] text-[#142D21] font-semibold'
                  : 'border-transparent text-[#5A574C] hover:text-[#142D21]'
              }`}
            >
              Catálogo
            </button>
            <button
              type="button"
              onClick={() => navigateTo('questions')}
              className={`py-1 border-b-2 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                activeView === 'questions'
                  ? 'border-[#1B4332] text-[#142D21] font-semibold'
                  : 'border-transparent text-[#5A574C] hover:text-[#142D21]'
              }`}
            >
              Perguntas
            </button>
            <button
              type="button"
              onClick={() => navigateTo('results')}
              className={`py-1 border-b-2 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                activeView === 'results'
                  ? 'border-[#1B4332] text-[#142D21] font-semibold'
                  : 'border-transparent text-[#5A574C] hover:text-[#142D21]'
              }`}
            >
              Meu Perfil
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action Button */}
          <div className="shrink-0">
            {activeView === 'results' ? (
              <button
                type="button"
                onClick={handleExportCsv}
                className="rounded-lg bg-[#1B4332] px-4 py-2 text-xs font-semibold text-[#F6F3EA] hover:bg-[#143326] transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                Exportar CSV
              </button>
            ) : activeView === 'home' ? (
              <button
                type="button"
                onClick={() => navigateTo('quiz')}
                className="rounded-lg bg-[#1B4332] px-4 py-2 text-xs font-semibold text-[#F6F3EA] hover:bg-[#143326] transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                {hasStarted ? 'Continuar Quiz' : 'Começar Quiz'}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigateTo('results')}
                className="rounded-lg bg-[#1B4332] px-4 py-2 text-xs font-semibold text-[#F6F3EA] hover:bg-[#143326] transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                Ver Resultado
              </button>
            )}
          </div>
        </div>

        {/* Compact Mobile Nav Strip */}
        <nav
          aria-label="Navegação móvel"
          className="flex md:hidden items-center justify-around border-t border-[#EAE4D3] px-2 py-2 text-xs font-medium"
        >
          {(
            [
              ['home', 'Início'],
              ['quiz', 'Catálogo'],
              ['questions', 'Perguntas'],
              ['results', 'Meu Perfil'],
            ] as [AppView, string][]
          ).map(([viewKey, label]) => (
            <button
              key={viewKey}
              type="button"
              onClick={() => navigateTo(viewKey)}
              className={`rounded-md px-3 py-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                activeView === viewKey
                  ? 'bg-[#1B4332] text-[#F6F3EA]'
                  : 'text-[#5A574C] hover:text-[#142D21]'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1">
        {activeView === 'home' && (
          <HomeView
            totalGames={games.length}
            categoriesCount={CATEGORY_SECTIONS.length}
            evaluatedCount={metrics.totalEvaluated}
            hasStarted={hasStarted}
            onStartQuiz={() => navigateTo('quiz')}
            onGoToResults={() => navigateTo('results')}
          />
        )}

        {activeView === 'quiz' && (
          <QuizCatalogView
            games={games}
            statuses={statuses}
            liveScore={score.totalScore}
            evaluatedCount={metrics.totalEvaluated}
            mainStartedCount={score.mainGamesStartedCount}
            onStatusChange={handleStatusChange}
            onOpenAddGame={() => {
              setGameToEdit(null);
              setEditModalOpen(true);
            }}
            onOpenEditGame={(game) => {
              setGameToEdit(game);
              setEditModalOpen(true);
            }}
            onSyncWikiCovers={handleSyncWikiCovers}
            isSyncingCovers={isSyncingCovers}
            onBackHome={() => navigateTo('home')}
            onNextStep={() => navigateTo('questions')}
          />
        )}

        {activeView === 'questions' && (
          <AdditionalQuestionsView
            games={games}
            questions={questions}
            onChange={setQuestions}
            onBackToCatalog={() => navigateTo('quiz')}
            onFinishQuiz={() => navigateTo('results')}
          />
        )}

        {activeView === 'results' && (
          <ResultsDashboardView
            games={games}
            statuses={statuses}
            questions={questions}
            score={score}
            metrics={metrics}
            achievements={achievements}
            attemptHistory={attemptHistory}
            playerName={playerName}
            customPhrase={customPhrase}
            onPlayerNameChange={setPlayerName}
            onPhraseChange={setCustomPhrase}
            onExportCsv={handleExportCsv}
            onEditCatalog={() => navigateTo('quiz')}
            onEditQuestions={() => navigateTo('questions')}
            onRedoSaveHistoryAndReset={handleRedoSaveHistoryAndReset}
            onResetAll={handleResetAll}
            onDeleteHistoryItem={handleDeleteHistoryItem}
            onRestoreHistoryItem={handleRestoreHistoryItem}
          />
        )}
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="border-t border-[#DED7C4] bg-[#FBF9F3] py-6 mt-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6B6759]">
          <p>
            Zelda Gamer Profile · Catálogo unificado por título único da franquia The Legend of Zelda.
          </p>
          <p>
            Dados salvos localmente no seu navegador · Capas atribuídas às respectivas fontes oficiais.
          </p>
        </div>
      </footer>

      {/* Add / Edit Game Modal */}
      <GameEditModal
        isOpen={editModalOpen}
        gameToEdit={gameToEdit}
        existingConsoles={existingConsoles}
        existingTimelines={existingTimelines}
        nextNumber={games.length + 1}
        onClose={() => setEditModalOpen(false)}
        onSave={handleSaveGame}
      />
    </div>
  );
}

import React, { useState } from 'react';
import {
  FileSpreadsheet,
  RotateCcw,
  RefreshCw,
  Pencil,
  Footprints,
  Compass,
  Gem,
  Shield,
  Crown,
  Gamepad2,
  Flame,
  Award,
  ScrollText,
  Map as MapIcon,
  Lock,
  CheckCircle2,
  Trash2,
  History,
  X,
} from 'lucide-react';
import {
  Achievement,
  AdditionalQuestions,
  AttemptSnapshot,
  GameStatus,
  PlayerMetrics,
  ZeldaGame,
  ZeldaScoreBreakdown,
} from '../types/zelda';
import { ResultsCharts } from './ResultsCharts';
import { ShareCardSection } from './ShareCardSection';
import { TriforceEmblem } from './HyruleMark';

interface ResultsDashboardViewProps {
  games: ZeldaGame[];
  statuses: Record<string, GameStatus>;
  questions: AdditionalQuestions;
  score: ZeldaScoreBreakdown;
  metrics: PlayerMetrics;
  achievements: Achievement[];
  attemptHistory: AttemptSnapshot[];
  playerName: string;
  customPhrase: string;
  onPlayerNameChange: (name: string) => void;
  onPhraseChange: (phrase: string) => void;
  onExportCsv: () => void;
  onEditCatalog: () => void;
  onEditQuestions: () => void;
  onRedoSaveHistoryAndReset: () => void;
  onResetAll: (resetCustomGames: boolean) => void;
  onDeleteHistoryItem: (id: string) => void;
  onRestoreHistoryItem: (snapshot: AttemptSnapshot) => void;
}

function AchievementIcon({
  iconKey,
  className = 'w-5 h-5',
}: {
  iconKey: Achievement['iconKey'];
  className?: string;
}) {
  switch (iconKey) {
    case 'footprints':
      return <Footprints className={className} />;
    case 'compass':
      return <Compass className={className} />;
    case 'gem':
      return <Gem className={className} />;
    case 'shield':
      return <Shield className={className} />;
    case 'crown':
      return <Crown className={className} />;
    case 'gamepad':
      return <Gamepad2 className={className} />;
    case 'flame':
      return <Flame className={className} />;
    case 'award':
      return <Award className={className} />;
    case 'scroll':
      return <ScrollText className={className} />;
    case 'map':
      return <MapIcon className={className} />;
  }
}

export const ResultsDashboardView: React.FC<ResultsDashboardViewProps> = ({
  games,
  statuses,
  questions,
  score,
  metrics,
  achievements,
  attemptHistory,
  playerName,
  customPhrase,
  onPlayerNameChange,
  onPhraseChange,
  onExportCsv,
  onEditCatalog,
  onEditQuestions,
  onRedoSaveHistoryAndReset,
  onResetAll,
  onDeleteHistoryItem,
  onRestoreHistoryItem,
}) => {
  const [redoModalOpen, setRedoModalOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [alsoResetCustomGames, setAlsoResetCustomGames] = useState(false);

  const ringRadius = 74;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset =
    ringCircumference - (score.totalScore / 100) * ringCircumference;

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Score Banner */}
      <section className="rounded-2xl border border-[#C59B38]/40 bg-gradient-to-br from-[#122A1F] via-[#173828] to-[#0E2018] text-[#F6F3EA] p-6 sm:p-10 shadow-md">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Animated Circular Progress Ring */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C59B38] mb-3">
              SEU ZELDA SCORE
            </p>
            <div className="relative w-48 h-48">
              <svg viewBox="0 0 180 180" className="w-full h-full -rotate-90">
                <circle
                  cx="90"
                  cy="90"
                  r={ringRadius}
                  fill="none"
                  stroke="rgba(246, 243, 234, 0.14)"
                  strokeWidth="12"
                />
                <circle
                  cx="90"
                  cy="90"
                  r={ringRadius}
                  fill="none"
                  stroke="#C59B38"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={ringOffset}
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-mono-tabular text-5xl font-bold text-[#F6F3EA]">
                  {score.totalScore}
                </span>
                <span className="font-mono-tabular text-sm text-[#C8C2B0]">
                  / 100
                </span>
              </div>
            </div>
          </div>

          {/* Classification & Score Breakdown */}
          <div className="lg:col-span-8 space-y-5">
            <div>
              <div className="flex items-center gap-2.5 text-[#E6C667]">
                <TriforceEmblem className="w-5 h-5" />
                <span className="text-xs font-semibold uppercase tracking-widest">
                  Classificação do Jogador
                </span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#F6F3EA] mt-1">
                {score.classification}
              </h1>
              <p className="mt-2.5 text-sm sm:text-base leading-relaxed text-[#DDD8C8] max-w-2xl">
                {score.description}
              </p>
            </div>

            {/* 5-Criteria Score Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2">
              <div className="rounded-lg border border-white/15 bg-white/5 p-3">
                <p className="text-[11px] text-[#C8C2B0]">Principais (21)</p>
                <p className="font-mono-tabular text-lg font-semibold text-[#F6F3EA] mt-0.5">
                  {score.mainCoveragePoints}
                  <span className="text-xs text-[#A59F8E]"> / 35</span>
                </p>
              </div>
              <div className="rounded-lg border border-white/15 bg-white/5 p-3">
                <p className="text-[11px] text-[#C8C2B0]">Progresso</p>
                <p className="font-mono-tabular text-lg font-semibold text-[#F6F3EA] mt-0.5">
                  {score.mainProgressPoints}
                  <span className="text-xs text-[#A59F8E]"> / 25</span>
                </p>
              </div>
              <div className="rounded-lg border border-white/15 bg-white/5 p-3">
                <p className="text-[11px] text-[#C8C2B0]">Últimos 30 dias</p>
                <p className="font-mono-tabular text-lg font-semibold text-[#F6F3EA] mt-0.5">
                  {score.recentActivityPoints}
                  <span className="text-xs text-[#A59F8E]"> / 20</span>
                </p>
              </div>
              <div className="rounded-lg border border-white/15 bg-white/5 p-3">
                <p className="text-[11px] text-[#C8C2B0]">Spin-offs / Especiais</p>
                <p className="font-mono-tabular text-lg font-semibold text-[#F6F3EA] mt-0.5">
                  {score.extraCategoriesPoints}
                  <span className="text-xs text-[#A59F8E]"> / 15</span>
                </p>
              </div>
              <div className="rounded-lg border border-white/15 bg-white/5 p-3 col-span-2 sm:col-span-1">
                <p className="text-[11px] text-[#C8C2B0]">Linhas do tempo</p>
                <p className="font-mono-tabular text-lg font-semibold text-[#F6F3EA] mt-0.5">
                  {score.timelineDiversityPoints}
                  <span className="text-xs text-[#A59F8E]"> / 5</span>
                </p>
              </div>
            </div>

            {/* Action Toolbar */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <a
                href="#share-card-section"
                className="inline-flex items-center gap-2 rounded-lg bg-[#C59B38] px-4 py-2 text-xs sm:text-sm font-semibold text-[#11241B] hover:bg-[#D4AB46] transition-colors whitespace-nowrap shrink-0"
              >
                <span>Gerar card compartilhável</span>
              </a>

              <button
                type="button"
                onClick={onExportCsv}
                className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-4 py-2 text-xs sm:text-sm font-medium text-[#F6F3EA] hover:bg-white/15 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <FileSpreadsheet className="w-4 h-4 text-[#E6C667]" />
                <span>Exportar CSV (Excel)</span>
              </button>

              <button
                type="button"
                onClick={onEditCatalog}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/25 bg-white/10 px-3.5 py-2 text-xs sm:text-sm font-medium text-[#F6F3EA] hover:bg-white/15 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Editar jogos</span>
              </button>

              <button
                type="button"
                onClick={() => setRedoModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/25 bg-white/10 px-3.5 py-2 text-xs sm:text-sm font-medium text-[#F6F3EA] hover:bg-white/15 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refazer quiz</span>
              </button>

              <button
                type="button"
                onClick={() => setResetModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 px-3.5 py-2 text-xs sm:text-sm font-medium text-[#DDD8C8] hover:bg-white/10 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reiniciar</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Player Metrics Panel: Experiência, Exploração, Atividade */}
      <section aria-label="Métricas do jogador" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Experiência */}
        <div className="rounded-2xl border border-[#DED7C4] bg-[#FBF9F3] p-6">
          <h2 className="font-display text-lg font-semibold text-[#142D21] pb-3 border-b border-[#E5DFCE]">
            Experiência
          </h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-[#5A574C]">Total de títulos únicos jogados</dt>
              <dd className="font-mono-tabular font-semibold text-[#163326]">
                {metrics.totalPlayed}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-[#5A574C]">Jogos principais explorados</dt>
              <dd className="font-mono-tabular font-semibold text-[#163326]">
                {metrics.mainExplored} / 21
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-[#5A574C]">Total de jogos concluídos</dt>
              <dd className="font-mono-tabular font-semibold text-[#163326]">
                {metrics.totalCompleted}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-[#5A574C]">Total de jogos com 100%</dt>
              <dd className="font-mono-tabular font-semibold text-[#8C6D23]">
                {metrics.totalCompleted100}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-[#5A574C]">Jogos ainda não iniciados</dt>
              <dd className="font-mono-tabular font-semibold text-[#163326]">
                {metrics.totalNotStarted}{' '}
                <span className="text-xs font-normal text-[#7A7566]">
                  ({metrics.totalUnanswered} sem resposta)
                </span>
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-[#5A574C]">Jogos em andamento</dt>
              <dd className="font-mono-tabular font-semibold text-[#1D4B6E]">
                {metrics.totalPlaying}
              </dd>
            </div>
          </dl>
        </div>

        {/* Exploração */}
        <div className="rounded-2xl border border-[#DED7C4] bg-[#FBF9F3] p-6">
          <h2 className="font-display text-lg font-semibold text-[#142D21] pb-3 border-b border-[#E5DFCE]">
            Exploração
          </h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-[#5A574C]">Conclusão do catálogo</dt>
              <dd className="font-mono-tabular font-semibold text-[#163326] text-right">
                {metrics.catalogCompletionPercent}%{' '}
                <span className="text-xs font-normal text-[#7A7566]">
                  ({metrics.catalogExploredPercent}% explorado)
                </span>
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-[#5A574C] shrink-0">Era mais explorada</dt>
              <dd className="font-medium text-[#163326] text-right truncate">
                {metrics.mostExploredTimeline}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-[#5A574C] shrink-0">Era menos explorada</dt>
              <dd className="font-medium text-[#163326] text-right truncate">
                {metrics.leastExploredTimeline}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-[#5A574C] shrink-0">Console com mais jogos</dt>
              <dd className="font-medium text-[#163326] text-right truncate">
                {metrics.topConsole}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-[#5A574C] shrink-0">Categoria mais explorada</dt>
              <dd className="font-medium text-[#163326] text-right truncate">
                {metrics.mostExploredCategory}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-[#5A574C]">Consoles diferentes usados</dt>
              <dd className="font-mono-tabular font-semibold text-[#163326]">
                {metrics.uniqueConsolesCount}
              </dd>
            </div>
          </dl>
        </div>

        {/* Atividade */}
        <div className="rounded-2xl border border-[#DED7C4] bg-[#FBF9F3] p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E5DFCE]">
              <h2 className="font-display text-lg font-semibold text-[#142D21]">
                Atividade e Preferências
              </h2>
              <button
                type="button"
                onClick={onEditQuestions}
                className="text-xs font-medium text-[#1B4332] hover:underline cursor-pointer"
              >
                Editar respostas
              </button>
            </div>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[#5A574C] shrink-0">Última atividade</dt>
                <dd className="font-medium text-[#163326] text-right truncate">
                  {questions.lastPlayed || 'Não informado'}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[#5A574C]">Dias nos últimos 30 dias</dt>
                <dd className="font-mono-tabular font-semibold text-[#163326]">
                  {questions.daysPlayedLast30 !== null
                    ? `${questions.daysPlayedLast30} dias`
                    : 'Não informado'}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[#5A574C]">Jogos em andamento</dt>
                <dd className="font-mono-tabular font-semibold text-[#1D4B6E]">
                  {metrics.totalPlaying}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[#5A574C] shrink-0">Jogo favorito</dt>
                <dd className="font-medium text-[#163326] text-right truncate">
                  {questions.favoriteGame || 'Não informado'}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[#5A574C] shrink-0">Primeiro Zelda</dt>
                <dd className="font-medium text-[#163326] text-right truncate">
                  {questions.firstGame || 'Não informado'}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[#5A574C] shrink-0">Rejogabilidade</dt>
                <dd className="font-medium text-[#163326] text-right truncate">
                  {questions.replaysGames || 'Não informado'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* 4 Visual Charts */}
      <ResultsCharts
        metrics={metrics}
        games={games}
        statuses={statuses}
        onGoToCatalog={onEditCatalog}
      />

      {/* Achievements & Medals */}
      <section className="rounded-2xl border border-[#DED7C4] bg-[#FBF9F3] p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-5 border-b border-[#E5DFCE]">
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-semibold text-[#142D21]">
              Conquistas e medalhas de Hyrule
            </h2>
            <p className="mt-1 text-sm text-[#5A574C]">
              Medalhas desbloqueadas automaticamente conforme seu avanço no catálogo e atividade.
            </p>
          </div>
          <span className="font-mono-tabular text-sm font-semibold text-[#8C6D23] shrink-0">
            {unlockedCount} / {achievements.length} desbloqueadas
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`rounded-xl border p-4 transition-colors ${
                ach.unlocked
                  ? 'border-[#C59B38] bg-[#FAF5E4]'
                  : 'border-[#E2DBC9] bg-[#F5F2E9] opacity-80'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border ${
                    ach.unlocked
                      ? 'border-[#C59B38] bg-[#1B4332] text-[#E6C667]'
                      : 'border-[#D4CCB8] bg-[#EAE4D3] text-[#7A7566]'
                  }`}
                >
                  <AchievementIcon iconKey={ach.iconKey} className="w-5 h-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display text-sm font-bold text-[#142D21] truncate">
                      {ach.name}
                    </h3>
                    {ach.unlocked ? (
                      <CheckCircle2
                        className="w-4 h-4 text-[#1B4332] shrink-0"
                        aria-label="Conquista desbloqueada"
                      />
                    ) : (
                      <Lock
                        className="w-3.5 h-3.5 text-[#7A7566] shrink-0"
                        aria-label="Conquista bloqueada"
                      />
                    )}
                  </div>

                  <p className="mt-1 text-xs leading-relaxed text-[#4A473E]">
                    {ach.description}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-black/8 flex items-center justify-between gap-2 text-[11px]">
                    <span className="text-[#6B6759] truncate" title={ach.conditionText}>
                      {ach.conditionText}
                    </span>
                    <span
                      className={`font-mono-tabular font-semibold shrink-0 ${
                        ach.unlocked ? 'text-[#1B4332]' : 'text-[#6A6658]'
                      }`}
                    >
                      {ach.unlocked ? 'Desbloqueada' : ach.progressText}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Shareable PNG Card */}
      <ShareCardSection
        score={score}
        metrics={metrics}
        favoriteGame={questions.favoriteGame}
        playerName={playerName}
        customPhrase={customPhrase}
        onPlayerNameChange={onPlayerNameChange}
        onPhraseChange={onPhraseChange}
      />

      {/* Attempt History */}
      {attemptHistory.length > 0 && (
        <section className="rounded-2xl border border-[#DED7C4] bg-[#FBF9F3] p-6 sm:p-8">
          <div className="flex items-center gap-2.5 pb-4 border-b border-[#E5DFCE]">
            <History className="w-5 h-5 text-[#8C6D23]" />
            <div>
              <h2 className="font-display text-lg sm:text-xl font-semibold text-[#142D21]">
                Histórico de jornadas anteriores
              </h2>
              <p className="text-xs text-[#5A574C]">
                Tentativas salvas ao refazer o quiz preservando seus registros passados.
              </p>
            </div>
          </div>

          <div className="mt-4 divide-y divide-[#EAE4D3]">
            {attemptHistory.map((item) => (
              <div
                key={item.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <p className="text-sm font-semibold text-[#163326]">
                    Zelda Score {item.score}/100 · {item.classification}
                  </p>
                  <p className="text-xs text-[#6A6658] mt-0.5">
                    {new Date(item.savedAt).toLocaleString('pt-BR')} · {item.totalPlayed} jogados ·{' '}
                    {item.totalCompleted} concluídos
                    {item.favoriteGame ? ` · Favorito: ${item.favoriteGame}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onRestoreHistoryItem(item)}
                    className="rounded-lg border border-[#CFC7B2] bg-white px-3 py-1.5 text-xs font-medium text-[#1B4332] hover:bg-[#EFECE1] cursor-pointer"
                  >
                    Carregar perfil
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteHistoryItem(item.id)}
                    className="rounded-lg border border-[#E5DFCE] p-1.5 text-[#6A6658] hover:text-red-700 hover:bg-red-50 cursor-pointer"
                    aria-label="Excluir registro do histórico"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Modal: Refazer Quiz */}
      {redoModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-xl border border-[#D4CCB8] bg-[#FBF9F3] p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5DFCE]">
              <h3 className="font-display text-lg font-semibold text-[#163326]">
                Como deseja refazer o quiz?
              </h3>
              <button
                type="button"
                onClick={() => setRedoModalOpen(false)}
                className="p-1 text-[#5A574C] hover:text-[#1A1D18] cursor-pointer"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[#4A473E]">
              Você pode salvar sua pontuação atual ({score.totalScore}/100) no histórico de jornadas antes de começar do zero, ou apenas voltar ao catálogo para ajustar suas respostas atuais.
            </p>
            <div className="mt-5 space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  setRedoModalOpen(false);
                  onRedoSaveHistoryAndReset();
                }}
                className="w-full rounded-lg bg-[#1B4332] px-4 py-2.5 text-sm font-semibold text-[#F6F3EA] hover:bg-[#143326] transition-colors cursor-pointer"
              >
                Salvar no histórico e iniciar nova tentativa
              </button>
              <button
                type="button"
                onClick={() => {
                  setRedoModalOpen(false);
                  onEditCatalog();
                }}
                className="w-full rounded-lg border border-[#CFC7B2] bg-white px-4 py-2.5 text-sm font-medium text-[#2A2D25] hover:bg-[#EFECE1] transition-colors cursor-pointer"
              >
                Manter respostas atuais e editar no catálogo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Reiniciar Progresso */}
      {resetModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-xl border border-[#D4CCB8] bg-[#FBF9F3] p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5DFCE]">
              <h3 className="font-display text-lg font-semibold text-[#163326]">
                Reiniciar progresso atual
              </h3>
              <button
                type="button"
                onClick={() => setResetModalOpen(false)}
                className="p-1 text-[#5A574C] hover:text-[#1A1D18] cursor-pointer"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[#4A473E]">
              Isso limpará o status de todos os jogos e as respostas complementares da sessão atual.
            </p>
            <label className="mt-4 flex items-center gap-2 text-xs text-[#4A473E] cursor-pointer">
              <input
                type="checkbox"
                checked={alsoResetCustomGames}
                onChange={(e) => setAlsoResetCustomGames(e.target.checked)}
                className="rounded border-[#CFC7B2] accent-[#1B4332]"
              />
              <span>Restaurar também o catálogo original (39 títulos únicos)</span>
            </label>
            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setResetModalOpen(false)}
                className="rounded-lg border border-[#CFC7B2] bg-white px-4 py-2 text-sm font-medium text-[#2A2D25] hover:bg-[#EFECE1] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  setResetModalOpen(false);
                  onResetAll(alsoResetCustomGames);
                }}
                className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 cursor-pointer"
              >
                Confirmar reinício
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

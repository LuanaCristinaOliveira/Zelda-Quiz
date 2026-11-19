import React, { useMemo, useState } from 'react';
import {
  Search,
  Plus,
  Pencil,
  CheckCircle2,
  Trophy,
  Clock,
  PlayCircle,
  MinusCircle,
  CircleDashed,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Image as ImageIcon,
} from 'lucide-react';
import { CATEGORY_SECTIONS, STATUS_OPTIONS } from '../data/zeldaGames';
import { GameCategory, GameStatus, ZeldaGame } from '../types/zelda';
import { getStatusLabel } from '../utils/scoring';
import { GameCover } from './GameCover';

interface QuizCatalogViewProps {
  games: ZeldaGame[];
  statuses: Record<string, GameStatus>;
  liveScore: number;
  evaluatedCount: number;
  mainStartedCount: number;
  onStatusChange: (gameId: string, status: GameStatus) => void;
  onOpenAddGame: () => void;
  onOpenEditGame: (game: ZeldaGame) => void;
  onSyncWikiCovers: () => Promise<number>;
  isSyncingCovers: boolean;
  onBackHome: () => void;
  onNextStep: () => void;
}

type GroupMode = 'category' | 'timeline' | 'flat';

function StatusIcon({ status, className = 'w-4 h-4' }: { status: GameStatus; className?: string }) {
  switch (status) {
    case 'completed_100':
      return <Trophy className={className} />;
    case 'completed':
      return <CheckCircle2 className={className} />;
    case 'playing':
      return <PlayCircle className={className} />;
    case 'played_unfinished':
      return <Clock className={className} />;
    case 'not_played':
      return <MinusCircle className={className} />;
    default:
      return <CircleDashed className={className} />;
  }
}

function getStatusBadgeClasses(status: GameStatus): string {
  switch (status) {
    case 'completed_100':
      return 'text-[#7C5A0B] bg-[#F5E8C0] border-[#D6B45A]';
    case 'completed':
      return 'text-[#14432B] bg-[#DFEDE4] border-[#9EC5AC]';
    case 'playing':
      return 'text-[#1D4B6E] bg-[#E2EEF6] border-[#A3C4DB]';
    case 'played_unfinished':
      return 'text-[#6A4A1B] bg-[#F3E9D7] border-[#D5BE97]';
    case 'not_played':
      return 'text-[#4F4D44] bg-[#ECE8DC] border-[#D3CCB8]';
    default:
      return 'text-[#6A675B] bg-[#F5F2E9] border-[#E0D9C5]';
  }
}

export const QuizCatalogView: React.FC<QuizCatalogViewProps> = ({
  games,
  statuses,
  liveScore,
  evaluatedCount,
  mainStartedCount,
  onStatusChange,
  onOpenAddGame,
  onOpenEditGame,
  onSyncWikiCovers,
  isSyncingCovers,
  onBackHome,
  onNextStep,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<GameCategory | 'ALL'>('ALL');
  const [timelineFilter, setTimelineFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | GameStatus>('ALL');
  const [groupMode, setGroupMode] = useState<GroupMode>('category');
  const [coverSyncMsg, setCoverSyncMsg] = useState<string | null>(null);

  const timelines = useMemo(
    () => Array.from(new Set(games.map((g) => g.timeline))),
    [games]
  );

  const missingWikiCoversCount = useMemo(
    () => games.filter((g) => g.wikiTitle && !g.coverUrl).length,
    [games]
  );

  const filteredGames = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return games.filter((g) => {
      if (categoryFilter !== 'ALL' && g.category !== categoryFilter) return false;
      if (timelineFilter !== 'ALL' && g.timeline !== timelineFilter) return false;
      const st = statuses[g.id] ?? 'unanswered';
      if (statusFilter !== 'ALL' && st !== statusFilter) return false;
      if (
        q &&
        !g.title.toLowerCase().includes(q) &&
        !g.timeline.toLowerCase().includes(q) &&
        !(g.linkedEditions?.some((e) => e.toLowerCase().includes(q)) ?? false)
      ) {
        return false;
      }
      return true;
    });
  }, [games, statuses, categoryFilter, timelineFilter, statusFilter, searchQuery]);

  const groupedSections = useMemo(() => {
    if (groupMode === 'flat') {
      return [
        {
          key: 'all',
          title: 'Lista única de títulos',
          subtitle: 'Cada jogo aparece uma única vez, independente das plataformas ou remakes.',
          items: filteredGames,
        },
      ];
    }

    if (groupMode === 'category') {
      return CATEGORY_SECTIONS.map((sec) => ({
        key: sec.id,
        title: sec.orderLabel,
        subtitle: sec.description,
        items: filteredGames.filter((g) => g.category === sec.id),
      })).filter((sec) => sec.items.length > 0);
    }

    // Group by timeline
    return timelines
      .map((tl) => ({
        key: tl,
        title: tl,
        subtitle: `Títulos únicos situados em "${tl}"`,
        items: filteredGames.filter((g) => g.timeline === tl),
      }))
      .filter((sec) => sec.items.length > 0);
  }, [filteredGames, groupMode, timelines]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    categoryFilter !== 'ALL' ||
    timelineFilter !== 'ALL' ||
    statusFilter !== 'ALL';

  const resetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('ALL');
    setTimelineFilter('ALL');
    setStatusFilter('ALL');
  };

  const handleSyncCovers = async () => {
    setCoverSyncMsg(null);
    const updated = await onSyncWikiCovers();
    if (updated > 0) {
      setCoverSyncMsg(`${updated} capa(s) oficial(is) carregada(s) da Wikipedia.`);
    } else {
      setCoverSyncMsg('Nenhuma nova capa disponível no momento.');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Progress & Step Bar */}
      <div className="rounded-xl border border-[#D8D0BC] bg-[#FBF9F3] p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#8C6D23]">
              Etapa 1 de 2 · Catálogo Único de Experiência
            </p>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-[#142D21] mt-0.5">
              Marque os jogos únicos de Zelda que você já vivenciou
            </h1>
            <p className="text-sm text-[#5A574C] mt-1">
              <span className="font-mono-tabular font-semibold text-[#163326]">
                {evaluatedCount}/{games.length}
              </span>{' '}
              títulos únicos avaliados ·{' '}
              <span className="font-mono-tabular font-semibold text-[#163326]">
                {mainStartedCount}/21
              </span>{' '}
              principais explorados · Prévia do Zelda Score:{' '}
              <span className="font-mono-tabular font-semibold text-[#8C6D23]">
                {liveScore}/100
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onOpenAddGame}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#CFC7B2] bg-white px-3.5 py-2 text-xs sm:text-sm font-medium text-[#2A2D25] hover:bg-[#EFECE1] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4 text-[#1B4332]" />
              <span>Adicionar jogo</span>
            </button>

            {missingWikiCoversCount > 0 && (
              <button
                type="button"
                onClick={handleSyncCovers}
                disabled={isSyncingCovers}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#CFC7B2] bg-white px-3.5 py-2 text-xs sm:text-sm font-medium text-[#2A2D25] hover:bg-[#EFECE1] disabled:opacity-60 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <ImageIcon className="w-4 h-4 text-[#8C6D23]" />
                <span>
                  {isSyncingCovers
                    ? 'Buscando capas...'
                    : `Completar capas (${missingWikiCoversCount})`}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={onNextStep}
              className="inline-flex items-center gap-2 rounded-lg bg-[#1B4332] px-4 py-2 text-xs sm:text-sm font-semibold text-[#F6F3EA] hover:bg-[#143326] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>Perguntas adicionais</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Thin progress bar */}
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-[#E5DFCE]">
          <div
            className="h-full bg-[#1B4332] transition-all duration-200"
            style={{
              width: `${games.length > 0 ? Math.round((evaluatedCount / games.length) * 100) : 0}%`,
            }}
          />
        </div>

        {coverSyncMsg && (
          <p className="mt-2.5 text-xs text-[#1B4332] font-medium">{coverSyncMsg}</p>
        )}
      </div>

      {/* Unified Filters & Organization Toolbar (NO console navigation or split by platform) */}
      <div className="rounded-xl border border-[#DED7C4] bg-[#FBF9F3] p-4 space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EAE4D3]">
          <p className="text-xs text-[#5A574C]">
            <strong>Um jogo = um único cadastro:</strong> versões, remakes e edições HD de um mesmo título já estão vinculadas abaixo para você responder apenas uma vez.
          </p>

          <div className="flex items-center gap-1 p-1 rounded-lg bg-[#EAE4D3] shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setGroupMode('category')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                groupMode === 'category'
                  ? 'bg-white text-[#163326] shadow-sm'
                  : 'text-[#5A574C] hover:text-[#163326]'
              }`}
            >
              Por categoria
            </button>
            <button
              type="button"
              onClick={() => setGroupMode('timeline')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                groupMode === 'timeline'
                  ? 'bg-white text-[#163326] shadow-sm'
                  : 'text-[#5A574C] hover:text-[#163326]'
              }`}
            >
              Por linha do tempo
            </button>
            <button
              type="button"
              onClick={() => setGroupMode('flat')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                groupMode === 'flat'
                  ? 'bg-white text-[#163326] shadow-sm'
                  : 'text-[#5A574C] hover:text-[#163326]'
              }`}
            >
              Lista única
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-[#6B6759] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar por nome do jogo ou edição vinculada..."
              aria-label="Pesquisar jogo por nome"
              className="w-full rounded-lg border border-[#CFC7B2] bg-white pl-10 pr-3.5 py-2 text-sm text-[#1A1D18] placeholder:text-[#7D7869] focus:border-[#1B4332] focus:outline-none focus:ring-2 focus:ring-[#1B4332]/15"
            />
          </div>

          <div className="md:col-span-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as GameCategory | 'ALL')}
              aria-label="Filtrar por categoria"
              className="w-full rounded-lg border border-[#CFC7B2] bg-white px-3 py-2 text-sm text-[#1A1D18] focus:border-[#1B4332] focus:outline-none"
            >
              <option value="ALL">Todas categorias</option>
              {CATEGORY_SECTIONS.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {sec.displayLabel}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              value={timelineFilter}
              onChange={(e) => setTimelineFilter(e.target.value)}
              aria-label="Filtrar por linha do tempo"
              className="w-full rounded-lg border border-[#CFC7B2] bg-white px-3 py-2 text-sm text-[#1A1D18] focus:border-[#1B4332] focus:outline-none"
            >
              <option value="ALL">Todas as linhas do tempo</option>
              {timelines.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'ALL' | GameStatus)}
              aria-label="Filtrar por status do jogo"
              className="w-full rounded-lg border border-[#CFC7B2] bg-white px-3 py-2 text-sm text-[#1A1D18] focus:border-[#1B4332] focus:outline-none"
            >
              <option value="ALL">Todos os status</option>
              <option value="unanswered">Não informado</option>
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-[#6B6759]">
          <span className="font-mono-tabular">
            Exibindo {filteredGames.length} de {games.length} jogos únicos
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 font-medium text-[#1B4332] hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpar filtros</span>
            </button>
          )}
        </div>
      </div>

      {/* Unified Catalog Sections */}
      {filteredGames.length === 0 ? (
        <div className="rounded-2xl border border-[#DED7C4] bg-[#FBF9F3] p-10 text-center">
          <p className="font-display text-lg font-semibold text-[#163326]">
            Nenhum título encontrado para os filtros aplicados
          </p>
          <p className="mt-1.5 text-sm text-[#5A574C]">
            Tente ajustar sua busca ou limpar os filtros selecionados.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#1B4332] px-4 py-2 text-sm font-medium text-[#F6F3EA] hover:bg-[#143326] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Mostrar todos os jogos</span>
          </button>
        </div>
      ) : (
        <div className="space-y-10">
          {groupedSections.map((section) => (
            <section key={section.key} className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-2 border-b border-[#DED7C4]">
                <div>
                  <h2 className="font-display text-lg sm:text-xl font-bold text-[#142D21]">
                    {section.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#5A574C]">{section.subtitle}</p>
                </div>
                <span className="font-mono-tabular text-xs font-medium text-[#8C6D23] shrink-0">
                  {section.items.length} {section.items.length === 1 ? 'título' : 'títulos'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {section.items.map((game) => {
                  const currentStatus: GameStatus = statuses[game.id] ?? 'unanswered';
                  const platformList =
                    game.platforms && game.platforms.length > 0
                      ? game.platforms.join(', ')
                      : game.console;

                  return (
                    <article
                      key={game.id}
                      className="group flex flex-col rounded-xl border border-[#DED7C4] bg-[#FBF9F3] overflow-hidden shadow-sm hover:border-[#C59B38]/80 transition-colors"
                    >
                      <GameCover game={game} />

                      <div className="flex flex-1 flex-col p-4 sm:p-5">
                        {/* Top metadata line: unboxed zero-pill discipline */}
                        <div className="flex items-start justify-between gap-2 text-xs text-[#6A6658]">
                          <span className="font-mono-tabular">
                            #{String(game.number).padStart(2, '0')} · {game.category}
                          </span>
                          <button
                            type="button"
                            onClick={() => onOpenEditGame(game)}
                            className="inline-flex items-center gap-1 text-xs font-medium text-[#5A574C] hover:text-[#1B4332] transition-colors cursor-pointer shrink-0"
                            title="Editar informações ou capa"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Editar</span>
                          </button>
                        </div>

                        {/* Game Full Title */}
                        <h3 className="mt-1.5 font-display text-base sm:text-[1.0625rem] font-semibold leading-snug text-[#142D21]">
                          {game.title}
                        </h3>

                        {/* Unboxed details: Linha do tempo · Ano original */}
                        <p className="mt-2 text-xs leading-relaxed text-[#4E4B42]">
                          <span className="font-medium text-[#2A2D25]">{game.timeline}</span>
                          <span aria-hidden="true"> · </span>
                          <span className="font-mono-tabular">
                            {game.releaseYear ? game.releaseYear : 'Ano não confirmado'}
                          </span>
                        </p>

                        {/* Complementary platform & linked editions info (never split into separate entries) */}
                        <p className="mt-1 text-xs text-[#5A574C]">
                          <span className="text-[#7A7566]">Plataformas:</span> {platformList}
                        </p>

                        {game.linkedEditions && game.linkedEditions.length > 0 && (
                          <p className="mt-1 text-[11px] leading-snug text-[#6A6658]">
                            <span className="font-medium text-[#4A473E]">Versões vinculadas:</span>{' '}
                            {game.linkedEditions.join(' · ')}
                          </p>
                        )}

                        {/* Cover provenance */}
                        <p
                          className="mt-1.5 text-[11px] text-[#7A7566] truncate"
                          title={game.coverSource ?? 'Espaço reservado oficial'}
                        >
                          {game.coverSource
                            ? `Fonte da capa: ${game.coverSource}`
                            : 'Capa: Espaço reservado oficial'}
                        </p>

                        {/* Explicit Status Indicator */}
                        <div className="mt-auto pt-3.5">
                          <div className="pt-3 border-t border-[#E6DFCE] flex items-center justify-between gap-2">
                            <span className="text-[11px] font-medium uppercase tracking-wider text-[#6A6658]">
                              Status
                            </span>
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-semibold ${getStatusBadgeClasses(
                                currentStatus
                              )}`}
                            >
                              <StatusIcon status={currentStatus} className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate max-w-[180px]">
                                {getStatusLabel(currentStatus)}
                              </span>
                            </span>
                          </div>

                          {/* Interactive 5-Option Status Selector */}
                          <div
                            role="group"
                            aria-label={`Selecionar status para ${game.title}`}
                            className="mt-3 grid grid-cols-2 gap-1.5"
                          >
                            {STATUS_OPTIONS.map((opt) => {
                              const active = currentStatus === opt.value;
                              const isFullWidth = opt.value === 'played_unfinished';
                              return (
                                <button
                                  key={opt.value}
                                  type="button"
                                  onClick={() => onStatusChange(game.id, opt.value)}
                                  aria-pressed={active}
                                  className={`inline-flex items-center justify-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs font-medium transition-all duration-150 cursor-pointer min-h-[38px] ${
                                    isFullWidth ? 'col-span-2' : ''
                                  } ${
                                    active
                                      ? 'border-[#1B4332] bg-[#1B4332] text-[#F6F3EA] shadow-sm'
                                      : 'border-[#D7D0BD] bg-white text-[#2F3029] hover:border-[#8C6D23] hover:bg-[#F4EFE1]'
                                  }`}
                                >
                                  <StatusIcon status={opt.value} className="w-3.5 h-3.5 shrink-0" />
                                  <span className="truncate">{opt.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Step Navigation Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-[#DED7C4] bg-[#FBF9F3] p-5">
        <button
          type="button"
          onClick={onBackHome}
          className="inline-flex items-center gap-2 rounded-lg border border-[#CFC7B2] bg-white px-4 py-2.5 text-sm font-medium text-[#2A2D25] hover:bg-[#EFECE1] transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para início</span>
        </button>

        <button
          type="button"
          onClick={onNextStep}
          className="inline-flex items-center gap-2 rounded-lg bg-[#1B4332] px-5 py-2.5 text-sm font-semibold text-[#F6F3EA] hover:bg-[#143326] transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <span>Avançar para Perguntas Adicionais</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

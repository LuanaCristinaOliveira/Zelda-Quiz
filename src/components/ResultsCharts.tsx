import React, { useState } from 'react';
import { GameStatus, PlayerMetrics, ZeldaGame } from '../types/zelda';

interface ResultsChartsProps {
  metrics: PlayerMetrics;
  games: ZeldaGame[];
  statuses: Record<string, GameStatus>;
  onGoToCatalog: () => void;
}

export const ResultsCharts: React.FC<ResultsChartsProps> = ({
  metrics,
  games,
  statuses,
  onGoToCatalog,
}) => {
  const [hoveredCat, setHoveredCat] = useState<string | null>(null);

  // 1. Console bar chart data (only consoles with played games, or top 8 consoles in catalog)
  const playedConsoles = metrics.consoleStats.filter((c) => c.played > 0).slice(0, 10);
  const maxConsolePlayed = Math.max(1, ...playedConsoles.map((c) => c.played));

  // 2. Category Donut chart data
  const totalCategoryPlayed = metrics.categoryStats.reduce((acc, c) => acc + c.played, 0);
  const radius = 56;
  const circumference = 2 * Math.PI * radius;

  let cumulativeOffset = 0;
  const donutSegments = metrics.categoryStats
    .filter((c) => c.played > 0)
    .map((c) => {
      const fraction = totalCategoryPlayed > 0 ? c.played / totalCategoryPlayed : 0;
      const strokeLength = fraction * circumference;
      const dashOffset = -cumulativeOffset;
      cumulativeOffset += strokeLength;
      return {
        ...c,
        fraction,
        percent: Math.round(fraction * 100),
        strokeLength,
        dashOffset,
      };
    });

  // 4. Main 21 games status breakdown
  const mainGames = games.filter((g) => g.category === 'Jogo principal');
  const mainTotal = mainGames.length || 21;
  const mainCounts = {
    completed100: 0,
    completed: 0,
    playing: 0,
    unfinished: 0,
    notStarted: 0,
  };
  for (const g of mainGames) {
    const st = statuses[g.id] ?? 'unanswered';
    if (st === 'completed_100') mainCounts.completed100 += 1;
    else if (st === 'completed') mainCounts.completed += 1;
    else if (st === 'playing') mainCounts.playing += 1;
    else if (st === 'played_unfinished') mainCounts.unfinished += 1;
    else mainCounts.notStarted += 1;
  }

  const mainCompletedPercent = Math.round(
    ((mainCounts.completed100 + mainCounts.completed) / mainTotal) * 100
  );
  const mainRingRadius = 48;
  const mainRingCirc = 2 * Math.PI * mainRingRadius;
  const mainRingOffset = mainRingCirc - (mainCompletedPercent / 100) * mainRingCirc;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Chart 1: Gráfico de barras por plataforma original */}
      <section className="rounded-2xl border border-[#DED7C4] bg-[#FBF9F3] p-6">
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#E5DFCE]">
          <div>
            <h3 className="font-display text-lg font-semibold text-[#142D21]">
              Títulos únicos por plataforma original
            </h3>
            <p className="text-xs text-[#6A6658] mt-0.5">
              Cada jogo é contabilizado uma única vez em sua plataforma de origem
            </p>
          </div>
          <span className="font-mono-tabular text-xs font-medium text-[#8C6D23] shrink-0">
            {metrics.uniqueConsolesCount} plataforma(s)
          </span>
        </div>

        {playedConsoles.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-[#5A574C]">
              Nenhuma plataforma registrada com jogos iniciados ou concluídos ainda.
            </p>
            <button
              type="button"
              onClick={onGoToCatalog}
              className="mt-3 text-xs font-semibold text-[#1B4332] hover:underline cursor-pointer"
            >
              Avaliar jogos no catálogo →
            </button>
          </div>
        ) : (
          <div className="mt-5 space-y-3.5">
            {playedConsoles.map((item) => {
              const playedWidth = Math.round((item.played / maxConsolePlayed) * 100);
              const completedWidth =
                item.played > 0 ? Math.round((item.completed / item.played) * 100) : 0;
              return (
                <div key={item.console}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-[#2A2D25] truncate pr-2">
                      {item.console}
                    </span>
                    <span className="font-mono-tabular text-[#5A574C] shrink-0">
                      {item.played} jogado(s) · {item.completed} concluído(s)
                    </span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-[#EAE4D3] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#3E6B52] relative transition-all duration-300"
                      style={{ width: `${Math.max(playedWidth, 6)}%` }}
                    >
                      {item.completed > 0 && (
                        <div
                          className="h-full bg-[#1B4332] rounded-full"
                          style={{ width: `${completedWidth}%` }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="pt-2 flex items-center gap-4 text-[11px] text-[#6A6658]">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#1B4332]" />
                Concluídos
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#3E6B52]" />
                Jogados / Em andamento
              </span>
            </div>
          </div>
        )}
      </section>

      {/* Chart 2: Gráfico de pizza por categoria */}
      <section className="rounded-2xl border border-[#DED7C4] bg-[#FBF9F3] p-6">
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#E5DFCE]">
          <div>
            <h3 className="font-display text-lg font-semibold text-[#142D21]">
              Distribuição por categoria
            </h3>
            <p className="text-xs text-[#6A6658] mt-0.5">
              Proporção dos títulos únicos explorados entre os 3 grupos do catálogo
            </p>
          </div>
          <span className="font-mono-tabular text-xs font-medium text-[#8C6D23] shrink-0">
            {totalCategoryPlayed} jogado(s)
          </span>
        </div>

        {totalCategoryPlayed === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-[#5A574C]">
              Marque pelo menos 1 jogo como jogado para visualizar o gráfico de categorias.
            </p>
            <button
              type="button"
              onClick={onGoToCatalog}
              className="mt-3 text-xs font-semibold text-[#1B4332] hover:underline cursor-pointer"
            >
              Ir para o catálogo →
            </button>
          </div>
        ) : (
          <div className="mt-6 flex flex-col sm:flex-row items-center gap-6">
            <div className="relative w-40 h-40 shrink-0">
              <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="none"
                  stroke="#EAE4D3"
                  strokeWidth="18"
                />
                {donutSegments.map((seg) => (
                  <circle
                    key={seg.category}
                    cx="70"
                    cy="70"
                    r={radius}
                    fill="none"
                    stroke={seg.color}
                    strokeWidth={hoveredCat === seg.category ? '21' : '18'}
                    strokeDasharray={`${seg.strokeLength} ${circumference}`}
                    strokeDashoffset={seg.dashOffset}
                    className="transition-all duration-200 cursor-pointer"
                    onMouseEnter={() => setHoveredCat(seg.category)}
                    onMouseLeave={() => setHoveredCat(null)}
                  />
                ))}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="font-mono-tabular text-2xl font-bold text-[#163326]">
                  {totalCategoryPlayed}
                </span>
                <span className="text-[11px] text-[#6A6658]">jogados</span>
              </div>
            </div>

            <div className="w-full space-y-2.5">
              {metrics.categoryStats.map((cat) => {
                const pct =
                  totalCategoryPlayed > 0
                    ? Math.round((cat.played / totalCategoryPlayed) * 100)
                    : 0;
                return (
                  <div
                    key={cat.category}
                    onMouseEnter={() => setHoveredCat(cat.category)}
                    onMouseLeave={() => setHoveredCat(null)}
                    className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                      hoveredCat === cat.category ? 'bg-[#EFECE1]' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-3 h-3 rounded-sm shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="font-medium text-[#2A2D25] truncate">
                        {cat.label}
                      </span>
                    </div>
                    <span className="font-mono-tabular text-[#5A574C] shrink-0 ml-2">
                      {cat.played}/{cat.total} ({pct}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Chart 3: Gráfico de progresso por linha do tempo */}
      <section className="rounded-2xl border border-[#DED7C4] bg-[#FBF9F3] p-6">
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#E5DFCE]">
          <div>
            <h3 className="font-display text-lg font-semibold text-[#142D21]">
              Progresso por linha do tempo
            </h3>
            <p className="text-xs text-[#6A6658] mt-0.5">
              Cobertura cronológica em cada era do catálogo
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {metrics.timelineStats.map((tl) => (
            <div key={tl.timeline}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-[#2A2D25] truncate pr-2">
                  {tl.timeline}
                </span>
                <span className="font-mono-tabular text-[#5A574C] shrink-0">
                  {tl.played}/{tl.total} ({tl.percentage}%)
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-[#EAE4D3] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#C59B38] transition-all duration-300"
                  style={{ width: `${tl.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Chart 4: Indicador de conclusão dos jogos principais */}
      <section className="rounded-2xl border border-[#DED7C4] bg-[#FBF9F3] p-6">
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#E5DFCE]">
          <div>
            <h3 className="font-display text-lg font-semibold text-[#142D21]">
              Conclusão dos jogos principais
            </h3>
            <p className="text-xs text-[#6A6658] mt-0.5">
              Status detalhado dos {mainTotal} títulos centrais da franquia
            </p>
          </div>
          <span className="font-mono-tabular text-xs font-medium text-[#1B4332] shrink-0">
            {mainCounts.completed + mainCounts.completed100}/{mainTotal} concluídos
          </span>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center gap-6">
          <div className="relative w-32 h-32 shrink-0">
            <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
              <circle
                cx="60"
                cy="60"
                r={mainRingRadius}
                fill="none"
                stroke="#EAE4D3"
                strokeWidth="12"
              />
              <circle
                cx="60"
                cy="60"
                r={mainRingRadius}
                fill="none"
                stroke="#1B4332"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={mainRingCirc}
                strokeDashoffset={mainRingOffset}
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="font-mono-tabular text-2xl font-bold text-[#163326]">
                {mainCompletedPercent}%
              </span>
              <span className="text-[11px] text-[#6A6658]">concluídos</span>
            </div>
          </div>

          <div className="w-full space-y-2 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-[#EFECE1]">
              <span className="text-[#2A2D25]">Completei 100%</span>
              <span className="font-mono-tabular font-semibold text-[#8C6D23]">
                {mainCounts.completed100}
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-[#EFECE1]">
              <span className="text-[#2A2D25]">Zerei</span>
              <span className="font-mono-tabular font-semibold text-[#1B4332]">
                {mainCounts.completed}
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-[#EFECE1]">
              <span className="text-[#2A2D25]">Estou jogando atualmente</span>
              <span className="font-mono-tabular font-semibold text-[#1D4B6E]">
                {mainCounts.playing}
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-[#EFECE1]">
              <span className="text-[#2A2D25]">Já joguei, mas não terminei</span>
              <span className="font-mono-tabular font-semibold text-[#6A4A1B]">
                {mainCounts.unfinished}
              </span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-[#6A6658]">Não iniciados / Sem resposta</span>
              <span className="font-mono-tabular font-semibold text-[#6A6658]">
                {mainCounts.notStarted}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

import React, { useState } from 'react';
import { ArrowRight, Compass, Layers, Clock, Award } from 'lucide-react';
import { HyruleCompassOrnament } from './HyruleMark';

interface HomeViewProps {
  totalGames: number;
  categoriesCount: number;
  evaluatedCount: number;
  hasStarted: boolean;
  onStartQuiz: () => void;
  onGoToResults: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  totalGames,
  categoriesCount,
  evaluatedCount,
  hasStarted,
  onStartQuiz,
  onGoToResults,
}) => {
  const [heroImgError, setHeroImgError] = useState(false);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Split Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-7 flex flex-col justify-center rounded-2xl border border-[#DDD5C1] bg-[#FBF9F3] p-7 sm:p-10 shadow-sm hyrule-parchment-grid">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#8C6D23] mb-3">
            Crônica Interativa de Experiência
          </p>

          <h1 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-bold leading-[1.15] text-[#142D21] text-balance">
            Qual é o seu nível de aventura em Hyrule?
          </h1>

          <p className="mt-4 text-base sm:text-lg leading-relaxed text-[#46443B] max-w-xl">
            Descubra seu Zelda Score, acompanhe sua jornada pela franquia e veja quantos jogos você já explorou.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={onStartQuiz}
              className="inline-flex items-center gap-2.5 rounded-lg bg-[#1B4332] px-6 py-3.5 text-sm font-semibold tracking-wide text-[#F6F3EA] shadow-sm hover:bg-[#133124] transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B4332]"
            >
              <span>{hasStarted ? 'CONTINUAR QUIZ' : 'COMEÇAR QUIZ'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {hasStarted && (
              <button
                type="button"
                onClick={onGoToResults}
                className="inline-flex items-center gap-2 rounded-lg border border-[#C59B38] bg-[#F6F1E2] px-5 py-3.5 text-sm font-semibold text-[#1B4332] hover:bg-[#EDE4CA] transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <span>Ver meu perfil ({evaluatedCount}/{totalGames})</span>
              </button>
            )}
          </div>

          <p className="mt-5 text-xs text-[#6A6658]">
            Catálogo de títulos únicos: remakes e relançamentos são vinculados ao jogo original, salvos localmente sem necessidade de cadastro.
          </p>
        </div>

        {/* Hero Thematic Illustration */}
        <div className="lg:col-span-5 rounded-2xl border border-[#DDD5C1] bg-[#163326] overflow-hidden shadow-sm min-h-[280px] relative">
          {!heroImgError ? (
            <>
              <img
                src="/src/assets/images/hero_hyrule_journey_1795098043564.jpg"
                alt="Ilustração temática de Hyrule com mapa antigo, bússola dourada e ruínas antigas"
                onError={() => setHeroImgError(true)}
                className="w-full h-full lg:h-full object-cover"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#10241A]/85 via-[#10241A]/30 to-transparent p-5">
                <p className="text-xs text-[#EAE4D3] font-medium">
                  Arquivo do Explorador · Mapeamento completo de títulos únicos e linhas do tempo
                </p>
              </div>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center text-[#F6F3EA]">
              <HyruleCompassOrnament className="w-16 h-16 text-[#C59B38] mb-4" />
              <p className="font-display text-lg font-semibold">Cartografia de Hyrule</p>
              <p className="mt-2 text-sm text-[#D6D0BE]">
                Registre cada título explorado, concluído ou completado em 100%.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 4-Column Key Info Strip (Full-Width Row Below Hero) */}
      <section
        aria-label="Resumo do catálogo"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="rounded-xl border border-[#DED7C4] bg-[#FBF9F3] p-5">
          <div className="flex items-center gap-2 text-xs font-medium text-[#6B6759] mb-1.5">
            <Compass className="w-4 h-4 text-[#8C6D23]" />
            <span>Catálogo único</span>
          </div>
          <p className="font-mono-tabular text-2xl font-semibold text-[#163326]">
            {totalGames} jogos
          </p>
          <p className="mt-1 text-xs text-[#6B6759]">
            Sem duplicatas por console ou remake
          </p>
        </div>

        <div className="rounded-xl border border-[#DED7C4] bg-[#FBF9F3] p-5">
          <div className="flex items-center gap-2 text-xs font-medium text-[#6B6759] mb-1.5">
            <Layers className="w-4 h-4 text-[#8C6D23]" />
            <span>Categorias disponíveis</span>
          </div>
          <p className="font-mono-tabular text-2xl font-semibold text-[#163326]">
            {categoriesCount} grupos
          </p>
          <p className="mt-1 text-xs text-[#6B6759]">
            Principais, Spin-offs e Especiais
          </p>
        </div>

        <div className="rounded-xl border border-[#DED7C4] bg-[#FBF9F3] p-5">
          <div className="flex items-center gap-2 text-xs font-medium text-[#6B6759] mb-1.5">
            <Clock className="w-4 h-4 text-[#8C6D23]" />
            <span>Tempo estimado</span>
          </div>
          <p className="font-mono-tabular text-2xl font-semibold text-[#163326]">
            3–5 min
          </p>
          <p className="mt-1 text-xs text-[#6B6759]">
            Responda uma vez por título único
          </p>
        </div>

        <div className="rounded-xl border border-[#DED7C4] bg-[#FBF9F3] p-5">
          <div className="flex items-center gap-2 text-xs font-medium text-[#6B6759] mb-1.5">
            <Award className="w-4 h-4 text-[#8C6D23]" />
            <span>Pontuação exclusiva</span>
          </div>
          <p className="font-mono-tabular text-2xl font-semibold text-[#163326]">
            0 a 100
          </p>
          <p className="mt-1 text-xs text-[#6B6759]">
            Zelda Score dinâmico + card em PNG
          </p>
        </div>
      </section>

      {/* How the Journey & Zelda Score Work */}
      <section className="rounded-2xl border border-[#DED7C4] bg-[#FBF9F3] p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E5DFCE]">
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-semibold text-[#142D21]">
              Como sua jornada é avaliada
            </h2>
            <p className="mt-1 text-sm text-[#5A574C]">
              Medimos quantos títulos diferentes da franquia Zelda você explorou, sem inflar a contagem com relançamentos.
            </p>
          </div>
          <span className="text-xs font-mono-tabular text-[#8C6D23] font-medium">
            Total máximo: 100 pontos
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div>
            <p className="text-xs font-semibold text-[#8C6D23] mb-1">01. Experiência por título único</p>
            <h3 className="text-base font-semibold text-[#1A1D18]">
              21 jogos principais e categorias extras
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-[#5A574C]">
              Os 21 capítulos centrais respondem por 60 pontos (35 de cobertura e 25 de conclusão), enquanto Spin-offs e Especiais somam até 15 pontos.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold text-[#8C6D23] mb-1">02. Linhas do tempo e atividade</p>
            <h3 className="text-base font-semibold text-[#1A1D18]">
              Cronologia e ritmo nos últimos 30 dias
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-[#5A574C]">
              Explorar as 4 grandes ramificações da cronologia vale 5 pontos e sua frequência recente nos últimos 30 dias compõe até 20 pontos do perfil.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold text-[#8C6D23] mb-1">03. Painel, medalhas e card PNG</p>
            <h3 className="text-base font-semibold text-[#1A1D18]">
              Estatísticas precisas e exportação
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-[#5A574C]">
              Receba gráficos baseados exclusivamente em jogos únicos, desbloqueie 10 medalhas, exporte para Excel/CSV e baixe seu card personalizado.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

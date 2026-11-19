import React from 'react';
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';
import {
  AdditionalQuestions,
  LastPlayedOption,
  ReplayHabitOption,
  ZeldaGame,
} from '../types/zelda';
import { getRecentActivityPoints } from '../utils/scoring';

interface AdditionalQuestionsViewProps {
  games: ZeldaGame[];
  questions: AdditionalQuestions;
  onChange: (updated: AdditionalQuestions) => void;
  onBackToCatalog: () => void;
  onFinishQuiz: () => void;
}

const LAST_PLAYED_OPTIONS: Exclude<LastPlayedOption, ''>[] = [
  'Hoje',
  'Esta semana',
  'Este mês',
  'Nos últimos 6 meses',
  'Há mais de 6 meses',
  'Há mais de 1 ano',
  'Nunca joguei',
];

const REPLAY_OPTIONS: Exclude<ReplayHabitOption, ''>[] = [
  'Sim, frequentemente',
  'Às vezes',
  'Raramente',
  'Não costumo',
];

const TIMELINE_INTEREST_OPTIONS = [
  'Antes da divisão',
  'Herói Caído',
  'Herói Criança',
  'Herói Adulto',
  'Era Selvagem',
  'Todas as linhas igualmente',
];

const DAYS_PRESETS = [
  { label: '0 dias', value: 0, pts: 0 },
  { label: '1–2 dias', value: 2, pts: 5 },
  { label: '3–5 dias', value: 4, pts: 10 },
  { label: '6–10 dias', value: 8, pts: 15 },
  { label: '11+ dias', value: 15, pts: 20 },
];

export const AdditionalQuestionsView: React.FC<AdditionalQuestionsViewProps> = ({
  games,
  questions,
  onChange,
  onBackToCatalog,
  onFinishQuiz,
}) => {
  const uniqueConsoles = Array.from(new Set(games.map((g) => g.console)));
  const recentPts = getRecentActivityPoints(questions.daysPlayedLast30);

  const updateField = <K extends keyof AdditionalQuestions>(
    field: K,
    value: AdditionalQuestions[K]
  ) => {
    onChange({
      ...questions,
      [field]: value,
    });
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="rounded-2xl border border-[#DED7C4] bg-[#FBF9F3] p-6 sm:p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#8C6D23]">
          Etapa 2 de 2 · Perfil Complementar
        </p>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#142D21] mt-1">
          Conte mais sobre sua relação com a franquia
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[#5A574C]">
          Essas perguntas enriquecem seu perfil de aventureiro e definem sua pontuação de atividade recente (até 20 pontos), sem alterar a contagem real de jogos que você avaliou no catálogo.
        </p>
      </div>

      <div className="rounded-2xl border border-[#DED7C4] bg-[#FBF9F3] p-6 sm:p-8 space-y-7 shadow-sm">
        {/* Q1 */}
        <div>
          <label
            htmlFor="q-first-game"
            className="block text-sm sm:text-base font-semibold text-[#163326] mb-1.5"
          >
            1. Qual foi o primeiro jogo de Zelda que você jogou?
          </label>
          <input
            id="q-first-game"
            type="text"
            list="zelda-games-list"
            value={questions.firstGame}
            onChange={(e) => updateField('firstGame', e.target.value)}
            placeholder="Selecione na lista ou digite o título (deixe vazio para Não informado)"
            className="w-full rounded-lg border border-[#CFC7B2] bg-white px-4 py-2.5 text-sm text-[#1A1D18] focus:border-[#1B4332] focus:outline-none focus:ring-2 focus:ring-[#1B4332]/15"
          />
        </div>

        {/* Q2 */}
        <div>
          <label
            htmlFor="q-fav-game"
            className="block text-sm sm:text-base font-semibold text-[#163326] mb-1.5"
          >
            2. Qual é seu jogo favorito da franquia?
          </label>
          <input
            id="q-fav-game"
            type="text"
            list="zelda-games-list"
            value={questions.favoriteGame}
            onChange={(e) => updateField('favoriteGame', e.target.value)}
            placeholder="Selecione na lista ou digite seu favorito"
            className="w-full rounded-lg border border-[#CFC7B2] bg-white px-4 py-2.5 text-sm text-[#1A1D18] focus:border-[#1B4332] focus:outline-none focus:ring-2 focus:ring-[#1B4332]/15"
          />
          <datalist id="zelda-games-list">
            {games.map((g) => (
              <option key={g.id} value={g.title} />
            ))}
          </datalist>
        </div>

        {/* Q3 */}
        <div>
          <label
            htmlFor="q-console"
            className="block text-sm sm:text-base font-semibold text-[#163326] mb-1.5"
          >
            3. Qual console você mais utilizou para jogar Zelda?
          </label>
          <select
            id="q-console"
            value={questions.mostUsedConsole}
            onChange={(e) => updateField('mostUsedConsole', e.target.value)}
            className="w-full rounded-lg border border-[#CFC7B2] bg-white px-4 py-2.5 text-sm text-[#1A1D18] focus:border-[#1B4332] focus:outline-none"
          >
            <option value="">Não informado</option>
            {uniqueConsoles.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
            <option value="Emulador / PC">Emulador / PC</option>
            <option value="Outro">Outro</option>
          </select>
        </div>

        {/* Q4 */}
        <div>
          <span className="block text-sm sm:text-base font-semibold text-[#163326] mb-2">
            4. Quando foi a última vez que você jogou algum título da franquia?
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {LAST_PLAYED_OPTIONS.map((opt) => {
              const active = questions.lastPlayed === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => updateField('lastPlayed', active ? '' : opt)}
                  className={`rounded-lg border px-3 py-2 text-xs sm:text-sm font-medium transition-colors cursor-pointer min-h-[40px] ${
                    active
                      ? 'border-[#1B4332] bg-[#1B4332] text-[#F6F3EA]'
                      : 'border-[#D4CCB8] bg-white text-[#2A2D25] hover:bg-[#F3EFE2]'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Q5 */}
        <div className="rounded-xl border border-[#DFD7C3] bg-[#F4EFE2] p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <label
                htmlFor="q-days-30"
                className="block text-sm sm:text-base font-semibold text-[#163326]"
              >
                5. Quantos dias você jogou Zelda nos últimos 30 dias?
              </label>
              <p className="text-xs text-[#5A574C] mt-0.5">
                Critério de atividade recente: vale até 20 pontos no Zelda Score.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="font-mono-tabular text-sm font-semibold text-[#163326]">
                {questions.daysPlayedLast30 === null
                  ? 'Não informado'
                  : `${questions.daysPlayedLast30} ${
                      questions.daysPlayedLast30 === 1 ? 'dia' : 'dias'
                    } (${recentPts} pts)`}
              </span>
              {questions.daysPlayedLast30 !== null && (
                <button
                  type="button"
                  onClick={() => updateField('daysPlayedLast30', null)}
                  className="inline-flex items-center gap-1 rounded border border-[#CFC7B2] bg-white px-2 py-1 text-xs text-[#4A473E] hover:bg-[#EFECE1] cursor-pointer"
                  title="Marcar como não informado"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Limpar</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {DAYS_PRESETS.map((preset) => {
              const d = questions.daysPlayedLast30;
              const isSelected =
                d !== null &&
                ((preset.value === 0 && d === 0) ||
                  (preset.value === 2 && d >= 1 && d <= 2) ||
                  (preset.value === 4 && d >= 3 && d <= 5) ||
                  (preset.value === 8 && d >= 6 && d <= 10) ||
                  (preset.value === 15 && d >= 11));
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => updateField('daysPlayedLast30', preset.value)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                    isSelected
                      ? 'border-[#1B4332] bg-[#1B4332] text-[#F6F3EA]'
                      : 'border-[#CFC7B2] bg-white text-[#2A2D25] hover:bg-[#EAE4D3]'
                  }`}
                >
                  {preset.label} ({preset.pts} pts)
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-4">
            <input
              id="q-days-30"
              type="range"
              min={0}
              max={30}
              value={questions.daysPlayedLast30 ?? 0}
              onChange={(e) => updateField('daysPlayedLast30', Number(e.target.value))}
              className="w-full accent-[#1B4332] cursor-pointer"
            />
            <input
              type="number"
              min={0}
              max={30}
              value={questions.daysPlayedLast30 ?? ''}
              placeholder="—"
              onChange={(e) => {
                const raw = e.target.value;
                if (raw === '') {
                  updateField('daysPlayedLast30', null);
                } else {
                  const n = Math.max(0, Math.min(30, Number(raw)));
                  if (!Number.isNaN(n)) updateField('daysPlayedLast30', n);
                }
              }}
              aria-label="Número exato de dias jogados nos últimos 30 dias"
              className="w-20 rounded-lg border border-[#CFC7B2] bg-white px-2.5 py-1.5 text-center text-sm font-mono-tabular text-[#1A1D18] focus:border-[#1B4332] focus:outline-none"
            />
          </div>
        </div>

        {/* Q6 */}
        <div>
          <span className="block text-sm sm:text-base font-semibold text-[#163326] mb-2">
            6. Você costuma rejogar os títulos que já terminou?
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {REPLAY_OPTIONS.map((opt) => {
              const active = questions.replaysGames === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => updateField('replaysGames', active ? '' : opt)}
                  className={`rounded-lg border px-3 py-2 text-xs sm:text-sm font-medium transition-colors cursor-pointer min-h-[40px] ${
                    active
                      ? 'border-[#1B4332] bg-[#1B4332] text-[#F6F3EA]'
                      : 'border-[#D4CCB8] bg-white text-[#2A2D25] hover:bg-[#F3EFE2]'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Q7 */}
        <div>
          <span className="block text-sm sm:text-base font-semibold text-[#163326] mb-2">
            7. Qual linha do tempo mais desperta seu interesse?
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {TIMELINE_INTEREST_OPTIONS.map((opt) => {
              const active = questions.favoriteTimeline === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => updateField('favoriteTimeline', active ? '' : opt)}
                  className={`rounded-lg border px-3 py-2 text-xs sm:text-sm font-medium transition-colors cursor-pointer min-h-[40px] ${
                    active
                      ? 'border-[#1B4332] bg-[#1B4332] text-[#F6F3EA]'
                      : 'border-[#D4CCB8] bg-white text-[#2A2D25] hover:bg-[#F3EFE2]'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBackToCatalog}
          className="inline-flex items-center gap-2 rounded-lg border border-[#CFC7B2] bg-[#FBF9F3] px-4 py-2.5 text-sm font-medium text-[#2A2D25] hover:bg-[#EFECE1] transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Catálogo</span>
        </button>

        <button
          type="button"
          onClick={onFinishQuiz}
          className="inline-flex items-center gap-2 rounded-lg bg-[#1B4332] px-6 py-3 text-sm font-semibold text-[#F6F3EA] hover:bg-[#143326] shadow-sm transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <span>Calcular meu Zelda Score</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

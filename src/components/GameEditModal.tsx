import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { GameCategory, ZeldaGame } from '../types/zelda';

interface GameEditModalProps {
  isOpen: boolean;
  gameToEdit: ZeldaGame | null;
  existingConsoles: string[];
  existingTimelines: string[];
  nextNumber: number;
  onClose: () => void;
  onSave: (game: ZeldaGame) => void;
}

const CATEGORIES: GameCategory[] = ['Jogo principal', 'Spin-off', 'Especial'];

export const GameEditModal: React.FC<GameEditModalProps> = ({
  isOpen,
  gameToEdit,
  existingConsoles,
  existingTimelines,
  nextNumber,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<GameCategory>('Spin-off');
  const [consoleName, setConsoleName] = useState('');
  const [platformsText, setPlatformsText] = useState('');
  const [linkedEditionsText, setLinkedEditionsText] = useState('');
  const [timeline, setTimeline] = useState('Fora da cronologia');
  const [releaseYear, setReleaseYear] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [coverSource, setCoverSource] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    if (gameToEdit) {
      setTitle(gameToEdit.title);
      setCategory(gameToEdit.category);
      setConsoleName(gameToEdit.console);
      setPlatformsText(
        (gameToEdit.platforms?.length ? gameToEdit.platforms : [gameToEdit.console]).join(', ')
      );
      setLinkedEditionsText(gameToEdit.linkedEditions?.join(', ') ?? '');
      setTimeline(gameToEdit.timeline);
      setReleaseYear(gameToEdit.releaseYear ? String(gameToEdit.releaseYear) : '');
      setCoverUrl(gameToEdit.coverUrl ?? '');
      setCoverSource(gameToEdit.coverSource ?? '');
    } else {
      setTitle('');
      setCategory('Spin-off');
      setConsoleName('Nintendo Switch');
      setPlatformsText('Nintendo Switch');
      setLinkedEditionsText('');
      setTimeline('Fora da cronologia');
      setReleaseYear('');
      setCoverUrl('');
      setCoverSource('');
    }
    setError('');
  }, [isOpen, gameToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !consoleName.trim() || !timeline.trim()) {
      setError('Preencha nome do jogo, plataforma original e linha do tempo.');
      return;
    }

    const parsedYear = releaseYear.trim() ? Number(releaseYear.trim()) : null;
    if (
      parsedYear !== null &&
      (Number.isNaN(parsedYear) || parsedYear < 1980 || parsedYear > 2035)
    ) {
      setError('Informe um ano válido entre 1980 e 2035, ou deixe em branco.');
      return;
    }

    const parsedPlatforms = platformsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const parsedEditions = linkedEditionsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const trimmedUrl = coverUrl.trim();
    const savedGame: ZeldaGame = {
      id: gameToEdit ? gameToEdit.id : `custom-${Date.now()}`,
      number: gameToEdit ? gameToEdit.number : nextNumber,
      title: title.trim(),
      category,
      console: consoleName.trim(),
      platforms: parsedPlatforms.length > 0 ? parsedPlatforms : [consoleName.trim()],
      linkedEditions: parsedEditions.length > 0 ? parsedEditions : undefined,
      timeline: timeline.trim(),
      releaseYear: parsedYear,
      coverUrl: trimmedUrl || null,
      coverSource: trimmedUrl
        ? coverSource.trim() || 'URL informada pelo jogador'
        : null,
      wikiTitle: gameToEdit?.wikiTitle ?? null,
      isCustom: gameToEdit ? gameToEdit.isCustom : true,
    };

    onSave(savedGame);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="game-modal-title"
    >
      <div className="w-full max-w-xl rounded-xl border border-[#D4CCB8] bg-[#FBF9F3] shadow-xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#E3DCCB] px-6 py-4 bg-[#F3EFE2]">
          <h2 id="game-modal-title" className="font-display text-lg font-semibold text-[#163326]">
            {gameToEdit ? 'Editar título do catálogo' : 'Adicionar novo jogo único ao catálogo'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#5A574C] hover:bg-[#E5DFCE] hover:text-[#1A1D18] transition-colors"
            aria-label="Fechar janela"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <p className="rounded-lg border border-red-300 bg-red-50 px-3.5 py-2.5 text-sm text-red-800">
              {error}
            </p>
          )}

          <div>
            <label className="block text-sm font-medium text-[#2A2D25] mb-1">
              Nome completo do jogo *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex.: The Legend of Zelda: ..."
              className="w-full rounded-lg border border-[#CFC7B2] bg-white px-3.5 py-2.5 text-sm text-[#1A1D18] focus:border-[#1B4332] focus:outline-none focus:ring-2 focus:ring-[#1B4332]/15"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#2A2D25] mb-1">
                Categoria *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as GameCategory)}
                className="w-full rounded-lg border border-[#CFC7B2] bg-white px-3.5 py-2.5 text-sm text-[#1A1D18] focus:border-[#1B4332] focus:outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2A2D25] mb-1">
                Ano original (se confirmado)
              </label>
              <input
                type="number"
                value={releaseYear}
                onChange={(e) => setReleaseYear(e.target.value)}
                placeholder="Ex.: 2023 (ou vazio)"
                className="w-full rounded-lg border border-[#CFC7B2] bg-white px-3.5 py-2.5 text-sm text-[#1A1D18] font-mono-tabular focus:border-[#1B4332] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#2A2D25] mb-1">
                Plataforma de lançamento original *
              </label>
              <input
                type="text"
                list="zelda-console-options"
                value={consoleName}
                onChange={(e) => setConsoleName(e.target.value)}
                placeholder="Ex.: Nintendo Switch"
                className="w-full rounded-lg border border-[#CFC7B2] bg-white px-3.5 py-2.5 text-sm text-[#1A1D18] focus:border-[#1B4332] focus:outline-none"
              />
              <datalist id="zelda-console-options">
                {existingConsoles.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2A2D25] mb-1">
                Linha do tempo *
              </label>
              <input
                type="text"
                list="zelda-timeline-options"
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                placeholder="Ex.: Era Selvagem"
                className="w-full rounded-lg border border-[#CFC7B2] bg-white px-3.5 py-2.5 text-sm text-[#1A1D18] focus:border-[#1B4332] focus:outline-none"
              />
              <datalist id="zelda-timeline-options">
                {existingTimelines.map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2A2D25] mb-1">
              Todas as plataformas (separadas por vírgula)
            </label>
            <input
              type="text"
              value={platformsText}
              onChange={(e) => setPlatformsText(e.target.value)}
              placeholder="Ex.: Nintendo 64, GameCube, Nintendo 3DS"
              className="w-full rounded-lg border border-[#CFC7B2] bg-white px-3.5 py-2.5 text-sm text-[#1A1D18] focus:border-[#1B4332] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2A2D25] mb-1">
              Remakes / versões vinculadas a este título (opcional, separadas por vírgula)
            </label>
            <input
              type="text"
              value={linkedEditionsText}
              onChange={(e) => setLinkedEditionsText(e.target.value)}
              placeholder="Ex.: Ocarina of Time 3D, Master Quest"
              className="w-full rounded-lg border border-[#CFC7B2] bg-white px-3.5 py-2.5 text-sm text-[#1A1D18] focus:border-[#1B4332] focus:outline-none"
            />
          </div>

          <div className="pt-2 border-t border-[#E6DFCE]">
            <label className="block text-sm font-medium text-[#2A2D25] mb-1">
              URL da imagem oficial da capa (opcional)
            </label>
            <input
              type="url"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-lg border border-[#CFC7B2] bg-white px-3.5 py-2.5 text-sm text-[#1A1D18] focus:border-[#1B4332] focus:outline-none"
            />
            <p className="mt-1 text-xs text-[#6B6759]">
              Deixe em branco para manter o espaço reservado oficial com o nome do jogo.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2A2D25] mb-1">
              Origem registrada da imagem
            </label>
            <input
              type="text"
              value={coverSource}
              onChange={(e) => setCoverSource(e.target.value)}
              placeholder="Ex.: Wikipedia / Site oficial Nintendo"
              className="w-full rounded-lg border border-[#CFC7B2] bg-white px-3.5 py-2.5 text-sm text-[#1A1D18] focus:border-[#1B4332] focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E3DCCB]">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[#CFC7B2] px-4 py-2 text-sm font-medium text-[#3C3A32] hover:bg-[#EFECE1] transition-colors whitespace-nowrap shrink-0"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#1B4332] px-5 py-2 text-sm font-semibold text-[#F6F3EA] hover:bg-[#143326] transition-colors whitespace-nowrap shrink-0"
            >
              {gameToEdit ? 'Salvar alterações' : 'Adicionar ao catálogo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

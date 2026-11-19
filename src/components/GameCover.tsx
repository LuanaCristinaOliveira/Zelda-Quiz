import React, { useState, useEffect } from 'react';
import { ZeldaGame } from '../types/zelda';
import { TriforceEmblem } from './HyruleMark';

interface GameCoverProps {
  game: ZeldaGame;
  compact?: boolean;
}

export const GameCover: React.FC<GameCoverProps> = ({ game, compact = false }) => {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [game.coverUrl]);

  const showImage = Boolean(game.coverUrl) && !imgError;

  if (showImage) {
    return (
      <div
        className={`relative w-full overflow-hidden bg-[#172820] border-b border-[#DED7C4] flex items-center justify-center ${
          compact ? 'h-40' : 'h-52'
        }`}
      >
        <img
          src={game.coverUrl ?? undefined}
          alt={`Capa de ${game.title}`}
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={() => setImgError(true)}
          className="h-full w-full object-contain p-2.5 transition-transform duration-200 group-hover:scale-[1.02]"
        />
      </div>
    );
  }

  // Official archival placeholder when no verified edition cover is available
  return (
    <div
      className={`relative w-full overflow-hidden border-b border-[#DED7C4] bg-gradient-to-br from-[#163326] via-[#1C3D2E] to-[#11241B] text-[#F4EFE2] flex flex-col justify-between p-4 ${
        compact ? 'h-40' : 'h-52'
      }`}
    >
      <div className="flex items-center justify-between text-[11px] tracking-wider uppercase text-[#C59B38]/90 font-medium">
        <span className="truncate pr-2">{game.console}</span>
        <span className="font-mono-tabular shrink-0">
          {game.releaseYear ?? 'Ano n/d'}
        </span>
      </div>

      <div className="my-auto flex flex-col items-center text-center px-2">
        <TriforceEmblem className="w-7 h-7 text-[#C59B38]/75 mb-2" />
        <p className="font-display text-sm sm:text-base font-semibold leading-snug text-[#F6F3EA] line-clamp-3 text-balance">
          {game.title}
        </p>
      </div>

      <div className="flex items-center justify-between text-[11px] text-[#C8C3B2]/80 border-t border-white/10 pt-2">
        <span className="truncate">{game.category}</span>
        <span className="shrink-0">Acervo sem capa</span>
      </div>
    </div>
  );
};

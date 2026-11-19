import React, { useState } from 'react';
import { Download, Check } from 'lucide-react';
import { PlayerMetrics, ZeldaScoreBreakdown } from '../types/zelda';
import { TriforceEmblem } from './HyruleMark';

interface ShareCardSectionProps {
  score: ZeldaScoreBreakdown;
  metrics: PlayerMetrics;
  favoriteGame: string;
  playerName: string;
  customPhrase: string;
  onPlayerNameChange: (name: string) => void;
  onPhraseChange: (phrase: string) => void;
}

function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const words = text.split(' ');
  let line = '';
  let currentY = y;

  for (let i = 0; i < words.length; i++) {
    const testLine = line + (line ? ' ' : '') + words[i];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line) {
      ctx.fillText(line, x, currentY);
      line = words[i];
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line) {
    ctx.fillText(line, x, currentY);
    currentY += lineHeight;
  }
  return currentY;
}

export const ShareCardSection: React.FC<ShareCardSectionProps> = ({
  score,
  metrics,
  favoriteGame,
  playerName,
  customPhrase,
  onPlayerNameChange,
  onPhraseChange,
}) => {
  const [format, setFormat] = useState<'stories' | 'feed'>('stories');
  const [downloaded, setDownloaded] = useState(false);

  const effectiveName = playerName.trim() || 'Herói de Hyrule';
  const effectivePhrase =
    customPhrase.trim() ||
    `Minha jornada por Hyrule já soma ${metrics.totalCompleted} aventuras concluídas!`;
  const effectiveFavorite = favoriteGame.trim() || 'Não informado';

  const handleDownloadPng = async () => {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }

    const width = 1080;
    const height = format === 'stories' ? 1920 : 1350;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Deep Forest Gradient Background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#0F241A');
    bgGrad.addColorStop(0.55, '#173828');
    bgGrad.addColorStop(1, '#0D1F16');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle radial golden glow behind score
    const glow = ctx.createRadialGradient(
      width / 2,
      format === 'stories' ? 620 : 470,
      40,
      width / 2,
      format === 'stories' ? 620 : 470,
      420
    );
    glow.addColorStop(0, 'rgba(197, 155, 56, 0.16)');
    glow.addColorStop(1, 'rgba(197, 155, 56, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);

    // 2. Outer Golden Archival Frame
    ctx.strokeStyle = 'rgba(197, 155, 56, 0.55)';
    ctx.lineWidth = 4;
    ctx.strokeRect(48, 48, width - 96, height - 96);

    ctx.strokeStyle = 'rgba(197, 155, 56, 0.22)';
    ctx.lineWidth = 2;
    ctx.strokeRect(66, 66, width - 132, height - 132);

    // 3. Top Header & Geometric Triforce
    const drawTriangle = (cx: number, topY: number, size: number) => {
      const h = (size * Math.sqrt(3)) / 2;
      ctx.beginPath();
      ctx.moveTo(cx, topY);
      ctx.lineTo(cx + size / 2, topY + h);
      ctx.lineTo(cx - size / 2, topY + h);
      ctx.closePath();
      ctx.fillStyle = 'rgba(197, 155, 56, 0.28)';
      ctx.fill();
      ctx.strokeStyle = '#C59B38';
      ctx.lineWidth = 3;
      ctx.stroke();
    };

    const triTop = format === 'stories' ? 140 : 105;
    drawTriangle(width / 2, triTop, 42);
    drawTriangle(width / 2 - 21, triTop + 36.4, 42);
    drawTriangle(width / 2 + 21, triTop + 36.4, 42);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#C59B38';
    ctx.font = '600 26px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('ZELDA GAMER PROFILE', width / 2, triTop + 128);

    ctx.fillStyle = '#F6F3EA';
    ctx.font = '700 44px "Cinzel", Georgia, serif';
    ctx.fillText(effectiveName, width / 2, triTop + 190);

    // 4. Score Ring
    const ringCy = format === 'stories' ? 620 : 475;
    const ringR = format === 'stories' ? 185 : 150;

    ctx.beginPath();
    ctx.arc(width / 2, ringCy, ringR, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(246, 243, 234, 0.14)';
    ctx.lineWidth = 20;
    ctx.stroke();

    const endAngle = -Math.PI / 2 + (score.totalScore / 100) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(width / 2, ringCy, ringR, -Math.PI / 2, endAngle);
    ctx.strokeStyle = '#C59B38';
    ctx.lineWidth = 20;
    ctx.lineCap = 'round';
    ctx.stroke();

    ctx.fillStyle = '#C59B38';
    ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('SEU ZELDA SCORE', width / 2, ringCy - 56);

    ctx.fillStyle = '#F6F3EA';
    ctx.font = '700 108px "JetBrains Mono", monospace';
    ctx.fillText(`${score.totalScore}`, width / 2, ringCy + 34);

    ctx.fillStyle = '#B8B29F';
    ctx.font = '500 30px "JetBrains Mono", monospace';
    ctx.fillText('de 100 pontos', width / 2, ringCy + 82);

    // 5. Classification
    const classY = ringCy + ringR + 88;
    ctx.fillStyle = '#E6C667';
    ctx.font = '700 48px "Cinzel", Georgia, serif';
    ctx.fillText(score.classification, width / 2, classY);

    // 6. Stats Row
    const statsY = classY + 75;
    const boxW = 410;
    const boxH = 148;
    const gap = 36;
    const leftX = width / 2 - boxW - gap / 2;
    const rightX = width / 2 + gap / 2;

    const drawStatBox = (bx: number, by: number, label: string, val: string) => {
      ctx.fillStyle = 'rgba(246, 243, 234, 0.06)';
      ctx.fillRect(bx, by, boxW, boxH);
      ctx.strokeStyle = 'rgba(197, 155, 56, 0.35)';
      ctx.lineWidth = 2;
      ctx.strokeRect(bx, by, boxW, boxH);

      ctx.fillStyle = '#C8C2B0';
      ctx.font = '500 24px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(label, bx + boxW / 2, by + 52);

      ctx.fillStyle = '#F6F3EA';
      ctx.font = '700 52px "JetBrains Mono", monospace';
      ctx.fillText(val, bx + boxW / 2, by + 115);
    };

    drawStatBox(leftX, statsY, 'JOGOS JOGADOS', String(metrics.totalPlayed));
    drawStatBox(rightX, statsY, 'JOGOS CONCLUÍDOS', String(metrics.totalCompleted));

    // 7. Favorite Game Box
    const favY = statsY + boxH + 34;
    const fullBoxW = boxW * 2 + gap;
    ctx.fillStyle = 'rgba(246, 243, 234, 0.06)';
    ctx.fillRect(leftX, favY, fullBoxW, 134);
    ctx.strokeStyle = 'rgba(197, 155, 56, 0.35)';
    ctx.lineWidth = 2;
    ctx.strokeRect(leftX, favY, fullBoxW, 134);

    ctx.fillStyle = '#C59B38';
    ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('JOGO FAVORITO DA FRANQUIA', width / 2, favY + 46);

    ctx.fillStyle = '#F6F3EA';
    ctx.font = '600 32px "Cinzel", Georgia, serif';
    const favText =
      effectiveFavorite.length > 42
        ? effectiveFavorite.slice(0, 40) + '...'
        : effectiveFavorite;
    ctx.fillText(favText, width / 2, favY + 96);

    // 8. Personalized Phrase
    const phraseY = favY + 210;
    ctx.fillStyle = '#E8E3D5';
    ctx.font = 'italic 32px Georgia, serif';
    drawWrappedText(ctx, `“${effectivePhrase}”`, width / 2, phraseY, 820, 46);

    // 9. Footer
    ctx.fillStyle = 'rgba(200, 194, 176, 0.72)';
    ctx.font = '500 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(
      `Principais: ${metrics.mainExplored}/21 · Consoles: ${metrics.uniqueConsolesCount}`,
      width / 2,
      height - 105
    );

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `zelda-score-${score.totalScore}-${format}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  return (
    <section
      id="share-card-section"
      className="rounded-2xl border border-[#DED7C4] bg-[#FBF9F3] p-6 sm:p-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E5DFCE]">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-semibold text-[#142D21]">
            Card compartilhável da sua jornada
          </h2>
          <p className="mt-1 text-sm text-[#5A574C]">
            Personalize seu nome e frase para compartilhar no Instagram Stories, WhatsApp ou redes sociais.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-lg bg-[#EAE4D3] shrink-0">
          <button
            type="button"
            onClick={() => setFormat('stories')}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              format === 'stories'
                ? 'bg-white text-[#163326] shadow-sm'
                : 'text-[#5A574C] hover:text-[#163326]'
            }`}
          >
            Stories (9:16)
          </button>
          <button
            type="button"
            onClick={() => setFormat('feed')}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              format === 'feed'
                ? 'bg-white text-[#163326] shadow-sm'
                : 'text-[#5A574C] hover:text-[#163326]'
            }`}
          >
            Feed (4:5)
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Customization Controls */}
        <div className="lg:col-span-5 space-y-5">
          <div>
            <label
              htmlFor="share-player-name"
              className="block text-sm font-medium text-[#2A2D25] mb-1.5"
            >
              Nome ou apelido do jogador
            </label>
            <input
              id="share-player-name"
              type="text"
              maxLength={32}
              value={playerName}
              onChange={(e) => onPlayerNameChange(e.target.value)}
              placeholder="Herói de Hyrule"
              className="w-full rounded-lg border border-[#CFC7B2] bg-white px-3.5 py-2.5 text-sm text-[#1A1D18] focus:border-[#1B4332] focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="share-custom-phrase"
              className="block text-sm font-medium text-[#2A2D25] mb-1.5"
            >
              Frase personalizada no card
            </label>
            <textarea
              id="share-custom-phrase"
              rows={3}
              maxLength={140}
              value={customPhrase}
              onChange={(e) => onPhraseChange(e.target.value)}
              placeholder={`Minha jornada por Hyrule já soma ${metrics.totalCompleted} aventuras concluídas!`}
              className="w-full rounded-lg border border-[#CFC7B2] bg-white px-3.5 py-2.5 text-sm text-[#1A1D18] focus:border-[#1B4332] focus:outline-none"
            />
            <p className="mt-1 text-xs text-[#6A6658]">
              Sugestão automática aplicada caso deixe em branco.
            </p>
          </div>

          <button
            type="button"
            onClick={handleDownloadPng}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#1B4332] px-5 py-3 text-sm font-semibold text-[#F6F3EA] hover:bg-[#143326] shadow-sm transition-colors cursor-pointer"
          >
            {downloaded ? (
              <>
                <Check className="w-4 h-4 text-[#E6C667]" />
                <span>PNG baixado com sucesso!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Baixar card em PNG ({format === 'stories' ? '1080×1920' : '1080×1350'})</span>
              </>
            )}
          </button>
        </div>

        {/* Live Visual Preview */}
        <div className="lg:col-span-7 flex justify-center">
          <div
            className={`w-full max-w-[360px] rounded-2xl bg-gradient-to-b from-[#0F241A] via-[#173828] to-[#0D1F16] p-5 text-[#F6F3EA] shadow-lg border border-[#C59B38]/40 flex flex-col justify-between ${
              format === 'stories' ? 'aspect-[9/16]' : 'aspect-[4/5]'
            }`}
          >
            <div className="border border-[#C59B38]/30 rounded-xl p-4 sm:p-5 h-full flex flex-col items-center justify-between text-center">
              <div className="flex flex-col items-center">
                <TriforceEmblem className="w-8 h-8 text-[#C59B38] mb-2" />
                <span className="text-[10px] font-semibold tracking-[0.2em] text-[#C59B38]">
                  ZELDA GAMER PROFILE
                </span>
                <p className="font-display text-lg font-bold text-[#F6F3EA] mt-1">
                  {effectiveName}
                </p>
              </div>

              <div className="my-2 flex flex-col items-center">
                <div className="w-28 h-28 rounded-full border-4 border-[#C59B38]/80 bg-[#0F241A]/60 flex flex-col items-center justify-center">
                  <span className="text-[9px] uppercase tracking-wider text-[#C59B38]">
                    Zelda Score
                  </span>
                  <span className="font-mono-tabular text-3xl font-bold text-[#F6F3EA]">
                    {score.totalScore}
                  </span>
                  <span className="font-mono-tabular text-[10px] text-[#C8C2B0]">
                    / 100
                  </span>
                </div>
                <p className="font-display text-base font-bold text-[#E6C667] mt-3">
                  {score.classification}
                </p>
              </div>

              <div className="w-full space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg border border-[#C59B38]/30 bg-white/5 py-2 px-2">
                    <p className="text-[9px] uppercase tracking-wider text-[#C8C2B0]">
                      Jogados
                    </p>
                    <p className="font-mono-tabular text-lg font-bold text-[#F6F3EA]">
                      {metrics.totalPlayed}
                    </p>
                  </div>
                  <div className="rounded-lg border border-[#C59B38]/30 bg-white/5 py-2 px-2">
                    <p className="text-[9px] uppercase tracking-wider text-[#C8C2B0]">
                      Concluídos
                    </p>
                    <p className="font-mono-tabular text-lg font-bold text-[#F6F3EA]">
                      {metrics.totalCompleted}
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border border-[#C59B38]/30 bg-white/5 py-2 px-3">
                  <p className="text-[9px] uppercase tracking-wider text-[#C59B38]">
                    Jogo favorito
                  </p>
                  <p className="font-display text-xs font-semibold text-[#F6F3EA] truncate mt-0.5">
                    {effectiveFavorite}
                  </p>
                </div>

                <p className="text-xs italic text-[#E2DDD0] leading-snug pt-1 line-clamp-3">
                  “{effectivePhrase}”
                </p>
              </div>

              <p className="text-[10px] text-[#B8B29F]">
                Principais: {metrics.mainExplored}/21 · Consoles: {metrics.uniqueConsolesCount}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

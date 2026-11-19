import {
  AdditionalQuestions,
  GameStatus,
  PlayerMetrics,
  ZeldaGame,
  ZeldaScoreBreakdown,
} from '../types/zelda';
import { getStatusLabel } from './scoring';

function escapeCsvCell(value: string | number | null | undefined): string {
  const str = value === null || value === undefined ? '' : String(value);
  if (/[",\n\r;]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportProfileToCsv(
  games: ZeldaGame[],
  statuses: Record<string, GameStatus>,
  questions: AdditionalQuestions,
  score: ZeldaScoreBreakdown,
  metrics: PlayerMetrics,
  playerName: string
): void {
  const now = new Date().toLocaleString('pt-BR');
  const lines: string[] = [];

  lines.push(['ZELDA GAMER PROFILE - RELATÓRIO DE TÍTULOS ÚNICOS'].map(escapeCsvCell).join(';'));
  lines.push(['Jogador', playerName || 'Herói de Hyrule'].map(escapeCsvCell).join(';'));
  lines.push(['Exportado em', now].map(escapeCsvCell).join(';'));
  lines.push(['Zelda Score', `${score.totalScore}/100`].map(escapeCsvCell).join(';'));
  lines.push(['Classificação', score.classification].map(escapeCsvCell).join(';'));
  lines.push(['Jogos únicos jogados', metrics.totalPlayed].map(escapeCsvCell).join(';'));
  lines.push(['Jogos únicos concluídos', metrics.totalCompleted].map(escapeCsvCell).join(';'));
  lines.push(['Jogos com 100%', metrics.totalCompleted100].map(escapeCsvCell).join(';'));
  lines.push(
    ['Primeiro Zelda', questions.firstGame || 'Não informado'].map(escapeCsvCell).join(';')
  );
  lines.push(
    ['Jogo favorito', questions.favoriteGame || 'Não informado'].map(escapeCsvCell).join(';')
  );
  lines.push(
    ['Console mais utilizado', questions.mostUsedConsole || 'Não informado']
      .map(escapeCsvCell)
      .join(';')
  );
  lines.push(
    ['Última atividade', questions.lastPlayed || 'Não informado'].map(escapeCsvCell).join(';')
  );
  lines.push(
    [
      'Dias jogados nos últimos 30 dias',
      questions.daysPlayedLast30 !== null ? questions.daysPlayedLast30 : 'Não informado',
    ]
      .map(escapeCsvCell)
      .join(';')
  );
  lines.push(
    ['Costuma rejogar', questions.replaysGames || 'Não informado'].map(escapeCsvCell).join(';')
  );
  lines.push(
    ['Linha do tempo de maior interesse', questions.favoriteTimeline || 'Não informado']
      .map(escapeCsvCell)
      .join(';')
  );
  lines.push('');

  lines.push(
    [
      'Nº',
      'Categoria',
      'Nome do jogo',
      'Linha do tempo',
      'Plataformas disponíveis',
      'Edições vinculadas',
      'Ano original',
      'Status',
      'Origem da capa',
    ]
      .map(escapeCsvCell)
      .join(';')
  );

  for (const game of games) {
    const status = statuses[game.id] ?? 'unanswered';
    lines.push(
      [
        game.number,
        game.category,
        game.title,
        game.timeline,
        (game.platforms?.length ? game.platforms : [game.console]).join(', '),
        game.linkedEditions?.join(', ') ?? '',
        game.releaseYear ?? 'Não confirmado',
        getStatusLabel(status),
        game.coverSource ?? 'Espaço reservado',
      ]
        .map(escapeCsvCell)
        .join(';')
    );
  }

  const csvContent = '\uFEFF' + lines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const dateSlug = new Date().toISOString().slice(0, 10);
  link.download = `zelda-gamer-profile-${dateSlug}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

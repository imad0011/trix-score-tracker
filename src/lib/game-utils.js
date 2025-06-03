export const saveGameData = (gameId, data) => {
  try {
    const games = JSON.parse(localStorage.getItem('trixComplexGamesV5')) || {}; // Reverted to V5 for this rollback
    games[gameId] = data;
    localStorage.setItem('trixComplexGamesV5', JSON.stringify(games));
    return true;
  } catch (error) {
    console.error('خطأ في حفظ بيانات اللعبة:', error);
    return false;
  }
};

export const loadGameData = (gameId) => {
  try {
    const games = JSON.parse(localStorage.getItem('trixComplexGamesV5')) || {};
    return games[gameId] || null;
  } catch (error) {
    console.error('خطأ في تحميل بيانات اللعبة:', error);
    return null;
  }
};

export const getAllGames = () => {
  try {
    return JSON.parse(localStorage.getItem('trixComplexGamesV5')) || {};
  } catch (error) {
    console.error('خطأ في تحميل الألعاب:', error);
    return {};
  }
};

export const deleteGame = (gameId) => {
  try {
    const games = JSON.parse(localStorage.getItem('trixComplexGamesV5')) || {};
    if (games[gameId]) {
      delete games[gameId];
      localStorage.setItem('trixComplexGamesV5', JSON.stringify(games));
      return true;
    }
    return false;
  } catch (error) {
    console.error('خطأ في حذف اللعبة:', error);
    return false;
  }
};

export const generateGameId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
};

export const generatePlayerId = () => {
  return Math.random().toString(36).substring(2, 10);
};

export const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export const calculateTeamTotal = (rounds, teamId) => {
  return rounds.reduce((total, round) => {
    const teamScore = round.scores[teamId] || 0;
    return total + teamScore;
  }, 0);
};

export const TOTAL_KINGDOMS_PER_GAME = 4; 
export const TOTAL_TRICKS = 13;
export const TOTAL_DIAMONDS_CARDS = 13;
export const TOTAL_QUEENS = 4;
export const COMPLEX_TOTAL_NEGATIVE_POINTS = -500;


export const checkComplexGameOver = (game) => {
  return game.rounds.length >= TOTAL_KINGDOMS_PER_GAME;
};


export const getTeamRankings = (teams, rounds) => {
  return [...teams].sort((a, b) => {
    const totalA = calculateTeamTotal(rounds, a.id);
    const totalB = calculateTeamTotal(rounds, b.id);
    return totalA - totalB; 
  });
};

export const KINGDOM_TYPES = {
  TRIX: 'تركس',
  COMPLEX: 'كمبلكس',
};

export const TRIX_SCORES = {
  FIRST: 200,
  SECOND: 150,
  THIRD: 100,
  FOURTH: 50,
};

export const COMPLEX_ITEM_SCORES = {
  QUEEN: -25,
  QUEEN_DOUBLED: -50,
  KING_HEARTS: -75,
  KING_HEARTS_DOUBLED: -150,
  DIAMOND: -10, 
  TRICK: -15,
  PENALTY_SOLD_QUEEN: -25, 
  REWARD_SOLD_QUEEN: 25, 
  PENALTY_SOLD_KING_HEARTS: -75, 
  REWARD_SOLD_KING_HEARTS: 75, 
};

export const CARD_TYPES = {
  QUEEN_SPADES: 'QS',
  QUEEN_HEARTS: 'QH',
  QUEEN_CLUBS: 'QC',
  QUEEN_DIAMONDS: 'QD',
  KING_HEARTS: 'KH',
};

export const ALL_QUEENS = [CARD_TYPES.QUEEN_SPADES, CARD_TYPES.QUEEN_HEARTS, CARD_TYPES.QUEEN_CLUBS, CARD_TYPES.QUEEN_DIAMONDS];
export const DOUBLABLE_CARDS = [...ALL_QUEENS, CARD_TYPES.KING_HEARTS];

export const getPlayerTeam = (game, playerId) => {
  if (!game || !game.teams || !playerId) return null;
  return game.teams.find(team => team.players.some(p => p.id === playerId));
};

export const getPlayerById = (game, playerId) => {
  if (!game || !game.players || !playerId) return null;
  return game.players.find(p => p.id === playerId);
};

export const getInitialPlayerKingdomChoices = (players) => {
 return players.reduce((acc, player) => {
    acc[player.id] = { count: 0, types: [], completedKingdoms: 0 };
    return acc;
  }, {});
};

export const getInitialComplexEats = (teams) => {
  return teams.reduce((acc, team) => {
    acc[team.id] = { 
      queens: 0, 
      diamonds: 0, 
      tricks: 0, 
      kingHearts: false, 
      queenOfDiamondsCardEatenByTeam: false 
    };
    return acc;
  }, {});
};

export const getInitialComplexDoubles = (players) => {
  return players.reduce((acc, player) => {
    acc[player.id] = DOUBLABLE_CARDS.reduce((cardAcc, card) => ({ ...cardAcc, [card]: false }), 
      { 
        soldTo: DOUBLABLE_CARDS.reduce((soldAcc, card) => ({ ...soldAcc, [card]: null }), {}),
      });
    return acc;
  }, {});
};
import { COMPLEX_ITEM_SCORES, CARD_TYPES, ALL_QUEENS, getPlayerTeam, DOUBLABLE_CARDS, COMPLEX_TOTAL_NEGATIVE_POINTS, getPlayerById } from "@/lib/game-utils";

export const calculateComplexScores = (submittedComplexData, teams, players, game) => {
  const finalScores = teams.reduce((acc, team) => ({ ...acc, [team.id]: 0 }), {});
  const { eats, doubles } = submittedComplexData;

  // Step 1: Calculate base scores from eats (tricks, diamonds, queens, sheikh)
  teams.forEach(team => {
    const teamEats = eats[team.id] || {};
    
    // Add scores for tricks (latosh)
    finalScores[team.id] += (teamEats.tricks || 0) * COMPLEX_ITEM_SCORES.TRICK;
    
    // Add scores for diamonds
    finalScores[team.id] += (teamEats.diamonds || 0) * COMPLEX_ITEM_SCORES.DIAMOND;
    
    // Add scores for regular queens
    const queensCount = (teamEats.queens || 0);
    if (queensCount > 0) {
      finalScores[team.id] += queensCount * COMPLEX_ITEM_SCORES.QUEEN;
    }
    
    // Add score for King of Hearts (Sheikh Kaba)
    if (teamEats.kingHearts) {
      finalScores[team.id] += COMPLEX_ITEM_SCORES.KING_HEARTS;
    }
    
    // Add score for Queen of Diamonds if eaten as a card
    if (teamEats.queenOfDiamondsCardEatenByTeam) {
      finalScores[team.id] += COMPLEX_ITEM_SCORES.QUEEN;
      finalScores[team.id] += COMPLEX_ITEM_SCORES.QUEEN_DIAMONDS_EXTRA;
    }
  });

  // Step 2: Process doubles and selling points
  players.forEach(declarerPlayer => {
    const declarerTeam = getPlayerTeam(game, declarerPlayer.id);
    if (!declarerTeam) return;

    DOUBLABLE_CARDS.forEach(cardType => {
      const isDoubled = doubles[declarerPlayer.id]?.[cardType];
      if (!isDoubled) return;

      const soldToOpponentPlayerId = doubles[declarerPlayer.id]?.soldTo?.[cardType];
      
      if (soldToOpponentPlayerId) {
        // Card was doubled and sold to opponent
        const opponentPlayer = getPlayerById(game, soldToOpponentPlayerId);
        const opponentTeam = getPlayerTeam(game, opponentPlayer?.id);

        if (opponentTeam && opponentTeam.id !== declarerTeam.id) {
          // Add reward to declarer's team for selling
          if (cardType === CARD_TYPES.KING_HEARTS) {
            finalScores[declarerTeam.id] += COMPLEX_ITEM_SCORES.REWARD_SOLD_KING_HEARTS; // +75
            finalScores[opponentTeam.id] -= COMPLEX_ITEM_SCORES.REWARD_SOLD_KING_HEARTS; // -75
          } else {
            finalScores[declarerTeam.id] += COMPLEX_ITEM_SCORES.REWARD_SOLD_QUEEN; // +25
            finalScores[opponentTeam.id] -= COMPLEX_ITEM_SCORES.REWARD_SOLD_QUEEN; // -25
          }
        }
      } else {
        // Card was doubled but not sold
        if (cardType === CARD_TYPES.KING_HEARTS) {
          finalScores[declarerTeam.id] -= COMPLEX_ITEM_SCORES.REWARD_SOLD_KING_HEARTS; // -75
          const otherTeam = teams.find(t => t.id !== declarerTeam.id);
          if (otherTeam) {
            finalScores[otherTeam.id] += COMPLEX_ITEM_SCORES.REWARD_SOLD_KING_HEARTS; // +75
          }
        } else {
          finalScores[declarerTeam.id] -= COMPLEX_ITEM_SCORES.REWARD_SOLD_QUEEN; // -25
          const otherTeam = teams.find(t => t.id !== declarerTeam.id);
          if (otherTeam) {
            finalScores[otherTeam.id] += COMPLEX_ITEM_SCORES.REWARD_SOLD_QUEEN; // +25
          }
        }
      }
    });
  });
  
  return finalScores;
};
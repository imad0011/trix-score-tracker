import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateTeamTotal, checkComplexGameOver, saveGameData, KINGDOM_TYPES, TRIX_SCORES, COMPLEX_ITEM_SCORES, CARD_TYPES, ALL_QUEENS, DOUBLABLE_CARDS, getPlayerTeam, getPlayerById, getInitialPlayerKingdomChoices, getInitialComplexEats, getInitialComplexDoubles } from "@/lib/game-utils";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { Trophy, Save, RotateCcw, Home, Plus, Trash2 } from "lucide-react";

import KingdomSelectionDialog from "@/components/game/KingdomSelectionDialog";
import TrixScoreDialog from "@/components/game/TrixScoreDialog";
import ComplexScoreDialog from "@/components/game/ComplexScoreDialog";
import GameOverDialog from "@/components/game/GameOverDialog";
import DeleteRoundDialog from "@/components/game/DeleteRoundDialog";
import PlayerTurnSelectorDialog from "@/components/game/PlayerTurnSelectorDialog";
import GameBoardHeader from "@/components/game/GameBoardHeader";
import GameStatus from "@/components/game/GameStatus";
import ScoreTable from "@/components/game/ScoreTable";
import GameControls from "@/components/game/GameControls";
import { calculateComplexScores } from "@/lib/score-calculator";


const GameBoard = ({ game, onSaveGame, onNewGame, onBackToHome }) => {
  const [currentGame, setCurrentGame] = useState(game);
  const [showKingdomSelectionDialog, setShowKingdomSelectionDialog] = useState(false);
  const [showTrixScoreDialog, setShowTrixScoreDialog] = useState(false);
  const [showComplexScoreDialog, setShowComplexScoreDialog] = useState(false);
  const [showGameOverDialog, setShowGameOverDialog] = useState(false);
  const [showDeleteRoundDialog, setShowDeleteRoundDialog] = useState(false);
  const [showPlayerTurnSelector, setShowPlayerTurnSelector] = useState(false);
  
  const [roundToDelete, setRoundToDelete] = useState(null);
  const [trixRoundData, setTrixRoundData] = useState({ ranks: {} });
  const [complexRoundData, setComplexRoundData] = useState({ 
    eats: getInitialComplexEats(game.teams), 
    doubles: getInitialComplexDoubles(game.players) 
  });

  const { toast } = useToast();
  const { name: gameName, teams, players, rounds, playerKingdomChoices, currentKingdomPlayerId, totalKingdoms, currentTurnIndex, kingdomsPlayedThisTurn } = currentGame;
  const activePlayerForKingdom = getPlayerById(currentGame, currentKingdomPlayerId);

  useEffect(() => {
    if (!currentKingdomPlayerId && rounds.length < totalKingdoms) {
      setShowPlayerTurnSelector(true);
    } else if (activePlayerForKingdom && playerKingdomChoices[activePlayerForKingdom.id].count < 2 && kingdomsPlayedThisTurn < 2 && rounds.length < totalKingdoms) {
      setShowKingdomSelectionDialog(true);
    } else if (checkComplexGameOver(currentGame)) {
      setShowGameOverDialog(true);
    }
  }, [currentKingdomPlayerId, activePlayerForKingdom, playerKingdomChoices, kingdomsPlayedThisTurn, rounds.length, totalKingdoms, currentGame]);

  const handlePlayerSelectedForTurn = (playerId) => {
    setCurrentGame(prev => ({ ...prev, currentKingdomPlayerId: playerId, kingdomsPlayedThisTurn: 0 }));
    setShowPlayerTurnSelector(false);
  };

  const handleKingdomSelected = (selectedType) => {
    setShowKingdomSelectionDialog(false);
    if (!activePlayerForKingdom) return;

    const playerChoices = playerKingdomChoices[activePlayerForKingdom.id];
    if (playerChoices.types.includes(selectedType)) {
        toast({ title: "خطأ", description: `لقد اخترت مملكة ${selectedType} من قبل.`, variant: "destructive"});
        setShowKingdomSelectionDialog(true); 
        return;
    }

    if (selectedType === KINGDOM_TYPES.TRIX) {
      const initialRanks = players.reduce((acc, p) => ({ ...acc, [p.id]: '' }), {});
      setTrixRoundData({ ranks: initialRanks });
      setShowTrixScoreDialog(true);
    } else if (selectedType === KINGDOM_TYPES.COMPLEX) {
      setComplexRoundData({ 
        eats: getInitialComplexEats(teams), 
        doubles: getInitialComplexDoubles(players) 
      });
      setShowComplexScoreDialog(true);
    }
  };

  const addRound = (kingdomType, scoresForTeams, roundSpecificData = {}) => {
    if (!activePlayerForKingdom) return;

    const newRound = {
      id: Date.now(),
      kingdomPlayerId: activePlayerForKingdom.id,
      kingdomType: kingdomType,
      scores: scoresForTeams,
      roundData: roundSpecificData,
      timestamp: Date.now()
    };

    const updatedPlayerChoices = {
      ...playerKingdomChoices,
      [activePlayerForKingdom.id]: {
        ...playerKingdomChoices[activePlayerForKingdom.id],
        count: playerKingdomChoices[activePlayerForKingdom.id].count + 1,
        types: [...playerKingdomChoices[activePlayerForKingdom.id].types, kingdomType]
      }
    };
    
    let newKingdomsPlayedThisTurn = kingdomsPlayedThisTurn + 1;
    let nextPlayerIdForKingdom = currentKingdomPlayerId;
    let nextTurnIdx = currentTurnIndex;

    if (newKingdomsPlayedThisTurn >= 2) {
      updatedPlayerChoices[activePlayerForKingdom.id].completedKingdoms +=1;
      newKingdomsPlayedThisTurn = 0;
      nextPlayerIdForKingdom = null; 
      nextTurnIdx = (currentTurnIndex + 1) % players.length;
    }

    const updatedGame = {
      ...currentGame,
      rounds: [...rounds, newRound],
      playerKingdomChoices: updatedPlayerChoices,
      currentKingdomPlayerId: nextPlayerIdForKingdom,
      kingdomsPlayedThisTurn: newKingdomsPlayedThisTurn,
      currentTurnIndex: nextTurnIdx,
      lastUpdated: Date.now()
    };

    setCurrentGame(updatedGame);
    saveGameData(updatedGame.id, updatedGame);
    onSaveGame(updatedGame);

    toast({
      title: `تم تسجيل مملكة ${kingdomType}`,
      description: `بواسطة ${activePlayerForKingdom.name}`,
    });

    if (newKingdomsPlayedThisTurn === 1 && rounds.length +1 < totalKingdoms) {
        const remainingKingdom = updatedPlayerChoices[activePlayerForKingdom.id].types.includes(KINGDOM_TYPES.TRIX) ? KINGDOM_TYPES.COMPLEX : KINGDOM_TYPES.TRIX;
        setTimeout(() => handleKingdomSelected(remainingKingdom), 100); 
    }
  };

  const handleTrixScoreSubmit = () => {
    const scores = { [teams[0].id]: 0, [teams[1].id]: 0 };
    const playerRanksValues = Object.values(trixRoundData.ranks).filter(rank => rank !== '');
    if (playerRanksValues.length !== 4 || new Set(playerRanksValues).size !== 4) {
        toast({ title: "خطأ", description: "يرجى تحديد مركز فريد لكل لاعب (1 إلى 4).", variant: "destructive" });
        return;
    }
    players.forEach(player => {
      const rank = parseInt(trixRoundData.ranks[player.id]);
      let score = 0;
      if (rank === 1) score = TRIX_SCORES.FIRST; else if (rank === 2) score = TRIX_SCORES.SECOND;
      else if (rank === 3) score = TRIX_SCORES.THIRD; else if (rank === 4) score = TRIX_SCORES.FOURTH;
      const playerTeamObj = getPlayerTeam(currentGame, player.id);
      if (playerTeamObj) scores[playerTeamObj.id] += score;
    });
    addRound(KINGDOM_TYPES.TRIX, scores, { ranks: trixRoundData.ranks });
    setShowTrixScoreDialog(false);
  };

  const handleComplexScoreSubmit = (submittedComplexData) => {
    const finalScores = calculateComplexScores(submittedComplexData, teams, players, currentGame);
    addRound(KINGDOM_TYPES.COMPLEX, finalScores, submittedComplexData);
    setShowComplexScoreDialog(false);
  };

  const internalConfirmDeleteRound = (roundId) => {
    setRoundToDelete(roundId);
    setShowDeleteRoundDialog(true);
  };

  const handleDeleteRound = () => {
    if (!roundToDelete) return;
    const roundBeingDeleted = rounds.find(r => r.id === roundToDelete);
    if (!roundBeingDeleted) return;

    const updatedRounds = rounds.filter(round => round.id !== roundToDelete);
    const playerOfDeletedRound = getPlayerById(currentGame, roundBeingDeleted.kingdomPlayerId);
    let updatedPlayerChoices = { ...playerKingdomChoices };
    let newKingdomsPlayedThisTurn = kingdomsPlayedThisTurn;

    if (playerOfDeletedRound) {
      const currentChoices = playerKingdomChoices[playerOfDeletedRound.id];
      const newTypes = currentChoices.types.filter(t => t !== roundBeingDeleted.kingdomType);
      updatedPlayerChoices[playerOfDeletedRound.id] = {
        ...currentChoices,
        count: Math.max(0, currentChoices.count - 1),
        types: newTypes,
        completedKingdoms: (currentChoices.types.length === 2 && newTypes.length === 0) ? Math.max(0, currentChoices.completedKingdoms -1) : currentChoices.completedKingdoms
      };
      if(currentKingdomPlayerId === playerOfDeletedRound.id) {
        newKingdomsPlayedThisTurn = Math.max(0, kingdomsPlayedThisTurn -1);
      }
    }
    
    const updatedGame = {
      ...currentGame,
      rounds: updatedRounds,
      playerKingdomChoices: updatedPlayerChoices,
      currentKingdomPlayerId: playerOfDeletedRound ? playerOfDeletedRound.id : null,
      kingdomsPlayedThisTurn: newKingdomsPlayedThisTurn,
      lastUpdated: Date.now()
    };

    setCurrentGame(updatedGame);
    saveGameData(updatedGame.id, updatedGame);
    onSaveGame(updatedGame);
    setShowDeleteRoundDialog(false);
    setRoundToDelete(null);
    toast({ title: "تم حذف الجولة", description: "تم حذف الجولة بنجاح." });
  };
  
  const handleSaveGame = () => {
    saveGameData(currentGame.id, currentGame);
    onSaveGame(currentGame);
    toast({ title: "تم حفظ اللعبة", description: "تم حفظ حالة اللعبة بنجاح." });
  };

  const handleResetGame = () => {
    const resetGame = {
      ...currentGame,
      rounds: [],
      playerKingdomChoices: getInitialPlayerKingdomChoices(players),
      currentKingdomPlayerId: null,
      kingdomsPlayedThisTurn: 0,
      currentTurnIndex: 0,
      lastUpdated: Date.now()
    };
    setCurrentGame(resetGame);
    saveGameData(resetGame.id, resetGame);
    onSaveGame(resetGame);
    toast({ title: "تم إعادة تعيين اللعبة", description: "تمت إعادة تعيين جميع النقاط." });
  };
  
  const isGameOver = checkComplexGameOver(currentGame);
  const gameStatusText = () => {
    if (isGameOver) return "اكتملت جميع الممالك!";
    if (!activePlayerForKingdom && !isGameOver) return `الدور على ${players[currentTurnIndex]?.name || 'لاعب'} لاختيار من سيلعب المملكة (${rounds.length +1}/${totalKingdoms})`;
    if (activePlayerForKingdom) {
      const choices = playerKingdomChoices[activePlayerForKingdom.id];
      if (choices.count < 2) {
        return `الدور على: ${activePlayerForKingdom.name} لاختيار مملكته ${choices.types.length === 0 ? 'الأولى' : 'الثانية'} (${rounds.length +1}/${totalKingdoms})`;
      }
    }
    return "تحميل...";
  };

  const availablePlayersForTurnSelection = players.filter(p => playerKingdomChoices[p.id]?.completedKingdoms < 1);

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Card className="border-2 border-primary/20 shadow-lg overflow-hidden">
          <GameBoardHeader 
            gameName={gameName}
            onBackToHome={onBackToHome}
            onSaveGame={handleSaveGame}
            onAddKingdom={() => {
              if (!currentKingdomPlayerId) setShowPlayerTurnSelector(true);
              else setShowKingdomSelectionDialog(true);
            }}
            isGameOver={isGameOver}
            canAddKingdom={rounds.length < totalKingdoms && (!activePlayerForKingdom || playerKingdomChoices[activePlayerForKingdom.id]?.count < 2)}
          />
          <GameStatus statusText={gameStatusText()} />
          
          <CardContent className="p-6">
            <ScoreTable teams={teams} rounds={rounds} isGameOver={isGameOver} game={{...currentGame, confirmDeleteRound: internalConfirmDeleteRound}} />
            <GameControls roundsPlayed={rounds.length} totalKingdoms={totalKingdoms} onResetGame={handleResetGame} onNewGame={onNewGame} />
          </CardContent>
        </Card>
      </motion.div>

      <PlayerTurnSelectorDialog
        open={showPlayerTurnSelector && availablePlayersForTurnSelection.length > 0 && !isGameOver}
        onOpenChange={setShowPlayerTurnSelector}
        players={availablePlayersForTurnSelection}
        onPlayerSelect={handlePlayerSelectedForTurn}
        title={`دور اللاعب: ${players[currentTurnIndex]?.name || ''} لاختيار من سيلعب`}
        description="اختر اللاعب الذي سيلعب مملكتي التركس والكمبلكس التاليتين."
      />

      {activePlayerForKingdom && <KingdomSelectionDialog 
        open={showKingdomSelectionDialog && !isGameOver} 
        onOpenChange={setShowKingdomSelectionDialog} 
        player={activePlayerForKingdom}
        onKingdomSelect={handleKingdomSelected}
        playerKingdomChoices={playerKingdomChoices}
      />}
      {activePlayerForKingdom && <TrixScoreDialog 
        open={showTrixScoreDialog && !isGameOver} 
        onOpenChange={setShowTrixScoreDialog} 
        players={players}
        teams={teams}
        trixRoundData={trixRoundData}
        setTrixRoundData={setTrixRoundData}
        onSubmit={handleTrixScoreSubmit}
        currentPlayerName={activePlayerForKingdom?.name}
      />}
      {activePlayerForKingdom && <ComplexScoreDialog
        open={showComplexScoreDialog && !isGameOver}
        onOpenChange={setShowComplexScoreDialog}
        game={currentGame}
        complexRoundData={complexRoundData}
        setComplexRoundData={setComplexRoundData}
        onSubmit={handleComplexScoreSubmit}
        currentPlayerName={activePlayerForKingdom?.name}
      />}
      <GameOverDialog
        open={showGameOverDialog}
        onOpenChange={setShowGameOverDialog}
        game={currentGame}
        onNewGame={onNewGame}
        onBackToHome={onBackToHome}
      />
      <DeleteRoundDialog
        open={showDeleteRoundDialog}
        onOpenChange={setShowDeleteRoundDialog}
        onDeleteConfirm={handleDeleteRound}
      />
    </div>
  );
};

export default GameBoard;
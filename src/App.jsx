import React, { useState, useEffect } from "react";
import { Toaster } from "./components/ui/toaster";
import NewGameForm from "./components/NewGameForm";
import GameBoard from "./components/GameBoard";
import GamesList from "./components/GamesList";
import { getAllGames, saveGameData } from "./lib/game-utils";
import { motion, AnimatePresence } from "framer-motion";

function App() {
  const [view, setView] = useState("list"); // list, new, game
  const [games, setGames] = useState({});
  const [currentGame, setCurrentGame] = useState(null);

  useEffect(() => {
    const savedGames = getAllGames();
    setGames(savedGames);
  }, []);

  const handleGameCreated = (newGame) => {
    saveGameData(newGame.id, newGame);
    setGames(prev => ({ ...prev, [newGame.id]: newGame }));
    setCurrentGame(newGame);
    setView("game");
  };

  const handleSelectGame = (game) => {
    setCurrentGame(game);
    setView("game");
  };

  const handleSaveGame = (updatedGame) => {
    setGames(prev => ({ ...prev, [updatedGame.id]: updatedGame }));
    setCurrentGame(updatedGame); // Keep current game in view
  };

  const handleDeleteGame = (gameId) => {
    const updatedGames = { ...games };
    delete updatedGames[gameId];
    setGames(updatedGames);
    if (currentGame && currentGame.id === gameId) {
      setCurrentGame(null);
      setView("list");
    }
  };

  const handleBackToHome = () => {
    setCurrentGame(null);
    setView("list");
  };

  const handleNewGame = () => {
    setCurrentGame(null);
    setView("new");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-8">
      <AnimatePresence mode="wait">
        {view === "list" && (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <GamesList
              games={games}
              onSelectGame={handleSelectGame}
              onNewGame={handleNewGame}
              onDeleteGame={handleDeleteGame}
            />
          </motion.div>
        )}

        {view === "new" && (
          <motion.div
            key="new"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="container mx-auto p-4">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                  لعبة جديدة (تركس كمبلكس)
                </h1>
                <button
                  onClick={handleBackToHome}
                  className="text-primary hover:underline"
                >
                  العودة للقائمة الرئيسية
                </button>
              </div>
              <NewGameForm onGameCreated={handleGameCreated} />
            </div>
          </motion.div>
        )}

        {view === "game" && currentGame && (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <GameBoard
              game={currentGame}
              onSaveGame={handleSaveGame}
              onNewGame={handleNewGame}
              onBackToHome={handleBackToHome}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Toaster />
    </div>
  );
}

export default App;
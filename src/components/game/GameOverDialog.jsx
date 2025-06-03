import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { calculateTeamTotal } from "@/lib/game-utils";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";

const GameOverDialog = ({ open, onOpenChange, game, onNewGame, onBackToHome }) => {
  if (!game || !game.teams || game.teams.length < 2) return null;

  const team1 = game.teams[0];
  const team2 = game.teams[1];

  const getWinningTeam = () => {
    const totalTeam1 = calculateTeamTotal(game.rounds, team1.id);
    const totalTeam2 = calculateTeamTotal(game.rounds, team2.id);
    if (totalTeam1 > totalTeam2) return team1;
    if (totalTeam2 > totalTeam1) return team2;
    return null; 
  };
  
  const winningTeam = getWinningTeam();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">🎉 انتهت اللعبة! 🎉</DialogTitle>
        </DialogHeader>
        <div className="py-6">
          <div className="text-center space-y-4">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }} className="mx-auto w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
              <Trophy className="h-12 w-12 text-primary" />
            </motion.div>
            {winningTeam ? (
              <>
                <h3 className="text-xl font-bold">الفريق الفائز: {winningTeam.name}</h3>
                <p className="text-muted-foreground">بمجموع نقاط: {calculateTeamTotal(game.rounds, winningTeam.id)}</p>
                <p className="text-sm">مقابل {calculateTeamTotal(game.rounds, winningTeam.id === team1.id ? team2.id : team1.id)} للفريق الآخر.</p>
              </>
            ) : (
              <h3 className="text-xl font-bold">تعادل!</h3>
            )}
          </div>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button onClick={onNewGame} className="flex-1">لعبة جديدة</Button>
          <Button variant="outline" onClick={onBackToHome} className="flex-1">القائمة الرئيسية</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GameOverDialog;
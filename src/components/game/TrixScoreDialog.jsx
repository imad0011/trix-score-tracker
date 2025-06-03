import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const TrixScoreDialog = ({ open, onOpenChange, players, teams, trixRoundData, setTrixRoundData, onSubmit, currentPlayerName }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>تسجيل نقاط مملكة تركس - {currentPlayerName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-4">
          <p className="text-sm text-muted-foreground">أدخل ترتيب كل لاعب (1 للأول، 4 للرابع).</p>
          {players.map(player => (
            <div key={player.id} className="flex items-center justify-between gap-3">
              <Label htmlFor={`trix-rank-${player.id}`} className="flex-1">{player.name} ({teams.find(t => t.players.some(p => p.id === player.id))?.name})</Label>
              <Input
                id={`trix-rank-${player.id}`}
                type="number"
                min="1" max="4"
                value={trixRoundData.ranks[player.id] || ''}
                onChange={(e) => setTrixRoundData(prev => ({ ...prev, ranks: { ...prev.ranks, [player.id]: e.target.value } }))}
                className="w-20 text-center"
              />
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button onClick={onSubmit}>تسجيل النقاط</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TrixScoreDialog;
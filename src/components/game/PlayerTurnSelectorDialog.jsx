import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { UserCheck } from "lucide-react";

const PlayerTurnSelectorDialog = ({ open, onOpenChange, players, onPlayerSelect, title, description }) => {
  if (!players || players.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title || "اختر اللاعب"}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-6">
          {players.map(player => (
            <Button 
              key={player.id}
              variant="outline" 
              className="h-16 text-md flex items-center justify-center gap-2" 
              onClick={() => onPlayerSelect(player.id)}
            >
              <UserCheck className="h-5 w-5" /> {player.name}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlayerTurnSelectorDialog;
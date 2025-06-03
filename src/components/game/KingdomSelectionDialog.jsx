import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { KINGDOM_TYPES } from "@/lib/game-utils";
import { Crown, Spade, Heart, Diamond, Club } from "lucide-react";

const KingdomSelectionDialog = ({ open, onOpenChange, player, onKingdomSelect, playerKingdomChoices }) => {
  if (!player || !playerKingdomChoices || !playerKingdomChoices[player.id]) return null;

  const choices = playerKingdomChoices[player.id];
  const canSelectTrix = !choices.types.includes(KINGDOM_TYPES.TRIX);
  const canSelectComplex = !choices.types.includes(KINGDOM_TYPES.COMPLEX);
  const kingdomsLeftToChoose = 2 - choices.completedKingdoms * 2 - choices.types.length;


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>اختيار مملكة للاعب: {player.name}</DialogTitle>
          <DialogDescription>
            اختر نوع المملكة. كل لاعب يلعب مملكة تركس واحدة ومملكة كمبلكس واحدة.
            {choices.types.length === 0 ? " اختر مملكتك الأولى." : " اختر مملكتك الثانية."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-6">
          <Button 
            variant="outline" 
            className="h-20 text-lg flex flex-col gap-1" 
            onClick={() => onKingdomSelect(KINGDOM_TYPES.TRIX)}
            disabled={!canSelectTrix}
          >
            <Crown className="h-6 w-6" /> {KINGDOM_TYPES.TRIX}
            {!canSelectTrix && <span className="text-xs text-muted-foreground">(تم اختيارها أو لعبها)</span>}
          </Button>
          <Button 
            variant="outline" 
            className="h-20 text-lg flex flex-col gap-1" 
            onClick={() => onKingdomSelect(KINGDOM_TYPES.COMPLEX)}
            disabled={!canSelectComplex}
          >
            <div className="flex gap-1"><Spade className="h-5 w-5" /><Heart className="h-5 w-5" /><Diamond className="h-5 w-5" /><Club className="h-5 w-5" /></div>
            {KINGDOM_TYPES.COMPLEX}
            {!canSelectComplex && <span className="text-xs text-muted-foreground">(تم اختيارها أو لعبها)</span>}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KingdomSelectionDialog;
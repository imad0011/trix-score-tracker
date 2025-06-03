import React from 'react';
import { Button } from "@/components/ui/button";
import { RotateCcw, Plus } from "lucide-react";

const GameControls = ({ roundsPlayed, totalKingdoms, onResetGame, onNewGame }) => (
  <div className="mt-6 p-4 bg-muted/30 rounded-lg">
    <div className="flex flex-wrap justify-between items-center gap-4">
      <p className="text-sm text-muted-foreground">الممالك الملعوبة: <span className="font-bold text-foreground">{roundsPlayed} / {totalKingdoms}</span></p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onResetGame} className="flex items-center gap-1"><RotateCcw className="h-4 w-4" /><span>إعادة تعيين</span></Button>
        <Button variant="outline" size="sm" onClick={onNewGame} className="flex items-center gap-1"><Plus className="h-4 w-4" /><span>لعبة جديدة</span></Button>
      </div>
    </div>
  </div>
);

export default GameControls;
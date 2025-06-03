import React from 'react';
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Save, Plus } from "lucide-react";

const GameBoardHeader = ({ gameName, onBackToHome, onSaveGame, onAddKingdom, isGameOver, canAddKingdom }) => (
  <CardHeader className="bg-gradient-to-r from-primary/20 to-primary/5 pb-4">
    <div className="flex justify-between items-center">
      <Button variant="outline" size="icon" onClick={onBackToHome} aria-label="العودة للرئيسية"><Home className="h-4 w-4" /></Button>
      <CardTitle className="text-2xl font-bold text-center">{gameName}</CardTitle>
      <div className="flex gap-2">
        <Button variant="outline" size="icon" onClick={onSaveGame} aria-label="حفظ اللعبة"><Save className="h-4 w-4" /></Button>
        {!isGameOver && canAddKingdom && (
          <Button variant="outline" size="icon" onClick={onAddKingdom} aria-label="إضافة مملكة">
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  </CardHeader>
);

export default GameBoardHeader;
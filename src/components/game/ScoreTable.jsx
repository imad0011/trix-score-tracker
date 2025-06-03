import React, { useState } from 'react';
import { motion } from "framer-motion";
import { Trash2, Trophy, Eye } from "lucide-react";
import { calculateTeamTotal, getPlayerById, KINGDOM_TYPES, CARD_TYPES, COMPLEX_ITEM_SCORES } from "@/lib/game-utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const RoundDetailsDialog = ({ open, onOpenChange, round, teams, game }) => {
  if (!round) return null;

  const getPlayerName = (playerId) => getPlayerById(game, playerId)?.name || 'غير معروف';
  const getTeamName = (teamId) => teams.find(t => t.id === teamId)?.name || 'غير معروف';

  const renderTrixDetails = () => {
    if (!round.roundData || !round.roundData.ranks) return <p>لا توجد تفاصيل إضافية لهذه الجولة.</p>;
    const ranks = round.roundData.ranks;
    return (
      <ul className="list-disc list-inside space-y-1 text-sm">
        {Object.entries(ranks).map(([playerId, rank]) => (
          <li key={playerId}>{getPlayerName(playerId)}: المركز {rank}</li>
        ))}
      </ul>
    );
  };

  const renderComplexDetails = () => {
    if (!round.roundData || !round.roundData.eats || !round.roundData.doubles) return <p>لا توجد تفاصيل إضافية لهذه الجولة.</p>;
    const { eats, doubles } = round.roundData;
    
    const getCardName = (cardType) => {
        switch(cardType) {
            case CARD_TYPES.QUEEN_SPADES: return "بنت البستوني";
            case CARD_TYPES.QUEEN_HEARTS: return "بنت الكبة";
            case CARD_TYPES.QUEEN_CLUBS: return "بنت السباتي";
            case CARD_TYPES.QUEEN_DIAMONDS: return "بنت الديناري";
            case CARD_TYPES.KING_HEARTS: return "شيخ الكبة";
            default: return cardType;
        }
    }

    const doublesDetails = [];
    Object.entries(doubles).forEach(([playerId, playerDoubles]) => {
        Object.entries(playerDoubles).forEach(([cardType, isDoubled]) => {
            if(isDoubled && cardType !== 'soldTo') {
                const soldToPlayerId = playerDoubles.soldTo?.[cardType];
                let detail = ` اللاعب ${getPlayerName(playerId)} دبل ${getCardName(cardType)}.`;
                if(soldToPlayerId) {
                    detail += ` تم بيعها للاعب ${getPlayerName(soldToPlayerId)} (${getTeamName(getPlayerById(game, soldToPlayerId)?.teamId)}).`;
                } else {
                     detail += ` لم يتم بيعها.`;
                }
                doublesDetails.push(<li key={`${playerId}-${cardType}`}>{detail}</li>);
            }
        });
    });


    return (
      <div className="space-y-3 text-sm">
        <div>
          <h4 className="font-semibold mb-1">الأكلات:</h4>
          {teams.map(team => (
            <div key={team.id} className="mb-2 p-2 border rounded-md">
              <p className="font-medium">{getTeamName(team.id)}:</p>
              <ul className="list-disc list-inside ml-4">
                <li>اللطوش: {eats[team.id]?.tricks || 0} ({(eats[team.id]?.tricks || 0) * COMPLEX_ITEM_SCORES.TRICK} نقطة)</li>
                <li>الديناري: {eats[team.id]?.diamonds || 0} ({(eats[team.id]?.diamonds || 0) * COMPLEX_ITEM_SCORES.DIAMOND} نقطة)</li>
                <li>البنات: {eats[team.id]?.queens || 0} ({(eats[team.id]?.queens || 0) * COMPLEX_ITEM_SCORES.QUEEN} نقطة)</li>
                <li>شيخ الكبة: {eats[team.id]?.kingHearts ? `نعم (${COMPLEX_ITEM_SCORES.KING_HEARTS} نقطة)` : 'لا'}</li>
                <li>بنت الديناري (ككرت): {eats[team.id]?.queenOfDiamondsCardEatenByTeam ? `نعم (${COMPLEX_ITEM_SCORES.QUEEN} نقطة إضافية كبنت)` : 'لا'}</li>
              </ul>
            </div>
          ))}
        </div>
        {doublesDetails.length > 0 && (
          <div>
            <h4 className="font-semibold mb-1">الدبل والبيع:</h4>
            <ul className="list-disc list-inside space-y-1">{doublesDetails}</ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>تفاصيل الجولة</DialogTitle>
          <DialogDescription>
            المملكة: <Badge variant="outline">{round.kingdomType}</Badge> بواسطة اللاعب <Badge>{getPlayerName(round.kingdomPlayerId)}</Badge>
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 max-h-[60vh] overflow-y-auto">
          {round.kingdomType === KINGDOM_TYPES.TRIX && renderTrixDetails()}
          {round.kingdomType === KINGDOM_TYPES.COMPLEX && renderComplexDetails()}
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>إغلاق</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


const ScoreTable = ({ teams, rounds, isGameOver, game }) => {
  const [selectedRound, setSelectedRound] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  if (!teams || teams.length < 2) return <p>خطأ: بيانات الفرق غير متوفرة.</p>;
  const team1 = teams[0];
  const team2 = teams[1];

  const handleRoundClick = (round) => {
    setSelectedRound(round);
    setIsDetailsModalOpen(true);
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted/50">
              <th className="p-3 text-right border-b sticky left-0 bg-muted/50 z-10 min-w-[150px]">الفريق (اللاعبون)</th>
              {rounds.map((round, index) => (
                <th key={round.id} className="p-3 text-center border-b min-w-[120px] relative">
                  <div className="flex flex-col items-center">
                    <span>مملكة {index + 1}</span>
                    <span className="text-xs text-muted-foreground">({round.kingdomType} - {getPlayerById(game, round.kingdomPlayerId)?.name})</span>
                  </div>
                  <button 
                    onClick={() => game.confirmDeleteRound(round.id)} 
                    className="absolute top-1 left-1 text-destructive/70 hover:text-destructive"
                    aria-label={`حذف مملكة ${index + 1}`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </th>
              ))}
              <th className="p-3 text-center border-b bg-primary/10 font-bold min-w-[100px]">المجموع</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team) => {
              const teamTotal = calculateTeamTotal(rounds, team.id);
              const totalTeam1 = calculateTeamTotal(rounds, team1.id);
              const totalTeam2 = calculateTeamTotal(rounds, team2.id);
              
              let winningTeamObj = null;
              if (isGameOver) {
                  if (totalTeam1 > totalTeam2) winningTeamObj = team1;
                  else if (totalTeam2 > totalTeam1) winningTeamObj = team2;
              }
              const isWinner = winningTeamObj && winningTeamObj.id === team.id;

              return (
                <tr key={team.id} className={`${isWinner ? 'bg-primary/10' : ''} hover:bg-muted/30`}>
                  <td className="p-3 border-b font-medium sticky left-0 bg-card z-10 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {isWinner && <Trophy className="h-5 w-5 text-yellow-500" />}
                      <span className="font-bold">{team.name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground ml-2">
                      ({team.players.map(p => p.name).join(' و ')})
                    </div>
                  </td>
                  {rounds.map((round) => (
                    <td 
                      key={`${team.id}-${round.id}`} 
                      className="p-3 text-center border-b cursor-pointer hover:bg-muted/50 relative group"
                      onClick={() => handleRoundClick(round)}
                    >
                      {round.scores[team.id] || 0}
                      <Eye className="h-4 w-4 absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </td>
                  ))}
                  <td className={`p-3 text-center border-b font-bold text-lg ${isWinner ? 'text-primary' : ''}`}>
                    <motion.span key={teamTotal} initial={{ scale: 1 }} animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.3 }}>
                      {teamTotal}
                    </motion.span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {selectedRound && (
        <RoundDetailsDialog
          open={isDetailsModalOpen}
          onOpenChange={setIsDetailsModalOpen}
          round={selectedRound}
          teams={teams}
          game={game}
        />
      )}
    </>
  );
};

export default ScoreTable;
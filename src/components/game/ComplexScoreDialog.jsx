import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CARD_TYPES, ALL_QUEENS, DOUBLABLE_CARDS, getPlayerTeam, TOTAL_TRICKS, TOTAL_DIAMONDS_CARDS, TOTAL_QUEENS } from "@/lib/game-utils";
import { Heart, Spade, Club, Diamond as DiamondIcon } from "lucide-react";

const CardImage = ({ cardType }) => {
  const baseStyle = "h-8 w-6 md:h-10 md:w-8 rounded border-2 flex items-center justify-center text-lg font-bold";
  let suitIcon, colorClass, cardChar;

  switch (cardType) {
    case CARD_TYPES.QUEEN_SPADES: suitIcon = <Spade className="h-4 w-4 fill-current" />; colorClass = "text-black border-black"; cardChar="Q"; break;
    case CARD_TYPES.QUEEN_HEARTS: suitIcon = <Heart className="h-4 w-4 fill-current" />; colorClass = "text-red-600 border-red-600"; cardChar="Q"; break;
    case CARD_TYPES.QUEEN_CLUBS: suitIcon = <Club className="h-4 w-4 fill-current" />; colorClass = "text-black border-black"; cardChar="Q"; break;
    case CARD_TYPES.QUEEN_DIAMONDS: suitIcon = <DiamondIcon className="h-4 w-4 fill-current" />; colorClass = "text-red-600 border-red-600"; cardChar="Q"; break;
    case CARD_TYPES.KING_HEARTS: suitIcon = <Heart className="h-4 w-4 fill-current" />; colorClass = "text-red-600 border-red-600"; cardChar="K"; break;
    default: return null;
  }
  return <div className={`${baseStyle} ${colorClass}`}>{cardChar}{suitIcon}</div>;
};

const DoublesTabContent = ({ game, doubledCardsByPlayer, onDoubleCheckboxChange, onSoldToChange }) => {
  const { players } = game;

  const isCardDoubledByOtherPlayer = (cardType, currentPlayerId) => {
    if (!doubledCardsByPlayer) return false;
    return players.some(p => p.id !== currentPlayerId && doubledCardsByPlayer[p.id]?.[cardType]);
  };

  return (
    <TabsContent value="doubles" className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
      <p className="text-sm text-muted-foreground">حدد الأوراق التي تم دبلها ومن قام بدبلها. إذا تم بيع ورقة مدبلة، حدد لمن تم بيعها. الورقة المدبلة لا يمكن دبلها من لاعب آخر.</p>
      {players.map(declarerPlayer => (
        <Card key={`double-declarer-${declarerPlayer.id}`} className="p-4">
          <h4 className="font-semibold mb-3">إعلانات الدبل من: {declarerPlayer.name} ({getPlayerTeam(game, declarerPlayer.id)?.name})</h4>
          <div className="space-y-4">
            {DOUBLABLE_CARDS.map(cardType => {
              const isDisabled = isCardDoubledByOtherPlayer(cardType, declarerPlayer.id);
              const isChecked = doubledCardsByPlayer?.[declarerPlayer.id]?.[cardType] || false;
              return (
                <div key={cardType} className="p-3 border rounded-md">
                  <div className="flex items-center space-x-2 space-x-reverse mb-2">
                    <Checkbox
                      id={`double-${declarerPlayer.id}-${cardType}`}
                      checked={isChecked}
                      onCheckedChange={(checked) => onDoubleCheckboxChange(declarerPlayer.id, cardType, checked)}
                      disabled={isDisabled}
                    />
                    <Label htmlFor={`double-${declarerPlayer.id}-${cardType}`} className={`flex items-center gap-2 ${isDisabled ? 'text-muted-foreground' : ''}`}>
                      دبل <CardImage cardType={cardType} />
                    </Label>
                    {isDisabled && <span className="text-xs text-destructive">(مدبلة من لاعب آخر)</span>}
                  </div>
                  {isChecked && !isDisabled && (
                    <div className="pl-8">
                      <Label htmlFor={`sold-${declarerPlayer.id}-${cardType}`}>بيع الورقة المدبلة إلى (اختياري):</Label>
                      <select
                        id={`sold-${declarerPlayer.id}-${cardType}`}
                        value={doubledCardsByPlayer?.[declarerPlayer.id]?.soldTo?.[cardType] || ''}
                        onChange={(e) => onSoldToChange(declarerPlayer.id, cardType, e.target.value)}
                        className="w-full p-2 border rounded-md mt-1 bg-background"
                      >
                        <option value="">لم يتم البيع / أكلها فريقه</option>
                        {players
                          .filter(p => getPlayerTeam(game, p.id)?.id !== getPlayerTeam(game, declarerPlayer.id)?.id) 
                          .map(opponent => (
                          <option key={opponent.id} value={opponent.id}>{opponent.name} ({getPlayerTeam(game, opponent.id)?.name})</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      ))}
    </TabsContent>
  );
};

const EatsTabContent = ({ teams, eatsData, onEatsDataChange }) => {
  const handleInputChange = (teamId, field, value) => {
    const numericValue = parseInt(value) || 0;
    let newEatsData = eatsData ? { ...eatsData } : {};
    if (!newEatsData[teamId]) newEatsData[teamId] = {};
    
    const otherTeamId = teams.find(t => t.id !== teamId)?.id;
    if (otherTeamId && !newEatsData[otherTeamId]) newEatsData[otherTeamId] = {};


    if (field === "tricks") {
      newEatsData[teamId] = { ...newEatsData[teamId], tricks: numericValue };
      if (otherTeamId) {
        newEatsData[otherTeamId] = { ...newEatsData[otherTeamId], tricks: TOTAL_TRICKS - numericValue };
      }
    } else if (field === "diamonds") {
      newEatsData[teamId] = { ...newEatsData[teamId], diamonds: numericValue };
      if (otherTeamId) {
        const qdEatenByTeam1 = newEatsData[teamId]?.queenOfDiamondsCardEatenByTeam;
        const qdEatenByTeam2 = newEatsData[otherTeamId]?.queenOfDiamondsCardEatenByTeam;
        let diamondsToDistribute = TOTAL_DIAMONDS_CARDS;
        if(qdEatenByTeam1 || qdEatenByTeam2) diamondsToDistribute -=1; 
        newEatsData[otherTeamId] = { ...newEatsData[otherTeamId], diamonds: Math.max(0, diamondsToDistribute - numericValue) };
      }
    } else if (field === "queens") {
        newEatsData[teamId] = { ...newEatsData[teamId], queens: numericValue };
        if (otherTeamId) {
            newEatsData[otherTeamId] = { ...newEatsData[otherTeamId], queens: TOTAL_QUEENS - numericValue };
        }
    } else if (field === "kingHearts") { 
        newEatsData[teamId] = { ...newEatsData[teamId], kingHearts: value };
        if (value && otherTeamId) { 
            newEatsData[otherTeamId] = { ...newEatsData[otherTeamId], kingHearts: false };
        }
    } else if (field === "queenOfDiamondsCardEatenByTeam") { 
       newEatsData[teamId] = { ...newEatsData[teamId], queenOfDiamondsCardEatenByTeam: value };
       if(value && otherTeamId) {
            newEatsData[otherTeamId] = { ...newEatsData[otherTeamId], queenOfDiamondsCardEatenByTeam: false };
       }
    }
    onEatsDataChange(newEatsData);
  };

  return (
    <TabsContent value="eats" className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
      <p className="text-sm text-muted-foreground">أدخل الأكلات لكل فريق. سيتم حساب القيم المتبقية تلقائياً.</p>
      {teams.map(team => (
        <Card key={`eats-${team.id}`} className="p-4">
          <h4 className="font-semibold mb-2">أكلات فريق: {team.name}</h4>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <Label htmlFor={`complex-queens-team-${team.id}`}>عدد البنات (Q) المأكولة</Label>
              <Input 
                id={`complex-queens-team-${team.id}`} type="number" min="0" max={TOTAL_QUEENS} 
                value={eatsData?.[team.id]?.queens === 0 ? '' : eatsData?.[team.id]?.queens || ''} 
                onChange={(e) => handleInputChange(team.id, "queens", e.target.value)}
                onFocus={(e) => handleInputChange(team.id, "queens", "")}
              />
            </div>
            <div className="flex items-center space-x-2 space-x-reverse pt-5">
              <Checkbox id={`complex-king-team-${team.id}`} 
                        checked={eatsData?.[team.id]?.kingHearts || false} 
                        onCheckedChange={(checked) => handleInputChange(team.id, "kingHearts", checked)} />
              <Label htmlFor={`complex-king-team-${team.id}`}>أكل شايب الكبة (K♥)</Label>
            </div>
            <div>
              <Label htmlFor={`complex-tricks-team-${team.id}`}>عدد اللطشات</Label>
              <Input 
                id={`complex-tricks-team-${team.id}`} type="number" min="0" max={TOTAL_TRICKS}
                value={eatsData?.[team.id]?.tricks === 0 ? '' : eatsData?.[team.id]?.tricks || ''} 
                onChange={(e) => handleInputChange(team.id, "tricks", e.target.value)}
                onFocus={(e) => handleInputChange(team.id, "tricks", "")}
              />
            </div>
            <div>
              <Label htmlFor={`complex-diamonds-team-${team.id}`}>عدد الديناري</Label>
              <Input 
                id={`complex-diamonds-team-${team.id}`} type="number" min="0" 
                max={TOTAL_DIAMONDS_CARDS}
                value={eatsData?.[team.id]?.diamonds === 0 ? '' : eatsData?.[team.id]?.diamonds || ''} 
                onChange={(e) => handleInputChange(team.id, "diamonds", e.target.value)}
                onFocus={(e) => handleInputChange(team.id, "diamonds", "")}
              />
            </div>
          </div>
        </Card>
      ))}
    </TabsContent>
  );
};


const ComplexScoreDialog = ({ open, onOpenChange, game, complexRoundData: parentComplexRoundData, setComplexRoundData: setParentComplexRoundData, onSubmit, currentPlayerName }) => {
  const { players, teams } = game;
  
  const getInitialDoublesState = useCallback(() => {
    return players.reduce((acc, player) => {
        acc[player.id] = DOUBLABLE_CARDS.reduce((cardAcc, card) => ({ ...cardAcc, [card]: false }), 
          { 
            soldTo: DOUBLABLE_CARDS.reduce((soldAcc, card) => ({ ...soldAcc, [card]: null }), {}),
          });
        return acc;
      }, {});
  }, [players]);

  const getInitialEatsState = useCallback(() => {
    return teams.reduce((acc, team) => ({ ...acc, [team.id]: { queens: 0, diamonds: 0, tricks: 0, kingHearts: false, queenOfDiamondsCardEatenByTeam: false } }), {});
  }, [teams]);


  const [doubledCardsByPlayer, setDoubledCardsByPlayer] = useState(() => parentComplexRoundData?.doubles || getInitialDoublesState() );
  const [eatsData, setEatsData] = useState(() => parentComplexRoundData?.eats || getInitialEatsState() );

  useEffect(() => {
    if (open) { 
      setDoubledCardsByPlayer(parentComplexRoundData?.doubles || getInitialDoublesState());
      setEatsData(parentComplexRoundData?.eats || getInitialEatsState());
    }
  }, [open, parentComplexRoundData, players, teams, getInitialDoublesState, getInitialEatsState]);


  const handleDoubleCheckboxChange = useCallback((playerId, cardType, checked) => {
    setDoubledCardsByPlayer(prev => {
      const newDoubles = prev ? JSON.parse(JSON.stringify(prev)) : getInitialDoublesState();
      
      if (!newDoubles[playerId]) {
        newDoubles[playerId] = DOUBLABLE_CARDS.reduce((cardAcc, card) => ({ ...cardAcc, [card]: false }), 
          { soldTo: DOUBLABLE_CARDS.reduce((soldAcc, card) => ({ ...soldAcc, [card]: null }), {}) }
        );
      }

      if (checked) {
        Object.keys(newDoubles).forEach(pId => {
          if (pId !== playerId && newDoubles[pId] && newDoubles[pId][cardType]) {
            newDoubles[pId][cardType] = false;
            if (newDoubles[pId].soldTo) newDoubles[pId].soldTo[cardType] = null;
          }
        });
      }
      newDoubles[playerId][cardType] = checked;
      if (!checked) {
         if (newDoubles[playerId].soldTo) newDoubles[playerId].soldTo[cardType] = null;
      }
      return newDoubles;
    });
  }, [getInitialDoublesState]);
  
  const handleSoldToChange = useCallback((declarerId, cardType, soldToPlayerId) => {
     setDoubledCardsByPlayer(prev => {
        const newDoubles = prev ? JSON.parse(JSON.stringify(prev)) : getInitialDoublesState();
        if (!newDoubles[declarerId]) {
           newDoubles[declarerId] = getInitialDoublesState()[declarerId] || {};
        }
        if (!newDoubles[declarerId].soldTo) newDoubles[declarerId].soldTo = {};
        newDoubles[declarerId].soldTo[cardType] = soldToPlayerId || null;
        return newDoubles;
     });
  }, [getInitialDoublesState]);

  const handleEatsDataChange = useCallback((newEatsData) => {
    setEatsData(newEatsData);
  }, []);

  const handleSubmitInternal = () => {
    onSubmit({ eats: eatsData, doubles: doubledCardsByPlayer });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>تسجيل نقاط مملكة كمبلكس - {currentPlayerName}</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="doubles" className="w-full pt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="doubles">إعلانات الدبل والبيع</TabsTrigger>
            <TabsTrigger value="eats">تسجيل الأكلات (للفريق)</TabsTrigger>
          </TabsList>
          <DoublesTabContent 
            game={game}
            doubledCardsByPlayer={doubledCardsByPlayer}
            onDoubleCheckboxChange={handleDoubleCheckboxChange}
            onSoldToChange={handleSoldToChange}
          />
          <EatsTabContent
            teams={teams}
            eatsData={eatsData}
            onEatsDataChange={handleEatsDataChange}
          />
        </Tabs>
        <DialogFooter className="pt-4">
          <Button onClick={handleSubmitInternal}>تسجيل النقاط</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ComplexScoreDialog;
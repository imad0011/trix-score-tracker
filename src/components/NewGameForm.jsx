import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { generateGameId, generatePlayerId, TOTAL_KINGDOMS_PER_GAME, getInitialPlayerKingdomChoices } from "@/lib/game-utils";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { Users, Shield } from "lucide-react";

const NewGameForm = ({ onGameCreated }) => {
  const [team1Name, setTeam1Name] = useState("الفريق الأول");
  const [team2Name, setTeam2Name] = useState("الفريق الثاني");
  const [player1Name, setPlayer1Name] = useState("");
  const [player2Name, setPlayer2Name] = useState("");
  const [player3Name, setPlayer3Name] = useState("");
  const [player4Name, setPlayer4Name] = useState("");
  const [gameName, setGameName] = useState("لعبة تركس كمبلكس جديدة");
  const { toast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();

    const playerNames = [player1Name, player2Name, player3Name, player4Name];
    if (playerNames.some(name => !name.trim())) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال أسماء جميع اللاعبين الأربعة.",
        variant: "destructive",
      });
      return;
    }

    const uniquePlayerNames = new Set(playerNames.map(name => name.trim()));
    if (uniquePlayerNames.size !== 4) {
      toast({
        title: "خطأ",
        description: "يجب أن تكون أسماء اللاعبين مختلفة.",
        variant: "destructive",
      });
      return;
    }
    
    if (!team1Name.trim() || !team2Name.trim()) {
        toast({
            title: "خطأ",
            description: "يرجى إدخال أسماء الفريقين.",
            variant: "destructive",
        });
        return;
    }

    if (team1Name.trim() === team2Name.trim()) {
        toast({
            title: "خطأ",
            description: "يجب أن تكون أسماء الفريقين مختلفة.",
            variant: "destructive",
        });
        return;
    }

    const p1Id = generatePlayerId();
    const p2Id = generatePlayerId();
    const p3Id = generatePlayerId();
    const p4Id = generatePlayerId();

    const team1Id = generatePlayerId();
    const team2Id = generatePlayerId();

    const playersList = [
      { id: p1Id, name: player1Name.trim(), teamId: team1Id },
      { id: p2Id, name: player2Name.trim(), teamId: team1Id },
      { id: p3Id, name: player3Name.trim(), teamId: team2Id },
      { id: p4Id, name: player4Name.trim(), teamId: team2Id }
    ];

    const newGame = {
      id: generateGameId(),
      name: gameName.trim(),
      teams: [
        { 
          id: team1Id, 
          name: team1Name.trim(), 
          players: playersList.filter(p => p.teamId === team1Id)
        },
        { 
          id: team2Id, 
          name: team2Name.trim(), 
          players: playersList.filter(p => p.teamId === team2Id)
        }
      ],
      players: playersList,
      rounds: [],
      playerKingdomChoices: getInitialPlayerKingdomChoices(playersList),
      currentKingdomPlayerId: null, // Will be set by user
      totalKingdoms: TOTAL_KINGDOMS_PER_GAME,
      turnOrder: playersList.map(p => p.id), // Default turn order, can be changed
      currentTurnIndex: 0, // Index in turnOrder for who's turn it is to pick a player for kingdom
      kingdomsPlayedThisTurn: 0, // 0, 1, or 2 (Trix, then Complex or vice-versa)
      createdAt: Date.now(),
      lastUpdated: Date.now()
    };

    onGameCreated(newGame);
    
    toast({
      title: "تم إنشاء اللعبة",
      description: `تم إنشاء "${newGame.name}" بنجاح!`,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="w-full max-w-lg mx-auto border-2 border-primary/20 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
          <CardTitle className="text-2xl font-bold text-center">لعبة تركس كمبلكس جديدة (شراكة)</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="gameName">اسم اللعبة</Label>
              <Input
                id="gameName"
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                placeholder="أدخل اسم اللعبة"
                className="border-primary/20"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3 p-4 border border-dashed border-primary/30 rounded-lg">
                <div className="flex items-center gap-2 text-primary">
                  <Shield className="h-5 w-5" />
                  <h3 className="font-semibold">الفريق الأول</h3>
                </div>
                <Input
                  value={team1Name}
                  onChange={(e) => setTeam1Name(e.target.value)}
                  placeholder="اسم الفريق الأول"
                  className="border-primary/20"
                  required
                />
                <Input
                  value={player1Name}
                  onChange={(e) => setPlayer1Name(e.target.value)}
                  placeholder="اسم اللاعب 1 (فريق 1)"
                  className="border-primary/20"
                  required
                />
                <Input
                  value={player2Name}
                  onChange={(e) => setPlayer2Name(e.target.value)}
                  placeholder="اسم اللاعب 2 (فريق 1)"
                  className="border-primary/20"
                  required
                />
              </div>

              <div className="space-y-3 p-4 border border-dashed border-primary/30 rounded-lg">
                <div className="flex items-center gap-2 text-primary">
                  <Shield className="h-5 w-5" />
                  <h3 className="font-semibold">الفريق الثاني</h3>
                </div>
                <Input
                  value={team2Name}
                  onChange={(e) => setTeam2Name(e.target.value)}
                  placeholder="اسم الفريق الثاني"
                  className="border-primary/20"
                  required
                />
                <Input
                  value={player3Name}
                  onChange={(e) => setPlayer3Name(e.target.value)}
                  placeholder="اسم اللاعب 3 (فريق 2)"
                  className="border-primary/20"
                  required
                />
                <Input
                  value={player4Name}
                  onChange={(e) => setPlayer4Name(e.target.value)}
                  placeholder="اسم اللاعب 4 (فريق 2)"
                  className="border-primary/20"
                  required
                />
              </div>
            </div>
            
            <CardFooter className="flex justify-end px-0 pt-6">
              <Button type="submit" className="w-full flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span>بدء اللعبة</span>
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default NewGameForm;
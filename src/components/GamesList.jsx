import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { formatDate, deleteGame } from "@/lib/game-utils";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Trash2, PlayCircle, Users, Trophy, Crown, Target } from "lucide-react";

const GamesList = ({ games, onSelectGame, onNewGame, onDeleteGame }) => {
  const [gameToDelete, setGameToDelete] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();

  const handleDeleteClick = (e, gameId) => {
    e.stopPropagation();
    setGameToDelete(gameId);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (gameToDelete) {
      const deleted = deleteGame(gameToDelete);
      if (deleted) {
        onDeleteGame(gameToDelete);
        toast({
          title: "تم الحذف",
          description: "تم حذف اللعبة بنجاح",
        });
      } else {
        toast({
          title: "خطأ",
          description: "حدث خطأ أثناء حذف اللعبة",
          variant: "destructive",
        });
      }
      setShowDeleteDialog(false);
      setGameToDelete(null);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const headerIcons = [
    <Trophy className="h-8 w-8 text-yellow-500" key="trophy" />,
    <Crown className="h-8 w-8 text-primary" key="crown" />,
    <Target className="h-8 w-8 text-blue-500" key="target" />
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/5 py-8">
      <div className="container mx-auto p-4 max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center gap-4 mb-4">
            {headerIcons.map((icon, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.2 }}
              >
                {icon}
              </motion.div>
            ))}
          </div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-500 to-primary mb-4">
            مسجل نتائج لعبة تركس
          </h1>
          <p className="text-muted-foreground mb-6">سجل نتائج لعبة تركس بسهولة وتابع تقدم اللاعبين</p>
          <Button 
            onClick={onNewGame} 
            size="lg"
            className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Plus className="h-5 w-5 mr-2" />
            <span>لعبة جديدة</span>
          </Button>
        </motion.div>

        {Object.keys(games).length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center p-12 bg-card/50 backdrop-blur-sm rounded-lg border-2 border-primary/10 shadow-lg"
          >
            <div className="mb-6 text-primary/50">
              <PlayCircle className="h-20 w-20 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold mb-3">لا توجد ألعاب محفوظة</h2>
            <p className="text-muted-foreground mb-8">ابدأ بإنشاء لعبة جديدة للاستمتاع بتسجيل النتائج</p>
            <Button 
              onClick={onNewGame} 
              size="lg"
              className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
            >
              <Plus className="h-5 w-5 mr-2" />
              <span>إنشاء لعبة جديدة</span>
            </Button>
          </motion.div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {Object.values(games)
              .sort((a, b) => b.lastUpdated - a.lastUpdated)
              .map((game) => (
                <motion.div key={game.id} variants={item}>
                  <Card 
                    onClick={() => onSelectGame(game)} 
                    className="cursor-pointer group hover:shadow-xl transition-all duration-300 border-2 border-primary/10 bg-card/50 backdrop-blur-sm overflow-hidden"
                  >
                    <CardHeader className="pb-2 relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="flex justify-between items-center relative">
                        <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                          {game.name}
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleDeleteClick(e, game.id)}
                          className="h-8 w-8 text-destructive hover:text-destructive-foreground hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-center text-sm mb-3">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-full bg-primary/10">
                            <Users className="h-4 w-4 text-primary" />
                          </div>
                          <span>{game.players.length} لاعبين</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-full bg-blue-500/10">
                            <Trophy className="h-4 w-4 text-blue-500" />
                          </div>
                          <span>{game.rounds.length} جولات</span>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <div className="h-2 w-2 rounded-full bg-primary/50 animate-pulse" />
                        آخر تحديث: {formatDate(game.lastUpdated)}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
          </motion.div>
        )}

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>هل أنت متأكد من حذف هذه اللعبة؟</AlertDialogTitle>
              <AlertDialogDescription>
                سيتم حذف هذه اللعبة نهائياً مع جميع الجولات والنتائج المسجلة فيها.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                حذف
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default GamesList;

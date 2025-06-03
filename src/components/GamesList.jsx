
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { formatDate, deleteGame } from "@/lib/game-utils";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Trash2, PlayCircle, Users } from "lucide-react";

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

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
          مسجل نتائج لعبة تركس
        </h1>
        <Button onClick={onNewGame} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>لعبة جديدة</span>
        </Button>
      </div>

      {Object.keys(games).length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center p-10 bg-muted/30 rounded-lg"
        >
          <div className="mb-4 text-muted-foreground">
            <PlayCircle className="h-16 w-16 mx-auto opacity-50" />
          </div>
          <h2 className="text-xl font-semibold mb-2">لا توجد ألعاب محفوظة</h2>
          <p className="text-muted-foreground mb-6">ابدأ بإنشاء لعبة جديدة للاستمتاع بتسجيل النتائج</p>
          <Button onClick={onNewGame} className="flex items-center gap-2 mx-auto">
            <Plus className="h-4 w-4" />
            <span>إنشاء لعبة جديدة</span>
          </Button>
        </motion.div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {Object.values(games)
            .sort((a, b) => b.lastUpdated - a.lastUpdated)
            .map((game) => (
              <motion.div key={game.id} variants={item}>
                <Card 
                  onClick={() => onSelectGame(game)} 
                  className="cursor-pointer hover:shadow-md transition-shadow border-2 border-primary/10 player-card"
                >
                  <CardHeader className="pb-2 bg-gradient-to-r from-primary/10 to-transparent">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-xl font-bold">{game.name}</CardTitle>
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
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{game.players.length} لاعبين</span>
                      </div>
                      <div className="text-muted-foreground">
                        {game.rounds.length} جولات
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
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
  );
};

export default GamesList;

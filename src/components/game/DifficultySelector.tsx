
import React from "react";
import { useGame } from "@/contexts/GameContext";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Zap, Award } from "lucide-react";

const DifficultySelector: React.FC = () => {
  const { gameState, setDifficulty } = useGame();
  
  const difficulties = [
    {
      level: "easy",
      label: "Easy",
      icon: <Shield className="h-5 w-5 text-green-400" />,
      description: "Slower enemies with less health"
    },
    {
      level: "medium",
      label: "Medium",
      icon: <Zap className="h-5 w-5 text-yellow-400" />,
      description: "Balanced challenge"
    },
    {
      level: "hard",
      label: "Hard",
      icon: <Award className="h-5 w-5 text-red-400" />,
      description: "Fast enemies with high health"
    }
  ];

  return (
    <Card className="max-w-3xl mx-auto bg-game-dark border-game-secondary mb-4">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row justify-between gap-2">
          {difficulties.map((difficulty) => (
            <div 
              key={difficulty.level}
              className={`px-4 py-2 flex-1 rounded-md cursor-pointer transition-all hover:bg-game-secondary/30 ${
                gameState.difficulty === difficulty.level 
                  ? "bg-game-secondary border border-game-primary" 
                  : "bg-game-dark/50 border border-game-secondary/50"
              }`}
              onClick={() => setDifficulty(difficulty.level)}
            >
              <div className="flex items-center justify-center gap-2">
                {difficulty.icon}
                <span className="font-medium">{difficulty.label}</span>
              </div>
              <div className="text-xs text-center mt-1 text-gray-400">{difficulty.description}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DifficultySelector;

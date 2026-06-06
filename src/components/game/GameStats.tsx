
import React from "react";
import { useGame } from "@/contexts/GameContext";
import { Award, Heart, Coins } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const GameStats: React.FC = () => {
  const { gameState } = useGame();

  return (
    <div className="max-w-3xl mx-auto grid grid-cols-3 gap-3 mb-6">
      <StatsCard 
        icon={<Award size={20} className="text-game-gold" />}
        label="Level"
        value={gameState.level}
      />
      <StatsCard 
        icon={<Coins size={20} className="text-game-gold" />}
        label="Gold"
        value={gameState.gold}
      />
      <StatsCard 
        icon={<Heart size={20} className="text-game-red" />}
        label="Lives"
        value={gameState.lives}
      />
    </div>
  );
};

interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
}

const StatsCard: React.FC<StatsCardProps> = ({ icon, label, value }) => {
  return (
    <Card className="bg-game-dark border-game-secondary">
      <CardContent className="p-4 flex flex-col items-center">
        <div className="flex items-center mb-1">
          {icon}
          <span className="font-bold ml-2 text-white">{label}</span>
        </div>
        <span className="text-2xl font-bold text-game-primary">{value}</span>
      </CardContent>
    </Card>
  );
};

export default GameStats;

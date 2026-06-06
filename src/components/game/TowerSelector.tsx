
import React from "react";
import { useGame } from "@/contexts/GameContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TowerSelector: React.FC = () => {
  const { gameState, selectTowerType } = useGame();

  const towers = [
    { 
      type: "basic", 
      name: "Basic Tower", 
      damage: 10, 
      range: 2, 
      cost: 50, 
      color: "bg-blue-500" 
    },
    { 
      type: "cannon", 
      name: "Cannon Tower", 
      damage: 20, 
      range: 1, 
      cost: 100, 
      color: "bg-red-500" 
    },
    { 
      type: "sniper", 
      name: "Sniper Tower", 
      damage: 30, 
      range: 3, 
      cost: 150, 
      color: "bg-purple-500" 
    },
  ];

  return (
    <Card className="max-w-3xl mx-auto bg-game-dark border-game-secondary mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-center text-game-primary">Towers</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-4">
        {towers.map((tower) => (
          <div 
            key={tower.type}
            className={`p-3 rounded-lg ${
              gameState.selectedTowerType === tower.type ? "bg-game-secondary/50" : "bg-game-dark"
            } cursor-pointer transition-colors hover:bg-game-secondary/30`}
            onClick={() => selectTowerType(tower.type)}
          >
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 ${tower.color} rounded-md flex items-center justify-center mb-2`}>
                <span className="text-white font-bold">{tower.name[0]}</span>
              </div>
              <h3 className="font-medium text-sm text-white mb-1">{tower.name}</h3>
              <div className="text-xs text-gray-300">
                <div>Damage: {tower.damage}</div>
                <div>Range: {tower.range}</div>
                <div className="text-game-gold">Cost: {tower.cost}</div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default TowerSelector;

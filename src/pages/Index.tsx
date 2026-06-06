
import React from "react";
import { GameProvider } from "@/contexts/GameContext";
import GameBoard from "@/components/game/GameBoard";
import GameControls from "@/components/game/GameControls";
import GameStats from "@/components/game/GameStats";
import TowerSelector from "@/components/game/TowerSelector";
import GameInstructions from "@/components/game/GameInstructions";
import DifficultySelector from "@/components/game/DifficultySelector";

const Index = () => {
  return (
    <GameProvider>
      <div className="min-h-screen bg-game-dark text-white p-4 md:p-8">
        <header className="text-center mb-6">
          <h1 className="text-4xl font-bold text-game-primary mb-2 animate-pulse-light">Defense Evolved</h1>
          <p className="text-gray-300">Fortress Saga</p>
        </header>
        
        <GameStats />
        <div className="mb-4">
          <DifficultySelector />
        </div>
        <GameControls />
        <GameBoard />
        <div className="mt-6">
          <TowerSelector />
        </div>
        <div className="mt-6 mb-12">
          <GameInstructions />
        </div>
        
        <footer className="text-center text-sm text-gray-400 mt-12">
          <p>Defense Evolved: Fortress Saga © 2025</p>
        </footer>
      </div>
    </GameProvider>
  );
};

export default Index;

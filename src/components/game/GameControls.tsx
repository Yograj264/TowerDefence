
import React from "react";
import { useGame } from "@/contexts/GameContext";
import { Button } from "@/components/ui/button";
import { Play, Plus, X, Pause } from "lucide-react";

const GameControls: React.FC = () => {
  const { gameState, startNewGame, resumeGame, pauseGame, quitGame } = useGame();

  return (
    <div className="flex flex-wrap gap-3 justify-center max-w-3xl mx-auto mb-4">
      <Button 
        onClick={startNewGame} 
        className="bg-game-primary hover:bg-game-secondary" 
        disabled={gameState.isStarted && !gameState.isPaused}
      >
        <Plus size={16} className="mr-2" /> New Game
      </Button>
      
      {gameState.isPaused ? (
        <Button 
          onClick={resumeGame} 
          className="bg-game-green hover:bg-game-green/80" 
          disabled={!gameState.isStarted}
        >
          <Play size={16} className="mr-2" /> Resume
        </Button>
      ) : (
        <Button 
          onClick={pauseGame} 
          className="bg-game-secondary hover:bg-game-secondary/80" 
          disabled={!gameState.isStarted || gameState.isPaused}
        >
          <Pause size={16} className="mr-2" /> Pause
        </Button>
      )}
      
      <Button 
        onClick={quitGame} 
        variant="destructive" 
        disabled={!gameState.isStarted}
      >
        <X size={16} className="mr-2" /> Quit Game
      </Button>
    </div>
  );
};

export default GameControls;

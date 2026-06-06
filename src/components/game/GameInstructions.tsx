
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoIcon, Zap, Shield, Award } from "lucide-react";

const GameInstructions: React.FC = () => {
  return (
    <Card className="max-w-3xl mx-auto bg-game-dark border-game-secondary">
      <CardHeader className="pb-2 flex flex-row items-center">
        <InfoIcon className="w-5 h-5 mr-2 text-game-primary" />
        <CardTitle className="text-game-primary">How to Play</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-gray-300">
        <ol className="list-decimal pl-5 space-y-2">
          <li>Click <strong>New Game</strong> to start</li>
          <li>Select difficulty level - affects enemy strength and speed</li>
          <li>Select a tower from the tower menu</li>
          <li>Place towers on the green tiles to defend against enemies</li>
          <li>Prevent enemies from reaching the end of the path</li>
          <li>Each enemy that reaches the end costs you a life</li>
          <li>Earn gold by defeating enemies</li>
          <li>Use gold to build more towers</li>
        </ol>
        
        <div className="mt-4 pt-3 border-t border-game-secondary/30">
          <h4 className="text-game-primary font-medium mb-2">Tower Types:</h4>
          <div className="grid grid-cols-3 gap-2">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded-sm"></div>
              <span><strong>Basic</strong>: Balanced</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded-sm"></div>
              <span><strong>Cannon</strong>: High damage</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-purple-500 rounded-sm"></div>
              <span><strong>Sniper</strong>: Long range</span>
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-3 border-t border-game-secondary/30">
          <h4 className="text-game-primary font-medium mb-2">Difficulty Levels:</h4>
          <div className="grid grid-cols-3 gap-2">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-green-400" />
              <span><strong>Easy</strong></span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-yellow-400" />
              <span><strong>Medium</strong></span>
            </div>
            <div className="flex items-center space-x-2">
              <Award className="h-4 w-4 text-red-400" />
              <span><strong>Hard</strong></span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GameInstructions;

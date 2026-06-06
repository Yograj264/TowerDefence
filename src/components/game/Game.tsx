import React from 'react';
import GameBoard from './GameBoard';
import { useGame } from '@/contexts/GameContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Game: React.FC = () => {
  const { currentUser, gameState, quitGame } = useGame();

  return (
    <div className="min-h-screen bg-game-dark p-4">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* User info header */}
        <Card className="bg-game-darker p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={currentUser?.avatar} />
                <AvatarFallback>{currentUser?.username?.[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="text-white">
                <h2 className="text-xl font-bold">Welcome, {currentUser?.username}!</h2>
                <div className="flex gap-2 mt-1">
                  <Badge variant="outline">High Score: {currentUser?.highScore}</Badge>
                  <Badge variant="outline">Games: {currentUser?.gamesPlayed}</Badge>
                </div>
              </div>
            </div>
            <Button variant="destructive" onClick={quitGame}>
              Quit Game
            </Button>
          </div>
        </Card>

        {/* Game stats */}
        <Card className="bg-game-darker p-4">
          <Tabs defaultValue="stats" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="stats">Game Stats</TabsTrigger>
              <TabsTrigger value="towers">Towers</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
            </TabsList>
            <TabsContent value="stats" className="mt-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="text-white">
                  <h3 className="text-sm font-medium text-gray-400">Level</h3>
                  <p className="text-2xl font-bold">{gameState.level}</p>
                  <Progress value={(gameState.level / 10) * 100} className="mt-1" />
                </div>
                <div className="text-white">
                  <h3 className="text-sm font-medium text-gray-400">Lives</h3>
                  <p className="text-2xl font-bold">{gameState.lives}</p>
                  <Progress value={(gameState.lives / 10) * 100} className="mt-1" />
                </div>
                <div className="text-white">
                  <h3 className="text-sm font-medium text-gray-400">Score</h3>
                  <p className="text-2xl font-bold">{gameState.score}</p>
                  <Progress value={(gameState.score / 1000) * 100} className="mt-1" />
                </div>
                <div className="text-white">
                  <h3 className="text-sm font-medium text-gray-400">Gold</h3>
                  <p className="text-2xl font-bold">{gameState.gold}</p>
                  <Progress value={(gameState.gold / 500) * 100} className="mt-1" />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="towers" className="mt-4">
              <div className="grid grid-cols-3 gap-4">
                {gameState.towers.map((tower) => (
                  <Card key={tower.id} className="p-3 bg-game-dark">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        tower.type === 'basic' ? 'bg-blue-500' :
                        tower.type === 'cannon' ? 'bg-red-500' :
                        'bg-purple-500'
                      }`}>
                        {tower.type === 'basic' ? '⚡' :
                         tower.type === 'cannon' ? '💥' :
                         '🎯'}
                      </div>
                      <div>
                        <p className="text-white font-medium">{tower.type}</p>
                        <p className="text-sm text-gray-400">Level {tower.level}</p>
                      </div>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-1 text-sm text-gray-400">
                      <div>DMG: {tower.damage}</div>
                      <div>RNG: {tower.range}</div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="achievements" className="mt-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-3 bg-game-dark">
                  <div className="flex items-center gap-2">
                    <Badge>🏆</Badge>
                    <div>
                      <p className="text-white font-medium">First Victory</p>
                      <p className="text-sm text-gray-400">Complete your first game</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-3 bg-game-dark">
                  <div className="flex items-center gap-2">
                    <Badge>💰</Badge>
                    <div>
                      <p className="text-white font-medium">Rich Defender</p>
                      <p className="text-sm text-gray-400">Accumulate 1000 gold</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-3 bg-game-dark">
                  <div className="flex items-center gap-2">
                    <Badge>⚔️</Badge>
                    <div>
                      <p className="text-white font-medium">Tower Master</p>
                      <p className="text-sm text-gray-400">Build 10 towers</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-3 bg-game-dark">
                  <div className="flex items-center gap-2">
                    <Badge>🌟</Badge>
                    <div>
                      <p className="text-white font-medium">Perfect Defense</p>
                      <p className="text-sm text-gray-400">Complete a wave without damage</p>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Game board */}
        <GameBoard />
      </div>
    </div>
  );
};

export default Game;
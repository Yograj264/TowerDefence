import React, { useState } from "react";
import { useGame } from "@/contexts/GameContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { difficultySettings } from "@/contexts/GameContext";
import { toast } from 'react-hot-toast';
import AchievementsList from './AchievementsList';

const GameBoard: React.FC = (): JSX.Element => {
  const { 
    gameState, 
    placeTower, 
    selectTowerType, 
    startGame, 
    pauseGame, 
    resumeGame, 
    quitGame,
    startWave,
    upgradeTower,
    sellTower
  } = useGame();
  
  const navigate = useNavigate();
  const [selectedCell, setSelectedCell] = useState<{ x: number; y: number } | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number } | null>(null);
  const [showAchievements, setShowAchievements] = useState(false);
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle returning to main menu
  const handleMainMenu = () => {
    quitGame(); // Save game state
    navigate('/'); // Redirect to login page
  };

  // Handle returning to login page
  const handleBackToLogin = () => {
    quitGame(); // Save game state
    navigate('/login', { replace: true }); // Use replace to prevent going back to game
  };

  // Define path markers to show the enemy path
  const pathMarkers = [
    { x: 1, y: 7 }, // Start point (door)
    { x: 1, y: 6 }, { x: 2, y: 6 }, { x: 3, y: 6 }, { x: 4, y: 6 }, { x: 5, y: 6 }, { x: 6, y: 6 }, { x: 7, y: 6 }, { x: 8, y: 6 }, { x: 9, y: 6 }, { x: 10, y: 6 },
    { x: 10, y: 5 },
    { x: 10, y: 4 }, { x: 9, y: 4 }, { x: 8, y: 4 }, { x: 7, y: 4 }, { x: 6, y: 4 }, { x: 5, y: 4 }, { x: 4, y: 4 }, { x: 3, y: 4 }, { x: 2, y: 4 }, { x: 1, y: 4 },
    { x: 1, y: 3 }, 
    { x: 1, y: 2 },
    { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 1 },   
    { x: 4, y: 0 }, { x: 5, y: 0 } // End point (exit)
  ];

  // Define alternate path for high health enemies
  const alternatePathMarkers = [
    { x: 1, y: 7 }, // Start point (door)
    { x: 1, y: 6 }, { x: 2, y: 6 }, { x: 3, y: 6 }, { x: 4, y: 6 }, { x: 5, y: 6 }, { x: 6, y: 6 }, { x: 7, y: 6 }, { x: 8, y: 6 }, { x: 9, y: 6 }, { x: 10, y: 6 },
    { x: 10, y: 5 },
    { x: 10, y: 4 }, // Divergence point
    { x: 10, y: 3 }, 
    { x: 10, y: 2 },
    { x: 10, y: 1 }, { x: 9, y: 1 }, { x: 8, y: 1 }, { x: 7, y: 1 }, { x: 6, y: 1 },
    { x: 6, y: 0 }, { x: 5, y: 0 } // End point (exit)
  ];

  // Define start and end points
  const startPoint = { x: 1, y: 7 };
  const endPoint = { x: 5, y: 0 };

  // Define the game map with more interesting terrain
  // 0 = path, 1 = tower placement, 2 = decorative element
  const gameMap = [
    [1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ];

  // Define tower types with enhanced visuals
  const towerTypes = {
    basic: {
      name: "Basic Tower",
      icon: "⚡",
      color: "bg-blue-500",
      glow: "shadow-[0_0_10px_rgba(59,130,246,0.5)]",
      cost: 50,
      damage: 10,
      range: 2,
      description: "Balanced tower with good all-around stats",
      upgradeCost: 30
    },
    cannon: {
      name: "Cannon Tower",
      icon: "💥",
      color: "bg-red-500",
      glow: "shadow-[0_0_10px_rgba(239,68,68,0.5)]",
      cost: 100,
      damage: 20,
      range: 1,
      description: "High damage but short range",
      upgradeCost: 60
    },
    sniper: {
      name: "Sniper Tower",
      icon: "🎯",
      color: "bg-purple-500",
      glow: "shadow-[0_0_10px_rgba(168,85,247,0.5)]",
      cost: 150,
      damage: 30,
      range: 3,
      description: "High damage and range, but slow attack speed",
      upgradeCost: 90
    }
  };

  const handleCellClick = (x: number, y: number) => {
    if (!gameState.isStarted || gameState.isPaused) return;
    
    // Check if cell is valid for tower placement
    if (gameMap[y][x] === 1) {
      setSelectedCell({ x, y });
      
      // If a tower is already selected, try to place it
      if (gameState.selectedTowerType) {
        placeTower({ x, y });
      }
    }
  };

  const handleCellHover = (x: number, y: number) => {
    if (gameMap[y][x] === 1) {
      setHoveredCell({ x, y });
    } else {
      setHoveredCell(null);
    }
  };

  // Get enemy color based on type
  const getEnemyColor = (type: string) => {
    switch(type) {
      case 'fast':
        return 'bg-game-gold';
      case 'tank':
        return 'bg-game-secondary';
      default:
        return 'bg-game-red';
    }
  };

  // Get tower visual based on type
  const getTowerVisual = (type: string) => {
    return towerTypes[type as keyof typeof towerTypes] || towerTypes.basic;
  };

  const isPathMarker = (x: number, y: number) => {
    return pathMarkers.some(marker => marker.x === x && marker.y === y);
  };

  const isAlternatePathMarker = (x: number, y: number) => {
    return alternatePathMarkers.some(marker => marker.x === x && marker.y === y);
  };

  const isDivergencePoint = (x: number, y: number) => {
    return x === 10 && y === 4;
  };

  const isStartPoint = (x: number, y: number) => {
    return x === startPoint.x && y === startPoint.y;
  };

  const isEndPoint = (x: number, y: number) => {
    return x === endPoint.x && y === endPoint.y;
  };

  const getEnemyPosition = (pathProgress: number) => {
    const totalPathLength = pathMarkers.length - 1;
    const pathIndex = Math.min(Math.floor((pathProgress / 100) * totalPathLength), totalPathLength);
    return pathMarkers[pathIndex];
  };

  const getTowerAtPosition = (x: number, y: number) => {
    return gameState.towers.find(tower => tower.position.x === x && tower.position.y === y);
  };

  const renderCell = (x: number, y: number) => {
    const cellType = gameMap[y][x];
    const tower = getTowerAtPosition(x, y);
    
    // Find all enemies at this position
    const enemiesAtPosition = gameState.enemies.filter(e => 
      e.position.x === x && e.position.y === y
    );
    
    let cellContent = null;
    let cellClassName = 'w-12 h-12 border border-gray-700 flex items-center justify-center relative transition-all duration-200';
    
    // Check if this cell is within range of any tower
    const isInTowerRange = gameState.towers.some(t => {
      const dx = Math.abs(t.position.x - x);
      const dy = Math.abs(t.position.y - y);
      return Math.sqrt(dx * dx + dy * dy) <= t.range;
    });
    
    // Add hover effect for valid tower placement cells
    if (cellType === 1) {
      cellClassName += ' bg-green-800 hover:bg-green-700 cursor-pointer';
      
      // Highlight selected cell
      if (selectedCell && selectedCell.x === x && selectedCell.y === y) {
        cellClassName += ' ring-2 ring-blue-500';
      }
      
      // Show tower range preview when hovering with a tower selected
      if (hoveredCell && hoveredCell.x === x && hoveredCell.y === y && gameState.selectedTowerType) {
        const towerType = towerTypes[gameState.selectedTowerType as keyof typeof towerTypes];
        cellClassName += ' ring-2 ring-green-500';
      }
      
      // Highlight cells in range of existing towers
      if (isInTowerRange) {
        cellClassName += ' bg-green-700';
      }
    } else if (cellType === 0) {
      if (isPathMarker(x, y)) {
        // Path marker cells - white background
        cellClassName += ' bg-white';
        
        // Add different color for start and end points
        if (isStartPoint(x, y)) {
          cellClassName += ' bg-purple-100';
        } else if (isEndPoint(x, y)) {
          cellClassName += ' bg-red-100';
        }
        
        // Highlight divergence point
        if (isDivergencePoint(x, y)) {
          cellClassName += ' bg-yellow-200';
        }
        
        // Highlight path cells in range of towers
        if (isInTowerRange) {
          cellClassName += ' bg-yellow-100';
        }
      } else if (isAlternatePathMarker(x, y)) {
        // Alternate path marker cells - light blue background
        cellClassName += ' bg-blue-100';
        
        // Highlight divergence point
        if (isDivergencePoint(x, y)) {
          cellClassName += ' bg-yellow-200';
        }
        
        // Highlight path cells in range of towers
        if (isInTowerRange) {
          cellClassName += ' bg-blue-200';
        }
      } else {
        // Regular path cells - light green
        cellClassName += ' bg-green-600';
        
        // Highlight path cells in range of towers
        if (isInTowerRange) {
          cellClassName += ' bg-yellow-200';
        }
      }
    } else {
      // Decorative elements - darker green
      cellClassName += ' bg-green-900';
      
      // Highlight decorative cells in range of towers
      if (isInTowerRange) {
        cellClassName += ' bg-green-800';
      }
    }
    
    if (isStartPoint(x, y)) {
      cellContent = (
        <div className="flex flex-col items-center">
          <span className="text-white text-xl">🚪</span>
          <Badge variant="outline" className="mt-1 text-xs">ENTRANCE</Badge>
        </div>
      );
    } else if (isEndPoint(x, y)) {
      cellContent = (
        <div className="flex flex-col items-center">
          <span className="text-white text-xl">🚪</span>
          <Badge variant="outline" className="mt-1 text-xs bg-red-500 text-white">ESCAPE</Badge>
        </div>
      );
    } else if (isDivergencePoint(x, y)) {
      cellContent = (
        <div className="flex flex-col items-center">
          <span className="text-yellow-600 text-xl">↔️</span>
          <Badge variant="outline" className="mt-1 text-xs bg-yellow-200">SPLIT</Badge>
        </div>
      );
    } else if (tower) {
      const visual = getTowerVisual(tower.type);
      const originalRange = towerTypes[tower.type as keyof typeof towerTypes].range;
      const rangeReduction = originalRange - tower.range;
      const rangeReductionPercent = rangeReduction > 0 ? Math.round((rangeReduction / originalRange) * 100) : 0;
      
      const originalDamage = towerTypes[tower.type as keyof typeof towerTypes].damage;
      const damageReduction = originalDamage - tower.damage;
      const damageReductionPercent = damageReduction > 0 ? Math.round((damageReduction / originalDamage) * 100) : 0;
      
      cellContent = (
        <Tooltip>
          <TooltipTrigger>
            <div className={`${visual.color} ${visual.glow} w-8 h-8 rounded-full flex items-center justify-center text-white`}>
              {tower.type === 'basic' ? '🗼' : tower.type === 'cannon' ? '💣' : '🎯'}
            </div>
          </TooltipTrigger>
          <TooltipContent className="w-64">
            <div className="space-y-2">
              <h4 className="font-bold">{visual.name}</h4>
              <div className="grid grid-cols-2 gap-1 text-sm">
                <div>Damage: {tower.damage} {damageReductionPercent > 0 && <span className="text-red-500">(-{damageReductionPercent}%)</span>}</div>
                <div>Range: {tower.range} {rangeReductionPercent > 0 && <span className="text-red-500">(-{rangeReductionPercent}%)</span>}</div>
                <div>Upgrade: {visual.upgradeCost} gold</div>
                <div>Sell: {Math.floor(tower.cost * 0.7)} gold</div>
              </div>
              <div className="flex gap-2 mt-2">
                <Button size="sm" onClick={() => upgradeTower(tower.id)}>
                  Upgrade
                </Button>
                <Button size="sm" variant="destructive" onClick={() => sellTower(tower.id)}>
                  Sell
                </Button>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      );
    } else if (enemiesAtPosition.length > 0) {
      // Display multiple enemies in the same cell
      const enemy = enemiesAtPosition[0]; // Use the first enemy for tooltip
      const healthPercent = (enemy.health / enemy.maxHealth) * 100;
      const isHighHealthPath = enemy.health > 20;
      
      cellContent = (
        <Tooltip>
          <TooltipTrigger>
            <div className="relative">
              <div className={`${getEnemyColor(enemy.type)} w-8 h-8 rounded-full flex items-center justify-center text-white`}>
                {enemy.type === 'fast' ? '⚡' : enemy.type === 'tank' ? '🛡️' : '👾'}
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                <div 
                  className="h-full bg-green-500" 
                  style={{ width: `${healthPercent}%` }}
                />
              </div>
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-xs font-bold text-white bg-black/50 px-1 rounded">
                {enemy.health}/{enemy.maxHealth}
              </div>
              {isHighHealthPath && (
                <div className="absolute -right-1 -top-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  A
                </div>
              )}
              {enemiesAtPosition.length > 1 && (
                <div className="absolute -left-1 -top-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {enemiesAtPosition.length}
                </div>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <div className="font-bold">{enemy.type.toUpperCase()} Enemy</div>
              <div className="text-red-500 font-semibold">Goal: Escape the house!</div>
              <div>Health: {enemy.health}/{enemy.maxHealth}</div>
              <div>Speed: {enemy.speed}</div>
              <div className="text-xs text-gray-500">If they escape, your towers will weaken!</div>
              {isHighHealthPath && (
                <div className="text-xs text-blue-500 font-semibold">Taking alternate path (health {'>'} 20)</div>
              )}
              {enemiesAtPosition.length > 1 && (
                <div className="text-xs text-red-500 font-semibold">{enemiesAtPosition.length} enemies in this cell</div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      );
    }
    
    return (
      <div 
        key={`${x}-${y}`}
        className={cellClassName}
        onClick={() => handleCellClick(x, y)}
        onMouseEnter={() => handleCellHover(x, y)}
        onMouseLeave={() => setHoveredCell(null)}
      >
        {cellContent}
      </div>
    );
  };

  // Render the game board
  const renderGameBoard = () => {
    const rows = [];
    for (let y = 0; y < gameMap.length; y++) {
      const cells = [];
      for (let x = 0; x < gameMap[y].length; x++) {
        cells.push(renderCell(x, y));
      }
      rows.push(
        <div key={y} className="flex">
          {cells}
        </div>
      );
    }
    return rows;
  };

  return (
    <div className="relative w-full h-full flex">
      {/* Left Side Panel with Game Information */}
      <div className="w-[250px] p-4 flex flex-col gap-4">
        <div className="bg-blue-50/90 p-4 rounded-lg shadow-lg border-2 border-blue-200">
          <h2 className="text-xl font-bold mb-2 text-center border-b-2 border-blue-300 pb-2 text-blue-800">Wave Details</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium text-blue-700">Next Wave:</span>
              <span className="font-bold text-blue-900">{gameState.wave + 1}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-blue-700">Enemies:</span>
              <span className="font-bold text-blue-900">{difficultySettings[gameState.difficulty].waveEnemyCount(gameState.wave + 1)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-blue-700">Difficulty:</span>
              <span className="font-bold text-blue-900 capitalize">{gameState.difficulty}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-blue-700">Enemy Health:</span>
              <span className="font-bold text-blue-900">{difficultySettings[gameState.difficulty].enemyHealthMultiplier}x</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-blue-700">Remaining:</span>
              <span className="font-bold text-blue-900">{gameState.enemies.length}</span>
            </div>
          </div>
        </div>

        <div className="bg-green-50/90 p-4 rounded-lg shadow-lg border-2 border-green-200">
          <h2 className="text-xl font-bold mb-2 text-center border-b-2 border-green-300 pb-2 text-green-800">Game Stats</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium text-green-700">Score:</span>
              <span className="font-bold text-green-900">{gameState.score}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-green-700">Gold:</span>
              <span className="font-bold text-green-900">{gameState.gold}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-green-700">Lives:</span>
              <span className="font-bold text-green-900">{gameState.lives}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-green-700">Level:</span>
              <span className="font-bold text-green-900">{gameState.level}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-green-700">Escaped:</span>
              <span className="font-bold text-green-900">{gameState.enemiesEscaped}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleBackToLogin}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors font-medium shadow-md flex-1"
          >
            Back to Login
          </button>
          <button
            onClick={() => setShowAchievements(!showAchievements)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors font-medium shadow-md"
          >
            {showAchievements ? 'Hide' : 'Show'} Achievements
          </button>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 p-4 flex flex-col">
        {/* Top Controls */}
        <div className="mb-4 flex justify-end">
          <Button 
            onClick={gameState.isPaused ? resumeGame : pauseGame}
            variant={gameState.isPaused ? "default" : "outline"}
            className="w-[120px] bg-purple-500 hover:bg-purple-600 text-white"
          >
            {gameState.isPaused ? "Resume" : "Pause"}
          </Button>
        </div>
        
        {/* Game Controls and Tower Selection */}
        <div className="flex gap-4 mb-4">
          {/* Game Controls */}
          <div className="flex-1">
            <div className="mb-4">
              {!gameState.isStarted ? (
                <div className="flex justify-center">
                  <Button onClick={() => startGame('medium')} className="w-[200px] bg-indigo-500 hover:bg-indigo-600 text-white">Start Game</Button>
                </div>
              ) : !gameState.waveInProgress ? (
                <div className="flex flex-col items-center">
                  <Button onClick={startWave} className="bg-emerald-500 hover:bg-emerald-600 mb-2 w-[200px] text-white">
                    Start Wave {gameState.wave + 1}
                  </Button>
                  
                  {/* Wave Details */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                    <h3 className="text-blue-800 font-semibold text-center mb-2 pb-2 border-b border-blue-200">Wave Details</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-blue-700 font-medium">Next Wave:</span>
                        <span className="text-blue-900">{gameState.wave + 1}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700 font-medium">Enemy Count:</span>
                        <span className="text-blue-900">{difficultySettings[gameState.difficulty].waveEnemyCount(gameState.wave + 1)}</span>
                      </div>
                      {gameState.nextWaveCountdown > 0 && (
                        <div className="flex justify-between">
                          <span className="text-blue-700 font-medium">Next Wave In:</span>
                          <span className="text-blue-900">{(gameState.nextWaveCountdown / 1000).toFixed(1)}s</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Wave details panel */}
                  <Card className="w-full p-3 bg-amber-50 border-2 border-amber-200">
                    <h3 className="font-bold text-center mb-2 text-amber-800">Wave {gameState.wave + 1} Details</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-amber-700">Enemies:</span>
                        <span className="font-bold text-amber-900">{difficultySettings[gameState.difficulty].waveEnemyCount(gameState.wave + 1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-amber-700">Level:</span>
                        <span className="font-bold text-amber-900">{gameState.level}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-amber-700">Enemy Health:</span>
                        <span className="font-bold text-amber-900">x{gameState.level}</span>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-amber-600">
                      <p>• Enemies with health {'>'} 20 will take the alternate path</p>
                      <p>• Escaped enemies will weaken your towers</p>
                    </div>
                  </Card>
                </div>
              ) : (
                <div className="text-center">
                  <div className="mb-2 font-bold text-cyan-800">Wave {gameState.wave} in progress</div>
                  <Progress value={gameState.waveTimer / 20000 * 100} className="w-full max-w-[400px] mx-auto bg-cyan-100" />
                  <div className="mt-1 text-sm text-cyan-700">{formatTime(gameState.waveTimer / 1000)}</div>
                  
                  {/* Wave progress indicators */}
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs max-w-[400px] mx-auto">
                    <div className="bg-green-100 p-1 rounded border border-green-200">
                      <span className="font-bold text-green-800">Defeated:</span> <span className="text-green-900">{gameState.enemiesDefeated}</span>
                    </div>
                    <div className="bg-red-100 p-1 rounded border border-red-200">
                      <span className="font-bold text-red-800">Escaped:</span> <span className="text-red-900">{gameState.enemiesEscaped}</span>
                    </div>
                  </div>
                  
                  {/* Next wave warning */}
                  {gameState.waveTimer < 5000 && (
                    <div className="mt-2 text-amber-600 font-bold animate-pulse">
                      Next wave starting soon!
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Tower Selection and Info */}
          <div className="w-[300px] flex flex-col gap-4">
            {/* Tower Selection */}
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(towerTypes).map(([type, tower]) => (
                <Button
                  key={type}
                  className={`flex flex-col items-center p-2 ${
                    gameState.selectedTowerType === type 
                      ? 'ring-2 ring-blue-500 bg-blue-100 shadow-md' 
                      : 'bg-white hover:bg-gray-100'
                  }`}
                  onClick={() => selectTowerType(type)}
                  disabled={gameState.gold < tower.cost}
                >
                  <span className="text-2xl mb-1">{tower.icon}</span>
                  <span className="text-sm font-bold text-gray-800">{tower.name}</span>
                  <span className="text-xs font-medium text-gray-600">{tower.cost} gold</span>
                </Button>
              ))}
            </div>
            
            {/* Tower Info Panel */}
            <Card className="p-4 bg-white border-2 border-gray-200 shadow-md">
              <h3 className="text-lg font-bold mb-3 text-gray-800 border-b-2 border-gray-200 pb-2">Tower Info</h3>
              {gameState.selectedTowerType ? (
                <div className="space-y-3">
                  {(() => {
                    const tower = towerTypes[gameState.selectedTowerType as keyof typeof towerTypes];
                    return (
                      <>
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{tower.icon}</span>
                          <span className="font-bold text-xl text-gray-800">{tower.name}</span>
                        </div>
                        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{tower.description}</div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="bg-blue-50 p-2 rounded">
                            <span className="text-gray-600">Damage:</span>
                            <span className="font-bold text-blue-800 ml-1">{tower.damage}</span>
                          </div>
                          <div className="bg-blue-50 p-2 rounded">
                            <span className="text-gray-600">Range:</span>
                            <span className="font-bold text-blue-800 ml-1">{tower.range}</span>
                          </div>
                          <div className="bg-green-50 p-2 rounded">
                            <span className="text-gray-600">Cost:</span>
                            <span className="font-bold text-green-800 ml-1">{tower.cost} gold</span>
                          </div>
                          <div className="bg-green-50 p-2 rounded">
                            <span className="text-gray-600">Upgrade:</span>
                            <span className="font-bold text-green-800 ml-1">{tower.upgradeCost} gold</span>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              ) : (
                <div className="text-sm text-gray-500 text-center py-4">Select a tower to see details</div>
              )}
            </Card>
          </div>
        </div>
        
        {/* Game Board */}
        <div className="flex-1 border-2 border-gray-300 p-4 rounded-lg bg-gray-50">
          {renderGameBoard()}
        </div>
      </div>

      {/* Achievements List */}
      {showAchievements && <AchievementsList />}
    </div>
  );
};

export default GameBoard;
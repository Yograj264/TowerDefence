import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { toast } from "@/components/ui/sonner";

type Difficulty = "easy" | "medium" | "hard";

interface Tower {
  id: string;
  type: 'basic' | 'cannon' | 'sniper';
  position: { x: number; y: number };
  level: number;
  damage: number;
  range: number;
  cost: number;
  lastAttackTime: number;
}

interface Enemy {
  id: string;
  type: string;
  health: number;
  maxHealth: number;
  position: { x: number; y: number };
  path: number;
  speed: number;
  reward: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  target: number;
  reward: number;
  unlocked: boolean;
  achieved: boolean;
  progress: number;
}

interface GameState {
  isStarted: boolean;
  isPaused: boolean;
  level: number;
  score: number;
  gold: number;
  lives: number;
  wave: number;
  health: number;
  towers: Tower[];
  enemies: Enemy[];
  selectedTowerType: 'basic' | 'cannon' | 'sniper' | null;
  difficulty: 'easy' | 'medium' | 'hard';
  waveInProgress: boolean;
  waveTimer: number;
  gameTime: number; // Track total game time in seconds
  enemiesDefeated: number;
  enemiesEscaped: number;
  nextWaveCountdown: number;
  totalEnemiesSpawned: number;
  achievements: Achievement[];
  unlockedAchievements: string[]; // Track unlocked achievement IDs
}

interface User {
  id: string;
  username: string;
  highScore: number;
  gamesPlayed: number;
  avatar?: string;
}

interface GameContextType {
  gameState: GameState;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  startNewGame: () => void;
  startGame: (difficulty: 'easy' | 'medium' | 'hard') => void;
  resumeGame: () => void;
  pauseGame: () => void;
  quitGame: () => void;
  placeTower: (position: { x: number; y: number }) => void;
  selectTowerType: (type: string) => void;
  setDifficulty: (difficulty: Difficulty) => void;
  updateUserStats: (score: number) => void;
  startWave: () => void;
  upgradeTower: (towerId: string) => void;
  sellTower: (towerId: string) => void;
}

const initialAchievements: Achievement[] = [
  {
    id: 'wave_5',
    title: 'Wave Warrior',
    description: 'Complete 5 waves',
    target: 5,
    reward: 100,
    unlocked: false,
    achieved: false,
    progress: 0
  },
  {
    id: 'score_1000',
    title: 'Score Champion',
    description: 'Reach 1000 points',
    target: 1000,
    reward: 200,
    unlocked: false,
    achieved: false,
    progress: 0
  },
  {
    id: 'tower_5',
    title: 'Tower Master',
    description: 'Place 5 towers',
    target: 5,
    reward: 150,
    unlocked: false,
    achieved: false,
    progress: 0
  },
  {
    id: 'level_3',
    title: 'Level Up',
    description: 'Reach level 3',
    target: 3,
    reward: 100,
    unlocked: false,
    achieved: false,
    progress: 0
  }
];

const initialGameState: GameState = {
  isStarted: false,
  isPaused: false,
  level: 1,
  score: 0,
  gold: 100,
  lives: 10,
  wave: 0,
  health: 100,
  towers: [],
  enemies: [],
  selectedTowerType: null,
  difficulty: 'medium',
  waveInProgress: false,
  waveTimer: 0,
  gameTime: 0,
  enemiesDefeated: 0,
  enemiesEscaped: 0,
  nextWaveCountdown: 0,
  totalEnemiesSpawned: 0,
  achievements: initialAchievements,
  unlockedAchievements: [] // Initialize empty array for unlocked achievements
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
  {x:10,y:2},
    { x: 10, y: 1 }, { x: 9, y: 1 }, { x: 8, y: 1 }, { x: 7, y: 1 }, { x: 6, y: 1 },
 { x:6, y: 0 }, { x: 5, y: 0 } // End point (exit)
];

// Define tower types and their properties
const towerTypes = {
  basic: {
    damage: 10,
    range: 2,
    cost: 50,
    upgradeCost: 30,
    attackSpeed: 1000, // ms between attacks
    description: "Basic tower with balanced stats"
  },
  cannon: {
    damage: 20,
    range: 1,
    cost: 100,
    upgradeCost: 60,
    attackSpeed: 1500,
    description: "High damage, low range"
  },
  sniper: {
    damage: 30,
    range: 3,
    cost: 150,
    upgradeCost: 90,
    attackSpeed: 2000,
    description: "High damage, high range, slow attack speed"
  }
};

// Define difficulty settings
export const difficultySettings = {
  easy: {
    startingGold: 200,
    startingLives: 15,
    enemyHealthMultiplier: 0.8,
    enemySpeedMultiplier: 0.8,
    enemyRewardMultiplier: 1.2,
    waveEnemyCount: (wave: number) => Math.floor(5 + wave * 2) // Starts with 5 enemies, increases by 2 per wave
  },
  medium: {
    startingGold: 100,
    startingLives: 10,
    enemyHealthMultiplier: 1.0,
    enemySpeedMultiplier: 1.0,
    enemyRewardMultiplier: 1.0,
    waveEnemyCount: (wave: number) => Math.floor(8 + wave * 3) // Starts with 8 enemies, increases by 3 per wave
  },
  hard: {
    startingGold: 50,
    startingLives: 5,
    enemyHealthMultiplier: 1.5,
    enemySpeedMultiplier: 1.2,
    enemyRewardMultiplier: 0.8,
    waveEnemyCount: (wave: number) => Math.floor(10 + wave * 4) // Starts with 10 enemies, increases by 4 per wave
  }
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [gameInterval, setGameInterval] = useState<NodeJS.Timeout | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedTowerType, setSelectedTowerType] = useState<'basic' | 'cannon' | 'sniper'>('basic');

  // Game loop
  useEffect(() => {
    if (gameState.isStarted && !gameState.isPaused) {
      const interval = setInterval(() => {
        updateGameState();
      }, 100); // Update more frequently for smoother animations
      
      setGameInterval(interval);
      
      return () => {
        if (interval) clearInterval(interval);
      };
    } else if (gameInterval) {
      clearInterval(gameInterval);
      setGameInterval(null);
    }
  }, [gameState.isStarted, gameState.isPaused]);

  // Calculate enemy position based on path progress
  const getEnemyPosition = (enemy: Enemy) => {
    // Choose path based on enemy health
    const selectedPath = enemy.health > 20 ? alternatePathMarkers : pathMarkers;
    
    // Convert path progress (0-100) to index in pathMarkers array
    const totalPathLength = selectedPath.length - 1;
    const pathIndex = Math.min(Math.floor((enemy.path / 100) * totalPathLength), totalPathLength);
    
    // Get current path point
    const currentPoint = selectedPath[pathIndex];
    
    // Return the exact grid position to keep enemies in cells
    return { x: currentPoint.x, y: currentPoint.y };
  };

  // Update game state on each tick
  const updateGameState = () => {
    setGameState(prev => {
      const diffSettings = difficultySettings[prev.difficulty];
      
      // Handle wave timer
      let newWaveTimer = prev.waveTimer;
      if (prev.waveInProgress) {
        newWaveTimer = Math.max(0, prev.waveTimer - 100);
      }
      
      // Handle next wave countdown
      let newNextWaveCountdown = prev.nextWaveCountdown;
      if (newNextWaveCountdown > 0) {
        newNextWaveCountdown = Math.max(0, newNextWaveCountdown - 100);
        if (newNextWaveCountdown === 0) {
          startWave();
        }
      }
      
      // Spawn new enemies based on wave progress
      let newEnemies = [...prev.enemies];
      let newWaveInProgress = prev.waveInProgress;
      let newLevel = prev.level;
      let newTotalEnemiesSpawned = prev.totalEnemiesSpawned;
      
      if (prev.waveInProgress) {
        // Calculate total enemies for this wave
        const totalEnemiesInWave = diffSettings.waveEnemyCount(prev.wave);
        
        // Only spawn if we haven't reached the wave limit
        if (newTotalEnemiesSpawned < totalEnemiesInWave) {
          // Spawn rate increases with wave number
          const spawnChance = Math.min(0.2 + (prev.wave * 0.01), 0.4);
          
          if (Math.random() < spawnChance) {
            // Spawn new enemy with weighted probabilities
            const enemyTypes = [
              { type: 'basic', weight: 0.6 },  // 60% chance
              { type: 'fast', weight: 0.25 },  // 25% chance
              { type: 'tank', weight: 0.15 }   // 15% chance
            ];
            
            // Select enemy type based on weights
            const random = Math.random();
            let selectedType = 'basic';
            let cumulativeWeight = 0;
            
            for (const enemyType of enemyTypes) {
              cumulativeWeight += enemyType.weight;
              if (random <= cumulativeWeight) {
                selectedType = enemyType.type;
                break;
              }
            }
            
            // Base health depends on enemy type and current level
            let baseHealth = 20 * prev.level;
            let speed = 1;
            let reward = 5;
            
            if (selectedType === 'fast') {
              baseHealth *= 0.8;
              speed = 1.5;
              reward = 8;
            } else if (selectedType === 'tank') {
              baseHealth *= 2.0;
              speed = 0.7;
              reward = 12;
            }
            
            // Apply difficulty multiplier
            const healthWithDifficulty = Math.round(baseHealth * diffSettings.enemyHealthMultiplier);
            const speedWithDifficulty = speed * diffSettings.enemySpeedMultiplier;
            
            const newEnemy: Enemy = {
              id: `enemy-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              type: selectedType,
              health: healthWithDifficulty,
              maxHealth: healthWithDifficulty,
              position: pathMarkers[0],
              path: 0,
              speed: speedWithDifficulty,
              reward: reward
            };
            
            newEnemies.push(newEnemy);
            newTotalEnemiesSpawned += 1;
          }
        }
        
        // Check if wave is complete
        if (newTotalEnemiesSpawned >= totalEnemiesInWave && newEnemies.length === 0 && newWaveInProgress) {
          newWaveInProgress = false;
          toast.success(`Wave ${prev.wave} completed!`);
          newNextWaveCountdown = 3000; // 3 seconds countdown
          
          // Check for level up - every 5 waves
          const nextWave = prev.wave + 1;
          const expectedLevel = Math.floor(nextWave / 5) + 1;
          if (expectedLevel > prev.level) {
            newLevel = expectedLevel;
            toast.success(`Level Up! Now at level ${newLevel}`);
          }
        }
      }
      
      // Process tower attacks
      let earnedGold = 0;
      let earnedScore = 0;
      const currentTime = Date.now();
      let enemiesDefeatedThisTick = 0;
      
      // Update towers and process attacks
      const updatedTowers = prev.towers.map(tower => {
        // Check if tower can attack (based on attack speed)
        const timeSinceLastAttack = currentTime - tower.lastAttackTime;
        const towerType = towerTypes[tower.type as keyof typeof towerTypes];
        
        if (timeSinceLastAttack >= towerType.attackSpeed) {
          // Find closest enemy in range
          const enemiesInRange = newEnemies.filter(enemy => {
            // Get enemy position based on path progress
            const enemyPos = getEnemyPosition(enemy);
            
            // Calculate distance between tower and enemy
            const xDiff = tower.position.x - enemyPos.x;
            const yDiff = tower.position.y - enemyPos.y;
            const distance = Math.sqrt(xDiff * xDiff + yDiff * yDiff);
            
            return distance <= tower.range;
          });
          
          if (enemiesInRange.length > 0) {
            // Attack the first enemy in range
            const targetEnemy = enemiesInRange[0];
            const targetIndex = newEnemies.findIndex(e => e.id === targetEnemy.id);
            
            if (targetIndex !== -1) {
              newEnemies[targetIndex].health -= tower.damage;
              
              // Check if enemy is defeated
              if (newEnemies[targetIndex].health <= 0) {
                // Calculate rewards
                earnedGold += targetEnemy.reward;
                earnedScore += targetEnemy.reward * 2;
                
                // Increment defeated counter
                enemiesDefeatedThisTick++;
                
                // Remove defeated enemy
                newEnemies = newEnemies.filter(e => e.id !== targetEnemy.id);
              }
              
              // Update tower's last attack time
              return { ...tower, lastAttackTime: currentTime };
            }
          }
        }
        
        return tower;
      });
      
      // Move existing enemies along the path - use smaller increments to prevent blinking
      newEnemies = newEnemies.map(enemy => {
        // Use a larger increment for faster movement
        const pathIncrement = enemy.speed * 0.2; // Increased from 0.05 to 0.2 for faster movement
        
        // Choose path based on enemy health
        const selectedPath = enemy.health > 20 ? alternatePathMarkers : pathMarkers;
        const totalPathLength = selectedPath.length - 1;
        
        // Calculate new path progress
        let newPathProgress = enemy.path + pathIncrement;
        
        // Check if enemy has reached the end
        if (newPathProgress >= 100) {
          newPathProgress = 100; // Cap at 100%
        }
        
        return {
          ...enemy,
          path: newPathProgress,
          // Update position directly to prevent blinking
          position: getEnemyPosition({...enemy, path: newPathProgress})
        };
      });
      
      // Count enemies that reached the end
      const enemiesReachedEnd = newEnemies.filter(enemy => {
        const position = getEnemyPosition(enemy);
        return position.x === 5 && position.y === 0; // End point
      });
      
      const reachedEndCount = enemiesReachedEnd.length;
      
      // Remove enemies that reached the end
      newEnemies = newEnemies.filter(enemy => {
        const position = getEnemyPosition(enemy);
        return !(position.x === 5 && position.y === 0); // End point
      });
      
      // Each enemy that reached the end costs a life
      const newLives = prev.lives - reachedEndCount;
      
      // Update enemiesEscaped counter
      const newEnemiesEscaped = prev.enemiesEscaped + reachedEndCount;
      
      // Update enemiesDefeated counter
      const newEnemiesDefeated = prev.enemiesDefeated + enemiesDefeatedThisTick;
      
      // Reduce tower range and damage when enemies escape
      let updatedTowersWithReducedStats = updatedTowers;
      if (reachedEndCount > 0) {
        // Calculate range reduction (10% per escaped enemy, max 50% reduction)
        const rangeReductionPercent = Math.min(reachedEndCount * 10, 50);
        const rangeMultiplier = 1 - (rangeReductionPercent / 100);
        
        // Calculate damage reduction (15% per escaped enemy, max 60% reduction)
        const damageReductionPercent = Math.min(reachedEndCount * 15, 60);
        const damageMultiplier = 1 - (damageReductionPercent / 100);
        
        // Apply range and damage reduction to all towers
        updatedTowersWithReducedStats = updatedTowers.map(tower => {
          const originalRange = towerTypes[tower.type as keyof typeof towerTypes].range;
          const newRange = Math.max(1, Math.floor(originalRange * rangeMultiplier));
          
          const originalDamage = towerTypes[tower.type as keyof typeof towerTypes].damage;
          const newDamage = Math.max(1, Math.floor(originalDamage * damageMultiplier));
          
          return {
            ...tower,
            range: newRange,
            damage: newDamage
          };
        });
        
        // Show notification about stat reduction
        if (rangeReductionPercent > 0 || damageReductionPercent > 0) {
          toast.warning(`Towers weakened! Range -${rangeReductionPercent}%, Damage -${damageReductionPercent}% due to escaped enemies!`);
        }
      }
      
      // Check for game over
      if (newLives <= 0) {
        toast.error("Game Over! You ran out of lives.");
        // Update user stats
        if (currentUser) {
          updateUserStats(prev.score);
        }
        return initialGameState;
      }
      
      // Check for level up - every 5 waves
      if (prev.wave > 0 && prev.wave % 5 === 0 && !prev.waveInProgress) {
        newLevel = prev.level + 1;
        toast.success(`Level Up! Now at level ${newLevel}`);
      }
      
      // Check achievements
      let newAchievements = [...prev.achievements];
      let newUnlockedAchievements = [...prev.unlockedAchievements];

      // Check wave achievements
      if (prev.wave >= 5 && !newUnlockedAchievements.includes('wave_5')) {
        const wave5Achievement = newAchievements.find(a => a.id === 'wave_5');
        if (wave5Achievement) {
          wave5Achievement.unlocked = true;
          wave5Achievement.achieved = true;
          wave5Achievement.progress = prev.wave;
          newUnlockedAchievements.push('wave_5');
          earnedGold += wave5Achievement.reward;
          toast.success(`Achievement Unlocked: ${wave5Achievement.title}! +${wave5Achievement.reward} gold`);
        }
      }

      if (prev.wave >= 10 && !newUnlockedAchievements.includes('wave_10')) {
        const wave10Achievement = newAchievements.find(a => a.id === 'wave_10');
        if (wave10Achievement) {
          wave10Achievement.unlocked = true;
          wave10Achievement.achieved = true;
          wave10Achievement.progress = prev.wave;
          newUnlockedAchievements.push('wave_10');
          earnedGold += wave10Achievement.reward;
          toast.success(`Achievement Unlocked: ${wave10Achievement.title}! +${wave10Achievement.reward} gold`);
        }
      }

      // Check level achievement
      if (prev.level >= 3 && !newUnlockedAchievements.includes('level_3')) {
        const level3Achievement = newAchievements.find(a => a.id === 'level_3');
        if (level3Achievement) {
          level3Achievement.unlocked = true;
          level3Achievement.achieved = true;
          level3Achievement.progress = prev.level;
          newUnlockedAchievements.push('level_3');
          earnedGold += level3Achievement.reward;
          toast.success(`Achievement Unlocked: ${level3Achievement.title}! +${level3Achievement.reward} gold`);
        }
      }

      // Check tower achievement
      if (prev.towers.length >= 5 && !newUnlockedAchievements.includes('tower_5')) {
        const tower5Achievement = newAchievements.find(a => a.id === 'tower_5');
        if (tower5Achievement) {
          tower5Achievement.unlocked = true;
          tower5Achievement.achieved = true;
          tower5Achievement.progress = prev.towers.length;
          newUnlockedAchievements.push('tower_5');
          earnedGold += tower5Achievement.reward;
          toast.success(`Achievement Unlocked: ${tower5Achievement.title}! +${tower5Achievement.reward} gold`);
        }
      }

      // Check score achievement
      if (prev.score >= 1000 && !newUnlockedAchievements.includes('score_1000')) {
        const score1000Achievement = newAchievements.find(a => a.id === 'score_1000');
        if (score1000Achievement) {
          score1000Achievement.unlocked = true;
          score1000Achievement.achieved = true;
          score1000Achievement.progress = prev.score;
          newUnlockedAchievements.push('score_1000');
          earnedGold += score1000Achievement.reward;
          toast.success(`Achievement Unlocked: ${score1000Achievement.title}! +${score1000Achievement.reward} gold`);
        }
      }

      return {
        ...prev,
        enemies: newEnemies,
        towers: updatedTowersWithReducedStats,
        gold: prev.gold + earnedGold,
        score: prev.score + earnedScore,
        lives: newLives,
        level: newLevel,
        wave: prev.wave + (newWaveInProgress === false && prev.waveInProgress === true ? 1 : 0),
        waveInProgress: newWaveInProgress,
        waveTimer: newWaveTimer,
        enemiesEscaped: newEnemiesEscaped,
        enemiesDefeated: newEnemiesDefeated,
        nextWaveCountdown: newNextWaveCountdown,
        totalEnemiesSpawned: newTotalEnemiesSpawned,
        achievements: newAchievements,
        unlockedAchievements: newUnlockedAchievements
      };
    });
  };

  const startNewGame = () => {
    const diffSettings = difficultySettings[gameState.difficulty];
    toast(`New game started on ${gameState.difficulty} difficulty!`);
    
    setGameState({
      ...initialGameState,
      isStarted: true,
      isPaused: false,
      difficulty: gameState.difficulty,
      gold: diffSettings.startingGold,
    });
  };

  const startGame = (difficulty: 'easy' | 'medium' | 'hard') => {
    const settings = difficultySettings[difficulty];
    setGameState({
      ...initialGameState,
      isStarted: true,
      difficulty,
      gold: settings.startingGold,
      lives: settings.startingLives,
      gameTime: 0
    });
  };

  const resumeGame = () => {
    if (gameState.isStarted && gameState.isPaused) {
      toast("Game resumed!");
      setGameState(prev => ({ ...prev, isPaused: false }));
    }
  };

  const pauseGame = () => {
    if (gameState.isStarted && !gameState.isPaused) {
      toast("Game paused!");
      setGameState(prev => ({ ...prev, isPaused: true }));
    }
  };

  const quitGame = () => {
    if (gameState.isStarted) {
      toast("Game ended!");
      // Update user stats
      if (currentUser) {
        updateUserStats(gameState.score);
      }
      setGameState(initialGameState);
    }
  };

  const startWave = () => {
    if (!gameState.waveInProgress) {
      const settings = difficultySettings[gameState.difficulty];
      const enemyCount = settings.waveEnemyCount(gameState.wave + 1);
      
      setGameState(prev => ({
        ...prev,
        waveInProgress: true,
        waveTimer: 20000,
        enemies: [],
        wave: prev.wave + 1,
        totalEnemiesSpawned: 0
      }));
    }
  };

  const placeTower = (position: { x: number; y: number }) => {
    const { selectedTowerType, gold, towers } = gameState;
    
    if (!selectedTowerType) {
      toast("Select a tower first!");
      return;
    }
    
    const towerSpec = towerTypes[selectedTowerType as keyof typeof towerTypes];
    
    // Check if enough gold
    if (gold < towerSpec.cost) {
      toast("Not enough gold!");
      return;
    }
    
    // Check if position is already occupied
    const isTowerAtPosition = towers.some(
      tower => tower.position.x === position.x && tower.position.y === position.y
    );
    
    if (isTowerAtPosition) {
      toast("Position already occupied!");
      return;
    }
    
    // Add new tower
    const newTower: Tower = {
      id: `tower-${Date.now()}`,
      type: selectedTowerType,
      position,
      level: 1,
      damage: towerSpec.damage,
      range: towerSpec.range,
      cost: towerSpec.cost,
      lastAttackTime: 0
    };
    
    setGameState(prev => ({
      ...prev,
      towers: [...prev.towers, newTower],
      gold: prev.gold - towerSpec.cost,
    }));
    
    toast(`${selectedTowerType} tower placed!`);
  };

  const upgradeTower = (towerId: string) => {
    const tower = gameState.towers.find(t => t.id === towerId);
    
    if (!tower) return;
    
    const towerSpec = towerTypes[tower.type as keyof typeof towerTypes];
    
    // Check if enough gold
    if (gameState.gold < towerSpec.upgradeCost) {
      toast("Not enough gold to upgrade!");
      return;
    }
    
    // Upgrade tower
    setGameState(prev => ({
      ...prev,
      towers: prev.towers.map(t => {
        if (t.id === towerId) {
          return {
            ...t,
            damage: t.damage * 1.5,
            range: t.range * 1.2,
            cost: t.cost + towerSpec.upgradeCost
          };
        }
        return t;
      }),
      gold: prev.gold - towerSpec.upgradeCost,
    }));
    
    toast(`${tower.type} tower upgraded!`);
  };

  const sellTower = (towerId: string) => {
    const tower = gameState.towers.find(t => t.id === towerId);
    
    if (!tower) return;
    
    // Refund 70% of the tower cost
    const refund = Math.floor(tower.cost * 0.7);
    
    setGameState(prev => ({
      ...prev,
      towers: prev.towers.filter(t => t.id !== towerId),
      gold: prev.gold + refund,
    }));
    
    toast(`Tower sold for ${refund} gold!`);
  };

  const selectTowerType = (type: string) => {
    setGameState(prev => ({ ...prev, selectedTowerType: type as 'basic' | 'cannon' | 'sniper' }));
  };

  const setDifficulty = (difficulty: Difficulty) => {
    if (!gameState.isStarted) {
      setGameState(prev => ({ ...prev, difficulty }));
      toast(`Difficulty set to ${difficulty}`);
    } else {
      toast("Cannot change difficulty during an active game");
    }
  };

  const updateUserStats = (score: number) => {
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        highScore: Math.max(currentUser.highScore, score),
        gamesPlayed: currentUser.gamesPlayed + 1,
        lastPlayed: new Date().toISOString()
      };

      // Update local storage
      const savedUsers = localStorage.getItem('gameUsers');
      if (savedUsers) {
        const users = JSON.parse(savedUsers);
        const updatedUsers = users.map((user: User) => 
          user.username === currentUser.username ? updatedUser : user
        );
        localStorage.setItem('gameUsers', JSON.stringify(updatedUsers));
      }

      setCurrentUser(updatedUser);
    }
  };

  const checkAchievements = useCallback(() => {
    const newAchievements = [...gameState.achievements];
    let newGold = gameState.gold;
    let newUnlockedAchievements = [...gameState.unlockedAchievements];

    newAchievements.forEach(achievement => {
      if (!achievement.unlocked) {
        let progress = 0;
        switch (achievement.id) {
          case 'wave_5':
            progress = gameState.wave;
            break;
          case 'score_1000':
            progress = gameState.score;
            break;
          case 'tower_5':
            progress = gameState.towers.length;
            break;
          case 'level_3':
            progress = gameState.level;
            break;
        }

        if (progress >= achievement.target) {
          achievement.unlocked = true;
          achievement.achieved = true;
          achievement.progress = progress;
          newGold += achievement.reward;
          newUnlockedAchievements.push(achievement.id);
          
          // Create new achievement when one is achieved
          if (achievement.id === 'wave_5') {
            newAchievements.push({
              id: 'wave_10',
              title: 'Wave Champion',
              description: 'Complete 10 waves',
              target: 10,
              reward: 200,
              unlocked: false,
              achieved: false,
              progress: 0
            });
          } else if (achievement.id === 'score_1000') {
            newAchievements.push({
              id: 'score_5000',
              title: 'Score Legend',
              description: 'Reach 5000 points',
              target: 5000,
              reward: 500,
              unlocked: false,
              achieved: false,
              progress: 0
            });
          } else if (achievement.id === 'tower_5') {
            newAchievements.push({
              id: 'tower_10',
              title: 'Tower Legend',
              description: 'Place 10 towers',
              target: 10,
              reward: 300,
              unlocked: false,
              achieved: false,
              progress: 0
            });
          } else if (achievement.id === 'level_3') {
            newAchievements.push({
              id: 'level_5',
              title: 'Level Master',
              description: 'Reach level 5',
              target: 5,
              reward: 200,
              unlocked: false,
              achieved: false,
              progress: 0
            });
          }
        } else {
          achievement.progress = progress;
        }
      }
    });

    setGameState(prev => ({
      ...prev,
      achievements: newAchievements,
      gold: newGold,
      unlockedAchievements: newUnlockedAchievements
    }));
  }, [gameState]);

  const value = {
    gameState,
    currentUser,
    setCurrentUser,
    startNewGame,
    startGame,
    resumeGame,
    pauseGame,
    quitGame,
    placeTower,
    selectTowerType,
    setDifficulty,
    updateUserStats,
    startWave,
    upgradeTower,
    sellTower
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};

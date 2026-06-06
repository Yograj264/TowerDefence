import React from 'react';
import { useGame } from '@/contexts/GameContext';
import { Card } from '@/components/ui/card';

const AchievementsList: React.FC = () => {
  const { gameState } = useGame();

  return (
    <div className="fixed top-4 right-4 z-50">
      <Card className="w-80 bg-white/90 backdrop-blur-sm p-4 shadow-lg">
        <h3 className="text-lg font-bold mb-3 text-center border-b pb-2">Achievements</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {gameState.achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-2 rounded ${
                achievement.unlocked
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">{achievement.title}</h4>
                  <p className="text-sm text-gray-600">{achievement.description}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium">
                    {achievement.unlocked ? '✓ Unlocked' : 'Locked'}
                  </span>
                  {achievement.unlocked && (
                    <div className="text-xs text-green-600">+{achievement.reward} gold</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default AchievementsList; 
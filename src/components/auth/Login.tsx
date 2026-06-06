import React, { useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  username: string;
  highScore: number;
  gamesPlayed: number;
  lastPlayed: string;
  avatar?: string;
}

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const { setCurrentUser, startGame } = useGame();
  const navigate = useNavigate();

  // Mock user database - in a real app, this would be in a backend
  const [users, setUsers] = useState<User[]>(() => {
    const savedUsers = localStorage.getItem('gameUsers');
    return savedUsers ? JSON.parse(savedUsers) : [];
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) return;

    let user = users.find(u => u.username.toLowerCase() === username.toLowerCase());

    if (!user && isNewUser) {
      // Create new user
      user = {
        id: `user-${Date.now()}`,
        username,
        highScore: 0,
        gamesPlayed: 0,
        lastPlayed: new Date().toISOString()
      };
      const newUsers = [...users, user];
      setUsers(newUsers);
      localStorage.setItem('gameUsers', JSON.stringify(newUsers));
    }

    if (user) {
      setCurrentUser(user);
      startGame(difficulty);
      navigate('/game', { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-game-dark">
      <div className="bg-game-darker p-8 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          Defense Evolved: Fortress Saga
        </h2>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 bg-game-dark border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your username"
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="newUser"
              checked={isNewUser}
              onChange={(e) => setIsNewUser(e.target.checked)}
              className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-600 rounded"
            />
            <label htmlFor="newUser" className="ml-2 block text-sm text-gray-300">
              New user
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
              className="w-full px-4 py-2 bg-game-dark border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-game-darker transition-colors"
          >
            {isNewUser ? 'Create Account' : 'Login'}
          </button>
        </form>

        {users.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-medium text-white mb-4">Recent Players</h3>
            <div className="space-y-2">
              {users.slice(-5).reverse().map((user) => (
                <div
                  key={user.username}
                  className="flex items-center justify-between p-2 bg-game-dark rounded-md"
                >
                  <span className="text-white">{user.username}</span>
                  <span className="text-gray-400">Score: {user.highScore}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
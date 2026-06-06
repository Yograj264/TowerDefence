import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/contexts/GameContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'react-hot-toast';

const LoginPage: React.FC = (): JSX.Element => {
  const navigate = useNavigate();
  const { setCurrentUser, currentUser } = useGame();
  const [username, setUsername] = useState('');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'score' | 'games' | 'date'>('score');

  const handleLogin = () => {
    if (!username.trim()) {
      toast.error('Please enter a username');
      return;
    }

    const savedUsers = localStorage.getItem('gameUsers');
    const users = savedUsers ? JSON.parse(savedUsers) : [];
    const existingUser = users.find((user: any) => user.username === username);

    if (existingUser) {
      setCurrentUser(existingUser);
      toast.success(`Welcome back, ${username}!`);
    } else {
      const newUser = {
        id: Date.now().toString(),
        username,
        highScore: 0,
        gamesPlayed: 0,
        lastPlayed: new Date().toISOString()
      };
      users.push(newUser);
      localStorage.setItem('gameUsers', JSON.stringify(users));
      setCurrentUser(newUser);
      toast.success(`Welcome, ${username}!`);
    }

    navigate('/game');
  };

  const handleDeleteUser = (username: string) => {
    setUserToDelete(username);
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteUser = () => {
    if (!userToDelete) return;

    const savedUsers = localStorage.getItem('gameUsers');
    if (savedUsers) {
      const users = JSON.parse(savedUsers);
      const updatedUsers = users.filter((user: any) => user.username !== userToDelete);
      localStorage.setItem('gameUsers', JSON.stringify(updatedUsers));
      
      if (currentUser && currentUser.username === userToDelete) {
        setCurrentUser(null);
      }
      
      toast.success(`User ${userToDelete} deleted successfully`);
    }

    setShowDeleteConfirmation(false);
    setUserToDelete(null);
  };

  const cancelDeleteUser = () => {
    setShowDeleteConfirmation(false);
    setUserToDelete(null);
  };

  const getSavedUsers = () => {
    const savedUsers = localStorage.getItem('gameUsers');
    const users = savedUsers ? JSON.parse(savedUsers) : [];
    
    // Sort users based on selected criteria
    return users.sort((a: any, b: any) => {
      switch (sortBy) {
        case 'score':
          return b.highScore - a.highScore;
        case 'games':
          return b.gamesPlayed - a.gamesPlayed;
        case 'date':
          return new Date(b.lastPlayed).getTime() - new Date(a.lastPlayed).getTime();
        default:
          return 0;
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-4xl space-y-4">
        <Card className="p-6">
          <h1 className="text-2xl font-bold text-center mb-6">Tower Defense Game</h1>
          
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full"
            />
            
            <div className="flex space-x-4">
              <Button
                onClick={handleLogin}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
              >
                Start Game
              </Button>
              {username && (
                <Button
                  onClick={() => handleDeleteUser(username)}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  Delete User
                </Button>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Leaderboard</h2>
            <div className="flex space-x-2">
              <Button
                onClick={() => setSortBy('score')}
                className={`${sortBy === 'score' ? 'bg-blue-500' : 'bg-gray-500'} text-white`}
              >
                Sort by Score
              </Button>
              <Button
                onClick={() => setSortBy('games')}
                className={`${sortBy === 'games' ? 'bg-blue-500' : 'bg-gray-500'} text-white`}
              >
                Sort by Games
              </Button>
              <Button
                onClick={() => setSortBy('date')}
                className={`${sortBy === 'date' ? 'bg-blue-500' : 'bg-gray-500'} text-white`}
              >
                Sort by Date
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {getSavedUsers().map((user: any, index: number) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <span className="text-lg font-bold text-gray-600 w-8">{index + 1}</span>
                  <div>
                    <span className="font-medium text-gray-800">{user.username}</span>
                    <div className="text-sm text-gray-500">
                      <span>High Score: {user.highScore}</span>
                      <span className="mx-2">•</span>
                      <span>Games Played: {user.gamesPlayed}</span>
                      <span className="mx-2">•</span>
                      <span>Last Played: {new Date(user.lastPlayed).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteUser(user.username)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-medium shadow-sm"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p className="mb-4">
              Are you sure you want to delete user "{userToDelete}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <Button
                onClick={cancelDeleteUser}
                className="bg-gray-500 hover:bg-gray-600 text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDeleteUser}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Delete
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
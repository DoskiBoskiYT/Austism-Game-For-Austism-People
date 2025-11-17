import React from 'react';
import type { GameId } from '../types';

interface LobbyProps {
  onStartGame: (gameId: GameId) => void;
}

export const Lobby: React.FC<LobbyProps> = ({ onStartGame }) => {
  const commonButtonClasses = "px-8 py-4 font-bold text-2xl text-white rounded-full shadow-lg transition-transform duration-300 w-full transform hover:scale-105";

  return (
    <div className="text-center bg-white/80 backdrop-blur-sm p-10 rounded-2xl shadow-2xl w-full max-w-md transition-transform transform hover:scale-105 duration-300">
      <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500 mb-8 animate-pulse">Game Lobby</h1>
      <div className="flex flex-col space-y-4">
        <button
          onClick={() => onStartGame('animal-sound-match')}
          className={`${commonButtonClasses} bg-yellow-500 hover:bg-yellow-600`}
          aria-label="Start Animal Sound Match Game"
        >
          Animal Sound Match
        </button>
        <button
          onClick={() => onStartGame('shape-sorter')}
          className={`${commonButtonClasses} bg-cyan-500 hover:bg-cyan-600`}
          aria-label="Start Shape Sorter Game"
        >
          Shape Sorter
        </button>
        <button
          onClick={() => onStartGame('color-splash')}
          className={`${commonButtonClasses} bg-rose-500 hover:bg-rose-600`}
          aria-label="Start Color Splash Game"
        >
          Color Splash
        </button>
        <button
          onClick={() => onStartGame('emotion-match')}
          className={`${commonButtonClasses} bg-violet-500 hover:bg-violet-600`}
          aria-label="Start Emotion Match Game"
        >
          Emotion Match
        </button>
        <button
          onClick={() => onStartGame('connect-the-stars')}
          className={`${commonButtonClasses} bg-indigo-500 hover:bg-indigo-600`}
          aria-label="Start Connect the Stars Game"
        >
          Connect the Stars
        </button>
      </div>
    </div>
  );
};
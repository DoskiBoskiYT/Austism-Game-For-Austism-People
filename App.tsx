import React, { useState } from 'react';
import type { GameId } from './types';
import { Lobby } from './components/Lobby';
import { AnimalSoundMatch } from './games/AnimalSoundMatch';
import { ShapeSorter } from './games/ShapeSorter';
import { ColorSplash } from './games/ColorSplash';
import { EmotionMatch } from './games/EmotionMatch';
import { ConnectTheStars } from './games/ConnectTheStars';

const App: React.FC = () => {
  const [currentGame, setCurrentGame] = useState<GameId>('lobby');

  const handleStartGame = (gameId: GameId) => {
    if (gameId !== 'lobby') {
      setCurrentGame(gameId);
    }
  };

  const handleGoToLobby = () => {
    setCurrentGame('lobby');
  };

  const renderContent = () => {
    switch (currentGame) {
      case 'animal-sound-match':
        return <AnimalSoundMatch onGoBack={handleGoToLobby} />;
      case 'shape-sorter':
        return <ShapeSorter onGoBack={handleGoToLobby} />;
      case 'color-splash':
        return <ColorSplash onGoBack={handleGoToLobby} />;
      case 'emotion-match':
        return <EmotionMatch onGoBack={handleGoToLobby} />;
      case 'connect-the-stars':
        return <ConnectTheStars onGoBack={handleGoToLobby} />;
      case 'lobby':
      default:
        return <Lobby onStartGame={handleStartGame} />;
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-200 via-rose-100 to-amber-200 flex items-center justify-center p-4 font-sans">
      {renderContent()}
    </main>
  );
};

export default App;
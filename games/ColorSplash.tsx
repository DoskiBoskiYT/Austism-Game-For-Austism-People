import React, { useState, useCallback, useEffect } from 'react';
import type { Color } from '../types';
import { GameStatus, CardStatus } from '../types';
import { COLORS_DATA, TOTAL_ROUNDS, CHOICES_PER_ROUND } from '../constants';

interface ColorSplashProps {
  onGoBack: () => void;
}

interface ColorCardProps {
  color: Color;
  status: CardStatus;
  onClick: (colorName: string) => void;
  disabled: boolean;
}

const BackIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
);

const ColorCard: React.FC<ColorCardProps> = ({ color, status, onClick, disabled }) => {
  const getStatusClasses = () => {
    switch (status) {
      case CardStatus.Correct:
        return 'border-green-500 bg-green-100 ring-4 ring-green-300';
      case CardStatus.Incorrect:
        return 'border-red-500 bg-red-100 ring-4 ring-red-300 animate-shake';
      default:
        return 'border-gray-200 bg-white hover:border-sky-400 hover:shadow-xl';
    }
  };

  const handleClick = () => {
    if (!disabled) {
      onClick(color.name);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`relative rounded-2xl border-4 p-4 flex flex-col items-center justify-center aspect-square shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105 ${getStatusClasses()} ${disabled && status === CardStatus.Default ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <div className="w-full h-full rounded-full" style={{ backgroundColor: color.hex }}></div>
      {status === CardStatus.Correct && (
        <div className="absolute inset-0 bg-green-500 bg-opacity-50 flex items-center justify-center rounded-2xl">
            <span className="text-6xl text-white animate-pulse">🎉</span>
        </div>
      )}
    </div>
  );
};

const shuffleArray = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

export const ColorSplash: React.FC<ColorSplashProps> = ({ onGoBack }) => {
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.Start);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [correctColor, setCorrectColor] = useState<Color | null>(null);
  const [roundChoices, setRoundChoices] = useState<Color[]>([]);
  const [selectedColorName, setSelectedColorName] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string>('');

  const setupRound = useCallback(() => {
    setSelectedColorName(null);
    setFeedback('');

    const shuffledColors = shuffleArray(COLORS_DATA);
    const correct = shuffledColors[0];
    const choices = shuffleArray(shuffledColors.slice(0, CHOICES_PER_ROUND));
    
    setCorrectColor(correct);
    setRoundChoices(choices);
    setGameStatus(GameStatus.Playing);
  }, []);
  
  const startGame = useCallback(() => {
    setScore(0);
    setRound(1);
    setupRound();
  }, [setupRound]);
  
  const handleNextRound = useCallback(() => {
    if (round < TOTAL_ROUNDS) {
      setRound(prev => prev + 1);
      setupRound();
    } else {
      setGameStatus(GameStatus.End);
    }
  }, [round, setupRound]);
  
  useEffect(() => {
    if (gameStatus === GameStatus.RoundOver) {
        const timer = setTimeout(() => {
            handleNextRound();
        }, 2000);
        return () => clearTimeout(timer);
    }
  }, [gameStatus, handleNextRound]);

  const handleColorSelect = (colorName: string) => {
    if (gameStatus !== GameStatus.Playing) return;

    setSelectedColorName(colorName);
    
    if (colorName === correctColor?.name) {
      setScore(prev => prev + 1);
      setFeedback('That\'s right! 🎉');
      setGameStatus(GameStatus.RoundOver);
    } else {
      setFeedback('Not quite!');
      setTimeout(() => {
        setSelectedColorName(null);
        setFeedback('');
      }, 1000);
    }
  };

  const getCardStatus = (colorName: string): CardStatus => {
    if (!selectedColorName) return CardStatus.Default;
    if (colorName === correctColor?.name && (gameStatus === GameStatus.RoundOver || selectedColorName === correctColor.name)) {
        return CardStatus.Correct;
    }
    if (colorName === selectedColorName && colorName !== correctColor?.name) {
        return CardStatus.Incorrect;
    }
    return CardStatus.Default;
  };
  
  const renderGameContent = () => {
    switch (gameStatus) {
      case GameStatus.Start:
        return (
          <div className="text-center">
            <h1 className="text-5xl font-bold text-rose-700 mb-4">Color Splash</h1>
            <p className="text-xl text-gray-600 mb-8">Find the correct color that matches the name!</p>
            <div className="flex flex-col items-center space-y-4">
                <button
                onClick={startGame}
                className="px-12 py-4 bg-rose-500 text-white font-bold text-2xl rounded-full shadow-lg hover:bg-rose-600 transform hover:scale-105 transition-transform duration-300"
                >
                Start Game
                </button>
                <button
                    onClick={onGoBack}
                    className="px-8 py-2 bg-pink-500 text-white font-semibold text-lg rounded-full shadow-md hover:bg-pink-600 transform hover:scale-105 transition-transform duration-300"
                >
                    Back to Lobby
                </button>
            </div>
          </div>
        );
      case GameStatus.End:
        return (
          <div className="text-center bg-white p-10 rounded-2xl shadow-2xl">
            <h1 className="text-5xl font-bold text-rose-700 mb-4">You did it!</h1>
            <p className="text-3xl text-gray-600 mb-8">Your final score is: <span className="font-bold text-green-500">{score} / {TOTAL_ROUNDS}</span></p>
            <div className="flex flex-col items-center space-y-4">
                <button
                onClick={startGame}
                className="px-12 py-4 bg-rose-500 text-white font-bold text-2xl rounded-full shadow-lg hover:bg-rose-600 transform hover:scale-105 transition-transform duration-300"
                >
                Play Again
                </button>
                <button
                    onClick={onGoBack}
                    className="px-8 py-2 bg-pink-500 text-white font-semibold text-lg rounded-full shadow-md hover:bg-pink-600 transform hover:scale-105 transition-transform duration-300"
                >
                    Back to Lobby
                </button>
            </div>
          </div>
        );
      case GameStatus.Playing:
      case GameStatus.RoundOver:
        return (
            <div className="w-full max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6 bg-rose-100/80 backdrop-blur-sm p-4 rounded-xl shadow-md">
                    <button onClick={onGoBack} className="text-rose-700 hover:text-rose-900 font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center" aria-label="Back to lobby">
                        <BackIcon className="mr-2" />
                        Lobby
                    </button>
                    <div className="text-xl md:text-2xl font-bold text-rose-800">Round: <span className="text-gray-800">{round}/{TOTAL_ROUNDS}</span></div>
                    <div className="text-xl md:text-2xl font-bold text-rose-800">Score: <span className="text-gray-800">{score}</span></div>
                </div>

                <div className="text-center mb-8 p-6 bg-pink-50 rounded-2xl shadow-lg">
                    <p className="text-2xl md:text-3xl font-semibold text-gray-700 mb-4">Which color is</p>
                    <h2 className="text-6xl font-black" style={{ color: correctColor?.hex }}>{correctColor?.name}?</h2>
                    {feedback && <p className={`mt-4 text-3xl font-bold ${selectedColorName === correctColor?.name ? 'text-green-600' : 'text-red-600'}`}>{feedback}</p>}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    {roundChoices.map(color => (
                        <ColorCard
                            key={color.name}
                            color={color}
                            status={getCardStatus(color.name)}
                            onClick={handleColorSelect}
                            disabled={gameStatus === GameStatus.RoundOver}
                        />
                    ))}
                </div>
            </div>
        );
    }
  };

  return (
    <>
      <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
          }
          .animate-shake {
            animation: shake 0.5s ease-in-out;
          }
        `}</style>
      {renderGameContent()}
    </>
  );
};
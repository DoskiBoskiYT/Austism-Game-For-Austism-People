import React, { useState, useCallback, useEffect } from 'react';
import type { Emotion } from '../types';
import { GameStatus, CardStatus } from '../types';
import { EMOTIONS_DATA, TOTAL_ROUNDS, CHOICES_PER_ROUND } from '../constants';

interface EmotionMatchProps {
  onGoBack: () => void;
}

interface EmotionCardProps {
  emotion: Emotion;
  status: CardStatus;
  onClick: (emotionId: string) => void;
  disabled: boolean;
}

const BackIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
);

const EmotionCard: React.FC<EmotionCardProps> = ({ emotion, status, onClick, disabled }) => {
  const getStatusClasses = () => {
    switch (status) {
      case CardStatus.Correct:
        return 'border-green-500 bg-green-100 ring-4 ring-green-300';
      case CardStatus.Incorrect:
        return 'border-red-500 bg-red-100 ring-4 ring-red-300 animate-shake';
      default:
        return 'border-sky-200 bg-white hover:border-sky-400 hover:shadow-xl';
    }
  };

  const handleClick = () => {
    if (!disabled) {
      onClick(emotion.id);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`relative rounded-2xl border-4 p-4 flex flex-col items-center justify-center aspect-square shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105 ${getStatusClasses()} ${disabled && status === CardStatus.Default ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span className="text-8xl">{emotion.emoji}</span>
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

export const EmotionMatch: React.FC<EmotionMatchProps> = ({ onGoBack }) => {
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.Start);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [correctEmotion, setCorrectEmotion] = useState<Emotion | null>(null);
  const [roundChoices, setRoundChoices] = useState<Emotion[]>([]);
  const [selectedEmotionId, setSelectedEmotionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string>('');

  const setupRound = useCallback(() => {
    setSelectedEmotionId(null);
    setFeedback('');

    const shuffledEmotions = shuffleArray(EMOTIONS_DATA);
    const correct = shuffledEmotions[0];
    const choices = shuffleArray(shuffledEmotions.slice(0, CHOICES_PER_ROUND));
    
    setCorrectEmotion(correct);
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

  const handleEmotionSelect = (emotionId: string) => {
    if (gameStatus !== GameStatus.Playing) return;

    setSelectedEmotionId(emotionId);
    
    if (emotionId === correctEmotion?.id) {
      setScore(prev => prev + 1);
      setFeedback('You got it! 🎉');
      setGameStatus(GameStatus.RoundOver);
    } else {
      setFeedback('Let\'s try another one!');
      setTimeout(() => {
        setSelectedEmotionId(null);
        setFeedback('');
      }, 1000);
    }
  };

  const getCardStatus = (emotionId: string): CardStatus => {
    if (!selectedEmotionId) return CardStatus.Default;
    if (emotionId === correctEmotion?.id && (gameStatus === GameStatus.RoundOver || selectedEmotionId === correctEmotion.id)) {
        return CardStatus.Correct;
    }
    if (emotionId === selectedEmotionId && emotionId !== correctEmotion?.id) {
        return CardStatus.Incorrect;
    }
    return CardStatus.Default;
  };
  
  const renderGameContent = () => {
    switch (gameStatus) {
      case GameStatus.Start:
        return (
          <div className="text-center">
            <h1 className="text-5xl font-bold text-violet-700 mb-4">Emotion Match</h1>
            <p className="text-xl text-gray-600 mb-8">Which face looks...</p>
            <div className="flex flex-col items-center space-y-4">
                <button
                onClick={startGame}
                className="px-12 py-4 bg-violet-500 text-white font-bold text-2xl rounded-full shadow-lg hover:bg-violet-600 transform hover:scale-105 transition-transform duration-300"
                >
                Start Game
                </button>
                <button
                    onClick={onGoBack}
                    className="px-8 py-2 bg-fuchsia-500 text-white font-semibold text-lg rounded-full shadow-md hover:bg-fuchsia-600 transform hover:scale-105 transition-transform duration-300"
                >
                    Back to Lobby
                </button>
            </div>
          </div>
        );
      case GameStatus.End:
        return (
          <div className="text-center bg-white p-10 rounded-2xl shadow-2xl">
            <h1 className="text-5xl font-bold text-violet-700 mb-4">Amazing!</h1>
            <p className="text-3xl text-gray-600 mb-8">Your final score is: <span className="font-bold text-green-500">{score} / {TOTAL_ROUNDS}</span></p>
            <div className="flex flex-col items-center space-y-4">
                <button
                onClick={startGame}
                className="px-12 py-4 bg-violet-500 text-white font-bold text-2xl rounded-full shadow-lg hover:bg-violet-600 transform hover:scale-105 transition-transform duration-300"
                >
                Play Again
                </button>
                <button
                    onClick={onGoBack}
                    className="px-8 py-2 bg-fuchsia-500 text-white font-semibold text-lg rounded-full shadow-md hover:bg-fuchsia-600 transform hover:scale-105 transition-transform duration-300"
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
                <div className="flex justify-between items-center mb-6 bg-violet-100/80 backdrop-blur-sm p-4 rounded-xl shadow-md">
                    <button onClick={onGoBack} className="text-violet-700 hover:text-violet-900 font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center" aria-label="Back to lobby">
                        <BackIcon className="mr-2" />
                        Lobby
                    </button>
                    <div className="text-xl md:text-2xl font-bold text-violet-800">Round: <span className="text-gray-800">{round}/{TOTAL_ROUNDS}</span></div>
                    <div className="text-xl md:text-2xl font-bold text-violet-800">Score: <span className="text-gray-800">{score}</span></div>
                </div>

                <div className="text-center mb-8 p-6 bg-fuchsia-50 rounded-2xl shadow-lg">
                    <p className="text-2xl md:text-3xl font-semibold text-gray-700 mb-4">Which face is</p>
                    <h2 className="text-6xl font-black text-purple-600">{correctEmotion?.name}?</h2>
                    {feedback && <p className={`mt-4 text-3xl font-bold ${selectedEmotionId === correctEmotion?.id ? 'text-green-600' : 'text-red-600'}`}>{feedback}</p>}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    {roundChoices.map(emotion => (
                        <EmotionCard
                            key={emotion.id}
                            emotion={emotion}
                            status={getCardStatus(emotion.id)}
                            onClick={handleEmotionSelect}
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
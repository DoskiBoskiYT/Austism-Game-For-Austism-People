import React, { useState, useCallback, useEffect } from 'react';
import type { Shape, ShapeType } from '../types';
import { GameStatus } from '../types';
import { TOTAL_ROUNDS } from '../constants';

interface ShapeSorterProps {
  onGoBack: () => void;
}

const SHAPES: ShapeType[] = ['square', 'circle', 'triangle', 'star'];
const COLORS = ['#3498db', '#e74c3c', '#2ecc71', '#f1c40f', '#9b59b6', '#1abc9c'];

const shuffleArray = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

const ShapeSvg: React.FC<{ type: ShapeType; color: string; className?: string }> = ({ type, color, className = 'w-24 h-24' }) => {
  switch (type) {
    case 'square':
      return <div className={className} style={{ backgroundColor: color, clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }} />;
    case 'circle':
      return <div className={className} style={{ backgroundColor: color, borderRadius: '50%' }} />;
    case 'triangle':
      return <div className={className} style={{ backgroundColor: color, clipPath: 'polygon(50% 0, 100% 100%, 0 100%)' }} />;
    case 'star':
      return <div className={className} style={{ backgroundColor: color, clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }} />;
    default:
      return null;
  }
};

const TargetShape: React.FC<{ type: ShapeType, onDrop: (type: ShapeType) => void, onDragOver: (e: React.DragEvent) => void, filled: boolean }> = ({ type, onDrop, onDragOver, filled }) => {
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedType = e.dataTransfer.getData('shapeType') as ShapeType;
    onDrop(droppedType);
  };

  return (
    <div onDrop={handleDrop} onDragOver={onDragOver} className={`w-40 h-40 border-4 border-dashed border-gray-400 rounded-2xl flex items-center justify-center transition-all duration-300 ${filled ? 'bg-lime-200 border-lime-500' : 'bg-white'}`}>
        {filled ? <span className="text-6xl">✓</span> : <ShapeSvg type={type} color="rgba(0,0,0,0.1)" className="w-32 h-32" />}
    </div>
  )
}

const DraggableShape: React.FC<{ shape: Shape }> = ({ shape }) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('shapeType', shape.type);
  };
  return (
    <div draggable onDragStart={handleDragStart} className="cursor-grab active:cursor-grabbing transition-transform duration-200 hover:scale-110">
      <div className="pointer-events-none">
        <ShapeSvg type={shape.type} color={shape.color} />
      </div>
    </div>
  )
}

const BackIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
);

export const ShapeSorter: React.FC<ShapeSorterProps> = ({ onGoBack }) => {
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.Start);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [targetShape, setTargetShape] = useState<ShapeType | null>(null);
  const [shapeChoices, setShapeChoices] = useState<Shape[]>([]);
  const [feedback, setFeedback] = useState<string>('');
  const [isCorrect, setIsCorrect] = useState(false);

  const setupRound = useCallback(() => {
    setFeedback('');
    setIsCorrect(false);

    const shuffledShapes = shuffleArray(SHAPES);
    const correctType = shuffledShapes[0];
    
    // Create choices ensuring the correct shape is one of them.
    const choiceTypes = shuffledShapes.slice(0, 4);
    
    const choices = shuffleArray(choiceTypes).map((type, index) => ({
      id: index,
      type: type,
      color: shuffleArray(COLORS)[index % COLORS.length]
    }));
    
    setTargetShape(correctType);
    setShapeChoices(choices);
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
        }, 1500);
        return () => clearTimeout(timer);
    }
  }, [gameStatus, handleNextRound]);

  const handleDrop = (droppedType: ShapeType) => {
    if (gameStatus !== GameStatus.Playing) return;

    if (droppedType === targetShape) {
      setScore(prev => prev + 1);
      setFeedback('Awesome! 🎉');
      setIsCorrect(true);
      setGameStatus(GameStatus.RoundOver);
    } else {
      setFeedback('Not quite, try again!');
      setTimeout(() => setFeedback(''), 1000);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  }
  
  const renderGameContent = () => {
    switch (gameStatus) {
      case GameStatus.Start:
        return (
          <div className="text-center">
            <h1 className="text-5xl font-bold text-lime-700 mb-4">Shape Sorter</h1>
            <p className="text-xl text-gray-600 mb-8">Drag the correct shape to its matching outline!</p>
            <div className="flex flex-col items-center space-y-4">
                <button
                onClick={startGame}
                className="px-12 py-4 bg-lime-500 text-white font-bold text-2xl rounded-full shadow-lg hover:bg-lime-600 transform hover:scale-105 transition-transform duration-300"
                >
                Start Game
                </button>
                 <button
                    onClick={onGoBack}
                    className="px-8 py-2 bg-green-500 text-white font-semibold text-lg rounded-full shadow-md hover:bg-green-600 transform hover:scale-105 transition-transform duration-300"
                >
                    Back to Lobby
                </button>
            </div>
          </div>
        );
      case GameStatus.End:
        return (
          <div className="text-center bg-white p-10 rounded-2xl shadow-2xl">
            <h1 className="text-5xl font-bold text-lime-700 mb-4">Great job!</h1>
            <p className="text-3xl text-gray-600 mb-8">Your final score is: <span className="font-bold text-green-500">{score} / {TOTAL_ROUNDS}</span></p>
            <div className="flex flex-col items-center space-y-4">
                <button
                onClick={startGame}
                className="px-12 py-4 bg-lime-500 text-white font-bold text-2xl rounded-full shadow-lg hover:bg-lime-600 transform hover:scale-105 transition-transform duration-300"
                >
                Play Again
                </button>
                 <button
                    onClick={onGoBack}
                    className="px-8 py-2 bg-green-500 text-white font-semibold text-lg rounded-full shadow-md hover:bg-green-600 transform hover:scale-105 transition-transform duration-300"
                >
                    Back to Lobby
                </button>
            </div>
          </div>
        );
      case GameStatus.Playing:
      case GameStatus.RoundOver:
        return (
            <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
                <div className="w-full flex justify-between items-center mb-6 bg-lime-100/80 backdrop-blur-sm p-4 rounded-xl shadow-md">
                    <button onClick={onGoBack} className="text-lime-700 hover:text-lime-900 font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center" aria-label="Back to lobby">
                        <BackIcon className="mr-2" />
                        Lobby
                    </button>
                    <div className="text-xl md:text-2xl font-bold text-lime-800">Round: <span className="text-gray-800">{round}/{TOTAL_ROUNDS}</span></div>
                    <div className="text-xl md:text-2xl font-bold text-lime-800">Score: <span className="text-gray-800">{score}</span></div>
                </div>

                <div className="text-center mb-8 p-6 bg-green-50 rounded-2xl shadow-lg">
                    <p className="text-2xl md:text-3xl font-semibold text-gray-700 mb-4">Drag the matching shape here</p>
                    {targetShape && <TargetShape type={targetShape} onDrop={handleDrop} onDragOver={handleDragOver} filled={isCorrect} />}
                </div>

                {feedback && <p className={`mb-4 text-3xl font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>{feedback}</p>}
                
                <div className="w-full flex justify-around items-center p-6 bg-lime-50 rounded-2xl shadow-lg">
                    {shapeChoices.map(shape => (
                        <DraggableShape key={shape.id} shape={shape} />
                    ))}
                </div>
            </div>
        );
    }
  };

  return <>{renderGameContent()}</>;
};
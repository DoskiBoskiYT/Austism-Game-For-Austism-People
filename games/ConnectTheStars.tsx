import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { Constellation } from '../types';
import { GameStatus } from '../types';
import { CONSTELLATIONS_DATA } from '../constants';

interface ConnectTheStarsProps {
  onGoBack: () => void;
}

const BackIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
);

const shuffleArray = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

// We'll shuffle the constellations once at the start
const shuffledConstellations = shuffleArray(CONSTELLATIONS_DATA);

export const ConnectTheStars: React.FC<ConnectTheStarsProps> = ({ onGoBack }) => {
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.Start);
  const [level, setLevel] = useState(0);
  const [connectedCount, setConnectedCount] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [constellation, setConstellation] = useState<Constellation | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const setupLevel = useCallback((levelIndex: number) => {
    if (levelIndex < shuffledConstellations.length) {
      setConstellation(shuffledConstellations[levelIndex]);
      setConnectedCount(0);
      setFeedback('');
      setGameStatus(GameStatus.Playing);
    } else {
      setGameStatus(GameStatus.End);
    }
  }, []);

  const startGame = useCallback(() => {
    setLevel(0);
    setupLevel(0);
  }, [setupLevel]);

  const handleNextLevel = useCallback(() => {
    const nextLevel = level + 1;
    setLevel(nextLevel);
    setupLevel(nextLevel);
  }, [level, setupLevel]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const container = containerRef.current;
    if (!ctx || !canvas || !constellation || !container) return;

    const size = Math.min(container.clientWidth, 500);
    canvas.width = size;
    canvas.height = size;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw lines
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 4;
    ctx.beginPath();
    const stars = constellation.stars;
    for (let i = 0; i < connectedCount; i++) {
        if(i === 0) ctx.moveTo(stars[i].x * size/500, stars[i].y * size/500);
        else ctx.lineTo(stars[i].x * size/500, stars[i].y * size/500);
    }
    ctx.stroke();

    // Draw stars
    stars.forEach((star, index) => {
      ctx.beginPath();
      ctx.arc(star.x * size/500, star.y * size/500, 10, 0, 2 * Math.PI);
      ctx.fillStyle = index < connectedCount ? '#fde047' : '#fff';
      ctx.fill();
      
      // Draw number
      ctx.fillStyle = '#0369a1';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if(index >= connectedCount) {
        ctx.fillText((index + 1).toString(), star.x * size/500, star.y * size/500);
      }
    });
  }, [constellation, connectedCount]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameStatus !== GameStatus.Playing || !constellation) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const size = canvas.width;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const nextStarIndex = connectedCount;
    if (nextStarIndex >= constellation.stars.length) return;

    const nextStar = constellation.stars[nextStarIndex];
    const distance = Math.sqrt(Math.pow(x - (nextStar.x * size/500), 2) + Math.pow(y - (nextStar.y * size/500), 2));

    if (distance < 20) { // Click radius
      const newConnectedCount = connectedCount + 1;
      setConnectedCount(newConnectedCount);
      setFeedback('');

      if (newConnectedCount === constellation.stars.length) {
        setFeedback(`You made a ${constellation.name}! ✨`);
        setGameStatus(GameStatus.RoundOver);
        setTimeout(handleNextLevel, 2000);
      }
    } else {
        setFeedback('Try to find the next number!');
        setTimeout(() => setFeedback(''), 1000);
    }
  };

  const renderGameContent = () => {
    switch (gameStatus) {
      case GameStatus.Start:
        return (
          <div className="text-center bg-slate-800/90 p-10 rounded-2xl shadow-2xl">
            <h1 className="text-5xl font-bold text-indigo-300 mb-4">Connect the Stars</h1>
            <p className="text-xl text-slate-300 mb-8">Click the numbers in order to make a picture!</p>
            <div className="flex flex-col items-center space-y-4">
              <button onClick={startGame} className="px-12 py-4 bg-indigo-500 text-white font-bold text-2xl rounded-full shadow-lg hover:bg-indigo-600 transform hover:scale-105 transition-transform duration-300">
                Start Game
              </button>
              <button onClick={onGoBack} className="px-8 py-2 bg-slate-600 text-white font-semibold text-lg rounded-full shadow-md hover:bg-slate-700 transform hover:scale-105 transition-transform duration-300">
                Back to Lobby
              </button>
            </div>
          </div>
        );
      case GameStatus.End:
        return (
          <div className="text-center bg-slate-800/90 p-10 rounded-2xl shadow-2xl">
            <h1 className="text-5xl font-bold text-indigo-300 mb-4">You're a star!</h1>
            <p className="text-3xl text-slate-300 mb-8">You found all the pictures!</p>
            <div className="flex flex-col items-center space-y-4">
              <button onClick={startGame} className="px-12 py-4 bg-indigo-500 text-white font-bold text-2xl rounded-full shadow-lg hover:bg-indigo-600 transform hover:scale-105 transition-transform duration-300">
                Play Again
              </button>
              <button onClick={onGoBack} className="px-8 py-2 bg-slate-600 text-white font-semibold text-lg rounded-full shadow-md hover:bg-slate-700 transform hover:scale-105 transition-transform duration-300">
                Back to Lobby
              </button>
            </div>
          </div>
        );
      case GameStatus.Playing:
      case GameStatus.RoundOver:
        return (
          <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
            <div className="w-full flex justify-between items-center mb-6 bg-slate-800/80 backdrop-blur-sm p-4 rounded-xl shadow-md">
                <button onClick={onGoBack} className="text-indigo-300 hover:text-indigo-100 font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center" aria-label="Back to lobby">
                    <BackIcon className="mr-2" />
                    Lobby
                </button>
                <div className="text-xl md:text-2xl font-bold text-indigo-300">Level: <span className="text-white">{level + 1} / {shuffledConstellations.length}</span></div>
            </div>
            
            <div className="text-center mb-4 p-4 bg-slate-700 rounded-2xl shadow-lg w-full">
                <h2 className="text-2xl font-semibold text-white">Click on number <span className="text-yellow-300 font-bold">{connectedCount + 1}</span></h2>
                 {feedback && <p className={`mt-2 text-2xl font-bold ${gameStatus === GameStatus.RoundOver ? 'text-green-400' : 'text-red-400'}`}>{feedback}</p>}
            </div>

            <div ref={containerRef} className="w-full aspect-square bg-sky-800 rounded-2xl shadow-inner cursor-pointer" style={{backgroundImage: 'radial-gradient(circle, #0c4a6e 0%, #072e44 100%)'}}>
                <canvas ref={canvasRef} onClick={handleCanvasClick} />
            </div>
          </div>
        );
    }
  };

  return <>{renderGameContent()}</>;
};
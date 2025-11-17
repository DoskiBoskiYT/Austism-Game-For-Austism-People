import React, { useState, useCallback, useEffect } from 'react';
import { AnimalCard } from '../components/AnimalCard';
import type { Animal } from '../types';
import { GameStatus, CardStatus } from '../types';
import { ANIMALS, TOTAL_ROUNDS, CHOICES_PER_ROUND, SOUND_CORRECT, SOUND_INCORRECT } from '../constants';
import { GoogleGenAI, Modality } from '@google/genai';

interface AnimalSoundMatchProps {
  onGoBack: () => void;
}

const SpeakerIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${className}`} viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"></path>
    </svg>
);

const BackIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
);

const SpinnerIcon: React.FC<{className?: string}> = ({className}) => (
    <svg className={`animate-spin h-10 w-10 text-white ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);


// A simple shuffle function
const shuffleArray = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

// Audio decoding helpers
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  // Fix: Corrected the malformed for loop.
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


export const AnimalSoundMatch: React.FC<AnimalSoundMatchProps> = ({ onGoBack }) => {
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.Start);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [correctAnimal, setCorrectAnimal] = useState<Animal | null>(null);
  const [roundChoices, setRoundChoices] = useState<Animal[]>([]);
  const [selectedAnimalId, setSelectedAnimalId] = useState<string | null>(null);
  const [isGeneratingSound, setIsGeneratingSound] = useState(false);
  
  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.2;
      window.speechSynthesis.speak(utterance);
    } else {
      console.error("Browser does not support text-to-speech.");
    }
  }, []);

  const playSound = useCallback((soundUrl: string) => {
    if (soundUrl) {
      const audio = new Audio(soundUrl);
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
            console.error("Error playing sound:", error);
        });
      }
    }
  }, []);
  
  const generateAndPlayAnimalSound = useCallback(async (animal: Animal) => {
    if (isGeneratingSound) return;
    setIsGeneratingSound(true);

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
        const prompt = `Make the sound of a ${animal.name}. ${animal.soundDescription}`;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                      prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });
        
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

        if (base64Audio) {
            const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            const audioBuffer = await decodeAudioData(
                decode(base64Audio),
                outputAudioContext,
                24000,
                1
            );
            const source = outputAudioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(outputAudioContext.destination);
            source.start();
        } else {
            console.error("No audio data received from API. Falling back to original sound.");
            playSound(animal.soundUrl);
        }
    } catch (error) {
        console.error("Error generating or playing AI sound:", error);
        playSound(animal.soundUrl);
    } finally {
        setIsGeneratingSound(false);
    }
  }, [isGeneratingSound, playSound]);

  const setupRound = useCallback(() => {
    setSelectedAnimalId(null);

    const shuffledAnimals = shuffleArray(ANIMALS);
    const correct = shuffledAnimals[0];
    const choices = shuffleArray(shuffledAnimals.slice(0, CHOICES_PER_ROUND));
    
    setCorrectAnimal(correct);
    setRoundChoices(choices);
    setGameStatus(GameStatus.Playing);
    setTimeout(() => speak("Which animal makes this sound?"), 200);
  }, [speak]);
  
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

  const handleAnimalSelect = (animalId: string) => {
    if (gameStatus !== GameStatus.Playing) return;

    setSelectedAnimalId(animalId);
    
    if (animalId === correctAnimal?.id) {
      playSound(SOUND_CORRECT);
      speak(`Yes, that's a ${correctAnimal.name}!`);
      setScore(prev => prev + 1);
      setGameStatus(GameStatus.RoundOver);
    } else {
      const chosenAnimal = roundChoices.find(a => a.id === animalId);
      playSound(SOUND_INCORRECT);
      if (chosenAnimal) {
        speak(`That's a ${chosenAnimal.name}. Let's try again!`);
      }
      setTimeout(() => {
        setSelectedAnimalId(null);
      }, 1000);
    }
  };

  const getCardStatus = (animalId: string): CardStatus => {
    if (!selectedAnimalId) return CardStatus.Default;
    if (animalId === correctAnimal?.id && (gameStatus === GameStatus.RoundOver || selectedAnimalId === correctAnimal.id)) {
        return CardStatus.Correct;
    }
    if (animalId === selectedAnimalId && animalId !== correctAnimal?.id) {
        return CardStatus.Incorrect;
    }
    return CardStatus.Default;
  };
  
  const renderGameContent = () => {
    switch (gameStatus) {
      case GameStatus.Start:
        return (
          <div className="text-center">
            <h1 className="text-5xl font-bold text-amber-700 mb-4">Animal Sound Match</h1>
            <p className="text-xl text-gray-600 mb-8">Listen to the sound and find the right animal!</p>
            <div className="flex flex-col items-center space-y-4">
                <button
                onClick={startGame}
                className="px-12 py-4 bg-orange-500 text-white font-bold text-2xl rounded-full shadow-lg hover:bg-orange-600 transform hover:scale-105 transition-transform duration-300"
                >
                Start Game
                </button>
                <button
                    onClick={onGoBack}
                    className="px-8 py-2 bg-amber-500 text-white font-semibold text-lg rounded-full shadow-md hover:bg-amber-600 transform hover:scale-105 transition-transform duration-300"
                >
                    Back to Lobby
                </button>
            </div>
          </div>
        );
      case GameStatus.End:
        return (
          <div className="text-center bg-white p-10 rounded-2xl shadow-2xl">
            <h1 className="text-5xl font-bold text-amber-700 mb-4">You did it!</h1>
            <p className="text-3xl text-gray-600 mb-8">Your final score is: <span className="font-bold text-green-500">{score} / {TOTAL_ROUNDS}</span></p>
            <div className="flex flex-col items-center space-y-4">
                <button
                onClick={startGame}
                className="px-12 py-4 bg-orange-500 text-white font-bold text-2xl rounded-full shadow-lg hover:bg-orange-600 transform hover:scale-105 transition-transform duration-300"
                >
                Play Again
                </button>
                <button
                    onClick={onGoBack}
                    className="px-8 py-2 bg-amber-500 text-white font-semibold text-lg rounded-full shadow-md hover:bg-amber-600 transform hover:scale-105 transition-transform duration-300"
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
                <div className="flex justify-between items-center mb-6 bg-yellow-100/80 backdrop-blur-sm p-4 rounded-xl shadow-md">
                    <button onClick={onGoBack} className="text-amber-700 hover:text-amber-900 font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center" aria-label="Back to lobby">
                        <BackIcon className="mr-2" />
                        Lobby
                    </button>
                    <div className="text-xl md:text-2xl font-bold text-amber-800">Round: <span className="text-gray-800">{round}/{TOTAL_ROUNDS}</span></div>
                    <div className="text-xl md:text-2xl font-bold text-amber-800">Score: <span className="text-gray-800">{score}</span></div>
                </div>

                <div className="text-center mb-8 p-6 bg-amber-50 rounded-2xl shadow-lg">
                    <p className="text-2xl md:text-3xl font-semibold text-gray-700 mb-4">Which animal makes this sound?</p>
                    <button
                        onClick={() => correctAnimal && generateAndPlayAnimalSound(correctAnimal)}
                        disabled={isGeneratingSound}
                        className={`flex items-center justify-center mx-auto p-5 bg-orange-500 text-white rounded-full shadow-lg transform hover:scale-110 active:scale-95 transition-transform duration-200 disabled:opacity-75 disabled:cursor-wait ${gameStatus === GameStatus.Playing && !isGeneratingSound ? 'animate-pulse' : ''}`}
                        aria-label={`Play sound: ${correctAnimal?.soundDescription}`}
                    >
                      {isGeneratingSound ? (
                        <SpinnerIcon />
                      ) : (
                        <>
                          <SpeakerIcon className="h-10 w-10"/>
                          <span className="ml-4 text-4xl font-black tracking-widest">{correctAnimal?.soundDescription}</span>
                        </>
                      )}
                    </button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    {roundChoices.map(animal => (
                        <AnimalCard
                            key={animal.id}
                            animal={animal}
                            status={getCardStatus(animal.id)}
                            onClick={handleAnimalSelect}
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
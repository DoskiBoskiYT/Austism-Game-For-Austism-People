
import React from 'react';
import type { Animal } from '../types';
import { CardStatus } from '../types';

interface AnimalCardProps {
  animal: Animal;
  status: CardStatus;
  onClick: (animalId: string) => void;
  disabled: boolean;
}

const SpeakerIcon: React.FC<{className: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"></path>
    </svg>
);

export const AnimalCard: React.FC<AnimalCardProps> = ({ animal, status, onClick, disabled }) => {
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
      onClick(animal.id);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`relative rounded-2xl border-4 p-4 flex flex-col items-center justify-center aspect-square shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105 ${getStatusClasses()} ${disabled && status === CardStatus.Default ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <img src={animal.image} alt={animal.name} className="w-full h-full object-cover rounded-lg" />
      <div className="mt-4 text-center">
        <p className="text-xl md:text-2xl font-bold text-gray-700">{animal.name}</p>
      </div>
      {status === CardStatus.Correct && (
        <div className="absolute inset-0 bg-green-500 bg-opacity-50 flex items-center justify-center rounded-2xl">
            <span className="text-6xl text-white animate-pulse">🎉</span>
        </div>
      )}
    </div>
  );
};

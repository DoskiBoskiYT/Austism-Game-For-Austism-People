import type { Animal, Color, Emotion, Constellation } from './types';

export const ANIMALS: Animal[] = [
  { id: 'lion', name: 'Lion', image: 'https://images.unsplash.com/photo-1546182990-dffeaf781f28?q=80&w=500&h=500&fit=crop&crop=entropy', soundDescription: 'ROAR!', soundUrl: 'https://cdn.pixabay.com/audio/2022/04/08/audio_b655a11eda.mp3' },
  { id: 'cow', name: 'Cow', image: 'https://images.unsplash.com/photo-1570042225732-ab021f9da372?q=80&w=500&h=500&fit=crop&crop=entropy', soundDescription: 'MOO!', soundUrl: 'https://cdn.pixabay.com/audio/2022/03/23/audio_45070678d9.mp3' },
  { id: 'dog', name: 'Dog', image: 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?q=80&w=500&h=500&fit=crop&crop=entropy', soundDescription: 'WOOF!', soundUrl: 'https://cdn.pixabay.com/audio/2022/03/15/audio_731a547b7a.mp3' },
  { id: 'cat', name: 'Cat', image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=500&h=500&fit=crop&crop=entropy', soundDescription: 'MEOW!', soundUrl: 'https://cdn.pixabay.com/audio/2022/09/20/audio_2426998b4c.mp3' },
  { id: 'duck', name: 'Duck', image: 'https://images.unsplash.com/photo-1563209219-286950e1859c?q=80&w=500&h=500&fit=crop&crop=entropy', soundDescription: 'QUACK!', soundUrl: 'https://cdn.pixabay.com/audio/2022/10/26/audio_f5e0284474.mp3' },
  { id: 'sheep', name: 'Sheep', image: 'https://images.unsplash.com/photo-1550030085-00ce52a75242?q=80&w=500&h=500&fit=crop&crop=entropy', soundDescription: 'BAA!', soundUrl: 'https://cdn.pixabay.com/audio/2021/11/24/audio_9242a781be.mp3' },
  { id: 'pig', name: 'Pig', image: 'https://images.unsplash.com/photo-1550825309-97427515a8a1?q=80&w=500&h=500&fit=crop&crop=entropy', soundDescription: 'OINK!', soundUrl: 'https://cdn.pixabay.com/audio/2022/03/24/audio_338a0b3c69.mp3' },
  { id: 'horse', name: 'Horse', image: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?q=80&w=500&h=500&fit=crop&crop=entropy', soundDescription: 'NEIGH!', soundUrl: 'https://cdn.pixabay.com/audio/2022/04/18/audio_511c1da483.mp3' },
];

export const COLORS_DATA: Color[] = [
  { name: 'Red', hex: '#e74c3c' },
  { name: 'Blue', hex: '#3498db' },
  { name: 'Green', hex: '#2ecc71' },
  { name: 'Yellow', hex: '#f1c40f' },
  { name: 'Purple', hex: '#9b59b6' },
  { name: 'Orange', hex: '#e67e22' },
  { name: 'Pink', hex: '#fd79a8' },
  { name: 'Teal', hex: '#1abc9c' },
];

export const EMOTIONS_DATA: Emotion[] = [
    { id: 'happy', name: 'Happy', emoji: '😊' },
    { id: 'sad', name: 'Sad', emoji: '😢' },
    { id: 'angry', name: 'Angry', emoji: '😠' },
    { id: 'surprised', name: 'Surprised', emoji: '😮' },
    { id: 'silly', name: 'Silly', emoji: '🤪' },
    { id: 'calm', name: 'Calm', emoji: '😌' },
    { id: 'excited', name: 'Excited', emoji: '🥳' },
    { id: 'tired', name: 'Tired', emoji: '😴' },
];

export const CONSTELLATIONS_DATA: Constellation[] = [
  {
    id: 'square',
    name: 'Square',
    stars: [
      { x: 100, y: 100 }, { x: 400, y: 100 }, { x: 400, y: 400 }, { x: 100, y: 400 }, { x: 100, y: 100 }
    ]
  },
  {
    id: 'triangle',
    name: 'Triangle',
    stars: [
      { x: 250, y: 100 }, { x: 400, y: 400 }, { x: 100, y: 400 }, { x: 250, y: 100 }
    ]
  },
  {
    id: 'house',
    name: 'House',
    stars: [
      { x: 100, y: 450 }, // 1. bottom-left
      { x: 400, y: 450 }, // 2. bottom-right
      { x: 400, y: 250 }, // 3. top-right wall
      { x: 250, y: 100 }, // 4. roof-peak
      { x: 100, y: 250 }, // 5. top-left wall
      { x: 100, y: 450 }, // 6. back to bottom-left
    ]
  }
];

export const SOUND_CORRECT = 'https://cdn.pixabay.com/audio/2022/03/10/audio_e5e3247078.mp3';
export const SOUND_INCORRECT = 'https://cdn.pixabay.com/audio/2022/03/10/audio_93a3c20063.mp3';

export const TOTAL_ROUNDS = 5;
export const CHOICES_PER_ROUND = 4;
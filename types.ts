export interface Animal {
  id: string;
  name: string;
  image: string;
  soundDescription: string;
  soundUrl: string;
}

export type ShapeType = 'square' | 'circle' | 'triangle' | 'star';

export interface Shape {
  id: number;
  type: ShapeType;
  color: string;
}

export interface Color {
  name: string;
  hex: string;
}

export interface Emotion {
  id: string;
  name: string;
  emoji: string;
}

export interface Star {
  x: number;
  y: number;
}

export interface Constellation {
  id: string;
  name: string;
  stars: Star[];
}

export enum GameStatus {
  Start,
  Playing,
  RoundOver,
  End,
}

export enum CardStatus {
  Default,
  Correct,
  Incorrect,
}

export type GameId =
  | 'lobby'
  | 'animal-sound-match'
  | 'shape-sorter'
  | 'color-splash'
  | 'emotion-match'
  | 'connect-the-stars';
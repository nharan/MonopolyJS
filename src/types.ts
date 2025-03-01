export enum GamePhase {
  Setup = 'setup',
  Rolling = 'rolling',
  PropertyAction = 'propertyAction',
  Auctioning = 'auctioning',
  EndTurn = 'endTurn',
  GameOver = 'gameOver'
}

export enum AIStrategy {
  Passive = 'passive',
  Balanced = 'balanced',
  Aggressive = 'aggressive',
  Adaptive = 'adaptive'
}

export interface Player {
  id: number;
  name: string;
  money: number;
  position: number;
  properties: number[]; // Array of property positions
  inJail: boolean;
  jailTurns: number;
  getOutOfJailCards: number;
  bankrupt: boolean;
  isAI: boolean;
  aiStrategy?: AIStrategy; // Strategy for AI players
  color: string;
  token: string;
  goSalary: number;
  goSalaryDirection: number; // -1 for decreasing, 1 for increasing (recession)
}

export type PropertyType = 'property' | 'railroad' | 'utility' | 'tax' | 'chance' | 'community' | 'corner';
export type PropertyGroup = 'brown' | 'light-blue' | 'pink' | 'orange' | 'red' | 'yellow' | 'green' | 'dark-blue' | null;

export interface Property {
  position: number;
  name: string;
  type: PropertyType;
  price: number;
  rent?: number;
  group: PropertyGroup;
  ownerId: number | null;
}

export type CardType = 'chance' | 'community';
export type CardAction = 'move' | 'money' | 'jail' | 'repairs';

export interface Card {
  type: CardType;
  description: string;
  action: CardAction;
  value?: number; // Position to move to, money amount, etc.
}

export interface GameState {
  players: Player[];
  properties: Property[];
  currentPlayerIndex: number;
  phase: GamePhase;
  dice: [number, number];
  chanceCards: Card[];
  communityChestCards: Card[];
  doubleRollCount: number;
  auctionProperty: Property | null;
  auctionBids: Record<number, number>;
  auctionHighestBid: number;
  auctionHighestBidder: number;
  auctionCurrentBidder: number;
  auctionEnded: boolean;
  winner: number | null;
  message: string;
}
import { Player, Property, GameState } from '../types';

export interface AIDecisionContext {
  gameState: GameState;
  currentPlayer: Player;
  property?: Property;
  currentBid?: number;
}

export interface AIStrategyInterface {
  // Property actions
  shouldStartAuction(context: AIDecisionContext): boolean;
  
  // Auction actions
  shouldBid(context: AIDecisionContext): boolean;
  calculateBidAmount(context: AIDecisionContext): number;
  
  // General decision making
  getThinkingTime(): number; // Time in ms to simulate "thinking"
} 
import { AIStrategy } from '../types';
import { AIStrategyInterface } from './AIStrategyInterface';
import { BalancedStrategy } from './BalancedStrategy';
import { PassiveStrategy } from './PassiveStrategy';
import { AggressiveStrategy } from './AggressiveStrategy';
import { AdaptiveStrategy } from './AdaptiveStrategy';

// Singleton instances of each strategy
const balancedStrategy = new BalancedStrategy();
const passiveStrategy = new PassiveStrategy();
const aggressiveStrategy = new AggressiveStrategy();
const adaptiveStrategy = new AdaptiveStrategy();

export class AIStrategyFactory {
  static getStrategy(strategyType: AIStrategy): AIStrategyInterface {
    switch (strategyType) {
      case AIStrategy.Passive:
        return passiveStrategy;
      case AIStrategy.Aggressive:
        return aggressiveStrategy;
      case AIStrategy.Adaptive:
        return adaptiveStrategy;
      case AIStrategy.Balanced:
      default:
        return balancedStrategy;
    }
  }
} 
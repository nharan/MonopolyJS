import { AIStrategy } from '../types';
import { AIStrategyInterface } from './AIStrategyInterface';
import { BalancedStrategy } from './BalancedStrategy';
import { PassiveStrategy } from './PassiveStrategy';
import { AggressiveStrategy } from './AggressiveStrategy';

// Singleton instances of each strategy
const balancedStrategy = new BalancedStrategy();
const passiveStrategy = new PassiveStrategy();
const aggressiveStrategy = new AggressiveStrategy();

export class AIStrategyFactory {
  static getStrategy(strategyType: AIStrategy): AIStrategyInterface {
    switch (strategyType) {
      case AIStrategy.Passive:
        return passiveStrategy;
      case AIStrategy.Aggressive:
        return aggressiveStrategy;
      case AIStrategy.Balanced:
      default:
        return balancedStrategy;
    }
  }
} 
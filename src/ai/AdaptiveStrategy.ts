import { AIStrategyInterface, AIDecisionContext } from './AIStrategyInterface';
import { PropertyGroup } from '../types';

export class AdaptiveStrategy implements AIStrategyInterface {
  // Track property purchase history
  private propertyPurchaseHistory: Record<number, number> = {}; // propertyPosition -> price paid
  
  // Property actions
  shouldStartAuction(context: AIDecisionContext): boolean {
    // 70% chance to start auction - moderately likely to bid
    return Math.random() < 0.7;
  }
  
  // Auction actions
  shouldBid(context: AIDecisionContext): boolean {
    const { currentPlayer, property, currentBid = 0, gameState } = context;
    
    if (!property) {
      console.log(`AI ${currentPlayer.name} (Adaptive) has no property to bid on, passing`);
      return false;
    }
    
    // Check if this is our own bid
    const isOurBid = gameState?.auctionHighestBidder === currentPlayer.id;
    
    // Don't bid if we're already the highest bidder
    if (isOurBid) {
      console.log(`AI ${currentPlayer.name} (Adaptive) is already highest bidder, not bidding`);
      return false;
    }
    
    // Calculate the maximum we're willing to pay based on various factors
    const maxBid = this.calculateMaxBid(context);
    
    // Log for debugging
    console.log(`AI ${currentPlayer.name} (Adaptive) considering bid: current $${currentBid}, max $${maxBid}, property: ${property.name}`);
    
    // Always make an initial bid if the current bid is 0
    if (currentBid === 0) {
      console.log(`AI ${currentPlayer.name} (Adaptive) making initial bid`);
      return true;
    }
    
    // Don't bid if the current bid is already too high compared to our max
    if (currentBid >= maxBid) {
      console.log(`AI ${currentPlayer.name} (Adaptive) current bid ($${currentBid}) exceeds max bid ($${maxBid}), passing`);
      return false;
    }
    
    // Bid if current bid is below max bid
    const shouldBid = currentBid < maxBid;
    console.log(`AI ${currentPlayer.name} (Adaptive) bidding decision: ${shouldBid}`);
    return shouldBid;
  }
  
  calculateBidAmount(context: AIDecisionContext): number {
    const { currentPlayer, property, currentBid = 0 } = context;
    
    if (!property) return 0;
    
    // For initial bids, make a bid based on the property's strategic value
    if (currentBid === 0) {
      const strategicValue = this.calculateStrategicValue(context);
      const initialBid = Math.floor(property.price * strategicValue * 0.3);
      console.log(`AI ${currentPlayer.name} (Adaptive) making initial bid of $${initialBid} (strategic value: ${strategicValue})`);
      return Math.max(initialBid, 5); // Minimum bid of $5
    }
    
    // For subsequent bids, calculate an appropriate increment
    const maxBid = this.calculateMaxBid(context);
    const remainingBidRoom = maxBid - currentBid;
    
    // If we're close to our max, bid more conservatively
    if (remainingBidRoom < 20) {
      return currentBid + 1; // Minimum increment
    }
    
    // Otherwise, bid more aggressively based on how valuable the property is
    const strategicValue = this.calculateStrategicValue(context);
    const bidPercentage = 0.1 + (strategicValue * 0.2); // 10-30% of remaining room
    const increment = Math.max(1, Math.floor(remainingBidRoom * bidPercentage));
    
    const finalBid = currentBid + increment;
    console.log(`AI ${currentPlayer.name} (Adaptive) bidding $${finalBid} (current: $${currentBid}, increment: $${increment})`);
    return finalBid;
  }
  
  getThinkingTime(): number {
    // Random thinking time between 500ms and 1500ms
    return 500 + Math.floor(Math.random() * 1000);
  }
  
  // Helper methods
  
  /**
   * Calculate the maximum amount the AI is willing to bid based on:
   * 1. Property's base price
   * 2. Current economic conditions (GO salary)
   * 3. Monopoly potential
   * 4. Player's financial situation
   */
  private calculateMaxBid(context: AIDecisionContext): number {
    const { currentPlayer, property, gameState } = context;
    
    if (!property) return 0;
    
    // Base value is the property's price
    let baseValue = property.price;
    
    // Factor 1: Economic conditions based on GO salary
    const economicFactor = this.calculateEconomicFactor(currentPlayer.goSalary);
    
    // Factor 2: Monopoly potential
    const monopolyFactor = this.calculateMonopolyFactor(context);
    
    // Factor 3: Player's financial situation
    const financialFactor = Math.min(1.5, currentPlayer.money / 1000); // Cap at 1.5
    
    // Calculate the maximum bid
    const maxBid = baseValue * economicFactor * monopolyFactor * financialFactor;
    
    // Cap the maximum bid at a percentage of the player's money
    const maxMoneyPercentage = 0.5; // Will use up to 50% of their money
    const moneyLimit = currentPlayer.money * maxMoneyPercentage;
    
    const finalMaxBid = Math.min(maxBid, moneyLimit);
    
    console.log(`AI ${currentPlayer.name} (Adaptive) max bid calculation:
      Base: $${baseValue}
      Economic factor: ${economicFactor.toFixed(2)}
      Monopoly factor: ${monopolyFactor.toFixed(2)}
      Financial factor: ${financialFactor.toFixed(2)}
      Final max bid: $${finalMaxBid.toFixed(0)}
    `);
    
    return Math.floor(finalMaxBid);
  }
  
  /**
   * Calculate a factor based on the current GO salary (economic conditions)
   * As GO salary decreases, the AI becomes more conservative
   */
  private calculateEconomicFactor(goSalary: number): number {
    // Standard GO salary is 200
    const standardSalary = 200;
    
    // Calculate ratio of current salary to standard
    const salaryRatio = goSalary / standardSalary;
    
    // Scale factor: 0.6 (recession) to 1.2 (boom)
    return 0.6 + (salaryRatio * 0.6);
  }
  
  /**
   * Calculate a factor based on monopoly potential
   * Higher values for properties that would complete or advance a monopoly
   */
  private calculateMonopolyFactor(context: AIDecisionContext): number {
    const { currentPlayer, property, gameState } = context;
    
    if (!property || !property.group || property.type !== 'property') {
      // For non-colored properties (railroads, utilities), use a standard factor
      if (property?.type === 'railroad') return 1.2; // Railroads are valuable
      if (property?.type === 'utility') return 1.1; // Utilities less so
      return 1.0; // Default for other types
    }
    
    // Count how many properties of this group the player already owns
    const propertiesInGroup = gameState.properties.filter(p => p.group === property.group);
    const totalInGroup = propertiesInGroup.length;
    const ownedByPlayer = propertiesInGroup.filter(p => 
      currentPlayer.properties.includes(p.position)
    ).length;
    
    // Calculate monopoly factor based on how close to completing a monopoly
    if (ownedByPlayer === 0) {
      // First property in a group
      return 1.0;
    } else if (ownedByPlayer === totalInGroup - 1) {
      // This would complete a monopoly - willing to pay up to 2x
      return 2.0;
    } else {
      // This would advance toward a monopoly - pay 20% more for each property already owned
      return 1.0 + (ownedByPlayer * 0.2);
    }
  }
  
  /**
   * Calculate the strategic value of a property (0.0 to 1.0)
   * Used to determine initial bids and bid increments
   */
  private calculateStrategicValue(context: AIDecisionContext): number {
    const { property } = context;
    
    if (!property) return 0.5;
    
    // Base value depends on property type
    let baseValue = 0.5;
    
    // Adjust based on property type
    if (property.type === 'property') {
      // Color properties have varying values
      const groupValues: Record<string, number> = {
        'brown': 0.4,
        'light-blue': 0.5,
        'pink': 0.6,
        'orange': 0.8,
        'red': 0.7,
        'yellow': 0.7,
        'green': 0.6,
        'dark-blue': 0.9
      };
      
      // Use a default value if the property group is null or not in our map
      baseValue = property.group && groupValues[property.group] 
        ? groupValues[property.group] 
        : 0.5;
      
      // Adjust based on monopoly potential
      const monopolyFactor = this.calculateMonopolyFactor(context);
      baseValue *= monopolyFactor;
    } else if (property.type === 'railroad') {
      baseValue = 0.7; // Railroads are valuable
    } else if (property.type === 'utility') {
      baseValue = 0.6; // Utilities less so
    }
    
    // Adjust based on economic conditions
    const economicFactor = this.calculateEconomicFactor(context.currentPlayer.goSalary);
    baseValue *= economicFactor;
    
    // Cap at 1.0
    return Math.min(1.0, baseValue);
  }
} 
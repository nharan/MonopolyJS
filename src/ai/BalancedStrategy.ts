import { AIStrategyInterface, AIDecisionContext } from './AIStrategyInterface';

export class BalancedStrategy implements AIStrategyInterface {
  // Property actions
  shouldStartAuction(context: AIDecisionContext): boolean {
    // 70% chance to start auction
    return Math.random() < 0.7;
  }
  
  // Auction actions
  shouldBid(context: AIDecisionContext): boolean {
    const { currentPlayer, property, currentBid = 0 } = context;
    
    if (!property) {
      console.log(`AI ${currentPlayer.name} has no property to bid on, passing`);
      return false;
    }
    
    // Calculate maximum bid based on property value and player's money
    const maxPricePercentage = 0.8; // Will bid up to 80% of property price
    const maxMoneyPercentage = 0.4; // Increased from 0.3 to 0.4
    
    const maxBid = Math.min(
      property.price * maxPricePercentage,
      currentPlayer.money * maxMoneyPercentage
    );
    
    // Check if this is our own bid
    const isOurBid = context.gameState?.auctionHighestBidder === currentPlayer.id;
    
    // Don't bid if we're already the highest bidder
    if (isOurBid) {
      console.log(`AI ${currentPlayer.name} is already highest bidder, not bidding`);
      return false;
    }
    
    // Log for debugging
    console.log(`AI ${currentPlayer.name} considering bid: current $${currentBid}, max $${maxBid}, our bid: ${isOurBid}, property price: $${property.price}`);
    
    // Always make an initial bid if the current bid is 0
    if (currentBid === 0) {
      console.log(`AI ${currentPlayer.name} making initial bid`);
      return true;
    }
    
    // Don't bid if the current bid is already too high compared to our max
    if (currentBid >= maxBid) {
      console.log(`AI ${currentPlayer.name} current bid ($${currentBid}) exceeds max bid ($${maxBid}), passing`);
      return false;
    }
    
    // More aggressive bidding for properties below a certain threshold
    if (property.price <= 200) {
      // For cheaper properties, be more willing to bid
      const shouldBid = currentBid < (maxBid * 1.2);
      console.log(`AI ${currentPlayer.name} bidding on cheap property: ${shouldBid}`);
      return shouldBid;
    }
    
    // Bid if current bid is below max bid
    const shouldBid = currentBid < maxBid;
    console.log(`AI ${currentPlayer.name} standard bidding decision: ${shouldBid}`);
    return shouldBid;
  }
  
  calculateBidAmount(context: AIDecisionContext): number {
    const { currentPlayer, property, currentBid = 0 } = context;
    
    if (!property) return 0;
    
    // Choose a bid increment based on current bid
    let increment: number;
    if (currentBid > 100) increment = 50;
    else if (currentBid > 50) increment = 25;
    else if (currentBid > 10) increment = 10;
    else increment = 5; // Increased from 2 to 5
    
    // For cheaper properties, make more aggressive bids
    if (property.price <= 200 && currentBid > 0) {
      // Make a more competitive bid for railroads and utilities
      if (property.type === 'railroad' || property.type === 'utility') {
        // Bid 10-20% more than current bid
        const competitiveBid = Math.floor(currentBid * (1.1 + (Math.random() * 0.1)));
        console.log(`AI ${currentPlayer.name} making competitive bid: $${competitiveBid} for ${property.name}`);
        return competitiveBid;
      }
    }
    
    // Add some randomness to the bid
    const randomFactor = 0.8 + (Math.random() * 0.4); // 0.8 to 1.2
    increment = Math.floor(increment * randomFactor);
    
    // Ensure minimum increment of 1
    increment = Math.max(1, increment);
    
    const finalBid = currentBid + increment;
    console.log(`AI ${currentPlayer.name} calculated bid amount: $${finalBid}`);
    return finalBid;
  }
  
  // General decision making
  getThinkingTime(): number {
    // Return a random thinking time between 800ms and 1500ms
    return 800 + Math.floor(Math.random() * 700);
  }
} 
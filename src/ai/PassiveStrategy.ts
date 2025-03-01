import { AIStrategyInterface, AIDecisionContext } from './AIStrategyInterface';

export class PassiveStrategy implements AIStrategyInterface {
  // Property actions
  shouldStartAuction(context: AIDecisionContext): boolean {
    // 40% chance to start auction - more likely to pass
    return Math.random() < 0.4;
  }
  
  // Auction actions
  shouldBid(context: AIDecisionContext): boolean {
    const { currentPlayer, property, currentBid = 0 } = context;
    
    if (!property) {
      console.log(`AI ${currentPlayer.name} (Passive) has no property to bid on, passing`);
      return false;
    }
    
    // Calculate maximum bid based on property value and player's money
    const maxPricePercentage = 0.6; // Will bid up to 60% of property price
    const maxMoneyPercentage = 0.2; // Will use up to 20% of their money
    
    const maxBid = Math.min(
      property.price * maxPricePercentage,
      currentPlayer.money * maxMoneyPercentage
    );
    
    // Check if this is our own bid
    const isOurBid = context.gameState?.auctionHighestBidder === currentPlayer.id;
    
    // Don't bid if we're already the highest bidder
    if (isOurBid) {
      console.log(`AI ${currentPlayer.name} (Passive) is already highest bidder, not bidding`);
      return false;
    }
    
    // Passive AI is more likely to pass on higher bids
    const bidThreshold = maxBid * (0.7 + (Math.random() * 0.2)); // 70-90% of max bid
    
    // Log for debugging
    console.log(`AI ${currentPlayer.name} (Passive) considering bid: current $${currentBid}, max $${maxBid}, threshold $${bidThreshold}, our bid: ${isOurBid}`);
    
    // Always make an initial bid if the current bid is 0
    if (currentBid === 0) {
      console.log(`AI ${currentPlayer.name} (Passive) making initial bid`);
      return true;
    }
    
    // Don't bid if the current bid is already too high compared to our threshold
    if (currentBid >= bidThreshold) {
      console.log(`AI ${currentPlayer.name} (Passive) current bid ($${currentBid}) exceeds threshold ($${bidThreshold}), passing`);
      return false;
    }
    
    // Bid if current bid is below threshold
    const shouldBid = currentBid < bidThreshold;
    console.log(`AI ${currentPlayer.name} (Passive) bidding decision: ${shouldBid}`);
    return shouldBid;
  }
  
  calculateBidAmount(context: AIDecisionContext): number {
    const { currentPlayer, property, currentBid = 0 } = context;
    
    if (!property) return 0;
    
    // Choose a smaller bid increment based on current bid
    let increment: number;
    if (currentBid > 100) increment = 25;
    else if (currentBid > 50) increment = 10;
    else if (currentBid > 10) increment = 5;
    else increment = 1;
    
    // Add some randomness to the bid
    const randomFactor = 0.8 + (Math.random() * 0.3); // 0.8 to 1.1
    increment = Math.floor(increment * randomFactor);
    
    // Ensure minimum increment of 1
    increment = Math.max(1, increment);
    
    return currentBid + increment;
  }
  
  // General decision making
  getThinkingTime(): number {
    // Return a random thinking time between 1000ms and 2000ms (slower to decide)
    return 1000 + Math.floor(Math.random() * 1000);
  }
} 
import { AIStrategyInterface, AIDecisionContext } from './AIStrategyInterface';

export class AggressiveStrategy implements AIStrategyInterface {
  // Property actions
  shouldStartAuction(context: AIDecisionContext): boolean {
    // 90% chance to start auction - very likely to bid
    return Math.random() < 0.9;
  }
  
  // Auction actions
  shouldBid(context: AIDecisionContext): boolean {
    const { currentPlayer, property, currentBid = 0 } = context;
    
    if (!property) {
      console.log(`AI ${currentPlayer.name} (Aggressive) has no property to bid on, passing`);
      return false;
    }
    
    // Calculate maximum bid based on property value and player's money
    const maxPricePercentage = 1.5; // Increased from 1.2 to 1.5
    const maxMoneyPercentage = 0.6; // Increased from 0.5 to 0.6
    
    const maxBid = Math.min(
      property.price * maxPricePercentage,
      currentPlayer.money * maxMoneyPercentage
    );
    
    // Check if this is our own bid
    const isOurBid = context.gameState?.auctionHighestBidder === currentPlayer.id;
    
    // Don't bid if we're already the highest bidder
    if (isOurBid) {
      console.log(`AI ${currentPlayer.name} (Aggressive) is already highest bidder, not bidding`);
      return false;
    }
    
    // FORCE BID: Always bid if this is the first time we're considering this property
    // This ensures the AI always makes at least one bid
    console.log(`AI ${currentPlayer.name} (Aggressive) FORCING a bid to ensure participation`);
    return true;
  }
  
  calculateBidAmount(context: AIDecisionContext): number {
    const { currentPlayer, property, currentBid = 0 } = context;
    
    if (!property) return 0;
    
    // For initial bids, make a more substantial offer
    if (currentBid === 0) {
      // Start with a bid of 20-30% of property price
      const initialBid = Math.floor(property.price * (0.2 + (Math.random() * 0.1)));
      console.log(`AI ${currentPlayer.name} (Aggressive) making initial bid of $${initialBid}`);
      return Math.max(initialBid, 10); // Minimum bid of $10
    }
    
    // For subsequent bids, outbid by a larger amount
    const increment = Math.max(10, Math.floor(currentBid * 0.2)); // At least $10 or 20% more
    const finalBid = currentBid + increment;
    
    console.log(`AI ${currentPlayer.name} (Aggressive) bidding $${finalBid} (current: $${currentBid}, increment: $${increment})`);
    return finalBid;
  }
  
  // General decision making
  getThinkingTime(): number {
    // Return a random thinking time between 500ms and 1000ms (quicker to decide)
    return 500 + Math.floor(Math.random() * 500);
  }
} 
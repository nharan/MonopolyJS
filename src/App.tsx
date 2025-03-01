import React, { useState, useEffect } from 'react';
import { DollarSign, Users, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from 'lucide-react';
import Board from './components/Board';
import PlayerPanel from './components/PlayerPanel';
import ActionPanel from './components/ActionPanel';
import AuctionPanel from './components/AuctionPanel';
import JailActionPanel from './components/JailActionPanel';
import SoundToggle from './components/SoundToggle';
import { Player, Property, GamePhase, GameState, Card, CardType, AIStrategy } from './types';
import { initialProperties, chanceCards, communityChestCards } from './data';
import { AIStrategyFactory } from './ai/AIStrategyFactory';
import { AIDecisionContext } from './ai/AIStrategyInterface';
import SoundManager from './utils/SoundManager';

function App() {
  const [gameState, setGameState] = useState<GameState>({
    players: [],
    properties: initialProperties,
    currentPlayerIndex: 0,
    phase: GamePhase.Setup,
    dice: [1, 1],
    chanceCards: [...chanceCards],
    communityChestCards: [...communityChestCards],
    doubleRollCount: 0,
    auctionProperty: null,
    auctionBids: {},
    auctionHighestBid: 0,
    auctionHighestBidder: -1,
    auctionCurrentBidder: 0,
    auctionEnded: false,
    winner: null,
    message: "Welcome to Monopoly! Set up your game to begin."
  });

  const [numPlayers, setNumPlayers] = useState<number>(2);
  const [numAIPlayers, setNumAIPlayers] = useState<number>(0);
  const [aiStrategy, setAIStrategy] = useState<AIStrategy>(AIStrategy.Balanced);
  const [bidAmount, setBidAmount] = useState<string>("");
  const [bidIncrement, setBidIncrement] = useState<number>(1);

  useEffect(() => {
    // Run AI turns when it's an AI player's turn
    if (gameState.phase !== GamePhase.Setup && 
        gameState.players[gameState.currentPlayerIndex]?.isAI &&
        gameState.phase !== GamePhase.GameOver) {
      const timeoutId = setTimeout(() => {
        handleAITurn();
      }, 1500); // Delay to make AI turns visible
      
      return () => clearTimeout(timeoutId);
    }
  }, [gameState.currentPlayerIndex, gameState.phase]);

  // Special effect for handling AI bidding during auctions
  useEffect(() => {
    // Only run this effect during auctions when it's an AI's turn to bid
    if (gameState.phase === GamePhase.Auctioning && 
        gameState.players[gameState.auctionCurrentBidder]?.isAI) {
      console.log(`AI bidding turn detected for ${gameState.players[gameState.auctionCurrentBidder].name}`);
      
      // Short delay to make AI bidding visible
      const timeoutId = setTimeout(() => {
        // Get the AI player who needs to bid
        const currentPlayer = gameState.players[gameState.auctionCurrentBidder];
        
        // Get the appropriate strategy for this AI
        const strategyType = currentPlayer.aiStrategy || AIStrategy.Balanced;
        const strategy = AIStrategyFactory.getStrategy(strategyType);
        
        // Create the decision context
        const context: AIDecisionContext = {
          gameState,
          currentPlayer,
          property: gameState.auctionProperty || undefined,
          currentBid: gameState.auctionHighestBid
        };
        
        console.log(`AI ${currentPlayer.name} making bidding decision`);
        
        // CRITICAL FIX: Check if AI can afford to bid higher than current bid
        const propertyValue = context.property?.price || 100;
        const maxWillingToPay = Math.floor(propertyValue * 0.6); // AI will pay up to 60% of property value
        const currentHighestBid = gameState.auctionHighestBid;
        const minimumValidBid = currentHighestBid + 1;
        
        // Check if AI is already highest bidder
        if (gameState.auctionHighestBidder === currentPlayer.id) {
          console.log(`AI ${currentPlayer.name} is already highest bidder, passing`);
          passBid();
        } 
        // Check if AI can afford to bid and if the current bid is below what AI is willing to pay
        else if (minimumValidBid <= currentPlayer.money && minimumValidBid <= maxWillingToPay) {
          // Calculate bid amount - either increment by 10% of property value or just above current bid
          const bidIncrement = Math.max(5, Math.floor(propertyValue * 0.1));
          const bidAmount = Math.min(
            currentHighestBid + bidIncrement, // Preferred bid
            maxWillingToPay, // Maximum willing to pay
            currentPlayer.money // Maximum can afford
          );
          
          // Ensure bid is at least 1 more than current highest
          const finalBid = Math.max(bidAmount, minimumValidBid);
          
          console.log(`AI ${currentPlayer.name} bidding $${finalBid} (current highest: $${currentHighestBid}, max willing: $${maxWillingToPay})`);
          placeBid(finalBid);
        } 
        // AI can't afford or doesn't want to bid higher
        else {
          console.log(`AI ${currentPlayer.name} passing - current bid $${currentHighestBid} too high (max willing: $${maxWillingToPay}, money: $${currentPlayer.money})`);
          passBid();
        }
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [gameState.auctionCurrentBidder, gameState.phase]);

  const handleAITurn = () => {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    
    if (!currentPlayer || !currentPlayer.isAI) return;
    
    // Get the appropriate strategy for this AI
    const strategyType = currentPlayer.aiStrategy || AIStrategy.Balanced;
    const strategy = AIStrategyFactory.getStrategy(strategyType);
    
    // Create the decision context
    const context: AIDecisionContext = {
      gameState,
      currentPlayer
    };
    
    // Get thinking time for this AI
    const thinkingTime = strategy.getThinkingTime();
    
    switch (gameState.phase) {
      case GamePhase.Rolling:
        // All AIs roll the dice when it's their turn
        setTimeout(() => {
          rollDice();
        }, thinkingTime);
        break;
        
      case GamePhase.JailDecision:
        // AI in jail - decide whether to pay or roll
        setTimeout(() => {
          // AI will pay to get out if they have enough money and it's their 2nd or 3rd turn in jail
          // Otherwise, they'll try to roll doubles
          if (currentPlayer.money >= 50 && currentPlayer.jailTurns >= 1) {
            payJailFine();
          } else {
            rollForJail();
          }
        }, thinkingTime);
        break;
        
      case GamePhase.PropertyAction:
        // Decide whether to start auction based on strategy
        context.property = gameState.properties.find(
          p => p.position === currentPlayer.position
        );
        
        setTimeout(() => {
          if (strategy.shouldStartAuction(context)) {
            startAuction();
          } else {
            pass();
          }
        }, thinkingTime);
        break;
        
      case GamePhase.Auctioning:
        // AI bidding strategy based on personality
        context.property = gameState.auctionProperty || undefined;
        context.currentBid = gameState.auctionHighestBid;
        context.gameState = gameState;
        
        if (!context.property) return;
        
        console.log(`AI ${currentPlayer.name} turn to bid. Current highest bid: $${context.currentBid}, Highest bidder: ${gameState.auctionHighestBidder}, AI ID: ${currentPlayer.id}`);
        console.log(`Property: ${context.property.name}, Price: $${context.property.price}, Type: ${context.property.type}`);
        
        // EMERGENCY FIX: Force immediate action with no conditions
        // This ensures the AI always takes action during the auction
        if (gameState.auctionHighestBidder === currentPlayer.id) {
          // We're already the highest bidder, pass
          console.log(`AI ${currentPlayer.name} is already highest bidder, passing`);
          passBid();
        } else if (gameState.auctionBids[currentPlayer.id] === 0) {
          // First bid in the auction, make a small bid
          const bidAmount = Math.max(10, Math.floor(context.property.price * 0.1));
          console.log(`AI ${currentPlayer.name} making FORCED initial bid of $${bidAmount}`);
          placeBid(bidAmount);
        } else {
          // We've already bid once, now pass
          console.log(`AI ${currentPlayer.name} passing after initial bid`);
          passBid();
        }
        break;
        
      case GamePhase.EndTurn:
        // AI should automatically end its turn when in EndTurn phase
        console.log(`AI ${currentPlayer.name} ending turn automatically`);
        setTimeout(() => {
          endTurn();
        }, thinkingTime);
        break;
        
      default:
        break;
    }
  };

  const setupGame = () => {
    const totalPlayers = numPlayers + numAIPlayers;
    if (totalPlayers < 2 || totalPlayers > 4) {
      setGameState({
        ...gameState,
        message: "Please select 2-4 total players"
      });
      return;
    }

    // Play game start sound
    SoundManager.getInstance().play('game-start');

    const playerColors = ["#FF5252", "#4CAF50", "#2196F3", "#FFC107"];
    const playerTokens = ["🚗", "🚢", "🎩", "🐕"];
    
    const players: Player[] = [];
    
    // Create human players
    for (let i = 0; i < numPlayers; i++) {
      players.push({
        id: i,
        name: `Player ${i + 1}`,
        money: 1500,
        position: 0,
        properties: [],
        inJail: false,
        jailTurns: 0,
        getOutOfJailCards: 0,
        bankrupt: false,
        isAI: false,
        color: playerColors[i],
        token: playerTokens[i],
        goSalary: 200,
        goSalaryDirection: -1 // -1 for decreasing, 1 for increasing (recession)
      });
    }
    
    // Create AI players
    for (let i = 0; i < numAIPlayers; i++) {
      players.push({
        id: numPlayers + i,
        name: `AI ${i + 1}`,
        money: 1500,
        position: 0,
        properties: [],
        inJail: false,
        jailTurns: 0,
        getOutOfJailCards: 0,
        bankrupt: false,
        isAI: true,
        aiStrategy: aiStrategy,
        color: playerColors[numPlayers + i],
        token: playerTokens[numPlayers + i],
        goSalary: 200,
        goSalaryDirection: -1
      });
    }

    // Shuffle the card decks
    const shuffledChance = [...gameState.chanceCards].sort(() => Math.random() - 0.5);
    const shuffledCommunity = [...gameState.communityChestCards].sort(() => Math.random() - 0.5);

    setGameState({
      ...gameState,
      players,
      currentPlayerIndex: 0,
      phase: GamePhase.Rolling,
      chanceCards: shuffledChance,
      communityChestCards: shuffledCommunity,
      message: `${players[0].name}'s turn. Roll the dice!`
    });
  };

  const rollDice = () => {
    if (gameState.phase !== GamePhase.Rolling) return;

    // Play dice roll sound
    SoundManager.getInstance().play('dice-roll');

    const die1 = Math.floor(Math.random() * 6) + 1;
    const die2 = Math.floor(Math.random() * 6) + 1;
    const diceSum = die1 + die2;
    const isDoubles = die1 === die2;
    
    const currentPlayer = { ...gameState.players[gameState.currentPlayerIndex] };
    let newPosition = currentPlayer.position;
    let newPhase = GamePhase.EndTurn;
    let newMessage = "";
    let doubleRollCount = isDoubles ? gameState.doubleRollCount + 1 : 0;
    let shouldAutoEndTurn = false; // Flag to automatically end turn
    
    // Check if player is in jail
    if (currentPlayer.inJail) {
      if (isDoubles) {
        currentPlayer.inJail = false;
        currentPlayer.jailTurns = 0;
        newMessage = `${currentPlayer.name} rolled doubles and got out of jail!`;
        
        // Play get out of jail sound
        SoundManager.getInstance().play('get-out-of-jail');
      } else {
        currentPlayer.jailTurns += 1;
        if (currentPlayer.jailTurns >= 3) {
          currentPlayer.inJail = false;
          currentPlayer.jailTurns = 0;
          currentPlayer.money -= 50; // Pay $50 to get out after 3 turns
          newMessage = `${currentPlayer.name} paid $50 to get out of jail after 3 turns.`;
        } else {
          newMessage = `${currentPlayer.name} is still in jail (turn ${currentPlayer.jailTurns} of 3).`;
          newPhase = GamePhase.EndTurn;
          shouldAutoEndTurn = true; // Auto end turn if still in jail
        }
      }
    } 
    
    // If player is not in jail or just got out, move them
    if (!currentPlayer.inJail) {
      // Check if player goes to jail for rolling 3 doubles
      if (doubleRollCount >= 3) {
        currentPlayer.inJail = true;
        currentPlayer.position = 10; // Jail position
        newMessage = `${currentPlayer.name} rolled doubles 3 times in a row and went to jail!`;
        newPhase = GamePhase.EndTurn;
        doubleRollCount = 0;
        shouldAutoEndTurn = true; // Auto end turn when sent to jail
        
        // Play go to jail sound
        SoundManager.getInstance().play('go-to-jail');
      } else {
        // Normal movement
        newPosition = (currentPlayer.position + diceSum) % 40;
        
        // Check if player passed GO
        if (newPosition < currentPlayer.position) {
          // Update GO salary based on direction
          if (currentPlayer.goSalaryDirection === -1) {
            // Decreasing phase
            currentPlayer.goSalary = Math.max(0, currentPlayer.goSalary - 10);
            if (currentPlayer.goSalary === 0) {
              currentPlayer.goSalaryDirection = 1; // Switch to recession
            }
          } else {
            // Recession phase (increasing payment)
            currentPlayer.goSalary += 10;
          }
          
          if (currentPlayer.goSalaryDirection === -1) {
            // Player receives money
            currentPlayer.money += currentPlayer.goSalary;
            newMessage = `${currentPlayer.name} passed GO and collected $${currentPlayer.goSalary}!`;
            
            // Play pass GO sound
            SoundManager.getInstance().play('pass-go');
          } else {
            // Player pays money (recession)
            currentPlayer.money -= currentPlayer.goSalary;
            newMessage = `${currentPlayer.name} passed GO during recession and paid $${currentPlayer.goSalary}!`;
            
            // Play pay tax sound (similar to paying during recession)
            SoundManager.getInstance().play('pay-tax');
            
            // Check for bankruptcy
            if (currentPlayer.money < 0) {
              currentPlayer.bankrupt = true;
              newMessage += ` ${currentPlayer.name} went bankrupt!`;
              shouldAutoEndTurn = true; // Auto end turn on bankruptcy
            }
          }
        }
        
        currentPlayer.position = newPosition;
        
        // Play player move sound
        SoundManager.getInstance().play('player-move');
        
        // Handle landing on different spaces
        const landedSpace = gameState.properties.find(p => p.position === newPosition);
        
        if (landedSpace) {
          if (landedSpace.type === 'property' || landedSpace.type === 'railroad' || landedSpace.type === 'utility') {
            if (landedSpace.ownerId === null) {
              // Unowned property - start auction
              newPhase = GamePhase.PropertyAction;
              newMessage = `${currentPlayer.name} landed on ${landedSpace.name}. Auction or pass?`;
            } else if (landedSpace.ownerId !== currentPlayer.id) {
              // Pay rent
              const owner = gameState.players.find(p => p.id === landedSpace.ownerId);
              if (owner && !owner.bankrupt) {
                let rent = calculateRent(landedSpace, diceSum, gameState.players, gameState.properties);
                currentPlayer.money -= rent;
                
                // Play pay rent sound
                SoundManager.getInstance().play('pay-rent');
                
                const updatedPlayers = [...gameState.players];
                const ownerIndex = updatedPlayers.findIndex(p => p.id === landedSpace.ownerId);
                if (ownerIndex >= 0) {
                  updatedPlayers[ownerIndex].money += rent;
                }
                
                newMessage = `${currentPlayer.name} paid $${rent} rent to ${owner.name}.`;
                shouldAutoEndTurn = true; // Auto end turn after paying rent
                newPhase = GamePhase.EndTurn; // Set phase to EndTurn
                
                // Check for bankruptcy
                if (currentPlayer.money < 0) {
                  currentPlayer.bankrupt = true;
                  newMessage += ` ${currentPlayer.name} went bankrupt!`;
                  shouldAutoEndTurn = true; // Auto end turn on bankruptcy
                }
                
                // Update all players
                updatedPlayers[gameState.currentPlayerIndex] = currentPlayer;
                
                setGameState(prevState => ({
                  ...prevState,
                  players: updatedPlayers,
                  phase: newPhase,
                  dice: [die1, die2],
                  doubleRollCount,
                  message: newMessage
                }));
                
                // Check for game over
                checkGameOver(updatedPlayers);
                
                // Auto end turn if needed
                if (shouldAutoEndTurn) {
                  setTimeout(() => {
                    endTurn();
                  }, 1500);
                }
                
                return;
              }
            } else {
              newMessage = `${currentPlayer.name} landed on their own property: ${landedSpace.name}.`;
              shouldAutoEndTurn = true; // Auto end turn when landing on own property
              newPhase = GamePhase.EndTurn; // Set phase to EndTurn
            }
          } else if (landedSpace.type === 'tax') {
            // Pay tax
            const taxAmount = landedSpace.position === 4 ? 200 : 100; // Income tax or luxury tax
            currentPlayer.money -= taxAmount;
            newMessage = `${currentPlayer.name} paid $${taxAmount} in taxes.`;
            shouldAutoEndTurn = true; // Auto end turn after paying tax
            newPhase = GamePhase.EndTurn; // Set phase to EndTurn
            
            // Play pay tax sound
            SoundManager.getInstance().play('pay-tax');
            
            // Check for bankruptcy
            if (currentPlayer.money < 0) {
              currentPlayer.bankrupt = true;
              newMessage += ` ${currentPlayer.name} went bankrupt!`;
            }
          } else if (landedSpace.type === 'chance') {
            // Draw chance card
            const card = drawCard('chance');
            if (card) {
              const handledByCard = applyCard(card, currentPlayer);
              newMessage = `${currentPlayer.name} drew a Chance card: ${card.description}`;
              
              // Only auto-end turn if the card didn't handle it (e.g., by moving to an unowned property)
              if (!handledByCard) {
                shouldAutoEndTurn = true;
                newPhase = GamePhase.EndTurn;
              }
            }
          } else if (landedSpace.type === 'community') {
            // Draw community chest card
            const card = drawCard('community');
            if (card) {
              const handledByCard = applyCard(card, currentPlayer);
              newMessage = `${currentPlayer.name} drew a Community Chest card: ${card.description}`;
              
              // Only auto-end turn if the card didn't handle it (e.g., by moving to an unowned property)
              if (!handledByCard) {
                shouldAutoEndTurn = true;
                newPhase = GamePhase.EndTurn;
              }
            } else if (landedSpace.position === 30) {
              // Go to jail
              currentPlayer.position = 10;
              currentPlayer.inJail = true;
              newMessage = `${currentPlayer.name} went to jail!`;
              shouldAutoEndTurn = true; // Auto end turn when sent to jail
              newPhase = GamePhase.EndTurn; // Set phase to EndTurn
              
              // Play go to jail sound
              SoundManager.getInstance().play('go-to-jail');
            } else if (landedSpace.position === 20) {
              // Free parking - nothing happens
              newMessage = `${currentPlayer.name} landed on Free Parking.`;
              shouldAutoEndTurn = true; // Auto end turn on free parking
              newPhase = GamePhase.EndTurn; // Set phase to EndTurn
            }
          }
        }
      }
    }
    
    // Update player in the players array
    const updatedPlayers = [...gameState.players];
    updatedPlayers[gameState.currentPlayerIndex] = currentPlayer;
    
    setGameState(prevState => ({
      ...prevState,
      players: updatedPlayers,
      phase: newPhase,
      dice: [die1, die2],
      doubleRollCount,
      message: newMessage
    }));
    
    // Check for game over
    checkGameOver(updatedPlayers);
    
    // Auto end turn if needed
    if (shouldAutoEndTurn) {
      setTimeout(() => {
        endTurn();
      }, 1500);
    }
  };

  const drawCard = (type: 'chance' | 'community'): Card | null => {
    const cardDeck = type === 'chance' ? [...gameState.chanceCards] : [...gameState.communityChestCards];
    
    if (cardDeck.length === 0) return null;
    
    // Draw the top card
    const drawnCard = cardDeck[0];
    
    // Move the card to the bottom of the deck
    const newDeck = [...cardDeck.slice(1), cardDeck[0]];
    
    // Update the state
    setGameState(prevState => ({
      ...prevState,
      chanceCards: type === 'chance' ? newDeck : prevState.chanceCards,
      communityChestCards: type === 'community' ? newDeck : prevState.communityChestCards
    }));
    
    return drawnCard;
  };

  const applyCard = (card: Card, player: Player) => {
    switch (card.action) {
      case 'move':
        if (card.value !== undefined) {
          // Check if passing GO
          if (card.value < player.position) {
            player.money += player.goSalary;
          }
          player.position = card.value;
          
          // Check if the player landed on an unowned property
          const landedProperty = gameState.properties.find(p => p.position === card.value);
          if (landedProperty && 
              (landedProperty.type === 'property' || landedProperty.type === 'railroad' || landedProperty.type === 'utility') && 
              landedProperty.ownerId === null) {
            // Set the game phase to PropertyAction so the player can auction or pass
            setGameState(prevState => ({
              ...prevState,
              phase: GamePhase.PropertyAction,
              message: `${player.name} landed on ${landedProperty.name}. Auction or pass?`
            }));
            return true; // Return true to indicate we've handled the game state update
          }
        }
        break;
      case 'money':
        if (card.value !== undefined) {
          player.money += card.value;
        }
        break;
      case 'jail':
        if (card.value === 1) {
          // Go to jail
          player.position = 10;
          player.inJail = true;
        } else if (card.value === 0) {
          // Get out of jail free
          player.getOutOfJailCards += 1;
        }
        break;
      case 'repairs':
        // Simplified - would need property improvements tracking
        if (card.value !== undefined) {
          const propertyCount = player.properties.length;
          player.money -= propertyCount * card.value;
        }
        break;
    }
    return false; // Return false to indicate normal processing should continue
  };

  const calculateRent = (property: Property, diceRoll: number, players: Player[], properties: Property[]): number => {
    if (property.type === 'property') {
      // Basic rent for now - would need to account for houses/hotels
      return property.rent || property.price * 0.1;
    } else if (property.type === 'railroad') {
      // Rent increases with number of railroads owned
      const owner = players.find(p => p.id === property.ownerId);
      if (!owner) return 0;
      
      const railroadsOwned = properties.filter(
        p => p.type === 'railroad' && p.ownerId === owner.id
      ).length;
      
      return 25 * Math.pow(2, railroadsOwned - 1);
    } else if (property.type === 'utility') {
      // Rent based on dice roll and utilities owned
      const owner = players.find(p => p.id === property.ownerId);
      if (!owner) return 0;
      
      const utilitiesOwned = properties.filter(
        p => p.type === 'utility' && p.ownerId === owner.id
      ).length;
      
      return utilitiesOwned === 1 ? diceRoll * 4 : diceRoll * 10;
    }
    
    return 0;
  };

  const startAuction = () => {
    if (gameState.phase !== GamePhase.PropertyAction) return;
    
    const property = gameState.properties.find(p => p.position === gameState.players[gameState.currentPlayerIndex].position);
    if (!property || property.ownerId !== null) return;
    
    // Play auction start sound
    SoundManager.getInstance().play('auction-start');
    
    // Initialize auction bids
    const auctionBids: Record<number, number> = {};
    gameState.players.forEach(player => {
      if (!player.bankrupt) {
        auctionBids[player.id] = 0;
      }
    });
    
    setGameState({
      ...gameState,
      phase: GamePhase.Auctioning,
      auctionProperty: property,
      auctionBids,
      auctionHighestBid: 0,
      auctionHighestBidder: -1,
      auctionCurrentBidder: gameState.currentPlayerIndex,
      auctionEnded: false,
      message: `Auction started for ${property.name}. ${gameState.players[gameState.currentPlayerIndex].name} to bid first.`
    });
    
    setBidAmount("");
  };

  const placeBid = (amount: number) => {
    if (gameState.phase !== GamePhase.Auctioning || !gameState.auctionProperty) {
      console.log("Cannot place bid: not in auction phase or no property");
      return;
    }
    
    const currentBidder = gameState.players[gameState.auctionCurrentBidder];
    console.log(`DEBUG: ${currentBidder.name} attempting to bid $${amount}`);
    console.log(`DEBUG: Current highest bid: $${gameState.auctionHighestBid}, Highest bidder: ${gameState.auctionHighestBidder}`);
    
    // Validate bid
    if (amount <= gameState.auctionHighestBid) {
      console.log(`DEBUG: Bid rejected - must be higher than current highest bid of $${gameState.auctionHighestBid}`);
      setGameState({
        ...gameState,
        message: `Bid must be higher than the current highest bid of $${gameState.auctionHighestBid}.`
      });
      return;
    }
    
    if (amount > currentBidder.money) {
      console.log(`DEBUG: Bid rejected - ${currentBidder.name} only has $${currentBidder.money}`);
      setGameState({
        ...gameState,
        message: `${currentBidder.name} doesn't have enough money for this bid.`
      });
      return;
    }
    
    // Play bid sound
    SoundManager.getInstance().play('auction-bid');
    
    // Update auction state
    const newBids = { ...gameState.auctionBids };
    newBids[currentBidder.id] = amount;
    console.log(`DEBUG: Updated bids: ${JSON.stringify(newBids)}`);
    
    // Find next bidder
    let nextBidderIndex = findNextBidder(gameState.auctionCurrentBidder);
    console.log(`DEBUG: Next bidder index: ${nextBidderIndex}, name: ${gameState.players[nextBidderIndex].name}`);
    
    setGameState({
      ...gameState,
      auctionBids: newBids,
      auctionHighestBid: amount,
      auctionHighestBidder: currentBidder.id,
      auctionCurrentBidder: nextBidderIndex,
      message: `${currentBidder.name} bid $${amount}. ${gameState.players[nextBidderIndex].name}'s turn to bid.`
    });
    
    setBidAmount("");
  };

  const passBid = () => {
    if (gameState.phase !== GamePhase.Auctioning) {
      console.log("Cannot pass bid: not in auction phase");
      return;
    }
    
    const currentBidder = gameState.players[gameState.auctionCurrentBidder];
    console.log(`${currentBidder.name} is passing their bid`);
    console.log(`DEBUG: Current bidder ID: ${currentBidder.id}, auctionCurrentBidder: ${gameState.auctionCurrentBidder}`);
    console.log(`DEBUG: Current bids: ${JSON.stringify(gameState.auctionBids)}`);
    
    // Mark player as passed by setting bid to -1
    const newBids = { ...gameState.auctionBids };
    newBids[currentBidder.id] = -1;
    console.log(`DEBUG: Updated bids: ${JSON.stringify(newBids)}`);
    
    // Check if auction is over (only one bidder left)
    const activeBidders = Object.entries(newBids).filter(([_, bid]) => bid >= 0);
    console.log(`Active bidders remaining: ${activeBidders.length}`);
    console.log(`DEBUG: Active bidders: ${JSON.stringify(activeBidders)}`);
    
    if (activeBidders.length <= 1) {
      // Auction ended
      console.log("Auction ending - only one or zero bidders left");
      endAuction();
      return;
    }
    
    // Find next bidder
    let nextBidderIndex = findNextBidder(gameState.auctionCurrentBidder);
    console.log(`Next bidder: ${gameState.players[nextBidderIndex].name}`);
    console.log(`DEBUG: Next bidder index: ${nextBidderIndex}`);
    
    setGameState({
      ...gameState,
      auctionBids: newBids,
      auctionCurrentBidder: nextBidderIndex,
      message: `${currentBidder.name} passed. ${gameState.players[nextBidderIndex].name}'s turn to bid.`
    });
  };

  const findNextBidder = (currentIndex: number): number => {
    const { players, auctionBids } = gameState;
    let nextIndex = (currentIndex + 1) % players.length;
    
    // Find the next player who hasn't passed and isn't bankrupt
    while (
      nextIndex !== currentIndex && 
      (players[nextIndex].bankrupt || auctionBids[players[nextIndex].id] === -1)
    ) {
      nextIndex = (nextIndex + 1) % players.length;
      
      // If we've checked all players, break to avoid infinite loop
      if (nextIndex === currentIndex) break;
    }
    
    return nextIndex;
  };

  const endAuction = () => {
    if (!gameState.auctionProperty) return;
    
    const { auctionHighestBidder, auctionHighestBid, auctionProperty } = gameState;
    
    if (auctionHighestBidder >= 0 && auctionHighestBid > 0) {
      // Someone won the auction
      const winner = gameState.players.find(p => p.id === auctionHighestBidder);
      if (!winner) return;
      
      // Play auction win sound
      SoundManager.getInstance().play('auction-win');
      
      // Update property owner
      const updatedProperties = gameState.properties.map(p => 
        p.position === auctionProperty.position 
          ? { ...p, ownerId: auctionHighestBidder } 
          : p
      );
      
      // Update player money and properties
      const updatedPlayers = gameState.players.map(p => {
        if (p.id === auctionHighestBidder) {
          return {
            ...p,
            money: p.money - auctionHighestBid,
            properties: [...p.properties, auctionProperty.position]
          };
        }
        return p;
      });
      
      setGameState({
        ...gameState,
        players: updatedPlayers,
        properties: updatedProperties,
        phase: GamePhase.EndTurn,
        auctionProperty: null,
        auctionBids: {},
        auctionEnded: true,
        message: `${winner.name} won the auction for ${auctionProperty.name} with a bid of $${auctionHighestBid}.`
      });
    } else {
      // No one bid
      setGameState({
        ...gameState,
        phase: GamePhase.EndTurn,
        auctionProperty: null,
        auctionBids: {},
        auctionEnded: true,
        message: "No one bid on the property. It remains unowned."
      });
    }
  };

  const pass = () => {
    if (gameState.phase !== GamePhase.PropertyAction) return;
    
    setGameState({
      ...gameState,
      phase: GamePhase.EndTurn,
      message: `${gameState.players[gameState.currentPlayerIndex].name} passed on the property.`
    });
  };

  const endTurn = () => {
    if (gameState.phase !== GamePhase.EndTurn) return;
    
    // Play turn start sound for next player
    SoundManager.getInstance().play('turn-start');
    
    // Check if current player rolled doubles
    const rolledDoubles = gameState.dice[0] === gameState.dice[1];
    
    // If doubles and not in jail, player goes again
    if (rolledDoubles && !gameState.players[gameState.currentPlayerIndex].inJail && gameState.doubleRollCount < 3) {
      setGameState({
        ...gameState,
        phase: GamePhase.Rolling,
        message: `${gameState.players[gameState.currentPlayerIndex].name} rolled doubles and goes again!`
      });
      return;
    }
    
    // Find next non-bankrupt player
    let nextPlayerIndex = gameState.currentPlayerIndex;
    do {
      nextPlayerIndex = (nextPlayerIndex + 1) % gameState.players.length;
    } while (gameState.players[nextPlayerIndex].bankrupt && nextPlayerIndex !== gameState.currentPlayerIndex);
    
    // If we looped back to the current player, everyone else is bankrupt
    if (nextPlayerIndex === gameState.currentPlayerIndex && gameState.players.filter(p => !p.bankrupt).length <= 1) {
      const winner = gameState.players.find(p => !p.bankrupt);
      setGameState({
        ...gameState,
        phase: GamePhase.GameOver,
        winner: winner?.id || null,
        message: winner ? `Game over! ${winner.name} wins!` : "Game over! It's a draw!"
      });
      return;
    }
    
    // Check if next player is in jail
    const nextPlayer = gameState.players[nextPlayerIndex];
    const nextPhase = nextPlayer.inJail ? GamePhase.JailDecision : GamePhase.Rolling;
    const nextMessage = nextPlayer.inJail 
      ? `${nextPlayer.name}'s turn. They are in jail (turn ${nextPlayer.jailTurns + 1} of 3).` 
      : `${nextPlayer.name}'s turn. Roll the dice!`;
    
    setGameState({
      ...gameState,
      currentPlayerIndex: nextPlayerIndex,
      phase: nextPhase,
      doubleRollCount: 0,
      message: nextMessage
    });
  };

  const checkGameOver = (players: Player[]) => {
    const activePlayers = players.filter(p => !p.bankrupt);
    
    if (activePlayers.length <= 1) {
      const winner = activePlayers[0];
      
      // Play game over sound
      SoundManager.getInstance().play('game-over');
      
      setGameState(prevState => ({
        ...prevState,
        phase: GamePhase.GameOver,
        winner: winner?.id || null,
        message: winner ? `Game over! ${winner.name} wins!` : "Game over! It's a draw!"
      }));
    }
  };

  const resetGame = () => {
    setGameState({
      players: [],
      properties: initialProperties,
      currentPlayerIndex: 0,
      phase: GamePhase.Setup,
      dice: [1, 1],
      chanceCards: [...chanceCards],
      communityChestCards: [...communityChestCards],
      doubleRollCount: 0,
      auctionProperty: null,
      auctionBids: {},
      auctionHighestBid: 0,
      auctionHighestBidder: -1,
      auctionCurrentBidder: 0,
      auctionEnded: false,
      winner: null,
      message: "Welcome to Monopoly! Set up your game to begin."
    });
    setNumPlayers(2);
    setNumAIPlayers(0);
  };

  const renderDie = (value: number) => {
    switch (value) {
      case 1: return <Dice1 size={32} />;
      case 2: return <Dice2 size={32} />;
      case 3: return <Dice3 size={32} />;
      case 4: return <Dice4 size={32} />;
      case 5: return <Dice5 size={32} />;
      case 6: return <Dice6 size={32} />;
      default: return <Dice1 size={32} />;
    }
  };

  // New function to handle rolling dice when in jail
  const rollForJail = () => {
    if (gameState.phase !== GamePhase.JailDecision) return;

    // Play dice roll sound
    SoundManager.getInstance().play('dice-roll');

    const die1 = Math.floor(Math.random() * 6) + 1;
    const die2 = Math.floor(Math.random() * 6) + 1;
    const isDoubles = die1 === die2;
    
    const currentPlayer = { ...gameState.players[gameState.currentPlayerIndex] };
    let newMessage = "";
    let newPhase = GamePhase.EndTurn;
    let shouldAutoEndTurn = true;
    
    if (isDoubles) {
      // Player rolled doubles and gets out of jail
      currentPlayer.inJail = false;
      currentPlayer.jailTurns = 0;
      newMessage = `${currentPlayer.name} rolled doubles and got out of jail!`;
      
      // Play get out of jail sound
      SoundManager.getInstance().play('get-out-of-jail');
      
      // Move the player according to the dice roll
      currentPlayer.position = (currentPlayer.position + die1 + die2) % 40;
      
      // Play player move sound
      SoundManager.getInstance().play('player-move');
      
      // Handle landing on different spaces (similar to rollDice function)
      const landedSpace = gameState.properties.find(p => p.position === currentPlayer.position);
      
      if (landedSpace) {
        if (landedSpace.type === 'property' || landedSpace.type === 'railroad' || landedSpace.type === 'utility') {
          if (landedSpace.ownerId === null) {
            // Unowned property - start auction
            newPhase = GamePhase.PropertyAction;
            newMessage = `${currentPlayer.name} got out of jail and landed on ${landedSpace.name}. Auction or pass?`;
            shouldAutoEndTurn = false;
          }
          // ... handle other landing cases ...
        }
        // ... handle other space types ...
      }
    } else {
      // Player didn't roll doubles
      currentPlayer.jailTurns += 1;
      
      if (currentPlayer.jailTurns >= 3) {
        // Player has been in jail for 3 turns, must pay $50 to get out
        currentPlayer.inJail = false;
        currentPlayer.jailTurns = 0;
        currentPlayer.money -= 50;
        newMessage = `${currentPlayer.name} paid $50 to get out of jail after 3 turns.`;
        
        // Check for bankruptcy
        if (currentPlayer.money < 0) {
          currentPlayer.bankrupt = true;
          newMessage += ` ${currentPlayer.name} went bankrupt!`;
        }
      } else {
        newMessage = `${currentPlayer.name} didn't roll doubles and is still in jail (turn ${currentPlayer.jailTurns} of 3).`;
      }
    }
    
    // Update player in the players array
    const updatedPlayers = [...gameState.players];
    updatedPlayers[gameState.currentPlayerIndex] = currentPlayer;
    
    setGameState(prevState => ({
      ...prevState,
      players: updatedPlayers,
      phase: newPhase,
      dice: [die1, die2],
      message: newMessage
    }));
    
    // Check for game over
    checkGameOver(updatedPlayers);
    
    // Auto end turn if needed
    if (shouldAutoEndTurn) {
      setTimeout(() => {
        endTurn();
      }, 1500);
    }
  };

  // New function to pay jail fine
  const payJailFine = () => {
    if (gameState.phase !== GamePhase.JailDecision) return;
    
    const currentPlayer = { ...gameState.players[gameState.currentPlayerIndex] };
    
    if (currentPlayer.money < 50) {
      setGameState(prevState => ({
        ...prevState,
        message: `${currentPlayer.name} doesn't have enough money to pay the jail fine.`
      }));
      return;
    }
    
    // Pay the fine and get out of jail
    currentPlayer.money -= 50;
    currentPlayer.inJail = false;
    currentPlayer.jailTurns = 0;
    
    // Play sound
    SoundManager.getInstance().play('pay-tax');
    
    // Update player in the players array
    const updatedPlayers = [...gameState.players];
    updatedPlayers[gameState.currentPlayerIndex] = currentPlayer;
    
    setGameState(prevState => ({
      ...prevState,
      players: updatedPlayers,
      phase: GamePhase.Rolling,
      message: `${currentPlayer.name} paid $50 to get out of jail.`
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Monopoly</h1>
          <SoundToggle />
        </div>
        
        {/* Game message */}
        <div className="bg-white p-4 rounded-lg shadow mb-4 text-center">
          <p className="text-lg">{gameState.message}</p>
        </div>
        
        {gameState.phase === GamePhase.Setup ? (
          <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4">Game Setup</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Human Players:
              </label>
              <div className="flex items-center">
                <button 
                  className="bg-blue-500 text-white px-3 py-1 rounded-l"
                  onClick={() => setNumPlayers(Math.max(0, numPlayers - 1))}
                >
                  -
                </button>
                <span className="px-4 py-1 border-t border-b">{numPlayers}</span>
                <button 
                  className="bg-blue-500 text-white px-3 py-1 rounded-r"
                  onClick={() => setNumPlayers(Math.min(4, numPlayers + 1))}
                >
                  +
                </button>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                AI Players:
              </label>
              <div className="flex items-center">
                <button 
                  className="bg-blue-500 text-white px-3 py-1 rounded-l"
                  onClick={() => setNumAIPlayers(Math.max(0, numAIPlayers - 1))}
                >
                  -
                </button>
                <span className="px-4 py-1 border-t border-b">{numAIPlayers}</span>
                <button 
                  className="bg-blue-500 text-white px-3 py-1 rounded-r"
                  onClick={() => setNumAIPlayers(Math.min(4, numAIPlayers + 1))}
                >
                  +
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">Total players: {numPlayers + numAIPlayers} (2-4 required)</p>
            </div>
            
            {numAIPlayers > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  AI Strategy:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  <button 
                    className={`py-2 px-3 rounded-md text-sm ${aiStrategy === AIStrategy.Passive 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700'}`}
                    onClick={() => setAIStrategy(AIStrategy.Passive)}
                  >
                    Passive
                  </button>
                  <button 
                    className={`py-2 px-3 rounded-md text-sm ${aiStrategy === AIStrategy.Balanced 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700'}`}
                    onClick={() => setAIStrategy(AIStrategy.Balanced)}
                  >
                    Balanced
                  </button>
                  <button 
                    className={`py-2 px-3 rounded-md text-sm ${aiStrategy === AIStrategy.Aggressive 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700'}`}
                    onClick={() => setAIStrategy(AIStrategy.Aggressive)}
                  >
                    Aggressive
                  </button>
                  <button 
                    className={`py-2 px-3 rounded-md text-sm ${aiStrategy === AIStrategy.Adaptive 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700'}`}
                    onClick={() => setAIStrategy(AIStrategy.Adaptive)}
                  >
                    Adaptive
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {aiStrategy === AIStrategy.Passive && "Passive AIs bid conservatively and are less likely to start auctions."}
                  {aiStrategy === AIStrategy.Balanced && "Balanced AIs use moderate bidding strategies."}
                  {aiStrategy === AIStrategy.Aggressive && "Aggressive AIs bid higher and are more likely to start auctions."}
                  {aiStrategy === AIStrategy.Adaptive && "Adaptive AIs adjust bidding based on economic conditions and monopoly potential."}
                </p>
              </div>
            )}
            
            <button 
              className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition-colors"
              onClick={setupGame}
            >
              Start Game
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left panel - Player info */}
            <div className="lg:col-span-3">
              <PlayerPanel 
                players={gameState.players} 
                currentPlayerIndex={gameState.currentPlayerIndex}
                properties={gameState.properties}
              />
              
              {/* Dice display */}
              {[GamePhase.Rolling, GamePhase.PropertyAction, GamePhase.Auctioning, GamePhase.EndTurn, GamePhase.JailDecision].includes(gameState.phase) && (
                <div className="bg-white p-4 rounded-lg shadow mt-4 flex justify-center space-x-4">
                  {renderDie(gameState.dice[0])}
                  {renderDie(gameState.dice[1])}
                </div>
              )}
              
              {/* Action panel moved here */}
              {gameState.phase === GamePhase.Auctioning ? (
                <div className="mt-4">
                  <AuctionPanel 
                    property={gameState.auctionProperty}
                    players={gameState.players}
                    currentBidder={gameState.auctionCurrentBidder}
                    highestBid={gameState.auctionHighestBid}
                    highestBidder={gameState.auctionHighestBidder}
                    bids={gameState.auctionBids}
                    onPlaceBid={() => {
                      const amount = parseInt(bidAmount);
                      if (!isNaN(amount) && amount > 0) {
                        placeBid(amount);
                      }
                    }}
                    onIncrementBid={() => {
                      const currentBid = gameState.auctionHighestBid;
                      placeBid(currentBid + bidIncrement);
                    }}
                    onPassBid={passBid}
                    bidAmount={bidAmount}
                    setBidAmount={setBidAmount}
                    bidIncrement={bidIncrement}
                    setBidIncrement={setBidIncrement}
                  />
                </div>
              ) : gameState.phase === GamePhase.JailDecision ? (
                <div className="mt-4">
                  <JailActionPanel 
                    currentPlayer={gameState.players[gameState.currentPlayerIndex]}
                    onPayJailFine={payJailFine}
                    onRollForJail={rollForJail}
                  />
                </div>
              ) : (
                <div className="mt-4">
                  <ActionPanel 
                    gamePhase={gameState.phase}
                    currentPlayer={gameState.players[gameState.currentPlayerIndex]}
                    onRollDice={rollDice}
                    onStartAuction={startAuction}
                    onPass={pass}
                    onEndTurn={endTurn}
                    onResetGame={resetGame}
                  />
                </div>
              )}
            </div>
            
            {/* Center - Game board */}
            <div className="lg:col-span-9 flex justify-center">
              <div className="w-full max-w-4xl">
                <Board 
                  properties={gameState.properties}
                  players={gameState.players}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
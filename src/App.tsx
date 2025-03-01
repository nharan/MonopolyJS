import React, { useState, useEffect } from 'react';
import { DollarSign, Users, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from 'lucide-react';
import Board from './components/Board';
import PlayerPanel from './components/PlayerPanel';
import ActionPanel from './components/ActionPanel';
import AuctionPanel from './components/AuctionPanel';
import { Player, Property, GamePhase, GameState, Card, CardType } from './types';
import { initialProperties, chanceCards, communityChestCards } from './data';

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

  const handleAITurn = () => {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    
    if (!currentPlayer || !currentPlayer.isAI) return;
    
    switch (gameState.phase) {
      case GamePhase.Rolling:
        rollDice();
        break;
      case GamePhase.PropertyAction:
        // AI has 70% chance to auction
        if (Math.random() < 0.7) {
          startAuction();
        } else {
          pass();
        }
        break;
      case GamePhase.Auctioning:
        // AI bidding strategy - bid if property value seems good
        const property = gameState.auctionProperty;
        if (!property) return;
        
        const currentBid = gameState.auctionHighestBid;
        const playerMoney = currentPlayer.money;
        
        // AI will bid up to 80% of property price if they have enough money
        const maxBid = Math.min(property.price * 0.8, playerMoney * 0.3);
        
        if (currentBid < maxBid) {
          // Choose a bid increment based on current bid
          let increment = 1;
          if (currentBid > 100) increment = 50;
          else if (currentBid > 50) increment = 25;
          else if (currentBid > 10) increment = 10;
          
          const newBid = currentBid + increment;
          placeBid(newBid);
        } else {
          passBid();
        }
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

    const die1 = Math.floor(Math.random() * 6) + 1;
    const die2 = Math.floor(Math.random() * 6) + 1;
    const diceSum = die1 + die2;
    const isDoubles = die1 === die2;
    
    const currentPlayer = { ...gameState.players[gameState.currentPlayerIndex] };
    let newPosition = currentPlayer.position;
    let newPhase = GamePhase.EndTurn;
    let newMessage = "";
    let doubleRollCount = isDoubles ? gameState.doubleRollCount + 1 : 0;
    
    // Check if player is in jail
    if (currentPlayer.inJail) {
      if (isDoubles) {
        currentPlayer.inJail = false;
        currentPlayer.jailTurns = 0;
        newMessage = `${currentPlayer.name} rolled doubles and got out of jail!`;
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
          } else {
            // Player pays money (recession)
            currentPlayer.money -= currentPlayer.goSalary;
            newMessage = `${currentPlayer.name} passed GO during recession and paid $${currentPlayer.goSalary}!`;
            
            // Check for bankruptcy
            if (currentPlayer.money < 0) {
              currentPlayer.bankrupt = true;
              newMessage += ` ${currentPlayer.name} went bankrupt!`;
            }
          }
        }
        
        currentPlayer.position = newPosition;
        
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
                
                const updatedPlayers = [...gameState.players];
                const ownerIndex = updatedPlayers.findIndex(p => p.id === landedSpace.ownerId);
                if (ownerIndex >= 0) {
                  updatedPlayers[ownerIndex].money += rent;
                }
                
                newMessage = `${currentPlayer.name} paid $${rent} rent to ${owner.name}.`;
                
                // Check for bankruptcy
                if (currentPlayer.money < 0) {
                  currentPlayer.bankrupt = true;
                  newMessage += ` ${currentPlayer.name} went bankrupt!`;
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
                return;
              }
            } else {
              newMessage = `${currentPlayer.name} landed on their own property: ${landedSpace.name}.`;
            }
          } else if (landedSpace.type === 'tax') {
            // Pay tax
            const taxAmount = landedSpace.position === 4 ? 200 : 100; // Income tax or luxury tax
            currentPlayer.money -= taxAmount;
            newMessage = `${currentPlayer.name} paid $${taxAmount} in taxes.`;
            
            // Check for bankruptcy
            if (currentPlayer.money < 0) {
              currentPlayer.bankrupt = true;
              newMessage += ` ${currentPlayer.name} went bankrupt!`;
            }
          } else if (landedSpace.type === 'chance') {
            // Draw chance card
            const card = drawCard('chance');
            if (card) {
              applyCard(card, currentPlayer);
              newMessage = `${currentPlayer.name} drew a Chance card: ${card.description}`;
            }
          } else if (landedSpace.type === 'community') {
            // Draw community chest card
            const card = drawCard('community');
            if (card) {
              applyCard(card, currentPlayer);
              newMessage = `${currentPlayer.name} drew a Community Chest card: ${card.description}`;
            }
          } else if (landedSpace.position === 30) {
            // Go to jail
            currentPlayer.position = 10;
            currentPlayer.inJail = true;
            newMessage = `${currentPlayer.name} went to jail!`;
          } else if (landedSpace.position === 20) {
            // Free parking - nothing happens
            newMessage = `${currentPlayer.name} landed on Free Parking.`;
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
    if (gameState.phase !== GamePhase.Auctioning || !gameState.auctionProperty) return;
    
    const currentBidder = gameState.players[gameState.auctionCurrentBidder];
    
    // Validate bid
    if (amount <= gameState.auctionHighestBid) {
      setGameState({
        ...gameState,
        message: `Bid must be higher than the current highest bid of $${gameState.auctionHighestBid}.`
      });
      return;
    }
    
    if (amount > currentBidder.money) {
      setGameState({
        ...gameState,
        message: `${currentBidder.name} doesn't have enough money for this bid.`
      });
      return;
    }
    
    // Update auction state
    const newBids = { ...gameState.auctionBids };
    newBids[currentBidder.id] = amount;
    
    // Find next bidder
    let nextBidderIndex = findNextBidder(gameState.auctionCurrentBidder);
    
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
    if (gameState.phase !== GamePhase.Auctioning) return;
    
    const currentBidder = gameState.players[gameState.auctionCurrentBidder];
    
    // Mark player as passed by setting bid to -1
    const newBids = { ...gameState.auctionBids };
    newBids[currentBidder.id] = -1;
    
    // Check if auction is over (only one bidder left)
    const activeBidders = Object.entries(newBids).filter(([_, bid]) => bid >= 0);
    
    if (activeBidders.length <= 1) {
      // Auction ended
      endAuction();
      return;
    }
    
    // Find next bidder
    let nextBidderIndex = findNextBidder(gameState.auctionCurrentBidder);
    
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
    
    setGameState({
      ...gameState,
      currentPlayerIndex: nextPlayerIndex,
      phase: GamePhase.Rolling,
      doubleRollCount: 0,
      message: `${gameState.players[nextPlayerIndex].name}'s turn. Roll the dice!`
    });
  };

  const checkGameOver = (players: Player[]) => {
    const activePlayers = players.filter(p => !p.bankrupt);
    
    if (activePlayers.length <= 1) {
      const winner = activePlayers[0];
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

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-4">Monopoly</h1>
        
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
              {[GamePhase.Rolling, GamePhase.PropertyAction, GamePhase.Auctioning, GamePhase.EndTurn].includes(gameState.phase) && (
                <div className="bg-white p-4 rounded-lg shadow mt-4 flex justify-center space-x-4">
                  {renderDie(gameState.dice[0])}
                  {renderDie(gameState.dice[1])}
                </div>
              )}
            </div>
            
            {/* Center - Game board */}
            <div className="lg:col-span-6 flex justify-center">
              <Board 
                properties={gameState.properties}
                players={gameState.players}
              />
            </div>
            
            {/* Right panel - Actions */}
            <div className="lg:col-span-3">
              {gameState.phase === GamePhase.Auctioning ? (
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
              ) : (
                <ActionPanel 
                  gamePhase={gameState.phase}
                  currentPlayer={gameState.players[gameState.currentPlayerIndex]}
                  onRollDice={rollDice}
                  onStartAuction={startAuction}
                  onPass={pass}
                  onEndTurn={endTurn}
                  onResetGame={resetGame}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
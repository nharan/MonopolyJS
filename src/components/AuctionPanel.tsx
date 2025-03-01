import React from 'react';
import { Property, Player } from '../types';
import SoundManager from '../utils/SoundManager';

interface AuctionPanelProps {
  property: Property | null;
  players: Player[];
  currentBidder: number;
  highestBid: number;
  highestBidder: number;
  bids: Record<number, number>;
  onPlaceBid: () => void;
  onIncrementBid: () => void;
  onPassBid: () => void;
  bidAmount: string;
  setBidAmount: (value: string) => void;
  bidIncrement: number;
  setBidIncrement: (value: number) => void;
}

const AuctionPanel: React.FC<AuctionPanelProps> = ({
  property,
  players,
  currentBidder,
  highestBid,
  highestBidder,
  bids,
  onPlaceBid,
  onIncrementBid,
  onPassBid,
  bidAmount,
  setBidAmount,
  bidIncrement,
  setBidIncrement
}) => {
  // Function to play button click sound and execute the provided action
  const handleButtonClick = (action: () => void) => {
    SoundManager.getInstance().play('button-click');
    action();
  };

  if (!property) return null;
  
  const currentPlayer = players[currentBidder];
  const highestBidderName = highestBidder >= 0 ? players.find(p => p.id === highestBidder)?.name : 'None';
  
  // Get property color
  const getPropertyColor = (): string => {
    if (property.type !== 'property') return 'bg-gray-200';
    
    switch (property.group) {
      case 'brown': return 'bg-amber-800';
      case 'light-blue': return 'bg-sky-300';
      case 'pink': return 'bg-pink-400';
      case 'orange': return 'bg-orange-500';
      case 'red': return 'bg-red-600';
      case 'yellow': return 'bg-yellow-400';
      case 'green': return 'bg-green-600';
      case 'dark-blue': return 'bg-blue-800';
      default: return 'bg-gray-200';
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 bg-blue-600 text-white">
        <h2 className="text-xl font-bold">Property Auction</h2>
      </div>
      
      <div className="p-4">
        {/* Property details */}
        <div className="mb-4 p-3 border rounded-lg">
          <div className={`h-4 w-full ${getPropertyColor()} mb-2`}></div>
          <h3 className="font-bold text-lg">{property.name}</h3>
          <p className="text-gray-600">Price: ${property.price}</p>
          {property.rent && <p className="text-gray-600">Rent: ${property.rent}</p>}
        </div>
        
        {/* Auction status */}
        <div className="mb-4 p-3 bg-gray-100 rounded-lg">
          <div className="flex justify-between mb-2">
            <span className="font-medium">Current Highest Bid:</span>
            <span className="font-bold">${highestBid}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Highest Bidder:</span>
            <span className="font-bold">{highestBidderName}</span>
          </div>
        </div>
        
        {/* Current bidder */}
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <h3 className="font-bold mb-2">Current Bidder: {currentPlayer?.name}</h3>
          <p>Available Money: ${currentPlayer?.money}</p>
        </div>
        
        {/* Bidding controls - only show if current player is not AI */}
        {!currentPlayer?.isAI && (
          <>
            {/* Custom bid input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enter Bid Amount:
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                  $
                </span>
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter amount"
                  min={highestBid + 1}
                  max={currentPlayer?.money}
                />
                <button
                  onClick={() => handleButtonClick(onPlaceBid)}
                  className="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 rounded-r-md bg-blue-600 text-white hover:bg-blue-700"
                >
                  Bid
                </button>
              </div>
            </div>
            
            {/* Quick bid increments */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bid Increment:
              </label>
              <div className="flex space-x-2">
                {[1, 10, 25, 50].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setBidIncrement(amount)}
                    className={`flex-1 py-2 border rounded ${
                      bidIncrement === amount 
                        ? 'bg-blue-100 border-blue-500' 
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    ${amount}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Quick bid button */}
            <button
              onClick={() => handleButtonClick(onIncrementBid)}
              className="w-full bg-green-500 text-white py-2 rounded-lg font-bold hover:bg-green-600 transition-colors mb-3"
              disabled={highestBid + bidIncrement > currentPlayer?.money}
            >
              Bid ${highestBid + bidIncrement}
            </button>
            
            {/* Pass button */}
            <button
              onClick={() => handleButtonClick(onPassBid)}
              className="w-full bg-gray-500 text-white py-2 rounded-lg font-bold hover:bg-gray-600 transition-colors"
            >
              Pass
            </button>
          </>
        )}
        
        {/* Bids summary */}
        <div className="mt-4">
          <h3 className="font-bold mb-2">Current Bids:</h3>
          <div className="space-y-1">
            {players.map((player) => {
              const playerBid = bids[player.id];
              if (playerBid === undefined) return null;
              
              return (
                <div 
                  key={player.id} 
                  className="flex justify-between items-center p-2 rounded"
                  style={{ backgroundColor: player.id === highestBidder ? '#e6f7ff' : 'transparent' }}
                >
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded-full mr-2"
                      style={{ backgroundColor: player.color }}
                    ></div>
                    <span>{player.name}</span>
                  </div>
                  <span>
                    {playerBid === -1 ? (
                      <span className="text-red-500">Passed</span>
                    ) : (
                      <span className="font-medium">${playerBid}</span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionPanel;
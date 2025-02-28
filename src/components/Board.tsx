import React from 'react';
import { Property, Player } from '../types';

interface BoardProps {
  properties: Property[];
  players: Player[];
}

const Board: React.FC<BoardProps> = ({ properties, players }) => {
  // Board layout configuration
  const boardSize = 11; // 11x11 grid
  const cellSize = 60; // Size of each cell in pixels
  const boardWidth = boardSize * cellSize;
  const boardHeight = boardSize * cellSize;
  
  // Helper function to get property color
  const getPropertyColor = (property: Property): string => {
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
  
  // Helper function to get property border color based on owner
  const getPropertyBorder = (property: Property): string => {
    if (property.ownerId === null) return 'border-gray-300';
    
    const owner = players.find(p => p.id === property.ownerId);
    return owner ? `border-2 border-${owner.color.replace('#', '')}` : 'border-gray-300';
  };
  
  // Helper function to get cell position
  const getCellPosition = (position: number): { x: number, y: number } => {
    // Bottom row (0-10)
    if (position <= 10) {
      return { x: 10 - position, y: 10 };
    }
    // Left column (11-20)
    else if (position <= 20) {
      return { x: 0, y: 10 - (position - 10) };
    }
    // Top row (21-30)
    else if (position <= 30) {
      return { x: position - 20, y: 0 };
    }
    // Right column (31-39)
    else {
      return { x: 10, y: position - 30 };
    }
  };
  
  // Render the board
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div 
        className="relative bg-green-100 border border-gray-300"
        style={{ width: `${boardWidth}px`, height: `${boardHeight}px` }}
      >
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <h2 className="text-3xl font-bold text-green-800 transform -rotate-45">MONOPOLY</h2>
        </div>
        
        {/* Properties */}
        {properties.map((property) => {
          const { x, y } = getCellPosition(property.position);
          const isCorner = [0, 10, 20, 30].includes(property.position);
          
          return (
            <div
              key={property.position}
              className={`absolute border ${getPropertyBorder(property)} ${isCorner ? 'w-16 h-16' : 
                property.position % 10 === 0 ? 'w-16 h-10' : 'w-10 h-16'}`}
              style={{
                left: `${x * cellSize}px`,
                top: `${y * cellSize}px`,
                transform: property.position >= 11 && property.position <= 30 ? 'rotate(180deg)' : '',
              }}
            >
              {/* Property color bar */}
              {property.type === 'property' && (
                <div 
                  className={`${getPropertyColor(property)} h-3 w-full`}
                ></div>
              )}
              
              {/* Property name */}
              <div className="text-xs font-semibold p-1 overflow-hidden text-center">
                {property.name.split(' ').map((word, i) => (
                  <span key={i} className="block leading-tight">{word}</span>
                ))}
              </div>
              
              {/* Property price */}
              {property.price > 0 && (
                <div className="text-xs text-center">
                  ${property.price}
                </div>
              )}
              
              {/* Players on this space */}
              <div className="absolute bottom-0 left-0 right-0 flex flex-wrap justify-center">
                {players
                  .filter(player => player.position === property.position && !player.bankrupt)
                  .map(player => (
                    <div 
                      key={player.id}
                      className="w-4 h-4 m-0.5 rounded-full flex items-center justify-center text-xs"
                      style={{ backgroundColor: player.color }}
                    >
                      {player.token}
                    </div>
                  ))
                }
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Board;
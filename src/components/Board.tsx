import React from 'react';
import { Property, Player } from '../types';

interface BoardProps {
  properties: Property[];
  players: Player[];
}

const Board: React.FC<BoardProps> = ({ properties, players }) => {
  // Board layout configuration
  const boardSize = 800; // Increased from 600 to 800 for better visibility
  const cornerSize = 100; // Increased from 80 to 100
  const sideSquareWidth = 53; // Increased from 40 to 53
  const sideSquareHeight = 80; // Increased from 60 to 80
  
  // Helper function to get property color
  const getPropertyColor = (property: Property): string => {
    if (property.type !== 'property') return '#e5e7eb';
    
    switch (property.group) {
      case 'brown': return '#92400e';
      case 'light-blue': return '#7dd3fc';
      case 'pink': return '#f472b6';
      case 'orange': return '#f97316';
      case 'red': return '#dc2626';
      case 'yellow': return '#facc15';
      case 'green': return '#16a34a';
      case 'dark-blue': return '#1e40af';
      default: return '#e5e7eb';
    }
  };
  
  // Helper function to get property border color based on owner
  const getPropertyBorder = (property: Property): string => {
    if (property.ownerId === null) return '#d1d5db';
    
    const owner = players.find(p => p.id === property.ownerId);
    return owner ? owner.color : '#d1d5db';
  };
  
  // Calculate positions for each property
  const getPropertyPosition = (position: number) => {
    const boardPadding = 10;
    const effectiveBoardSize = boardSize - 2 * boardPadding;
    
    // Bottom row (0-10)
    if (position >= 0 && position <= 10) {
      if (position === 0) {
        return {
          x: boardPadding + effectiveBoardSize - cornerSize,
          y: boardPadding + effectiveBoardSize - cornerSize,
          width: cornerSize,
          height: cornerSize,
          rotation: 0
        };
      } else if (position === 10) {
        return {
          x: boardPadding,
          y: boardPadding + effectiveBoardSize - cornerSize,
          width: cornerSize,
          height: cornerSize,
          rotation: 0
        };
      } else {
        // Calculate position for properties 1-9
        const totalWidth = effectiveBoardSize - 2 * cornerSize;
        const propertyWidth = totalWidth / 9; // 9 properties between corners
        return {
          x: boardPadding + cornerSize + (9 - position) * propertyWidth,
          y: boardPadding + effectiveBoardSize - sideSquareHeight,
          width: propertyWidth,
          height: sideSquareHeight,
          rotation: 0
        };
      }
    }
    // Left column (11-20)
    else if (position >= 11 && position <= 20) {
      if (position === 20) {
        return {
          x: boardPadding,
          y: boardPadding,
          width: cornerSize,
          height: cornerSize,
          rotation: 0
        };
      } else {
        // Calculate position for properties 11-19
        const totalHeight = effectiveBoardSize - 2 * cornerSize;
        const propertyHeight = totalHeight / 9; // 9 properties between corners
        return {
          x: boardPadding,
          y: boardPadding + cornerSize + (19 - position) * propertyHeight,
          width: sideSquareHeight,
          height: propertyHeight,
          rotation: 90
        };
      }
    }
    // Top row (21-30)
    else if (position >= 21 && position <= 30) {
      if (position === 30) {
        return {
          x: boardPadding + effectiveBoardSize - cornerSize,
          y: boardPadding,
          width: cornerSize,
          height: cornerSize,
          rotation: 0
        };
      } else {
        // Calculate position for properties 21-29
        const totalWidth = effectiveBoardSize - 2 * cornerSize;
        const propertyWidth = totalWidth / 9; // 9 properties between corners
        return {
          x: boardPadding + cornerSize + (position - 21) * propertyWidth,
          y: boardPadding,
          width: propertyWidth,
          height: sideSquareHeight,
          rotation: 180
        };
      }
    }
    // Right column (31-39)
    else {
      // Calculate position for properties 31-39
      const totalHeight = effectiveBoardSize - 2 * cornerSize;
      const propertyHeight = totalHeight / 9; // 9 properties between corners
      return {
        x: boardPadding + effectiveBoardSize - sideSquareHeight,
        y: boardPadding + cornerSize + (position - 31) * propertyHeight,
        width: sideSquareHeight,
        height: propertyHeight,
        rotation: 270
      };
    }
  };
  
  // Render the board
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <svg 
        width={boardSize} 
        height={boardSize} 
        viewBox={`0 0 ${boardSize} ${boardSize}`}
        className="mx-auto"
      >
        {/* Board background */}
        <defs>
          <linearGradient id="boardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d1fae5" />
            <stop offset="100%" stopColor="#a7f3d0" />
          </linearGradient>
        </defs>
        
        <rect 
          x="10" 
          y="10" 
          width={boardSize - 20} 
          height={boardSize - 20} 
          fill="url(#boardGradient)" 
          stroke="#047857" 
          strokeWidth="2"
          rx="5"
        />
        
        {/* Center logo */}
        <g transform={`translate(${boardSize/2}, ${boardSize/2})`}>
          <rect 
            x="-160" 
            y="-50" 
            width="320" 
            height="100" 
            fill="#ecfdf5" 
            rx="10" 
            transform="rotate(0)"
            stroke="#047857"
            strokeWidth="1"
          />
          <text 
            textAnchor="middle" 
            fontSize="64" 
            fontWeight="bold" 
            fill="#047857" 
            transform="rotate(0)"
          >
            MONOPOLY
          </text>
        </g>
        
        {/* Properties */}
        {properties.map((property) => {
          const pos = getPropertyPosition(property.position);
          const isCorner = [0, 10, 20, 30].includes(property.position);
          
          return (
            <g 
              key={property.position} 
              transform={`translate(${pos.x}, ${pos.y}) rotate(${pos.rotation}, ${pos.width/2}, ${pos.height/2})`}
            >
              {/* Property background */}
              <rect 
                x="0" 
                y="0" 
                width={pos.width} 
                height={pos.height} 
                fill="white" 
                stroke={getPropertyBorder(property)} 
                strokeWidth="1"
              />
              
              {/* Property color bar */}
              {property.type === 'property' && (
                <rect 
                  x="0" 
                  y="0" 
                  width={pos.width} 
                  height="16" 
                  fill={getPropertyColor(property)}
                />
              )}
              
              {/* Special property types */}
              {property.type === 'railroad' && (
                <rect 
                  x="0" 
                  y="0" 
                  width={pos.width} 
                  height="16" 
                  fill="#1f2937"
                />
              )}
              
              {property.type === 'utility' && (
                <rect 
                  x="0" 
                  y="0" 
                  width={pos.width} 
                  height="16" 
                  fill="#4b5563"
                />
              )}
              
              {property.type === 'tax' && (
                <rect 
                  x="0" 
                  y="0" 
                  width={pos.width} 
                  height="16" 
                  fill="#7c2d12"
                />
              )}
              
              {/* Special icons for corners and special spaces */}
              {property.position === 0 && (
                <text x={pos.width/2} y={pos.height/2} textAnchor="middle" fontSize="24" fontWeight="bold" fill="#0369a1">GO</text>
              )}
              {property.position === 10 && (
                <text x={pos.width/2} y={pos.height/2} textAnchor="middle" fontSize="24" fontWeight="bold" fill="#b91c1c">JAIL</text>
              )}
              {property.position === 20 && (
                <text x={pos.width/2} y={pos.height/2 - 15} textAnchor="middle" fontSize="16" fontWeight="bold" fill="#047857">FREE</text>
              )}
              {property.position === 20 && (
                <text x={pos.width/2} y={pos.height/2 + 15} textAnchor="middle" fontSize="16" fontWeight="bold" fill="#047857">PARKING</text>
              )}
              {property.position === 30 && (
                <text x={pos.width/2} y={pos.height/2 - 15} textAnchor="middle" fontSize="16" fontWeight="bold" fill="#b91c1c">GO TO</text>
              )}
              {property.position === 30 && (
                <text x={pos.width/2} y={pos.height/2 + 15} textAnchor="middle" fontSize="16" fontWeight="bold" fill="#b91c1c">JAIL</text>
              )}
              
              {/* Property name - only for non-corner spaces */}
              {!isCorner && (
                <text 
                  x={pos.width/2} 
                  y={property.type === 'property' || property.type === 'railroad' || property.type === 'utility' || property.type === 'tax' ? 30 : 25} 
                  textAnchor="middle" 
                  fontSize="9" 
                  fontWeight="bold"
                >
                  {property.name.length > 12 ? property.name.substring(0, 10) + '...' : property.name}
                </text>
              )}
              
              {/* Property price */}
              {property.price > 0 && !isCorner && (
                <text 
                  x={pos.width/2} 
                  y={pos.height - 10} 
                  textAnchor="middle" 
                  fontSize="11"
                  fontWeight="medium"
                >
                  ${property.price}
                </text>
              )}
            </g>
          );
        })}
        
        {/* Players */}
        {players.filter(p => !p.bankrupt).map((player) => {
          const property = properties.find(p => p.position === player.position);
          if (!property) return null;
          
          const pos = getPropertyPosition(property.position);
          const playerIndex = players.filter(p => p.position === property.position && !p.bankrupt)
            .findIndex(p => p.id === player.id);
          
          // Calculate player token position within the property
          const tokenSize = 22;
          const tokenMargin = 5;
          const tokensPerRow = Math.floor(pos.width / (tokenSize + tokenMargin));
          const row = Math.floor(playerIndex / tokensPerRow);
          const col = playerIndex % tokensPerRow;
          
          const tokenX = pos.x + tokenMargin + col * (tokenSize + tokenMargin);
          const tokenY = pos.y + pos.height - tokenSize - tokenMargin - row * (tokenSize + tokenMargin);
          
          return (
            <g key={player.id} transform={`translate(${tokenX}, ${tokenY})`}>
              <circle 
                cx={tokenSize/2} 
                cy={tokenSize/2} 
                r={tokenSize/2} 
                fill={player.color} 
                stroke="white" 
                strokeWidth="2"
                filter="drop-shadow(0px 2px 2px rgba(0, 0, 0, 0.25))"
              />
              <text 
                x={tokenSize/2} 
                y={tokenSize/2 + 4} 
                textAnchor="middle" 
                fontSize="14" 
                fill="white"
                fontWeight="bold"
                style={{ textShadow: '1px 1px 1px rgba(0, 0, 0, 0.5)' }}
              >
                {player.token}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default Board;
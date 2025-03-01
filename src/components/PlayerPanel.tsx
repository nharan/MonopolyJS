import React from 'react';
import { DollarSign, Home, Users, Bot } from 'lucide-react';
import { Player, Property, AIStrategy } from '../types';

interface PlayerPanelProps {
  players: Player[];
  currentPlayerIndex: number;
  properties: Property[];
}

const PlayerPanel: React.FC<PlayerPanelProps> = ({ players, currentPlayerIndex, properties }) => {
  // Group properties by owner
  const getPlayerProperties = (playerId: number) => {
    return properties.filter(property => property.ownerId === playerId);
  };
  
  // Group properties by color
  const groupPropertiesByColor = (playerProperties: Property[]) => {
    const groups: Record<string, Property[]> = {};
    
    playerProperties.forEach(property => {
      if (property.group) {
        if (!groups[property.group]) {
          groups[property.group] = [];
        }
        groups[property.group].push(property);
      }
    });
    
    return groups;
  };
  
  // Get color for property group
  const getGroupColor = (group: string): string => {
    switch (group) {
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
        <h2 className="text-xl font-bold flex items-center">
          <Users className="mr-2" /> Players
        </h2>
      </div>
      
      <div className="divide-y divide-gray-200">
        {players.map((player, index) => {
          const playerProperties = getPlayerProperties(player.id);
          const propertyGroups = groupPropertiesByColor(playerProperties);
          
          return (
            <div 
              key={player.id} 
              className={`p-4 ${index === currentPlayerIndex ? 'bg-blue-50' : ''} ${player.bankrupt ? 'opacity-50' : ''}`}
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <div 
                    className="w-6 h-6 rounded-full mr-2 flex items-center justify-center text-white"
                    style={{ backgroundColor: player.color }}
                  >
                    {player.token}
                  </div>
                  <h3 className="font-bold">
                    {player.name} 
                    {player.bankrupt && <span className="text-red-500 ml-2">(Bankrupt)</span>}
                    {player.inJail && <span className="text-orange-500 ml-2">(In Jail)</span>}
                  </h3>
                </div>
                <div className="flex items-center text-green-600">
                  <DollarSign size={16} className="mr-1" />
                  <span className="font-bold">{player.money}</span>
                </div>
              </div>
              
              {/* AI Strategy */}
              {player.isAI && player.aiStrategy && (
                <div className="text-xs mb-2 flex items-center">
                  <Bot size={12} className="mr-1" />
                  <span className="font-medium">Strategy: </span>
                  <span className={`ml-1 ${
                    player.aiStrategy === AIStrategy.Aggressive ? 'text-red-500' : 
                    player.aiStrategy === AIStrategy.Passive ? 'text-blue-500' : 
                    'text-green-500'
                  }`}>
                    {player.aiStrategy.charAt(0).toUpperCase() + player.aiStrategy.slice(1)}
                  </span>
                </div>
              )}
              
              {/* GO Salary Status */}
              <div className="text-sm mb-2">
                <span className="font-medium">GO Salary: </span>
                {player.goSalaryDirection === -1 ? (
                  <span className="text-green-600">Receive ${player.goSalary}</span>
                ) : (
                  <span className="text-red-600">Pay ${player.goSalary} (Recession)</span>
                )}
              </div>
              
              {/* Properties */}
              {playerProperties.length > 0 && (
                <div className="mt-2">
                  <h4 className="text-sm font-medium flex items-center">
                    <Home size={14} className="mr-1" /> Properties:
                  </h4>
                  <div className="flex flex-wrap mt-1">
                    {Object.entries(propertyGroups).map(([group, props]) => (
                      <div key={group} className="mr-2 mb-2">
                        <div className={`${getGroupColor(group)} px-2 py-1 rounded text-xs text-white`}>
                          {group} ({props.length})
                        </div>
                      </div>
                    ))}
                    
                    {/* Railroads and Utilities */}
                    {playerProperties.filter(p => p.type === 'railroad').length > 0 && (
                      <div className="mr-2 mb-2">
                        <div className="bg-gray-800 px-2 py-1 rounded text-xs text-white">
                          Railroads ({playerProperties.filter(p => p.type === 'railroad').length})
                        </div>
                      </div>
                    )}
                    
                    {playerProperties.filter(p => p.type === 'utility').length > 0 && (
                      <div className="mr-2 mb-2">
                        <div className="bg-gray-500 px-2 py-1 rounded text-xs text-white">
                          Utilities ({playerProperties.filter(p => p.type === 'utility').length})
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlayerPanel;
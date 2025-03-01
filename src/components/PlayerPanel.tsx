import React, { useState } from 'react';
import { DollarSign, Home, Users, Bot, ChevronDown, ChevronUp, Award, Banknote } from 'lucide-react';
import { Player, Property, AIStrategy } from '../types';

interface PlayerPanelProps {
  players: Player[];
  currentPlayerIndex: number;
  properties: Property[];
}

const PlayerPanel: React.FC<PlayerPanelProps> = ({ players, currentPlayerIndex, properties }) => {
  const [expandedPlayer, setExpandedPlayer] = useState<number | null>(null);
  
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
  
  // Get text color for property group
  const getGroupTextColor = (group: string): string => {
    switch (group) {
      case 'brown':
      case 'dark-blue':
      case 'green':
      case 'red':
        return 'text-white';
      default:
        return 'text-gray-800';
    }
  };
  
  // Get AI strategy badge color
  const getStrategyBadgeColor = (strategy: AIStrategy): string => {
    switch (strategy) {
      case AIStrategy.Aggressive: return 'bg-red-100 text-red-800 border-red-300';
      case AIStrategy.Passive: return 'bg-blue-100 text-blue-800 border-blue-300';
      case AIStrategy.Balanced: return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };
  
  // Toggle player expansion
  const togglePlayerExpansion = (playerId: number) => {
    if (expandedPlayer === playerId) {
      setExpandedPlayer(null);
    } else {
      setExpandedPlayer(playerId);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <h2 className="text-xl font-bold flex items-center">
          <Users className="mr-2" /> Players
        </h2>
      </div>
      
      <div className="divide-y divide-gray-200">
        {players.map((player, index) => {
          const playerProperties = getPlayerProperties(player.id);
          const propertyGroups = groupPropertiesByColor(playerProperties);
          const isExpanded = expandedPlayer === player.id;
          
          return (
            <div 
              key={player.id} 
              className={`${index === currentPlayerIndex ? 'bg-blue-50' : ''} ${player.bankrupt ? 'opacity-50' : ''} transition-all duration-200`}
            >
              {/* Player header - always visible */}
              <div 
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => togglePlayerExpansion(player.id)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div 
                      className="w-8 h-8 rounded-full mr-2 flex items-center justify-center text-white shadow-md"
                      style={{ backgroundColor: player.color }}
                    >
                      {player.token}
                    </div>
                    <div>
                      <h3 className="font-bold flex items-center">
                        {player.name} 
                        {player.isAI && (
                          <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${getStrategyBadgeColor(player.aiStrategy || AIStrategy.Balanced)}`}>
                            <Bot size={12} className="inline mr-1" />
                            {player.aiStrategy}
                          </span>
                        )}
                      </h3>
                      
                      {/* Status badges */}
                      <div className="flex space-x-1 mt-1">
                        {player.bankrupt && (
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                            Bankrupt
                          </span>
                        )}
                        {player.inJail && (
                          <span className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">
                            In Jail
                          </span>
                        )}
                        {index === currentPlayerIndex && !player.bankrupt && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                            Current Turn
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="flex items-center bg-green-50 text-green-700 px-3 py-1 rounded-full mr-3">
                      <DollarSign size={16} className="mr-1" />
                      <span className="font-bold">{player.money}</span>
                    </div>
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>
                
                {/* Property count summary - always visible */}
                <div className="mt-2 flex items-center text-sm text-gray-600">
                  <Home size={14} className="mr-1" />
                  <span>
                    {playerProperties.length} {playerProperties.length === 1 ? 'property' : 'properties'}
                  </span>
                </div>
              </div>
              
              {/* Expanded player details */}
              {isExpanded && (
                <div className="px-4 pb-4 bg-gray-50 border-t border-gray-100">
                  {/* GO Salary Status */}
                  <div className="mb-3 p-2 bg-white rounded-md shadow-sm">
                    <h4 className="text-sm font-medium flex items-center mb-1">
                      <Banknote size={14} className="mr-1" /> GO Salary:
                    </h4>
                    {player.goSalaryDirection === -1 ? (
                      <div className="flex items-center text-green-600">
                        <span>Receive </span>
                        <DollarSign size={14} className="mx-0.5" />
                        <span className="font-bold">{player.goSalary}</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-red-600">
                        <span>Pay </span>
                        <DollarSign size={14} className="mx-0.5" />
                        <span className="font-bold">{player.goSalary}</span>
                        <span className="ml-1">(Recession)</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Properties */}
                  {playerProperties.length > 0 ? (
                    <div>
                      <h4 className="text-sm font-medium flex items-center mb-2">
                        <Home size={14} className="mr-1" /> Properties:
                      </h4>
                      
                      {/* Property groups */}
                      <div className="space-y-3">
                        {/* Color groups */}
                        {Object.entries(propertyGroups).map(([group, props]) => (
                          <div key={group} className="bg-white rounded-md shadow-sm overflow-hidden">
                            <div className={`${getGroupColor(group)} ${getGroupTextColor(group)} px-3 py-1 font-medium text-sm`}>
                              {group.charAt(0).toUpperCase() + group.slice(1)} Group ({props.length})
                            </div>
                            <div className="p-2">
                              <div className="grid grid-cols-1 gap-2">
                                {props.map(property => (
                                  <div key={property.position} className="text-xs border border-gray-200 rounded p-1 flex justify-between">
                                    <span>{property.name}</span>
                                    <span className="font-medium">${property.price}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {/* Railroads */}
                        {playerProperties.filter(p => p.type === 'railroad').length > 0 && (
                          <div className="bg-white rounded-md shadow-sm overflow-hidden">
                            <div className="bg-gray-800 text-white px-3 py-1 font-medium text-sm">
                              Railroads ({playerProperties.filter(p => p.type === 'railroad').length})
                            </div>
                            <div className="p-2">
                              <div className="grid grid-cols-1 gap-2">
                                {playerProperties.filter(p => p.type === 'railroad').map(property => (
                                  <div key={property.position} className="text-xs border border-gray-200 rounded p-1 flex justify-between">
                                    <span>{property.name}</span>
                                    <span className="font-medium">${property.price}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Utilities */}
                        {playerProperties.filter(p => p.type === 'utility').length > 0 && (
                          <div className="bg-white rounded-md shadow-sm overflow-hidden">
                            <div className="bg-gray-500 text-white px-3 py-1 font-medium text-sm">
                              Utilities ({playerProperties.filter(p => p.type === 'utility').length})
                            </div>
                            <div className="p-2">
                              <div className="grid grid-cols-1 gap-2">
                                {playerProperties.filter(p => p.type === 'utility').map(property => (
                                  <div key={property.position} className="text-xs border border-gray-200 rounded p-1 flex justify-between">
                                    <span>{property.name}</span>
                                    <span className="font-medium">${property.price}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 italic">No properties owned</div>
                  )}
                  
                  {/* Get Out of Jail Cards */}
                  {player.getOutOfJailCards > 0 && (
                    <div className="mt-3 p-2 bg-white rounded-md shadow-sm">
                      <div className="flex items-center text-orange-600">
                        <Award size={14} className="mr-1" />
                        <span>{player.getOutOfJailCards} Get Out of Jail Free {player.getOutOfJailCards === 1 ? 'Card' : 'Cards'}</span>
                      </div>
                    </div>
                  )}
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
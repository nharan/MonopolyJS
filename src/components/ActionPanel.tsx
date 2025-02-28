import React from 'react';
import { Player, GamePhase } from '../types';

interface ActionPanelProps {
  gamePhase: GamePhase;
  currentPlayer: Player | undefined;
  onRollDice: () => void;
  onStartAuction: () => void;
  onPass: () => void;
  onEndTurn: () => void;
  onResetGame: () => void;
}

const ActionPanel: React.FC<ActionPanelProps> = ({
  gamePhase,
  currentPlayer,
  onRollDice,
  onStartAuction,
  onPass,
  onEndTurn,
  onResetGame
}) => {
  if (!currentPlayer) return null;
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 bg-blue-600 text-white">
        <h2 className="text-xl font-bold">Actions</h2>
      </div>
      
      <div className="p-4">
        {gamePhase === GamePhase.Rolling && (
          <button
            className="w-full bg-blue-500 text-white py-3 rounded-lg font-bold hover:bg-blue-600 transition-colors mb-4"
            onClick={onRollDice}
            disabled={currentPlayer.isAI}
          >
            Roll Dice
          </button>
        )}
        
        {gamePhase === GamePhase.PropertyAction && (
          <div className="space-y-3">
            <button
              className="w-full bg-green-500 text-white py-3 rounded-lg font-bold hover:bg-green-600 transition-colors"
              onClick={onStartAuction}
              disabled={currentPlayer.isAI}
            >
              Start Auction
            </button>
            
            <button
              className="w-full bg-gray-500 text-white py-3 rounded-lg font-bold hover:bg-gray-600 transition-colors"
              onClick={onPass}
              disabled={currentPlayer.isAI}
            >
              Pass
            </button>
          </div>
        )}
        
        {gamePhase === GamePhase.EndTurn && (
          <button
            className="w-full bg-blue-500 text-white py-3 rounded-lg font-bold hover:bg-blue-600 transition-colors"
            onClick={onEndTurn}
            disabled={currentPlayer.isAI}
          >
            End Turn
          </button>
        )}
        
        {gamePhase === GamePhase.GameOver && (
          <button
            className="w-full bg-red-500 text-white py-3 rounded-lg font-bold hover:bg-red-600 transition-colors"
            onClick={onResetGame}
          >
            New Game
          </button>
        )}
        
        {/* Rules reminder */}
        <div className="mt-6 p-3 bg-gray-100 rounded-lg text-sm">
          <h3 className="font-bold mb-2">Game Rules:</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Properties must be auctioned when landed on</li>
            <li>GO salary decreases by $10 each time</li>
            <li>After GO salary reaches $0, players enter recession and must pay to pass GO</li>
            <li>Three doubles in a row sends you to jail</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ActionPanel;
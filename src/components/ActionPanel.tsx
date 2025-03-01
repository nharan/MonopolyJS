import React from 'react';
import { Player, GamePhase } from '../types';
import { DollarSign, ArrowRight, Home, AlertTriangle, RefreshCw, Award, HelpCircle, Dices } from 'lucide-react';

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
  
  // Helper function to get phase description
  const getPhaseDescription = (): string => {
    switch (gamePhase) {
      case GamePhase.Rolling:
        return "Roll the dice to move your token around the board.";
      case GamePhase.PropertyAction:
        return "You landed on an unowned property. Start an auction or pass.";
      case GamePhase.Auctioning:
        return "Auction in progress. Place your bid or pass.";
      case GamePhase.EndTurn:
        return "Your turn is complete. End your turn to continue.";
      case GamePhase.GameOver:
        return "Game over! Start a new game to play again.";
      default:
        return "";
    }
  };
  
  // Helper function to get button animation class
  const getButtonAnimation = (primary: boolean = true): string => {
    if (currentPlayer.isAI) return "";
    
    if (primary) {
      return gamePhase === GamePhase.Rolling || gamePhase === GamePhase.EndTurn
        ? "animate-pulse" 
        : "";
    }
    return "";
  };
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <h2 className="text-xl font-bold flex items-center">
          {gamePhase === GamePhase.Rolling && <Dices className="mr-2" />}
          {gamePhase === GamePhase.PropertyAction && <Home className="mr-2" />}
          {gamePhase === GamePhase.EndTurn && <ArrowRight className="mr-2" />}
          {gamePhase === GamePhase.GameOver && <Award className="mr-2" />}
          {currentPlayer.name}'s Actions
        </h2>
        <p className="text-sm mt-1 text-indigo-100">{getPhaseDescription()}</p>
      </div>
      
      <div className="p-4">
        {/* Current player status */}
        <div className="mb-4 p-3 bg-indigo-50 rounded-lg flex items-center justify-between">
          <div className="flex items-center">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-white mr-3"
              style={{ backgroundColor: currentPlayer.color }}
            >
              {currentPlayer.token}
            </div>
            <div>
              <div className="font-bold">{currentPlayer.name}</div>
              <div className="text-xs text-gray-600">
                {currentPlayer.inJail ? "In Jail" : `Position: ${currentPlayer.position}`}
              </div>
            </div>
          </div>
          <div className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full">
            <DollarSign size={16} className="mr-1" />
            <span className="font-bold">{currentPlayer.money}</span>
          </div>
        </div>
        
        {gamePhase === GamePhase.Rolling && (
          <button
            className={`w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-bold hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 flex items-center justify-center ${getButtonAnimation()}`}
            onClick={onRollDice}
            disabled={currentPlayer.isAI}
          >
            <Dices className="mr-2" />
            Roll Dice
          </button>
        )}
        
        {gamePhase === GamePhase.PropertyAction && (
          <div className="space-y-3">
            <button
              className={`w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-bold hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105 flex items-center justify-center ${getButtonAnimation()}`}
              onClick={onStartAuction}
              disabled={currentPlayer.isAI}
            >
              <DollarSign className="mr-2" />
              Start Auction
            </button>
            
            <button
              className="w-full bg-gradient-to-r from-gray-400 to-gray-500 text-white py-3 rounded-lg font-bold hover:from-gray-500 hover:to-gray-600 transition-all flex items-center justify-center"
              onClick={onPass}
              disabled={currentPlayer.isAI}
            >
              <ArrowRight className="mr-2" />
              Pass
            </button>
          </div>
        )}
        
        {gamePhase === GamePhase.EndTurn && (
          <button
            className={`w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white py-3 rounded-lg font-bold hover:from-indigo-600 hover:to-indigo-700 transition-all transform hover:scale-105 flex items-center justify-center ${getButtonAnimation()}`}
            onClick={onEndTurn}
            disabled={currentPlayer.isAI}
          >
            <ArrowRight className="mr-2" />
            End Turn
          </button>
        )}
        
        {gamePhase === GamePhase.GameOver && (
          <button
            className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-lg font-bold hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105 flex items-center justify-center"
            onClick={onResetGame}
          >
            <RefreshCw className="mr-2" />
            New Game
          </button>
        )}
        
        {/* AI turn indicator */}
        {currentPlayer.isAI && gamePhase !== GamePhase.GameOver && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center">
            <AlertTriangle size={20} className="text-yellow-500 mr-2" />
            <div className="text-sm text-yellow-700">
              AI is thinking... Please wait.
            </div>
          </div>
        )}
        
        {/* Rules reminder */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm border border-gray-200">
          <h3 className="font-bold mb-2 flex items-center text-gray-700">
            <HelpCircle size={16} className="mr-1" /> Game Rules:
          </h3>
          <ul className="list-disc pl-5 space-y-1 text-gray-600">
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
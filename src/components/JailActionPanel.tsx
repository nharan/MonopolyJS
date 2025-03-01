import React from 'react';
import { Player } from '../types';
import { Lock, DollarSign, Dices } from 'lucide-react';
import SoundManager from '../utils/SoundManager';

interface JailActionPanelProps {
  currentPlayer: Player;
  onPayJailFine: () => void;
  onRollForJail: () => void;
}

const JailActionPanel: React.FC<JailActionPanelProps> = ({
  currentPlayer,
  onPayJailFine,
  onRollForJail
}) => {
  // Function to play button click sound and execute the provided action
  const handleButtonClick = (action: () => void) => {
    SoundManager.getInstance().play('button-click');
    action();
  };

  if (!currentPlayer || !currentPlayer.inJail) return null;

  const canPayFine = currentPlayer.money >= 50;
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-gray-700 to-gray-800 text-white">
        <h2 className="text-xl font-bold flex items-center">
          <Lock className="mr-2" />
          Jail Actions
        </h2>
        <p className="text-sm mt-1 text-gray-300">
          You're in jail! Pay $50 to get out or try to roll doubles.
        </p>
      </div>
      
      <div className="p-4">
        {/* Current player status */}
        <div className="mb-4 p-3 bg-gray-100 rounded-lg flex items-center justify-between">
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
                Jail Turn: {currentPlayer.jailTurns + 1} of 3
              </div>
            </div>
          </div>
          <div className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full">
            <DollarSign size={16} className="mr-1" />
            <span className="font-bold">{currentPlayer.money}</span>
          </div>
        </div>
        
        <div className="space-y-3">
          <button
            className={`w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-bold hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center ${!canPayFine ? 'opacity-50 cursor-not-allowed' : 'transform hover:scale-105'}`}
            onClick={() => handleButtonClick(onPayJailFine)}
            disabled={!canPayFine || currentPlayer.isAI}
          >
            <DollarSign className="mr-2" />
            Pay $50 to Get Out
          </button>
          
          <button
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-bold hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 flex items-center justify-center"
            onClick={() => handleButtonClick(onRollForJail)}
            disabled={currentPlayer.isAI}
          >
            <Dices className="mr-2" />
            Try to Roll Doubles
          </button>
        </div>
        
        {/* AI turn indicator */}
        {currentPlayer.isAI && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center">
            <div className="text-sm text-yellow-700">
              AI is deciding... Please wait.
            </div>
          </div>
        )}
        
        {/* Jail rules */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm border border-gray-200">
          <h3 className="font-bold mb-2 text-gray-700">Jail Rules:</h3>
          <ul className="list-disc pl-5 space-y-1 text-gray-600">
            <li>Pay $50 to get out immediately</li>
            <li>Roll doubles to get out for free</li>
            <li>After 3 turns in jail, you must pay $50 and get out</li>
            <li>You cannot collect rent while in jail</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default JailActionPanel; 
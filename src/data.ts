import { Property, Card } from './types';

// Initialize properties
export const initialProperties: Property[] = [
  // Bottom row (left to right)
  { position: 0, name: 'GO', type: 'corner', price: 0, group: null, ownerId: null },
  { position: 1, name: 'Mediterranean Avenue', type: 'property', price: 60, rent: 2, group: 'brown', ownerId: null },
  { position: 2, name: 'Community Chest', type: 'community', price: 0, group: null, ownerId: null },
  { position: 3, name: 'Baltic Avenue', type: 'property', price: 60, rent: 4, group: 'brown', ownerId: null },
  { position: 4, name: 'Income Tax', type: 'tax', price: 200, group: null, ownerId: null },
  { position: 5, name: 'Reading Railroad', type: 'railroad', price: 200, group: null, ownerId: null },
  { position: 6, name: 'Oriental Avenue', type: 'property', price: 100, rent: 6, group: 'light-blue', ownerId: null },
  { position: 7, name: 'Chance', type: 'chance', price: 0, group: null, ownerId: null },
  { position: 8, name: 'Vermont Avenue', type: 'property', price: 100, rent: 6, group: 'light-blue', ownerId: null },
  { position: 9, name: 'Connecticut Avenue', type: 'property', price: 120, rent: 8, group: 'light-blue', ownerId: null },
  { position: 10, name: 'Jail / Just Visiting', type: 'corner', price: 0, group: null, ownerId: null },
  
  // Left column (bottom to top)
  { position: 11, name: 'St. Charles Place', type: 'property', price: 140, rent: 10, group: 'pink', ownerId: null },
  { position: 12, name: 'Electric Company', type: 'utility', price: 150, group: null, ownerId: null },
  { position: 13, name: 'States Avenue', type: 'property', price: 140, rent: 10, group: 'pink', ownerId: null },
  { position: 14, name: 'Virginia Avenue', type: 'property', price: 160, rent: 12, group: 'pink', ownerId: null },
  { position: 15, name: 'Pennsylvania Railroad', type: 'railroad', price: 200, group: null, ownerId: null },
  { position: 16, name: 'St. James Place', type: 'property', price: 180, rent: 14, group: 'orange', ownerId: null },
  { position: 17, name: 'Community Chest', type: 'community', price: 0, group: null, ownerId: null },
  { position: 18, name: 'Tennessee Avenue', type: 'property', price: 180, rent: 14, group: 'orange', ownerId: null },
  { position: 19, name: 'New York Avenue', type: 'property', price: 200, rent: 16, group: 'orange', ownerId: null },
  { position: 20, name: 'Free Parking', type: 'corner', price: 0, group: null, ownerId: null },
  
  // Top row (right to left)
  { position: 21, name: 'Kentucky Avenue', type: 'property', price: 220, rent: 18, group: 'red', ownerId: null },
  { position: 22, name: 'Chance', type: 'chance', price: 0, group: null, ownerId: null },
  { position: 23, name: 'Indiana Avenue', type: 'property', price: 220, rent: 18, group: 'red', ownerId: null },
  { position: 24, name: 'Illinois Avenue', type: 'property', price: 240, rent: 20, group: 'red', ownerId: null },
  { position: 25, name: 'B&O Railroad', type: 'railroad', price: 200, group: null, ownerId: null },
  { position: 26, name: 'Atlantic Avenue', type: 'property', price: 260, rent: 22, group: 'yellow', ownerId: null },
  { position: 27, name: 'Ventnor Avenue', type: 'property', price: 260, rent: 22, group: 'yellow', ownerId: null },
  { position: 28, name: 'Water Works', type: 'utility', price: 150, group: null, ownerId: null },
  { position: 29, name: 'Marvin Gardens', type: 'property', price: 280, rent: 24, group: 'yellow', ownerId: null },
  { position: 30, name: 'Go To Jail', type: 'corner', price: 0, group: null, ownerId: null },
  
  // Right column (top to bottom)
  { position: 31, name: 'Pacific Avenue', type: 'property', price: 300, rent: 26, group: 'green', ownerId: null },
  { position: 32, name: 'North Carolina Avenue', type: 'property', price: 300, rent: 26, group: 'green', ownerId: null },
  { position: 33, name: 'Community Chest', type: 'community', price: 0, group: null, ownerId: null },
  { position: 34, name: 'Pennsylvania Avenue', type: 'property', price: 320, rent: 28, group: 'green', ownerId: null },
  { position: 35, name: 'Short Line Railroad', type: 'railroad', price: 200, group: null, ownerId: null },
  { position: 36, name: 'Chance', type: 'chance', price: 0, group: null, ownerId: null },
  { position: 37, name: 'Park Place', type: 'property', price: 350, rent: 35, group: 'dark-blue', ownerId: null },
  { position: 38, name: 'Luxury Tax', type: 'tax', price: 100, group: null, ownerId: null },
  { position: 39, name: 'Boardwalk', type: 'property', price: 400, rent: 50, group: 'dark-blue', ownerId: null },
];

// Chance cards
export const chanceCards: Card[] = [
  { type: 'chance', description: 'Advance to GO', action: 'move', value: 0 },
  { type: 'chance', description: 'Advance to Illinois Avenue', action: 'move', value: 24 },
  { type: 'chance', description: 'Advance to St. Charles Place', action: 'move', value: 11 },
  { type: 'chance', description: 'Advance to nearest Railroad', action: 'move', value: 5 }, // Simplified
  { type: 'chance', description: 'Advance to nearest Utility', action: 'move', value: 12 }, // Simplified
  { type: 'chance', description: 'Bank pays you dividend of $50', action: 'money', value: 50 },
  { type: 'chance', description: 'Get Out of Jail Free', action: 'jail', value: 0 },
  { type: 'chance', description: 'Go Back 3 Spaces', action: 'move', value: -3 }, // Special handling needed
  { type: 'chance', description: 'Go to Jail', action: 'jail', value: 1 },
  { type: 'chance', description: 'Make general repairs on all your property', action: 'repairs', value: 25 },
  { type: 'chance', description: 'Pay poor tax of $15', action: 'money', value: -15 },
  { type: 'chance', description: 'Take a trip to Reading Railroad', action: 'move', value: 5 },
  { type: 'chance', description: 'Take a walk on the Boardwalk', action: 'move', value: 39 },
  { type: 'chance', description: 'You have been elected Chairman of the Board', action: 'money', value: -50 },
  { type: 'chance', description: 'Your building loan matures', action: 'money', value: 150 },
];

// Community Chest cards
export const communityChestCards: Card[] = [
  { type: 'community', description: 'Advance to GO', action: 'move', value: 0 },
  { type: 'community', description: 'Bank error in your favor. Collect $200', action: 'money', value: 200 },
  { type: 'community', description: 'Doctor\'s fee. Pay $50', action: 'money', value: -50 },
  { type: 'community', description: 'From sale of stock you get $50', action: 'money', value: 50 },
  { type: 'community', description: 'Get Out of Jail Free', action: 'jail', value: 0 },
  { type: 'community', description: 'Go to Jail', action: 'jail', value: 1 },
  { type: 'community', description: 'Grand Opera Night. Collect $50 from every player', action: 'money', value: 50 }, // Simplified
  { type: 'community', description: 'Holiday Fund matures. Receive $100', action: 'money', value: 100 },
  { type: 'community', description: 'Income tax refund. Collect $20', action: 'money', value: 20 },
  { type: 'community', description: 'It\'s your birthday. Collect $10 from every player', action: 'money', value: 10 }, // Simplified
  { type: 'community', description: 'Life insurance matures. Collect $100', action: 'money', value: 100 },
  { type: 'community', description: 'Pay hospital fees of $100', action: 'money', value: -100 },
  { type: 'community', description: 'Pay school fees of $50', action: 'money', value: -50 },
  { type: 'community', description: 'Receive $25 consultancy fee', action: 'money', value: 25 },
  { type: 'community', description: 'You are assessed for street repairs', action: 'repairs', value: 40 },
  { type: 'community', description: 'You have won second prize in a beauty contest. Collect $10', action: 'money', value: 10 },
  { type: 'community', description: 'You inherit $100', action: 'money', value: 100 },
];
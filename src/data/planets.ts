export interface Planet {
  id: string;
  name: string;
  color: string;
  radius: number; // visual radius in pixels
  orbitRadius: number; // visual orbit radius in pixels
  actualRadius: number; // actual radius in km
  distanceFromSun: number; // in million km
  orbitalPeriod: number; // in Earth days
  description: string;
  emoji: string;
}

export const planets: Planet[] = [
  {
    id: 'mercury',
    name: 'Mercury',
    color: '#b5b5b5',
    radius: 5,
    orbitRadius: 70,
    actualRadius: 2439.7,
    distanceFromSun: 57.9,
    orbitalPeriod: 88,
    description: 'The smallest planet and closest to the Sun. It has no atmosphere and extreme temperature variations.',
    emoji: '☿',
  },
  {
    id: 'venus',
    name: 'Venus',
    color: '#e8cda0',
    radius: 8,
    orbitRadius: 110,
    actualRadius: 6051.8,
    distanceFromSun: 108.2,
    orbitalPeriod: 225,
    description: 'The hottest planet due to its thick atmosphere. It rotates in the opposite direction to most planets.',
    emoji: '♀',
  },
  {
    id: 'earth',
    name: 'Earth',
    color: '#4fa4e8',
    radius: 9,
    orbitRadius: 155,
    actualRadius: 6371,
    distanceFromSun: 149.6,
    orbitalPeriod: 365.25,
    description: 'Our home planet — the only known world with liquid water on its surface and life.',
    emoji: '🌍',
  },
  {
    id: 'mars',
    name: 'Mars',
    color: '#e07050',
    radius: 7,
    orbitRadius: 200,
    actualRadius: 3389.5,
    distanceFromSun: 227.9,
    orbitalPeriod: 687,
    description: 'The Red Planet, named for its iron oxide surface. Home to the tallest volcano in the solar system.',
    emoji: '♂',
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    color: '#d4a574',
    radius: 18,
    orbitRadius: 270,
    actualRadius: 69911,
    distanceFromSun: 778.5,
    orbitalPeriod: 4333,
    description: 'The largest planet in our solar system. Its Great Red Spot is a storm larger than Earth.',
    emoji: '♃',
  },
  {
    id: 'saturn',
    name: 'Saturn',
    color: '#e8d5a0',
    radius: 15,
    orbitRadius: 340,
    actualRadius: 58232,
    distanceFromSun: 1434,
    orbitalPeriod: 10759,
    description: 'Famous for its stunning ring system made of ice and rock particles. It could float in water!',
    emoji: '♄',
  },
  {
    id: 'uranus',
    name: 'Uranus',
    color: '#7ec8e3',
    radius: 12,
    orbitRadius: 400,
    actualRadius: 25362,
    distanceFromSun: 2871,
    orbitalPeriod: 30687,
    description: 'An ice giant that rotates on its side. It has a blue-green color from methane in its atmosphere.',
    emoji: '♅',
  },
  {
    id: 'neptune',
    name: 'Neptune',
    color: '#4060e0',
    radius: 11,
    orbitRadius: 450,
    actualRadius: 24622,
    distanceFromSun: 4495,
    orbitalPeriod: 60190,
    description: 'The windiest planet with speeds up to 2,100 km/h. It was the first planet found by mathematics.',
    emoji: '♆',
  },
];

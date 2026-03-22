import { Ionicons } from '@expo/vector-icons';

export interface SoundItem {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  // Audio source — requires actual .mp3 files in assets/sounds/
  // Replace require() paths once files are added
  source: number | null;
}

// To add a sound:
// 1. Place the .mp3 file in frontend/assets/sounds/
// 2. Update the `source` field with: require('../../assets/sounds/filename.mp3')
// 3. Set source to `null` for sounds not yet added (will show as "no disponible")

export const SOUND_CATALOG: SoundItem[] = [
  {
    id: 'white_noise',
    title: 'Ruido Blanco',
    description: 'Sonido constante que cubre todas las frecuencias',
    icon: 'radio-outline',
    color: '#607D8B',
    source: null,
  },
  {
    id: 'rain',
    title: 'Lluvia',
    description: 'Lluvia suave y constante',
    icon: 'rainy-outline',
    color: '#2196F3',
    source: null,
  },
  {
    id: 'ocean',
    title: 'Olas del Mar',
    description: 'Olas rompiendo en la orilla',
    icon: 'water-outline',
    color: '#00BCD4',
    source: null,
  },
  {
    id: 'forest',
    title: 'Bosque',
    description: 'Aves y brisa entre los árboles',
    icon: 'leaf-outline',
    color: '#4CAF50',
    source: null,
  },
  {
    id: 'creek',
    title: 'Arroyo',
    description: 'Agua corriendo suavemente',
    icon: 'fish-outline',
    color: '#26A69A',
    source: null,
  },
  {
    id: 'fire',
    title: 'Fogata',
    description: 'Crepitar de leña ardiendo',
    icon: 'flame-outline',
    color: '#FF5722',
    source: null,
  },
  {
    id: 'wind',
    title: 'Viento',
    description: 'Brisa suave y continua',
    icon: 'cloudy-outline',
    color: '#78909C',
    source: null,
  },
  {
    id: 'night',
    title: 'Noche',
    description: 'Grillos y sonidos nocturnos',
    icon: 'moon-outline',
    color: '#3F51B5',
    source: null,
  },
];

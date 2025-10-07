import type { ExploreData } from '@/types/explore'

export const mockExploreData: ExploreData = {
  editorsChoice: [
    {
      id: '1',
      title: 'Exploring Czechia by train',
      backgroundImage: 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=400&h=600&fit=crop',
      gradientFrom: 'teal-400',
      gradientTo: 'teal-600',
      user: {
        id: 'nicky',
        name: 'Nicky Polarsteps',
        description: 'Polarsteps editor Nicky\'s Czech railway adventures',
      },
      badge: {
        color: 'teal-600',
        text: 'explore.editorsChoice',
      },
    },
    {
      id: '2',
      title: 'The Neverending Journey',
      backgroundImage: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=600&fit=crop',
      user: {
        id: 'vins-natha',
        name: 'Vins et Natha Take',
        description: 'Blazing trails and crossing borders in the saddle of a motorbike.',
      },
      badge: {
        color: 'gray-600',
        text: 'explore.editorsChoice',
      },
      status: 'explore.nowTraveling',
    },
    {
      id: '3',
      title: 'Island Hopping Adventure',
      backgroundImage: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=600&fit=crop',
      gradientFrom: 'blue-400',
      gradientTo: 'blue-600',
      user: {
        id: 'sarah',
        name: 'Sarah Explorer',
        description: 'Discovering hidden gems across tropical islands',
      },
      badge: {
        color: 'blue-600',
        text: 'explore.editorsChoice',
      },
    },
  ],
  collections: [
    {
      id: 'pioneers',
      title: 'Polarsteps Pioneers',
      description: 'A group of bold travelers we support on their journeys — chosen for their free spirits, boundary-pushing adventures.',
      backgroundImage: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&h=400&fit=crop',
      badge: {
        color: 'teal-600',
        text: 'explore.collections',
      },
    },
    {
      id: 'adventures',
      title: 'Epic Adventures',
      description: 'Extraordinary journeys that push the boundaries of exploration and adventure.',
      backgroundImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
      badge: {
        color: 'orange-600',
        text: 'explore.collections',
      },
    },
  ],
}

'use client'

import { Search, User } from 'lucide-react'
import { mockExploreData } from '@/data/explore-mock'
import { useTranslation } from '@/hooks/useTranslation'
import Collection from './components/Collection'
import EditorsChoiceCard from './components/EditorsChoiceCard'

export default function Explore() {
  const { t } = useTranslation()
  const { editorsChoice, collections } = mockExploreData

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Content */}
      <div className="px-6 py-6">
        {/* Title */}
        <h1 className="text-4xl font-bold text-gray-900 mb-8">{t.explore.title}</h1>

        {/* Editors' Choice Cards */}
        <div className="flex space-x-4 mb-8 overflow-x-auto pb-2">
          {editorsChoice.map(card => (
            <EditorsChoiceCard key={card.id} card={card} />
          ))}
        </div>

        {/* Collections Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">{t.explore.collections}</h2>

          <div className="space-y-6">
            {collections.map(collection => (
              <Collection key={collection.id} collection={collection} />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Search Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <button className="w-12 aspect-square bg-gray-100 rounded-full flex items-center justify-center">
            <User size={20} className="text-gray-600" />
          </button>

          <div className="flex-1 relative">
            <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t.explore.searchPlaceholder}
              className="w-full h-12 pl-12 pr-4 bg-gray-100 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>
      </div>

      {/* Bottom Padding for Fixed Search Bar */}
      <div className="h-20" />
    </div>
  )
}

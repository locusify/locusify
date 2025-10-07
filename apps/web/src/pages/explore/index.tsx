import type { FC } from 'react'
import type { Collection, EditorsChoiceCard } from '@/types/explore'
import { Search, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { mockExploreData } from '@/data/explore-mock'

// 编辑推荐卡片组件
const EditorsChoiceCardComponent: FC<{ card: EditorsChoiceCard }> = ({ card }) => {
  const { t } = useTranslation()

  return (
    <div className="relative min-w-[280px] h-[400px] rounded-2xl overflow-hidden">
      {/* 渐变背景 */}
      {card.gradientFrom && card.gradientTo && (
        <div className={`absolute inset-0 bg-gradient-to-b from-${card.gradientFrom} to-${card.gradientTo}`} />
      )}

      {/* 背景图片 */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('${card.backgroundImage}')`,
        }}
      />
      <div className="absolute inset-0 bg-black/20" />

      {/* 徽章 */}
      <div className="absolute top-4 left-4">
        <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5">
          <div className="flex items-center space-x-2">
            <div className="w-4 aspect-square bg-white rounded-full flex items-center justify-center">
              <div className={`w-2 aspect-square bg-${card.badge.color} rounded-full`} />
            </div>
            <span className="text-white text-sm font-medium">{t(card.badge.text)}</span>
          </div>
        </div>
      </div>

      {/* 内容 */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <h3 className="text-white text-2xl font-bold mb-2">
          {card.title.split(' ').map((word, index, array) => (
            <span key={index}>
              {word}
              {index < array.length - 1 && <br />}
            </span>
          ))}
        </h3>

        {card.status && (
          <div className="text-white/90 text-sm mb-4">{t(card.status)}</div>
        )}

        <div className="flex items-center space-x-3 mt-4">
          <div className="w-8 aspect-square bg-white rounded-full flex items-center justify-center">
            <User size={16} className="text-gray-600" />
          </div>
          <div>
            <div className="text-white font-medium">{card.user.name}</div>
            {card.user.description && (
              <div className="text-white/80 text-sm">{card.user.description}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// 集合组件
const CollectionComponent: FC<{ collection: Collection }> = ({ collection }) => {
  const { t } = useTranslation()

  return (
    <div className="relative h-[300px] rounded-2xl overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('${collection.backgroundImage}')`,
        }}
      />
      <div className="absolute inset-0 bg-black/30" />

      {/* 徽章 */}
      <div className="absolute top-4 left-4">
        <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5">
          <div className="flex items-center space-x-2">
            <div className="w-4 aspect-square bg-white rounded-full flex items-center justify-center">
              <div className={`w-2 aspect-square bg-${collection.badge.color} rounded-full`} />
            </div>
            <span className="text-white text-sm font-medium">{t(collection.badge.text).toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* 内容 */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <h3 className="text-white text-3xl font-bold mb-3">
          {collection.title}
        </h3>
        <p className="text-white/90 text-base">
          {collection.description}
        </p>
      </div>
    </div>
  )
}

const Explore: FC = () => {
  const { t } = useTranslation()
  const { editorsChoice, collections } = mockExploreData

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Content */}
      <div className="px-6 py-6">
        {/* Title */}
        <h1 className="text-4xl font-bold text-gray-900 mb-8">{t('explore.title')}</h1>

        {/* Editors' Choice Cards */}
        <div className="flex space-x-4 mb-8 overflow-x-auto pb-2">
          {editorsChoice.map(card => (
            <EditorsChoiceCardComponent key={card.id} card={card} />
          ))}
        </div>

        {/* Collections Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">{t('explore.collections')}</h2>

          <div className="space-y-6">
            {collections.map(collection => (
              <CollectionComponent key={collection.id} collection={collection} />
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
              placeholder={t('explore.searchPlaceholder')}
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

export default Explore

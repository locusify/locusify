import type { FC } from 'react'
import type { Collection, EditorsChoiceCard } from '@/types/explore'
import { Search, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { mockExploreData } from '@/data/explore-mock'

// 编辑推荐卡片组件
const EditorsChoiceCardComponent: FC<{ card: EditorsChoiceCard }> = ({ card }) => {
  const { t } = useTranslation()

  return (
    <div className="relative flex flex-col rounded-2xl overflow-hidden box-border outline-solid outline-transparent focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2 shadow-medium transition-transform-background motion-reduce:transition-none w-full min-w-[280px] h-[400px]">
      {/* 顶部标题区域 */}
      <div className="flex p-3 w-full justify-start shrink-0 overflow-inherit subpixel-antialiased rounded-t-large absolute z-10 top-1 flex-col items-start">
        <p className="text-tiny text-white/80 uppercase font-bold">{card.badge.text}</p>
        <p className="text-white font-medium text-2xl">
          {card.title}
        </p>
      </div>

      {/* 背景图片 */}
      <img
        className="absolute inset-0 w-full h-full object-cover object-center opacity-100 shadow-none transition-transform-opacity motion-reduce:transition-none duration-300 z-0"
        alt={card.title}
        src={card.backgroundImage}
      />

      {/* 遮罩层 */}
      <div className="absolute inset-0 bg-black/15" />
      {/* 底部毛玻璃效果栏 */}
      <div className="p-3 h-auto flex w-full items-center overflow-hidden subpixel-antialiased rounded-b-large backdrop-blur backdrop-saturate-150 absolute bg-white/30 bottom-0 border-t border-zinc-100/50 z-10 justify-between">
        <div className="flex items-center text-sm">

          <p className="text-black text-tiny font-medium">{card.user.name}</p>
          {card.status && (
            <p className="text-black/60 text-tiny">{t(card.status)}</p>
          )}

        </div>

        <button
          type="button"
          className="z-0 text-sm group relative inline-flex items-center justify-center box-border appearance-none select-none whitespace-nowrap font-normal subpixel-antialiased overflow-hidden tap-highlight-transparent outline-solid outline-transparent focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2 px-3 min-w-16 h-8 gap-2 rounded-full transition-transform-colors-opacity motion-reduce:transition-none bg-black text-white hover:opacity-80 active:scale-[0.97] text-tiny"
        >
          {t('explore.viewDetails')}
        </button>
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

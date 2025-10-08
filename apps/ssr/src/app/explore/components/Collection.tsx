'use client'

import type { CollectionType } from '@/types/explore'

function Collection({ collection }: { collection: CollectionType }) {
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
            <span className="text-white text-sm font-medium">{collection.badge.text.toUpperCase()}</span>
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

export default Collection

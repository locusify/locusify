'use client'

import type { EditorsChoiceCardType } from '@/types/explore'
import { User } from 'lucide-react'
// 编辑推荐卡片组件
function EditorsChoiceCard({ card }: { card: EditorsChoiceCardType }) {
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
            <span className="text-white text-sm font-medium">{card.badge.text}</span>
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
          <div className="text-white/90 text-sm mb-4">{card.status}</div>
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

export default EditorsChoiceCard

import type { LocaleType } from './types'

const zhCN: LocaleType = {
  common: {
    loading: '加载中...',
    search: '搜索',
    cancel: '取消',
    save: '保存',
    edit: '编辑',
    delete: '删除',
    confirm: '确认',
    back: '返回',
  },

  navigation: {
    home: '首页',
    explore: '探索',
    profile: '个人中心',
  },

  explore: {
    title: '探索',
    editorsChoice: '编辑推荐',
    collections: '精选合集',
    searchPlaceholder: '搜索用户和地点',
    nowTraveling: '正在旅行',
  },

  error: {
    404: {
      title: '404',
      message: '页面未找到',
      description: '抱歉，您访问的页面不存在',
      backHome: '返回首页',
    },
  },

  badges: {
    featured: '精选',
    new: '最新',
    trending: '热门',
    collection: '合集',
  },

  language: {
    name: '中文',
    code: 'zh-CN',
    flag: '🇨🇳',
  },
}

export default zhCN

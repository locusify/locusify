// 翻译文件的类型定义
export interface LocaleType {
  common: {
    loading: string
    search: string
    cancel: string
    save: string
    edit: string
    delete: string
    confirm: string
    back: string
  }

  navigation: {
    home: string
    explore: string
    profile: string
  }

  explore: {
    title: string
    editorsChoice: string
    collections: string
    searchPlaceholder: string
    nowTraveling: string
  }

  error: {
    404: {
      title: string
      message: string
      description: string
      backHome: string
    }
  }

  badges: {
    featured: string
    new: string
    trending: string
    collection: string
  }

  language: {
    name: string
    code: string
    flag: string
  }
}

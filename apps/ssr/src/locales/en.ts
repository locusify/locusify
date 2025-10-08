import type { LocaleType } from './types'

const en: LocaleType = {
  common: {
    loading: 'Loading...',
    search: 'Search',
    cancel: 'Cancel',
    save: 'Save',
    edit: 'Edit',
    delete: 'Delete',
    confirm: 'Confirm',
    back: 'Back',
  },

  navigation: {
    home: 'Home',
    explore: 'Explore',
    profile: 'Profile',
  },

  explore: {
    title: 'Explore',
    editorsChoice: 'EDITORS\' CHOICE',
    collections: 'Collections',
    searchPlaceholder: 'Search people & places',
    nowTraveling: 'Now traveling',
  },

  error: {
    404: {
      title: '404',
      message: 'Page Not Found',
      description: 'Sorry, the page you are looking for does not exist',
      backHome: 'Back to Home',
    },
  },

  badges: {
    featured: 'Featured',
    new: 'New',
    trending: 'Trending',
    collection: 'Collection',
  },

  language: {
    name: 'English',
    code: 'en',
    flag: '🇺🇸',
  },
}

export default en

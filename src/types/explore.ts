export interface User {
  id: string
  name: string
  avatar?: string
  description?: string
}

export interface EditorsChoiceCard {
  id: string
  title: string
  subtitle?: string
  backgroundImage: string
  gradientFrom?: string
  gradientTo?: string
  user: User
  badge: {
    color: string
    text: string
  }
  status?: string
}

export interface Collection {
  id: string
  title: string
  description: string
  backgroundImage: string
  badge: {
    color: string
    text: string
  }
}

export interface ExploreData {
  editorsChoice: EditorsChoiceCard[]
  collections: Collection[]
}

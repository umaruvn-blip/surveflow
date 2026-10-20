export type Category = {
  id: number
  name: string
  slug: string
  description: string | null
}

export type Interest = {
  id: number
  name: string
  slug: string
  description: string | null
}

export type Tag = {
  id: number
  name: string
  slug: string
}

export type Badge = {
  id: number
  code: string
  name: string
  description: string | null
  iconUrl: string | null
}

export type Level = {
  id: number
  levelNumber: number
  name: string | null
  minXp: number
}

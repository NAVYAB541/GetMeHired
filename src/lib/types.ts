export interface Job {
  id: string
  title: string
  company: string
  location: string
  type: string
  source: 'Seek' | 'LinkedIn' | 'GradAustralia' | 'Indeed' | 'Otta'
  postedDaysAgo: number
  companyRating: number
  description: string
  url: string
  remote: boolean
  salary: string
}

export type SortKey = 'date' | 'rating' | 'alpha'
export type TabKey = 'all' | 'saved' | 'applied'

export interface Filters {
  keyword: string
  location: string
  type: string
  source: string
  status: string
}

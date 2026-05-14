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
  tags?: string[]
}

export type SortKey = 'date' | 'rating' | 'alpha'
export type StatusFilter = '' | 'saved' | 'applied' | 'new'

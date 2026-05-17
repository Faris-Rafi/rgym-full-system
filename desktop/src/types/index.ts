export interface Member {
  id: number
  name: string
  email: string
  phone?: string
  isActive: boolean
  createdAt: string
  membership?: Membership
}

export interface Membership {
  id: number
  memberId: number
  plan: string
  startDate: string
  endDate: string
  isActive: boolean
}

export interface Checkin {
  id: number
  memberId: number
  type: 'entry' | 'exit'
  timestamp: string
  method: string
  member?: Member
}

export interface TodayStats {
  date: string
  totalEntries: number
  totalExits: number
  currentlyInside: number
  uniqueMembers: number
}

export interface FaceRecognitionResult {
  matched: boolean
  member_id: number | null
  confidence: number
}
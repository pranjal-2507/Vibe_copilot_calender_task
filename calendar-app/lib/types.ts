export type CalendarView = "month" | "week" | "day"

export type CalendarEntryType = "Task" | "Event" | "Meeting"

export interface CalendarEntry {
  id: string
  type: CalendarEntryType
  title: string
  description: string
  date: Date
  endDate?: Date
  duration?: number
  platform?: string
  meetingLink?: string
  assignedTo?: string
  source?: "outlook" | "gmail" | "local"
}


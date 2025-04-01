"use client"

import React from "react"
import { useState, useEffect } from "react"
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addDays,
  getHours,
  setHours,
  setMinutes,
  isToday,
} from "date-fns"
import type { CalendarEntry, CalendarView } from "@/lib/types"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface CalendarGridProps {
  currentDate: Date
  view: CalendarView
  entries: CalendarEntry[]
  onDateClick: (date: Date) => void
}

export default function CalendarGrid({ currentDate, view, entries, onDateClick }: CalendarGridProps) {
  const [filters, setFilters] = useState({
    tasks: true,
    meetings: true,
    events: true,
    outlook: false,
    gmail: false,
  })

  // Load filters from localStorage
  useEffect(() => {
    const storedFilters = localStorage.getItem("calendarFilters")
    if (storedFilters) {
      try {
        setFilters(JSON.parse(storedFilters))
      } catch (error) {
        console.error("Error parsing stored filters:", error)
      }
    }
  }, [])

  // Listen for changes to filters in localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const storedFilters = localStorage.getItem("calendarFilters")
      if (storedFilters) {
        try {
          setFilters(JSON.parse(storedFilters))
        } catch (error) {
          console.error("Error parsing stored filters:", error)
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)

    // Custom event for same-window updates
    window.addEventListener("filtersUpdated", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("filtersUpdated", handleStorageChange)
    }
  }, [])

  const filteredEntries = entries.filter((entry) => {
    // Filter by type
    if (entry.type === "Task" && !filters.tasks) return false
    if (entry.type === "Meeting" && !filters.meetings) return false
    if (entry.type === "Event" && !filters.events) return false

    // Filter by source (if implemented)
    if (entry.source === "outlook" && !filters.outlook) return false
    if (entry.source === "gmail" && !filters.gmail) return false

    return true
  })

  if (view === "month") {
    return <MonthView currentDate={currentDate} entries={filteredEntries} onDateClick={onDateClick} />
  } else if (view === "week") {
    return <WeekView currentDate={currentDate} entries={filteredEntries} onDateClick={onDateClick} />
  } else {
    return <DayView currentDate={currentDate} entries={filteredEntries} onDateClick={onDateClick} />
  }
}

function MonthView({
  currentDate,
  entries,
  onDateClick,
}: {
  currentDate: Date
  entries: CalendarEntry[]
  onDateClick: (date: Date) => void
}) {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)

  const days = eachDayOfInterval({ start: startDate, end: endDate })

  return (
    <div className="grid grid-cols-7 gap-1 md:gap-2">
      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
        <div
          key={day}
          className="h-10 flex items-center justify-center font-medium text-sm md:text-base text-muted-foreground"
        >
          {day}
        </div>
      ))}

      {days.map((day) => {
        const dayEntries = entries.filter((entry) => isSameDay(new Date(entry.date), day))

        // Determine if this day should be highlighted based on entries
        const hasEntries = dayEntries.length > 0
        const isCurrentMonth = isSameMonth(day, monthStart)
        const isCurrentDay = isToday(day)

        return (
          <motion.div
            key={day.toString()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "min-h-[100px] md:min-h-[120px] p-1 md:p-2 border rounded-md transition-all duration-200 calendar-day",
              !isCurrentMonth && "bg-muted/30 text-muted-foreground",
              isCurrentDay && "bg-primary/5 border-primary/70 dark:bg-primary/10",
              hasEntries && !isCurrentDay && "border-primary/40",
              "hover:bg-accent/50 hover:text-accent-foreground cursor-pointer",
              "dark:hover:bg-accent/30",
            )}
            onClick={() => onDateClick(day)}
          >
            <div
              className={cn("font-medium text-right text-sm md:text-base", isCurrentDay && "text-primary font-bold")}
            >
              {format(day, "d")}
            </div>
            <div className="mt-1 md:mt-2 space-y-1 max-h-[80px] md:max-h-[90px] overflow-y-auto">
              {dayEntries.map((entry, index) => (
                <EntryBadge key={index} entry={entry} />
              ))}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

function WeekView({
  currentDate,
  entries,
  onDateClick,
}: {
  currentDate: Date
  entries: CalendarEntry[]
  onDateClick: (date: Date) => void
}) {
  const weekStart = startOfWeek(currentDate)
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  // Create time slots from 8 AM to 8 PM
  const timeSlots = Array.from({ length: 13 }, (_, i) => i + 8)

  return (
    <div className="flex flex-col overflow-x-auto">
      <div className="grid grid-cols-8 gap-1 min-w-[700px]">
        <div className="h-10 flex items-center justify-center font-medium"></div>
        {days.map((day) => (
          <div
            key={day.toString()}
            className={cn(
              "h-10 flex items-center justify-center font-medium",
              isToday(day) && "text-primary font-bold",
            )}
          >
            <div className="text-center">
              <div>{format(day, "EEE")}</div>
              <div>{format(day, "d")}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-8 gap-1 min-w-[700px]">
        {timeSlots.map((hour) => (
          <React.Fragment key={hour}>
            <div className="h-20 flex items-start justify-end pr-2 pt-1 text-sm text-muted-foreground">
              {format(setHours(new Date(), hour), "h a")}
            </div>

            {days.map((day) => {
              const hourStart = setHours(setMinutes(new Date(day), 0), hour)
              const hourEnd = setHours(setMinutes(new Date(day), 59), hour)

              const hourEntries = entries.filter((entry) => {
                const entryDate = new Date(entry.date)
                const entryHour = getHours(entryDate)
                return isSameDay(entryDate, day) && entryHour === hour
              })

              // Determine if this time slot should be highlighted
              const hasEntries = hourEntries.length > 0
              const isCurrentDay = isToday(day)

              return (
                <motion.div
                  key={day.toString() + hour}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "h-20 border-t border-l p-1 hover:bg-accent/50 hover:text-accent-foreground cursor-pointer transition-all duration-200 calendar-day",
                    isCurrentDay && "bg-primary/5 dark:bg-primary/10",
                    hasEntries && "border-primary/40",
                  )}
                  onClick={() => {
                    const clickedDate = new Date(day)
                    clickedDate.setHours(hour)
                    onDateClick(clickedDate)
                  }}
                >
                  <div className="space-y-1 max-h-[72px] overflow-y-auto">
                    {hourEntries.map((entry, index) => (
                      <EntryBadge key={index} entry={entry} />
                    ))}
                  </div>
                </motion.div>
              )
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

function DayView({
  currentDate,
  entries,
  onDateClick,
}: {
  currentDate: Date
  entries: CalendarEntry[]
  onDateClick: (date: Date) => void
}) {
  // Create time slots from 8 AM to 8 PM
  const timeSlots = Array.from({ length: 13 }, (_, i) => i + 8)
  const isCurrentDay = isToday(currentDate)

  return (
    <div className="flex flex-col">
      <div className="text-center mb-4">
        <h3
          className={cn(
            "text-lg font-medium font-heading bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70",
            isCurrentDay && "font-bold",
          )}
        >
          {format(currentDate, "EEEE, MMMM d, yyyy")}
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-1">
        {timeSlots.map((hour) => {
          const hourStart = setHours(setMinutes(new Date(currentDate), 0), hour)
          const hourEnd = setHours(setMinutes(new Date(currentDate), 59), hour)

          const hourEntries = entries.filter((entry) => {
            const entryDate = new Date(entry.date)
            const entryHour = getHours(entryDate)
            return isSameDay(entryDate, currentDate) && entryHour === hour
          })

          // Determine if this time slot should be highlighted
          const hasEntries = hourEntries.length > 0

          return (
            <div key={hour} className="flex">
              <div className="w-20 flex items-start justify-end pr-2 pt-1 text-sm text-muted-foreground">
                {format(setHours(new Date(), hour), "h a")}
              </div>

              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={cn(
                  "flex-1 border-t border-l p-2 min-h-[80px] hover:bg-accent/50 hover:text-accent-foreground cursor-pointer transition-all duration-200 calendar-day",
                  hasEntries && "border-primary/40",
                )}
                onClick={() => {
                  const clickedDate = new Date(currentDate)
                  clickedDate.setHours(hour)
                  onDateClick(clickedDate)
                }}
              >
                <div className="space-y-1">
                  {hourEntries.map((entry, index) => (
                    <EntryBadge key={index} entry={entry} />
                  ))}
                </div>
              </motion.div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function EntryBadge({ entry }: { entry: CalendarEntry }) {
  // Get background and text colors based on entry type
  const getColors = () => {
    switch (entry.type) {
      case "Task":
        return {
          bg: "bg-gradient-to-r from-violet-500 to-violet-600",
          text: "text-white",
          border: "border-violet-400",
        }
      case "Meeting":
        return {
          bg: "bg-gradient-to-r from-rose-500 to-rose-600",
          text: "text-white",
          border: "border-rose-400",
        }
      case "Event":
        return {
          bg: "bg-gradient-to-r from-fuchsia-500 to-fuchsia-600",
          text: "text-white",
          border: "border-fuchsia-400",
        }
      default:
        return {
          bg: "bg-gradient-to-r from-gray-500 to-gray-600",
          text: "text-white",
          border: "border-gray-400",
        }
    }
  }

  const { bg, text, border } = getColors()

  // Truncate description for preview
  const descriptionPreview = entry.description
    ? entry.description.length > 30
      ? entry.description.substring(0, 30) + "..."
      : entry.description
    : ""

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="mb-1"
    >
      <div
        className={`w-full rounded-md px-2 py-1.5 shadow-sm hover:shadow transition-all duration-200 border-l-4 ${border} ${bg}`}
        title={`${entry.title}${entry.description ? `: ${entry.description}` : ""}`}
      >
        <div className={`font-medium text-xs truncate ${text}`}>{entry.title}</div>
        {entry.description && <div className={`text-xs opacity-90 truncate mt-0.5 ${text}`}>{descriptionPreview}</div>}
      </div>
    </motion.div>
  )
}


"use client"

import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { CalendarView } from "@/lib/types"
import { motion } from "framer-motion"

interface CalendarHeaderProps {
  currentDate: Date
  view: CalendarView
  onPrevious: () => void
  onNext: () => void
  onToday: () => void
  onViewChange: (view: CalendarView) => void
}

export default function CalendarHeader({
  currentDate,
  view,
  onPrevious,
  onNext,
  onToday,
  onViewChange,
}: CalendarHeaderProps) {
  const getHeaderText = () => {
    if (view === "month") {
      return format(currentDate, "MMMM yyyy")
    } else if (view === "week") {
      const startOfWeek = new Date(currentDate)
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)

      if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
        return `${format(startOfWeek, "MMM d")} - ${format(endOfWeek, "d, yyyy")}`
      } else if (startOfWeek.getFullYear() === endOfWeek.getFullYear()) {
        return `${format(startOfWeek, "MMM d")} - ${format(endOfWeek, "MMM d, yyyy")}`
      } else {
        return `${format(startOfWeek, "MMM d, yyyy")} - ${format(endOfWeek, "MMM d, yyyy")}`
      }
    } else {
      return format(currentDate, "EEE, MMM d, yyyy")
    }
  }

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
      <motion.div
        className="flex items-center"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-xl md:text-2xl font-bold font-heading bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
          {getHeaderText()}
        </h2>
      </motion.div>

      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1 mr-2 md:mr-4 bg-muted/50 rounded-lg p-1">
          <Button
            variant={view === "month" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewChange("month")}
            className="rounded-md transition-all duration-200"
          >
            <span className="hidden sm:inline">Month</span>
            <span className="sm:hidden">M</span>
          </Button>
          <Button
            variant={view === "week" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewChange("week")}
            className="rounded-md transition-all duration-200"
          >
            <span className="hidden sm:inline">Week</span>
            <span className="sm:hidden">W</span>
          </Button>
          <Button
            variant={view === "day" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewChange("day")}
            className="rounded-md transition-all duration-200"
          >
            <span className="hidden sm:inline">Day</span>
            <span className="sm:hidden">D</span>
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onToday}
          className="transition-all duration-200 hover:bg-primary/10"
        >
          <span className="hidden sm:inline">Today</span>
          <span className="sm:hidden">T</span>
        </Button>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button variant="outline" size="icon" onClick={onPrevious} className="transition-all duration-200">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button variant="outline" size="icon" onClick={onNext} className="transition-all duration-200">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </div>
  )
}


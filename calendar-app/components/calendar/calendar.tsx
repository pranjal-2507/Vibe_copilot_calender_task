"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import CalendarHeader from "./calendar-header"
import CalendarGrid from "./calendar-grid"
import AddEntryModal from "./add-entry-modal"
import EntryDetailsModal from "./entry-details-modal"
import type { CalendarEntry, CalendarView } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"
import { Card } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
// import { useAudioPlayer } from "@/components/audio-player"

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<CalendarView>("month")
  const [entries, setEntries] = useState<CalendarEntry[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedEntry, setSelectedEntry] = useState<CalendarEntry | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const { toast } = useToast()
  // const { playSound, isAudioSupported } = useAudioPlayer()

  // Load entries from localStorage on component mount
  useEffect(() => {
    const storedEntries = localStorage.getItem("calendarEntries")
    if (storedEntries) {
      try {
        const parsedEntries = JSON.parse(storedEntries)
        // Convert string dates back to Date objects
        const formattedEntries = parsedEntries.map((entry: any) => ({
          ...entry,
          date: new Date(entry.date),
          endDate: entry.endDate ? new Date(entry.endDate) : undefined,
        }))
        setEntries(formattedEntries)
      } catch (error) {
        console.error("Error parsing stored entries:", error)
      }
    }
  }, [])

  // Save entries to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("calendarEntries", JSON.stringify(entries))
  }, [entries])

  const handlePrevious = () => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate)
      if (view === "month") {
        newDate.setMonth(newDate.getMonth() - 1)
      } else if (view === "week") {
        newDate.setDate(newDate.getDate() - 7)
      } else if (view === "day") {
        newDate.setDate(newDate.getDate() - 1)
      }
      return newDate
    })
  }

  const handleNext = () => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate)
      if (view === "month") {
        newDate.setMonth(newDate.getMonth() + 1)
      } else if (view === "week") {
        newDate.setDate(newDate.getDate() + 7)
      } else if (view === "day") {
        newDate.setDate(newDate.getDate() + 1)
      }
      return newDate
    })
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const handleViewChange = (newView: CalendarView) => {
    setView(newView)
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setIsModalOpen(true)
  }

  const handleAddEntry = (entry: CalendarEntry) => {
    setEntries([...entries, entry])
    setIsModalOpen(false)

    // Play sound based on entry type if audio is supported
    // if (isAudioSupported) {
    //   playSound(entry.type.toLowerCase() as any)
    // }

    toast({
      title: `${entry.type} created`,
      description: `Your ${entry.type.toLowerCase()} has been added to the calendar.`,
      duration: 3000,
    })
  }

  const handleAddButtonClick = () => {
    setSelectedDate(new Date())
    setIsModalOpen(true)
  }

  const handleEntryClick = (entry: CalendarEntry) => {
    setSelectedEntry(entry)
    setIsDetailsModalOpen(true)
  }

  const handleDeleteEntry = (id: string) => {
    setEntries(entries.filter((entry) => entry.id !== id))

    toast({
      title: "Entry deleted",
      description: "The entry has been removed from your calendar.",
      duration: 3000,
    })
  }

  const handleEditEntry = (updatedEntry: CalendarEntry) => {
    setEntries(entries.map((entry) => (entry.id === updatedEntry.id ? updatedEntry : entry)))

    toast({
      title: "Entry updated",
      description: "Your changes have been saved.",
      duration: 3000,
    })
  }

  return (
    <div className="relative space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Card className="p-4 shadow-md dark:shadow-lg dark:shadow-primary/5 rounded-xl border border-border/40 backdrop-blur-sm bg-card/95 transition-all duration-300">
          <CalendarHeader
            currentDate={currentDate}
            view={view}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onToday={handleToday}
            onViewChange={handleViewChange}
          />
        </Card>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={view + currentDate.toISOString().substring(0, 10)}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="p-4 shadow-md dark:shadow-lg dark:shadow-primary/5 rounded-xl border border-border/40 backdrop-blur-sm bg-card/95 transition-all duration-300">
            <div className="overflow-x-auto">
              <CalendarGrid
                currentDate={currentDate}
                view={view}
                entries={entries}
                onDateClick={handleDateClick}
                onEntryClick={handleEntryClick}
              />
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>

      <motion.div className="fixed bottom-6 right-6 z-10" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl bg-primary hover:bg-primary/90 transition-all duration-300"
          onClick={handleAddButtonClick}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </motion.div>

      <AddEntryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddEntry={handleAddEntry}
        selectedDate={selectedDate}
      />

      <EntryDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false)
          setSelectedEntry(null)
        }}
        entry={selectedEntry}
        onDelete={handleDeleteEntry}
        onEdit={handleEditEntry}
      />
    </div>
  )
}


"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { CalendarEntry } from "@/lib/types"
import { motion, AnimatePresence } from "framer-motion"

interface AddEntryModalProps {
  isOpen: boolean
  onClose: () => void
  onAddEntry: (entry: CalendarEntry) => void
  selectedDate: Date | null
}

export default function AddEntryModal({ isOpen, onClose, onAddEntry, selectedDate }: AddEntryModalProps) {
  const [activeTab, setActiveTab] = useState("task")

  const handleAddEntry = (type: "Task" | "Event" | "Meeting", formData: FormData) => {
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const date = new Date(formData.get("date") as string)

    // Set time if provided
    if (formData.get("time")) {
      const [hours, minutes] = (formData.get("time") as string).split(":")
      date.setHours(Number.parseInt(hours, 10), Number.parseInt(minutes, 10))
    }

    let entry: CalendarEntry = {
      id: Date.now().toString(),
      type,
      title,
      description,
      date,
    }

    // Add type-specific properties
    if (type === "Event") {
      const endDate = new Date(formData.get("endDate") as string)
      if (formData.get("endTime")) {
        const [endHours, endMinutes] = (formData.get("endTime") as string).split(":")
        endDate.setHours(Number.parseInt(endHours, 10), Number.parseInt(endMinutes, 10))
      }
      entry = { ...entry, endDate }
    } else if (type === "Meeting") {
      const duration = Number.parseInt(formData.get("duration") as string, 10)
      const platform = formData.get("platform") as string
      const meetingLink = generateMeetingLink(platform, title)
      entry = { ...entry, duration, platform, meetingLink }
    } else if (type === "Task") {
      const assignedTo = formData.get("assignedTo") as string
      entry = { ...entry, assignedTo }
    }

    onAddEntry(entry)
  }

  const generateMeetingLink = (platform: string, title: string) => {
    // This is a mock function - in a real app, you would integrate with the actual APIs
    if (platform === "zoom") {
      return `https://zoom.us/j/${Math.floor(Math.random() * 1000000000)}`
    } else if (platform === "teams") {
      return `https://teams.microsoft.com/l/meetup-join/${Math.floor(Math.random() * 1000000000)}`
    }
    return "#"
  }

  const formatDateForInput = (date: Date | null) => {
    if (!date) return ""
    return format(date, "yyyy-MM-dd")
  }

  const formatTimeForInput = (date: Date | null) => {
    if (!date) return ""
    return format(date, "HH:mm")
  }

  const getTabStyles = (tabType: string) => {
    if (tabType === "task") {
      return "data-[state=active]:bg-violet-500 data-[state=active]:text-white"
    } else if (tabType === "event") {
      return "data-[state=active]:bg-fuchsia-500 data-[state=active]:text-white"
    } else if (tabType === "meeting") {
      return "data-[state=active]:bg-rose-500 data-[state=active]:text-white"
    }
    return ""
  }

  const getButtonStyles = (tabType: string) => {
    if (tabType === "task") {
      return "bg-violet-500 hover:bg-violet-600 text-white"
    } else if (tabType === "event") {
      return "bg-fuchsia-500 hover:bg-fuchsia-600 text-white"
    } else if (tabType === "meeting") {
      return "bg-rose-500 hover:bg-rose-600 text-white"
    }
    return ""
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur-sm border border-border/40 shadow-lg dark:shadow-primary/5 rounded-xl transition-all duration-300">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold font-heading bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            Add to Calendar
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="task" value={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList className="grid grid-cols-3 mb-4 bg-muted/50 p-1 rounded-lg">
            <TabsTrigger value="task" className={`rounded-md transition-all duration-200 ${getTabStyles("task")}`}>
              Task
            </TabsTrigger>
            <TabsTrigger value="event" className={`rounded-md transition-all duration-200 ${getTabStyles("event")}`}>
              Event
            </TabsTrigger>
            <TabsTrigger
              value="meeting"
              className={`rounded-md transition-all duration-200 ${getTabStyles("meeting")}`}
            >
              Meeting
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <TabsContent value="task">
                <form action={(formData) => handleAddEntry("Task", formData)} className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label htmlFor="task-title" className="font-medium">
                      Task Name
                    </Label>
                    <Input id="task-title" name="title" required className="w-full" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="task-date" className="font-medium">
                        Date
                      </Label>
                      <Input
                        id="task-date"
                        name="date"
                        type="date"
                        defaultValue={formatDateForInput(selectedDate)}
                        required
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="task-time" className="font-medium">
                        Time
                      </Label>
                      <Input
                        id="task-time"
                        name="time"
                        type="time"
                        defaultValue={formatTimeForInput(selectedDate)}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="task-description" className="font-medium">
                      Description
                    </Label>
                    <Textarea id="task-description" name="description" className="min-h-[80px]" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="task-assigned" className="font-medium">
                      Assign To
                    </Label>
                    <Input id="task-assigned" name="assignedTo" placeholder="Email address" className="w-full" />
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      type="submit"
                      className={`w-full sm:w-auto transition-colors duration-200 ${getButtonStyles("task")}`}
                    >
                      Create Task
                    </Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="event">
                <form action={(formData) => handleAddEntry("Event", formData)} className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label htmlFor="event-title" className="font-medium">
                      Event Name
                    </Label>
                    <Input id="event-title" name="title" required className="w-full" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="event-date" className="font-medium">
                        Start Date
                      </Label>
                      <Input
                        id="event-date"
                        name="date"
                        type="date"
                        defaultValue={formatDateForInput(selectedDate)}
                        required
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="event-time" className="font-medium">
                        Start Time
                      </Label>
                      <Input
                        id="event-time"
                        name="time"
                        type="time"
                        defaultValue={formatTimeForInput(selectedDate)}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="event-end-date" className="font-medium">
                        End Date
                      </Label>
                      <Input
                        id="event-end-date"
                        name="endDate"
                        type="date"
                        defaultValue={formatDateForInput(selectedDate)}
                        required
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="event-end-time" className="font-medium">
                        End Time
                      </Label>
                      <Input id="event-end-time" name="endTime" type="time" className="w-full" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="event-description" className="font-medium">
                      Description
                    </Label>
                    <Textarea id="event-description" name="description" className="min-h-[80px]" />
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      type="submit"
                      className={`w-full sm:w-auto transition-colors duration-200 ${getButtonStyles("event")}`}
                    >
                      Create Event
                    </Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="meeting">
                <form action={(formData) => handleAddEntry("Meeting", formData)} className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label htmlFor="meeting-title" className="font-medium">
                      Meeting Topic
                    </Label>
                    <Input id="meeting-title" name="title" required className="w-full" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="meeting-date" className="font-medium">
                        Date
                      </Label>
                      <Input
                        id="meeting-date"
                        name="date"
                        type="date"
                        defaultValue={formatDateForInput(selectedDate)}
                        required
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="meeting-time" className="font-medium">
                        Time
                      </Label>
                      <Input
                        id="meeting-time"
                        name="time"
                        type="time"
                        defaultValue={formatTimeForInput(selectedDate)}
                        required
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="meeting-duration" className="font-medium">
                        Duration (minutes)
                      </Label>
                      <Input
                        id="meeting-duration"
                        name="duration"
                        type="number"
                        defaultValue="30"
                        min="15"
                        step="15"
                        required
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="meeting-platform" className="font-medium">
                        Platform
                      </Label>
                      <select
                        id="meeting-platform"
                        name="platform"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        defaultValue="zoom"
                      >
                        <option value="zoom">Zoom</option>
                        <option value="teams">Microsoft Teams</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="meeting-description" className="font-medium">
                      Description
                    </Label>
                    <Textarea id="meeting-description" name="description" className="min-h-[80px]" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="meeting-participants" className="font-medium">
                      Participants
                    </Label>
                    <Textarea
                      id="meeting-participants"
                      name="participants"
                      placeholder="Enter email addresses, separated by commas"
                      className="min-h-[60px]"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      type="submit"
                      className={`w-full sm:w-auto transition-colors duration-200 ${getButtonStyles("meeting")}`}
                    >
                      Create Meeting
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}


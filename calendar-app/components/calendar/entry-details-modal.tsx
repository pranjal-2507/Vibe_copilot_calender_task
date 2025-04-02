"use client"

import type React from "react"

import { useState } from "react"
import { format } from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Trash2, Edit, ExternalLink } from "lucide-react"
import type { CalendarEntry } from "@/lib/types"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface EntryDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  entry: CalendarEntry | null
  onDelete: (id: string) => void
  onEdit: (entry: CalendarEntry) => void
}

export default function EntryDetailsModal({ isOpen, onClose, entry, onDelete, onEdit }: EntryDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedEntry, setEditedEntry] = useState<CalendarEntry | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Initialize the edited entry when the modal opens or entry changes
  if (entry && !editedEntry) {
    setEditedEntry({ ...entry })
  }

  const handleClose = () => {
    setIsEditing(false)
    setEditedEntry(null)
    onClose()
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = () => {
    if (editedEntry) {
      onEdit(editedEntry)
      setIsEditing(false)
      onClose()
    }
  }

  const handleDelete = () => {
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (entry) {
      onDelete(entry.id)
      setIsDeleteDialogOpen(false)
      onClose()
    }
  }

  const cancelDelete = () => {
    setIsDeleteDialogOpen(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (editedEntry) {
      setEditedEntry({
        ...editedEntry,
        [e.target.name]: e.target.value,
      })
    }
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editedEntry) {
      if (e.target.name === "date") {
        const newDate = new Date(editedEntry.date)
        const [year, month, day] = e.target.value.split("-").map(Number)
        newDate.setFullYear(year, month - 1, day)
        setEditedEntry({
          ...editedEntry,
          date: newDate,
        })
      } else if (e.target.name === "endDate" && editedEntry.endDate) {
        const newEndDate = new Date(editedEntry.endDate)
        const [year, month, day] = e.target.value.split("-").map(Number)
        newEndDate.setFullYear(year, month - 1, day)
        setEditedEntry({
          ...editedEntry,
          endDate: newEndDate,
        })
      }
    }
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editedEntry) {
      if (e.target.name === "time") {
        const newDate = new Date(editedEntry.date)
        const [hours, minutes] = e.target.value.split(":").map(Number)
        newDate.setHours(hours, minutes)
        setEditedEntry({
          ...editedEntry,
          date: newDate,
        })
      } else if (e.target.name === "endTime" && editedEntry.endDate) {
        const newEndDate = new Date(editedEntry.endDate)
        const [hours, minutes] = e.target.value.split(":").map(Number)
        newEndDate.setHours(hours, minutes)
        setEditedEntry({
          ...editedEntry,
          endDate: newEndDate,
        })
      }
    }
  }

  const formatDateForInput = (date: Date | undefined) => {
    if (!date) return ""
    return format(date, "yyyy-MM-dd")
  }

  const formatTimeForInput = (date: Date | undefined) => {
    if (!date) return ""
    return format(date, "HH:mm")
  }

  // Get background color based on entry type
  const getTypeColor = () => {
    if (!entry) return ""

    switch (entry.type) {
      case "Task":
        return "bg-violet-500 text-white"
      case "Meeting":
        return "bg-rose-500 text-white"
      case "Event":
        return "bg-fuchsia-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  if (!entry || !editedEntry) return null

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <span className={`px-2 py-1 rounded-md text-sm mr-2 ${getTypeColor()}`}>{entry.type}</span>
              {isEditing ? (
                <Input
                  name="title"
                  value={editedEntry.title}
                  onChange={handleInputChange}
                  className="text-xl font-bold"
                />
              ) : (
                <span className="text-xl font-bold">{entry.title}</span>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {isEditing ? (
              // Edit mode
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      value={formatDateForInput(editedEntry.date)}
                      onChange={handleDateChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      name="time"
                      type="time"
                      value={formatTimeForInput(editedEntry.date)}
                      onChange={handleTimeChange}
                    />
                  </div>
                </div>

                {entry.type === "Event" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        name="endDate"
                        type="date"
                        value={formatDateForInput(editedEntry.endDate)}
                        onChange={handleDateChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endTime">End Time</Label>
                      <Input
                        id="endTime"
                        name="endTime"
                        type="time"
                        value={formatTimeForInput(editedEntry.endDate)}
                        onChange={handleTimeChange}
                      />
                    </div>
                  </div>
                )}

                {entry.type === "Meeting" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (minutes)</Label>
                      <Input
                        id="duration"
                        name="duration"
                        type="number"
                        value={editedEntry.duration || 30}
                        onChange={handleInputChange}
                        min={15}
                        step={15}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="platform">Platform</Label>
                      <Input
                        id="platform"
                        name="platform"
                        value={editedEntry.platform || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={editedEntry.description}
                    onChange={handleInputChange}
                    className="min-h-[100px]"
                  />
                </div>

                {entry.type === "Task" && (
                  <div className="space-y-2">
                    <Label htmlFor="assignedTo">Assigned To</Label>
                    <Input
                      id="assignedTo"
                      name="assignedTo"
                      value={editedEntry.assignedTo || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                )}
              </div>
            ) : (
              // View mode
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Date & Time</h4>
                    <p>{format(entry.date, "PPP")}</p>
                    <p>{format(entry.date, "p")}</p>
                  </div>

                  {entry.type === "Event" && entry.endDate && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">End Date & Time</h4>
                      <p>{format(entry.endDate, "PPP")}</p>
                      <p>{format(entry.endDate, "p")}</p>
                    </div>
                  )}

                  {entry.type === "Meeting" && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Duration</h4>
                      <p>{entry.duration} minutes</p>
                    </div>
                  )}
                </div>

                {entry.description && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
                    <p className="whitespace-pre-wrap">{entry.description}</p>
                  </div>
                )}

                {entry.type === "Task" && entry.assignedTo && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Assigned To</h4>
                    <p>{entry.assignedTo}</p>
                  </div>
                )}

                {entry.type === "Meeting" && entry.platform && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Platform</h4>
                    <p>{entry.platform}</p>
                  </div>
                )}

                {entry.type === "Meeting" && entry.meetingLink && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Meeting Link</h4>
                    <a
                      href={entry.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center"
                    >
                      Join Meeting <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-between">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>Save Changes</Button>
              </>
            ) : (
              <>
                <Button variant="destructive" onClick={handleDelete} className="flex items-center">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
                <Button onClick={handleEdit} className="flex items-center">
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this {entry.type.toLowerCase()}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the {entry.type.toLowerCase()}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}


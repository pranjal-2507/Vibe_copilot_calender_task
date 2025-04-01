"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Navbar from "@/components/navbar"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function PlanMyDay() {
  const router = useRouter()
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  })
  const [workingDays, setWorkingDays] = useState({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false,
  })
  const [workingHours, setWorkingHours] = useState({
    startTime: "09:00",
    endTime: "17:00",
  })
  const [slotDuration, setSlotDuration] = useState("30")

  const handleWorkingDayChange = (day: keyof typeof workingDays) => {
    setWorkingDays({
      ...workingDays,
      [day]: !workingDays[day],
    })
  }

  const handleSavePreferences = () => {
    // Save preferences to localStorage
    localStorage.setItem(
      "calendarPreferences",
      JSON.stringify({
        dateRange,
        workingDays,
        workingHours,
        slotDuration,
      }),
    )

    toast({
      title: "Preferences saved",
      description: "Your calendar preferences have been saved successfully.",
    })
  }

  const handleSchedule = () => {
    // Save and redirect to calendar
    handleSavePreferences()
    router.push("/")
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Plan My Day</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Date Range</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Working Days</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {Object.entries(workingDays).map(([day, checked]) => (
                  <div key={day} className="flex items-center space-x-2">
                    <Checkbox
                      id={day}
                      checked={checked}
                      onCheckedChange={() => handleWorkingDayChange(day as keyof typeof workingDays)}
                    />
                    <Label htmlFor={day} className="capitalize">
                      {day}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Working Hours</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={workingHours.startTime}
                    onChange={(e) =>
                      setWorkingHours({
                        ...workingHours,
                        startTime: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={workingHours.endTime}
                    onChange={(e) =>
                      setWorkingHours({
                        ...workingHours,
                        endTime: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="slotDuration">Slot Duration (minutes)</Label>
              <Select value={slotDuration} onValueChange={(value) => setSlotDuration(value)}>
                <SelectTrigger id="slotDuration">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleSavePreferences}>
              Save Preferences
            </Button>
            <Button onClick={handleSchedule}>Schedule</Button>
          </CardFooter>
        </Card>
      </div>
      <Toaster />
    </main>
  )
}


"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { CalendarIcon, ChevronDown, Menu, RefreshCw } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"


export default function Navbar() {
  const pathname = usePathname()
  const [filters, setFilters] = useState({
    tasks: true,
    meetings: true,
    events: true,
    outlook: false,
    gmail: false,
  })
  const [mounted, setMounted] = useState(false)

  // After mounting, we can safely show the theme toggle
  useEffect(() => {
    setMounted(true)
  }, [])

  // Load filters from localStorage on component mount
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

  const handleFilterChange = (filter: keyof typeof filters) => {
    const updatedFilters = {
      ...filters,
      [filter]: !filters[filter],
    }

    setFilters(updatedFilters)

    // Save filters to localStorage
    localStorage.setItem("calendarFilters", JSON.stringify(updatedFilters))

    // Dispatch a custom event to notify other components
    window.dispatchEvent(new Event("filtersUpdated"))
  }

  const handleSync = (service: string) => {
    toast({
      title: `Syncing with ${service}`,
      description: `Your calendar is being synchronized with ${service}.`,
    })
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-colors duration-300">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex items-center">
          <CalendarIcon className="h-6 w-6 mr-2 text-primary" />
          <Link
            href="/"
            className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70"
          >
            Calendar App
          </Link>
        </div>

        <div className="ml-auto flex items-center space-x-2 md:space-x-4">
          {/* Desktop filters */}
          <div className="hidden lg:flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="tasks-desktop"
                checked={filters.tasks}
                onCheckedChange={() => handleFilterChange("tasks")}
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <Label htmlFor="tasks-desktop" className="text-sm font-medium">
                Tasks
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="meetings-desktop"
                checked={filters.meetings}
                onCheckedChange={() => handleFilterChange("meetings")}
                className="data-[state=checked]:bg-destructive data-[state=checked]:border-destructive"
              />
              <Label htmlFor="meetings-desktop" className="text-sm font-medium">
                Meetings
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="events-desktop"
                checked={filters.events}
                onCheckedChange={() => handleFilterChange("events")}
                className="data-[state=checked]:bg-secondary data-[state=checked]:border-secondary"
              />
              <Label htmlFor="events-desktop" className="text-sm font-medium">
                Events
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="outlook-desktop"
                checked={filters.outlook}
                onCheckedChange={() => handleFilterChange("outlook")}
              />
              <Label htmlFor="outlook-desktop" className="text-sm font-medium">
                Outlook
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="gmail-desktop"
                checked={filters.gmail}
                onCheckedChange={() => handleFilterChange("gmail")}
              />
              <Label htmlFor="gmail-desktop" className="text-sm font-medium">
                Gmail
              </Label>
            </div>
          </div>

          {/* Mobile filters */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>Show or hide calendar entries</SheetDescription>
              </SheetHeader>
              <div className="py-4 space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="tasks-mobile"
                    checked={filters.tasks}
                    onCheckedChange={() => handleFilterChange("tasks")}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <Label htmlFor="tasks-mobile">Tasks</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="meetings-mobile"
                    checked={filters.meetings}
                    onCheckedChange={() => handleFilterChange("meetings")}
                    className="data-[state=checked]:bg-destructive data-[state=checked]:border-destructive"
                  />
                  <Label htmlFor="meetings-mobile">Meetings</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="events-mobile"
                    checked={filters.events}
                    onCheckedChange={() => handleFilterChange("events")}
                    className="data-[state=checked]:bg-secondary data-[state=checked]:border-secondary"
                  />
                  <Label htmlFor="events-mobile">Events</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="outlook-mobile"
                    checked={filters.outlook}
                    onCheckedChange={() => handleFilterChange("outlook")}
                  />
                  <Label htmlFor="outlook-mobile">Outlook</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="gmail-mobile"
                    checked={filters.gmail}
                    onCheckedChange={() => handleFilterChange("gmail")}
                  />
                  <Label htmlFor="gmail-mobile">Gmail</Label>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="transition-all duration-200 hover:bg-primary/10">
                <RefreshCw className="h-4 w-4 mr-2 transition-transform duration-300 ease-in-out group-hover:rotate-180" />
                <span className="hidden sm:inline">Sync</span>
                <ChevronDown className="h-4 w-4 ml-0 sm:ml-2 transition-transform duration-200 ease-in-out group-hover:translate-y-0.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="animate-in slide-in-from-top-5 duration-200">
              <DropdownMenuItem onClick={() => handleSync("Outlook")}>Sync Outlook</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSync("Gmail")}>Sync Gmail</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

       

          <Button asChild size="sm" className="bg-primary hover:bg-primary/90 transition-colors duration-200">
            <Link href="/plan-my-day">
              <span className="hidden sm:inline">Plan My Day</span>
              <span className="sm:hidden">Plan</span>
            </Link>
          </Button>
        </div>
      </div>
      <Toaster />
    </header>
  )
}


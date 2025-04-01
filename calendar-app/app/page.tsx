import Calendar from "@/components/calendar/calendar"
import Navbar from "@/components/navbar"

export default function Home() {
  return (
    <main className="min-h-screen bg-background transition-colors duration-300">
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        <Calendar />
      </div>
    </main>
  )
}


"use client"

import { useState, useEffect, useRef } from "react"

type Location = "all" | "shawarma" | "coffee"
type Period = "daily" | "weekly"

interface SaleRecord {
  date: string
  location: "shawarma" | "coffee"
  revenue: number
  orders: number
  customers: number
  items: Record<string, number>
  hourly: number[]
}

const SHAWARMA_ITEMS = [
  "Classic Shawarma",
  "Chicken Shawarma",
  "Mixed Grill Plate",
  "Falafel Wrap",
  "Meat Sandwich",
  "Hummus Plate",
  "French Fries",
  "Soft Drinks",
]

const COFFEE_ITEMS = [
  "Espresso",
  "Cappuccino",
  "Latte",
  "Cold Brew",
  "Americano",
  "Croissant",
  "Cheesecake Slice",
  "Matcha Latte",
]

function generateMockData(): SaleRecord[] {
  const records: SaleRecord[] = []
  const today = new Date()
  for (let d = 29; d >= 0; d--) {
    const date = new Date(today)
    date.setDate(today.getDate() - d)
    const dateStr = date.toISOString().split("T")[0]
    const dayOfWeek = date.getDay()
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6

    const sBase = isWeekend ? 1400 : 950
    const cBase = isWeekend ? 900 : 650

    const shawarmaItems: Record<string, number> = {}
    SHAWARMA_ITEMS.forEach((item) => {
      shawarmaItems[item] = Math.floor(Math.random() * 40 + 5)
    })

    const coffeeItems: Record<string, number> = {}
    COFFEE_ITEMS.forEach((item) => {
      coffeeItems[item] = Math.floor(Math.random() * 35 + 5)
    })

    const sHourly = Array.from({ length: 24 }, (_, h) => {
      if (h < 8 || h > 23) return 0
      if (h >= 12 && h <= 14) return Math.floor(Math.random() * 30 + 20)
      if (h >= 18 && h <= 21) return Math.floor(Math.random() * 35 + 25)
      return Math.floor(Math.random() * 15 + 5)
    })

    const cHourly = Array.from({ length: 24 }, (_, h) => {
      if (h < 7 || h > 22) return 0
      if (h >= 8 && h <= 10) return Math.floor(Math.random() * 30 + 20)
      if (h >= 15 && h <= 17) return Math.floor(Math.random() * 25 + 15)
      return Math.floor(Math.random() * 12 + 3)
    })

    records.push({
      date: dateStr,
      location: "shawarma",
      revenue: sBase + Math.floor(Math.random() * 400 - 200),
      orders: Math.floor(sBase / 6.5 + Math.random() * 20 - 10),
      customers: Math.floor(sBase / 7 + Math.random() * 15 - 7),
      items: shawarmaItems,
      hourly: sHourly,
    })

    records.push({
      date: dateStr,
      location: "coffee",
      revenue: cBase + Math.floor(Math.random() * 300 - 150),
      orders: Math.floor(cBase / 5 + Math.random() * 20 - 10),
      customers: Math.floor(cBase / 5.5 + Math.random() * 15 - 7),
      items: coffeeItems,
      hourly: cHourly,
    })
  }
  return records
}

function formatCurrency(val: number) {
  return `${val.toLocaleString("en-JO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} JOD`
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-JO", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
}

interface KPIData {
  revenue: number
  orders: number
  customers: number
  avgOrder: number
  prevRevenue: number
  prevOrders: number
  prevCustomers: number
  prevAvgOrder: number
}

function pct(curr: number, prev: number) {
  if (prev === 0) return 0
  return ((curr - prev) / prev) * 100
}

function Arrow({ val }: { val: number }) {
  if (val > 0)
    return <span className="text-emerald-400 font-bold">↑ {val.toFixed(1)}%</span>
  if (val < 0)
    return <span className="text-red-400 font-bold">↓ {Math.abs(val).toFixed(1)}%</span>
  return <span className="text-zinc-400 font-bold">— 0%</span>
}

export default function SalesSummaryPage() {
  const [allData] = useState<SaleRecord[]>(() => generateMockData())
  const [location, setLocation] = useState<Location>("all")
  const [period, setPeriod] = useState<Period>("weekly")
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date()
    return d.toISOString().split("T")[0]
  })
  const [activeTab, setActiveTab] = useState<"overview" | "hourly" | "items">("overview")
  const printRef = useRef<HTMLDivElement>(null)

  const today = new Date()
  const todayStr = today.toISOString().split("T")[0]

  function getDateRange(anchor: string, p: Period): string[] {
    const dates: string[] = []
    const anchorDate = new Date(anchor)
    if (p === "daily") {
      return [anchor]
    } else {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(anchorDate)
        d.setDate(anchorDate.getDate() - i)
        dates.push(d.toISOString().split("T")[0])
      }
      return dates
    }
  }

  function getPrevDateRange(anchor: string, p: Period): string[] {
    const anchorDate = new Date(anchor)
    const offset = p === "daily" ? 1 : 7
    const prev = new Date(anchorDate)
    prev.setDate(anchorDate.getDate() - offset)
    return getDateRange(prev.toISOString().split("T")[0], p)
  }

  function filterRecords(dates: string[], loc: Location): SaleRecord[] {
    return allData.filter(
      (r) =>
        dates.includes(r.date) &&
        (loc === "all" || r.location === loc)
    )
  }

  const currentDates = getDateRange(selectedDate, period)
  const prevDates = getPrevDateRange(selectedDate, period)
  const currentRecords = filterRecords(currentDates, location)
  const prevRecords = filterRecords(prevDates, location)

  function sumKPI(records: SaleRecord[]): Pick<KPIData, "revenue" | "orders" | "customers" | "avgOrder"> {
    const revenue = records.reduce((s, r) => s + r.revenue, 0)
    const orders = records.reduce((s, r) => s + r.orders, 0)
    const customers = records.reduce((s, r) => s + r.customers, 0)
    return { revenue, orders, customers, avgOrder: orders > 0 ? revenue / orders : 0 }
  }

  const curr = sumKPI(currentRecords)
  const prev = sumKPI(prevRecords)

  // Top items
  const itemTotals: Record<string, number> = {}
  currentRecords.forEach((r) => {
    Object.entries(r.items).forEach(([item, qty]) => {
      itemTotals[item] = (itemTotals[item] || 0) + qty
    })
  })
  const topItems = Object.entries(itemTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
  const maxItemQty = topItems[0]?.[1] || 1

  // Hourly aggregation
  const hourlyTotals = Array(24).fill(0)
  currentRecords.forEach((r) => {
    r.hourly.forEach((v, h) => {
      hourlyTotals[h] += v
    })
  })
  const maxHourly = Math.max(...hourlyTotals, 1)
  const peakHour = hourlyTotals.indexOf(Math.max(...hourlyTotals))

  // Revenue trend per date
  const trendData = currentDates.map((date) => {
    const recs = filterRecords([date], location)
    return { date, revenue: recs.reduce((s, r) => s + r.revenue, 0) }
  })
  const maxTrendRevenue = Math.max(...trendData.map((d) => d.revenue), 1)

  // Location split (only when "all")
  const shawarmaRevenue = currentDates.reduce((s, d) => {
    const r = allData.find((rec) => rec.date === d && rec.location === "shawarma")
    return s + (r?.revenue || 0)
  }, 0)
  const coffeeRevenue = currentDates.reduce((s, d) => {
    const r = allData.find((rec) => rec.date === d && rec.location === "coffee")
    return s + (r?.revenue || 0)
  }, 0)
  const totalRevForPie = shawarmaRevenue + coffeeRevenue

  // Export CSV
  function exportCSV() {
    const rows: string[][] = []
    rows.push(["Date", "Location", "Revenue (JOD)", "Orders", "Customers", "Avg Order (JOD)"])
    currentDates.forEach((date) => {
      const locs: ("shawarma" | "coffee")[] =
        location === "all" ? ["shawarma", "coffee"] : [location]
      locs.forEach((loc) => {
        const recs = allData.filter((r) => r.date === date && r.location === loc)
        if (recs.length === 0) return
        const rev = recs.reduce((s, r) => s + r.revenue, 0)
        const ord = recs.reduce((s, r) => s + r.orders, 0)
        const cust = recs.reduce((s, r) => s + r.customers, 0)
        const avg = ord > 0 ? (rev / ord).toFixed(2) : "0.00"
        rows.push([
          date,
          loc === "shawarma" ? "Shawarma House" : "Bean Corner Coffee",
          rev.toFixed(2),
          String(ord),
          String(cust),
          avg,
        ])
      })
    })
    // Add top items
    rows.push([])
    rows.push(["Top Selling Items", "Quantity Sold"])
    topItems.forEach(([item, qty]) => rows.push([item, String(qty)]))

    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `sales-report-${period}-${selectedDate}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handlePrint() {
    window.print()
  }

  const locationLabel =
    location === "all"
      ? "All Locations"
      : location === "shawarma"
      ? "Shawarma House"
      : "Bean Corner Coffee"

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* Hero */}
      <div className="bg-gradient-to-br from-zinc-900 via-amber-950/30 to-zinc-950 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">🌯</span>
                <span className="text-3xl">☕</span>
                <span className="bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                  Analytics Dashboard
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                Shawarma House &<br />
                <span className="text-amber-400">Bean Corner</span>
              </h1>
              <p className="text-zinc-400 mt-2 text-base">
                Daily & Weekly Sales Summary Reports · Amman, Jordan
              </p>
            </div>
            <div className="flex flex-col gap-3 min-w-[240px]">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Report Date</p>
                <input
                  type="date"
                  value={selectedDate}
                  max={todayStr}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8" ref={printRef}>
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Period Toggle */}
          <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            {(["daily", "weekly"] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-5 py-2.5 text-sm font-semibold capitalize transition-all ${
                  period === p
                    ? "bg-amber-500 text-zinc-950"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                }`}
              >
                {p === "daily" ? "📅 Daily" : "📆 Weekly"}
              </button>
            ))}
          </div>

          {/* Location Filter */}
          <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl overflow-
"use client"

import { useState } from "react"

type Location = "shawarma" | "coffee" | "all"
type SortKey = "margin" | "revenue" | "variance" | "name"

interface MenuItem {
  id: string
  name: string
  location: "shawarma" | "coffee"
  category: string
  menuPrice: number
  theoreticalCost: number
  actualCost: number
  unitsSold: number
  emoji: string
}

const menuItems: MenuItem[] = [
  { id: "1", name: "Classic Shawarma Wrap", location: "shawarma", category: "Wraps", menuPrice: 3.5, theoreticalCost: 1.05, actualCost: 1.28, unitsSold: 420, emoji: "🌯" },
  { id: "2", name: "Chicken Shawarma Plate", location: "shawarma", category: "Plates", menuPrice: 5.5, theoreticalCost: 1.87, actualCost: 2.31, unitsSold: 310, emoji: "🍗" },
  { id: "3", name: "Mixed Grill Platter", location: "shawarma", category: "Platters", menuPrice: 9.0, theoreticalCost: 3.15, actualCost: 3.78, unitsSold: 185, emoji: "🥩" },
  { id: "4", name: "Falafel Wrap", location: "shawarma", category: "Wraps", menuPrice: 2.5, theoreticalCost: 0.62, actualCost: 0.71, unitsSold: 290, emoji: "🥙" },
  { id: "5", name: "Garlic Sauce Add-on", location: "shawarma", category: "Extras", menuPrice: 0.75, theoreticalCost: 0.08, actualCost: 0.14, unitsSold: 680, emoji: "🧄" },
  { id: "6", name: "Hummus Bowl", location: "shawarma", category: "Sides", menuPrice: 2.0, theoreticalCost: 0.55, actualCost: 0.61, unitsSold: 230, emoji: "🫘" },
  { id: "7", name: "Lamb Shawarma Premium", location: "shawarma", category: "Wraps", menuPrice: 4.5, theoreticalCost: 1.89, actualCost: 2.47, unitsSold: 195, emoji: "🥓" },
  { id: "8", name: "Soft Drink", location: "shawarma", category: "Beverages", menuPrice: 1.0, theoreticalCost: 0.35, actualCost: 0.36, unitsSold: 510, emoji: "🥤" },
  { id: "9", name: "Specialty Espresso", location: "coffee", category: "Espresso", menuPrice: 2.75, theoreticalCost: 0.55, actualCost: 0.63, unitsSold: 540, emoji: "☕" },
  { id: "10", name: "Cold Brew Signature", location: "coffee", category: "Cold Drinks", menuPrice: 3.5, theoreticalCost: 0.70, actualCost: 0.95, unitsSold: 320, emoji: "🧊" },
  { id: "11", name: "Avocado Toast", location: "coffee", category: "Food", menuPrice: 4.5, theoreticalCost: 1.58, actualCost: 2.03, unitsSold: 210, emoji: "🥑" },
  { id: "12", name: "Croissant Butter", location: "coffee", category: "Pastries", menuPrice: 2.25, theoreticalCost: 0.72, actualCost: 0.81, unitsSold: 380, emoji: "🥐" },
  { id: "13", name: "Matcha Latte", location: "coffee", category: "Specialty", menuPrice: 3.75, theoreticalCost: 0.94, actualCost: 1.31, unitsSold: 275, emoji: "🍵" },
  { id: "14", name: "Turkish Coffee", location: "coffee", category: "Espresso", menuPrice: 2.0, theoreticalCost: 0.30, actualCost: 0.33, unitsSold: 460, emoji: "🫖" },
  { id: "15", name: "Smoothie Bowl", location: "coffee", category: "Food", menuPrice: 5.5, theoreticalCost: 2.20, actualCost: 2.86, unitsSold: 145, emoji: "🍓" },
  { id: "16", name: "Flat White", location: "coffee", category: "Espresso", menuPrice: 3.0, theoreticalCost: 0.60, actualCost: 0.68, unitsSold: 490, emoji: "🍶" },
]

function calcMetrics(item: MenuItem) {
  const revenue = item.menuPrice * item.unitsSold
  const theoreticalCostTotal = item.theoreticalCost * item.unitsSold
  const actualCostTotal = item.actualCost * item.unitsSold
  const theoreticalMargin = ((item.menuPrice - item.theoreticalCost) / item.menuPrice) * 100
  const actualMargin = ((item.menuPrice - item.actualCost) / item.menuPrice) * 100
  const variance = item.actualCost - item.theoreticalCost
  const variancePct = (variance / item.theoreticalCost) * 100
  const profit = revenue - actualCostTotal
  return { revenue, theoreticalCostTotal, actualCostTotal, theoreticalMargin, actualMargin, variance, variancePct, profit }
}

function getMarginColor(margin: number) {
  if (margin >= 65) return "text-emerald-400"
  if (margin >= 50) return "text-amber-400"
  if (margin >= 35) return "text-orange-400"
  return "text-red-400"
}

function getMarginBg(margin: number) {
  if (margin >= 65) return "bg-emerald-400/10 border-emerald-400/30"
  if (margin >= 50) return "bg-amber-400/10 border-amber-400/30"
  if (margin >= 35) return "bg-orange-400/10 border-orange-400/30"
  return "bg-red-400/10 border-red-400/30"
}

function getVarianceColor(variance: number) {
  if (variance <= 0.05) return "text-emerald-400"
  if (variance <= 0.20) return "text-amber-400"
  return "text-red-400"
}

export default function ProfitabilityTracker() {
  const [selectedLocation, setSelectedLocation] = useState<Location>("all")
  const [sortKey, setSortKey] = useState<SortKey>("margin")
  const [sortAsc, setSortAsc] = useState(false)
  const [activeTab, setActiveTab] = useState<"items" | "summary" | "heatmap">("items")
  const [highlightThreshold, setHighlightThreshold] = useState(50)

  const filteredItems = menuItems.filter(item =>
    selectedLocation === "all" ? true : item.location === selectedLocation
  )

  const sortedItems = [...filteredItems].sort((a, b) => {
    const ma = calcMetrics(a)
    const mb = calcMetrics(b)
    let valA = 0, valB = 0
    if (sortKey === "margin") { valA = ma.actualMargin; valB = mb.actualMargin }
    if (sortKey === "revenue") { valA = ma.revenue; valB = mb.revenue }
    if (sortKey === "variance") { valA = ma.variance; valB = mb.variance }
    if (sortKey === "name") return sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    return sortAsc ? valA - valB : valB - valA
  })

  const allMetrics = filteredItems.map(item => ({ item, ...calcMetrics(item) }))
  const totalRevenue = allMetrics.reduce((s, m) => s + m.revenue, 0)
  const totalActualCost = allMetrics.reduce((s, m) => s + m.actualCostTotal, 0)
  const totalTheoreticalCost = allMetrics.reduce((s, m) => s + m.theoreticalCostTotal, 0)
  const totalProfit = totalRevenue - totalActualCost
  const overallMargin = (totalProfit / totalRevenue) * 100
  const totalVariance = totalActualCost - totalTheoreticalCost

  const shawarmaMetrics = menuItems.filter(i => i.location === "shawarma").map(item => calcMetrics(item))
  const coffeeMetrics = menuItems.filter(i => i.location === "coffee").map(item => calcMetrics(item))

  const shawarmaRevTotal = shawarmaMetrics.reduce((s, m) => s + m.revenue, 0)
  const shawarmaActualTotal = shawarmaMetrics.reduce((s, m) => s + m.actualCostTotal, 0)
  const shawarmaMargin = ((shawarmaRevTotal - shawarmaActualTotal) / shawarmaRevTotal) * 100

  const coffeeRevTotal = coffeeMetrics.reduce((s, m) => s + m.revenue, 0)
  const coffeeActualTotal = coffeeMetrics.reduce((s, m) => s + m.actualCostTotal, 0)
  const coffeeMargin = ((coffeeRevTotal - coffeeActualTotal) / coffeeRevTotal) * 100

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc)
    else { setSortKey(key); setSortAsc(false) }
  }

  const categories = Array.from(new Set(filteredItems.map(i => i.category)))

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-amber-950/30 border-b border-zinc-800">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-8 left-12 text-8xl">🌯</div>
          <div className="absolute top-4 right-24 text-7xl">☕</div>
          <div className="absolute bottom-4 left-1/3 text-6xl">📊</div>
          <div className="absolute bottom-8 right-16 text-5xl">🥙</div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex gap-1">
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">🌯 Shawarma House</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-800/30 text-amber-300 border border-amber-700/30">☕ Bean Corner</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-400 border border-zinc-700">Amman, Jordan</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-1">
                Food Cost <span className="text-amber-400">&</span> Revenue
              </h1>
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-400 mb-3">Profitability Tracker</h2>
              <p className="text-zinc-400 text-sm max-w-xl">
                Real-time comparison of theoretical food cost vs. actual ingredient spend — identify margin leaks and underperforming items across both locations.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 text-center min-w-[110px]">
                <div className="text-2xl font-black text-amber-400">JOD {(totalRevenue).toFixed(0)}</div>
                <div className="text-xs text-zinc-500 mt-1">Total Revenue</div>
              </div>
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 text-center min-w-[110px]">
                <div className={`text-2xl font-black ${getMarginColor(overallMargin)}`}>{overallMargin.toFixed(1)}%</div>
                <div className="text-xs text-zinc-500 mt-1">Blended Margin</div>
              </div>
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 text-center min-w-[110px]">
                <div className="text-2xl font-black text-red-400">+JOD {totalVariance.toFixed(0)}</div>
                <div className="text-xs text-zinc-500 mt-1">Cost Variance</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Location KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-amber-500/40 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-xl">🌯</div>
                <div>
                  <div className="font-bold text-white">Shawarma House</div>
                  <div className="text-xs text-zinc-500">Fast-Casual Branch</div>
                </div>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getMarginBg(shawarmaMargin)}`}>
                {shawarmaMargin.toFixed(1)}% margin
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-zinc-800/50 rounded-xl p-3">
                <div className="text-lg font-bold text-white">JOD {shawarmaRevTotal.toFixed(0)}</div>
                <div className="text-xs text-zinc-500">Revenue</div>
              </div>
              <div className="bg-zinc-800/50 rounded-xl p-3">
                <div className="text-lg font-bold text-zinc-300">JOD {shawarmaActualTotal
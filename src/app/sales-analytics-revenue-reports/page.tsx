"use client"

import { useState, useEffect } from "react"

// Types
type Period = "daily" | "weekly" | "monthly"
type Location = "all" | "shawarma-house" | "bean-corner"
type Tab = "overview" | "menu" | "orders" | "insights"

interface RevenueData {
  label: string
  shawarmaHouse: number
  beanCorner: number
}

interface MenuItem {
  name: string
  location: string
  revenue: number
  orders: number
  trend: number
  category: string
}

interface OrderTrend {
  label: string
  dineIn: number
  takeaway: number
}

interface Insight {
  type: "positive" | "negative" | "neutral"
  title: string
  description: string
  location: string
  metric: string
}

// Mock Data Generators
const generateRevenueData = (period: Period): RevenueData[] => {
  if (period === "daily") {
    return [
      { label: "Mon", shawarmaHouse: 1240, beanCorner: 680 },
      { label: "Tue", shawarmaHouse: 1380, beanCorner: 720 },
      { label: "Wed", shawarmaHouse: 1520, beanCorner: 810 },
      { label: "Thu", shawarmaHouse: 1890, beanCorner: 950 },
      { label: "Fri", shawarmaHouse: 2340, beanCorner: 1280 },
      { label: "Sat", shawarmaHouse: 2780, beanCorner: 1540 },
      { label: "Sun", shawarmaHouse: 2150, beanCorner: 1180 },
    ]
  } else if (period === "weekly") {
    return [
      { label: "Wk 1", shawarmaHouse: 12400, beanCorner: 7200 },
      { label: "Wk 2", shawarmaHouse: 13800, beanCorner: 7900 },
      { label: "Wk 3", shawarmaHouse: 11200, beanCorner: 6800 },
      { label: "Wk 4", shawarmaHouse: 15600, beanCorner: 9100 },
    ]
  } else {
    return [
      { label: "Jan", shawarmaHouse: 48000, beanCorner: 28000 },
      { label: "Feb", shawarmaHouse: 43000, beanCorner: 25000 },
      { label: "Mar", shawarmaHouse: 52000, beanCorner: 31000 },
      { label: "Apr", shawarmaHouse: 55000, beanCorner: 33000 },
      { label: "May", shawarmaHouse: 61000, beanCorner: 37000 },
      { label: "Jun", shawarmaHouse: 67000, beanCorner: 41000 },
    ]
  }
}

const menuItems: MenuItem[] = [
  { name: "Classic Shawarma", location: "Shawarma House", revenue: 18400, orders: 1840, trend: 12.4, category: "Main" },
  { name: "Mixed Grill Plate", location: "Shawarma House", revenue: 14200, orders: 710, trend: 8.2, category: "Main" },
  { name: "Chicken Shawarma", location: "Shawarma House", revenue: 16800, orders: 1680, trend: -3.1, category: "Main" },
  { name: "Falafel Wrap", location: "Shawarma House", revenue: 6200, orders: 886, trend: 2.8, category: "Side" },
  { name: "Hummus Plate", location: "Shawarma House", revenue: 3800, orders: 760, trend: -8.5, category: "Side" },
  { name: "Lamb Shawarma", location: "Shawarma House", revenue: 22100, orders: 1105, trend: 18.7, category: "Main" },
  { name: "Specialty Latte", location: "Bean Corner", revenue: 12400, orders: 2067, trend: 22.1, category: "Coffee" },
  { name: "Cold Brew", location: "Bean Corner", revenue: 9800, orders: 1633, trend: 15.6, category: "Coffee" },
  { name: "Cappuccino", location: "Bean Corner", revenue: 7200, orders: 1800, trend: -2.4, category: "Coffee" },
  { name: "Avocado Toast", location: "Bean Corner", revenue: 5600, orders: 560, trend: 9.3, category: "Food" },
  { name: "Croissant", location: "Bean Corner", revenue: 3200, orders: 1067, trend: -5.8, category: "Food" },
  { name: "Matcha Latte", location: "Bean Corner", revenue: 8900, orders: 1483, trend: 31.2, category: "Coffee" },
]

const generateOrderTrends = (period: Period): OrderTrend[] => {
  if (period === "daily") {
    return [
      { label: "Mon", dineIn: 142, takeaway: 98 },
      { label: "Tue", dineIn: 158, takeaway: 112 },
      { label: "Wed", dineIn: 175, takeaway: 134 },
      { label: "Thu", dineIn: 210, takeaway: 168 },
      { label: "Fri", dineIn: 285, takeaway: 224 },
      { label: "Sat", dineIn: 320, takeaway: 278 },
      { label: "Sun", dineIn: 248, takeaway: 198 },
    ]
  } else if (period === "weekly") {
    return [
      { label: "Wk 1", dineIn: 1240, takeaway: 980 },
      { label: "Wk 2", dineIn: 1380, takeaway: 1120 },
      { label: "Wk 3", dineIn: 1180, takeaway: 890 },
      { label: "Wk 4", dineIn: 1560, takeaway: 1340 },
    ]
  } else {
    return [
      { label: "Jan", dineIn: 4800, takeaway: 3600 },
      { label: "Feb", dineIn: 4200, takeaway: 3100 },
      { label: "Mar", dineIn: 5200, takeaway: 4100 },
      { label: "Apr", dineIn: 5600, takeaway: 4400 },
      { label: "May", dineIn: 6100, takeaway: 5200 },
      { label: "Jun", dineIn: 6800, takeaway: 5900 },
    ]
  }
}

const insights: Insight[] = [
  {
    type: "positive",
    title: "Matcha Latte Surge",
    description: "Matcha Latte revenue grew 31.2% this month — highest growth item. Consider expanding to seasonal variants.",
    location: "Bean Corner",
    metric: "+31.2% MoM",
  },
  {
    type: "positive",
    title: "Lamb Shawarma Peak",
    description: "Lamb Shawarma is driving 18.7% revenue increase. Weekend dinner slots are fully booked.",
    location: "Shawarma House",
    metric: "+18.7% MoM",
  },
  {
    type: "negative",
    title: "Hummus Plate Declining",
    description: "Hummus Plate orders dropped 8.5% — consider recipe refresh or promotional bundle deals.",
    location: "Shawarma House",
    metric: "-8.5% MoM",
  },
  {
    type: "negative",
    title: "Croissant Low Performance",
    description: "Croissant revenue down 5.8%. Review freshness schedule and consider replacing with high-margin pastry.",
    location: "Bean Corner",
    metric: "-5.8% MoM",
  },
  {
    type: "neutral",
    title: "Takeaway Volume Rising",
    description: "Takeaway orders represent 46% of total volume, up from 38% last quarter. Delivery optimization recommended.",
    location: "Both Locations",
    metric: "46% of orders",
  },
  {
    type: "positive",
    title: "Friday Revenue Peak",
    description: "Friday generates 32% more revenue than average weekday. Staff scheduling should reflect this demand spike.",
    location: "Both Locations",
    metric: "+32% vs avg",
  },
]

// Bar Chart Component
const BarChart = ({ data, keys, colors }: { data: RevenueData[], keys: string[], colors: string[] }) => {
  const maxVal = Math.max(...data.flatMap(d => keys.map(k => (d as any)[k])))

  return (
    <div className="flex items-end gap-1.5 h-48 w-full">
      {data.map((item, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full flex items-end gap-0.5 h-40">
            {keys.map((key, ki) => {
              const val = (item as any)[key]
              const height = (val / maxVal) * 100
              return (
                <div
                  key={ki}
                  className="flex-1 rounded-t-sm transition-all duration-500 cursor-pointer hover:opacity-80 relative group"
                  style={{ height: `${height}%`, backgroundColor: colors[ki] }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-800 text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 transition-opacity">
                    {val >= 1000 ? `${(val / 1000).toFixed(1)}k JD` : `${val} JD`}
                  </div>
                </div>
              )
            })}
          </div>
          <span className="text-zinc-500 text-xs">{item.label}</span>
        </div>
      ))}
    </div>
  )
}

// Order Bar Chart
const OrderBarChart = ({ data }: { data: OrderTrend[] }) => {
  const maxVal = Math.max(...data.flatMap(d => [d.dineIn, d.takeaway]))

  return (
    <div className="flex items-end gap-1.5 h-48 w-full">
      {data.map((item, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full flex items-end gap-0.5 h-40">
            {[
              { key: "dineIn", color: "#f97316" },
              { key: "takeaway", color: "#06b6d4" },
            ].map(({ key, color }) => {
              const val = (item as any)[key]
              const height = (val / maxVal) * 100
              return (
                <div
                  key={key}
                  className="flex-1 rounded-t-sm transition-all duration-500 cursor-pointer hover:opacity-80 relative group"
                  style={{ height: `${height}%`, backgroundColor: color }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-800 text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 transition-opacity">
                    {val} orders
                  </div>
                </div>
              )
            })}
          </div>
          <span className="text-zinc-500 text-xs">{item.label}</span>
        </div>
      ))}
    </div>
  )
}

// Trend Indicator
const TrendBadge = ({ value }: { value: number }) => (
  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${value >= 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
    {value >= 0 ? "▲" : "▼"} {Math.abs(value)}%
  </span>
)

// Stat Card
const StatCard = ({ title, value, sub, color }: { title: string, value: string, sub: string, color: string }) => (
  <div className={`bg-zinc-900 rounded-xl p-4 border border-zinc-800 relative overflow-hidden`}>
    <div className={`absolute top-0 left-0 w-1 h-full rounded-l-xl`} style={{ backgroundColor: color }} />
    <p className="text-zinc-400 text-sm mb-1 pl-2">{title}</p>
    <p className="text-white text-2xl font-bold pl-2">{value}</p>
    <p className="text-zinc-500 text-xs mt-1 pl-2">{sub}</p>
  </div>
)

export default function SalesAnalytics() {
  const [period, setPeriod] = useState<Period>("weekly")
  const [location, setLocation] = useState<Location>("all")
  const [activeTab, setActiveTab] = useState<Tab>("overview")
  const [revenueData, setRevenueData] = useState<RevenueData[]>([])
  const [orderData, setOrderData] = useState<OrderTrend[]>([])
  const [selectedInsightType, setSelectedInsightType] = useState<"all" | "positive" | "negative" | "neutral">("all")
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    setAnimating(true)
    setTimeout(() => {
      setRevenueData(generateRevenueData(period))
      setOrderData(generateOrderTrends(period))
      setAnimating(false)
    }, 200)
  }, [period])

  const totalSH = revenueData.reduce((a, b) => a + b.shawarmaHouse, 0)
  const totalBC = revenueData.reduce((a, b) => a + b.beanCorner, 0)
  const totalRevenue = totalSH + totalBC

  const totalDineIn = orderData.reduce((a, b) => a + b.dineIn, 0)
  const totalTakeaway = orderData.reduce((a, b) => a + b.takeaway, 0)

  const filteredMenuItems = menuItems
    .filter(item => {
      if (location === "shawarma-house") return item.location === "Shawarma House"
      if (location === "bean-corner") return item.location === "Bean Corner"
      return true
    })
    .sort((a, b) => b.revenue - a.revenue)

  const topItems = filteredMenuItems.slice(0, 3)
  const bottomItems = [...filteredMenuItems].sort((a, b) => a.revenue - b.revenue).slice(0, 3)

  const filteredInsights = insights.filter(i =>
    selectedInsightType === "all" ? true : i.type === selectedInsightType
  )

  const chartKeys = location === "shawarma-house"
    ? ["shawarmaHouse"]
    : location === "bean-corner"
    ? ["beanCorner"]
    : ["shawarmaHouse", "beanCorner"]

  const chartColors = ["#f97
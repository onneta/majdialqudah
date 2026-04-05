"use client"

import { useState, useEffect, useRef } from "react"

type Location = "all" | "shawarma" | "bean"
type Period = "daily" | "weekly" | "monthly"

interface DayData {
  date: string
  shawarma: number
  bean: number
}

interface MenuItem {
  name: string
  location: "shawarma" | "bean"
  sold: number
  revenue: number
  cost: number
}

const generateDailyData = (): DayData[] => {
  const data: DayData[] = []
  const now = new Date()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split("T")[0]
    data.push({
      date: dateStr,
      shawarma: Math.floor(Math.random() * 1200 + 1800),
      bean: Math.floor(Math.random() * 700 + 900),
    })
  }
  return data
}

const MENU_ITEMS: MenuItem[] = [
  { name: "Classic Shawarma Wrap", location: "shawarma", sold: 342, revenue: 4788, cost: 1915 },
  { name: "Chicken Shawarma Plate", location: "shawarma", sold: 289, revenue: 5202, cost: 2080 },
  { name: "Mixed Grill Platter", location: "shawarma", sold: 178, revenue: 5340, cost: 2670 },
  { name: "Falafel Sandwich", location: "shawarma", sold: 245, revenue: 2450, cost: 735 },
  { name: "Hummus & Pita", location: "shawarma", sold: 198, revenue: 1980, cost: 594 },
  { name: "Shawarma Fries", location: "shawarma", sold: 310, revenue: 3100, cost: 930 },
  { name: "Signature Espresso", location: "bean", sold: 521, revenue: 4168, cost: 1042 },
  { name: "Caramel Latte", location: "bean", sold: 398, revenue: 3980, cost: 1194 },
  { name: "Cold Brew", location: "bean", sold: 267, revenue: 2937, cost: 801 },
  { name: "Matcha Latte", location: "bean", sold: 201, revenue: 2412, cost: 724 },
  { name: "Croissant", location: "bean", sold: 312, revenue: 2808, cost: 1123 },
  { name: "Cheesecake Slice", location: "bean", sold: 189, revenue: 2835, cost: 1134 },
]

const DAILY_DATA = generateDailyData()

function formatCurrency(n: number) {
  return `${n.toLocaleString()} JOD`
}

function formatPct(n: number) {
  return `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`
}

function getPeriodData(data: DayData[], period: Period) {
  if (period === "daily") return data.slice(-7)
  if (period === "weekly") {
    const weeks: DayData[] = []
    for (let i = 0; i < 4; i++) {
      const slice = data.slice(i * 7, i * 7 + 7)
      if (slice.length === 0) continue
      weeks.push({
        date: `Week ${i + 1}`,
        shawarma: slice.reduce((a, b) => a + b.shawarma, 0),
        bean: slice.reduce((a, b) => a + b.bean, 0),
      })
    }
    return weeks
  }
  return [
    {
      date: "This Month",
      shawarma: data.reduce((a, b) => a + b.shawarma, 0),
      bean: data.reduce((a, b) => a + b.bean, 0),
    },
  ]
}

interface SimpleLineChartProps {
  data: DayData[]
  location: Location
}

function SimpleLineChart({ data, location }: SimpleLineChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    ctx.clearRect(0, 0, width, height)

    const shawarmaVals = data.map((d) => d.shawarma)
    const beanVals = data.map((d) => d.bean)
    const bothVals = location === "all" ? [...shawarmaVals, ...beanVals] : location === "shawarma" ? shawarmaVals : beanVals
    const maxVal = Math.max(...bothVals) * 1.1
    const minVal = Math.min(...bothVals) * 0.9
    const range = maxVal - minVal

    const padL = 50, padR = 20, padT = 20, padB = 40
    const chartW = width - padL - padR
    const chartH = height - padT - padB

    // Grid lines
    ctx.strokeStyle = "rgba(63,63,70,0.6)"
    ctx.lineWidth = 1
    for (let i = 0; i <= 4; i++) {
      const y = padT + (chartH / 4) * i
      ctx.beginPath()
      ctx.moveTo(padL, y)
      ctx.lineTo(padL + chartW, y)
      ctx.stroke()
      const val = maxVal - (range / 4) * i
      ctx.fillStyle = "#a1a1aa"
      ctx.font = "10px sans-serif"
      ctx.textAlign = "right"
      ctx.fillText(Math.round(val).toString(), padL - 6, y + 4)
    }

    const drawLine = (vals: number[], color: string, fillColor: string) => {
      if (vals.length < 2) return
      const points = vals.map((v, i) => ({
        x: padL + (i / (vals.length - 1)) * chartW,
        y: padT + ((maxVal - v) / range) * chartH,
      }))

      ctx.beginPath()
      ctx.moveTo(points[0].x, points[0].y)
      for (let i = 1; i < points.length; i++) {
        const cp1x = (points[i - 1].x + points[i].x) / 2
        ctx.bezierCurveTo(cp1x, points[i - 1].y, cp1x, points[i].y, points[i].x, points[i].y)
      }
      ctx.strokeStyle = color
      ctx.lineWidth = 2.5
      ctx.stroke()

      // Fill
      ctx.lineTo(points[points.length - 1].x, padT + chartH)
      ctx.lineTo(points[0].x, padT + chartH)
      ctx.closePath()
      ctx.fillStyle = fillColor
      ctx.fill()

      // Dots
      points.forEach((p) => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.fill()
      })
    }

    if (location === "all" || location === "shawarma") {
      drawLine(shawarmaVals, "#f59e0b", "rgba(245,158,11,0.12)")
    }
    if (location === "all" || location === "bean") {
      drawLine(beanVals, "#10b981", "rgba(16,185,129,0.12)")
    }

    // X labels
    ctx.fillStyle = "#a1a1aa"
    ctx.font = "10px sans-serif"
    ctx.textAlign = "center"
    const step = Math.floor(data.length / 6)
    data.forEach((d, i) => {
      if (i % step === 0 || i === data.length - 1) {
        const x = padL + (i / (data.length - 1)) * chartW
        const label = d.date.slice(5)
        ctx.fillText(label, x, height - 8)
      }
    })
  }, [data, location])

  return <canvas ref={canvasRef} width={800} height={260} className="w-full h-full" />
}

interface BarChartProps {
  items: MenuItem[]
  location: Location
}

function BarChart({ items, location }: BarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const filtered = items
      .filter((it) => location === "all" || it.location === location)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6)

    const width = canvas.width
    const height = canvas.height
    ctx.clearRect(0, 0, width, height)

    const maxRev = Math.max(...filtered.map((it) => it.revenue)) * 1.1
    const padL = 140, padR = 20, padT = 20, padB = 20
    const chartW = width - padL - padR
    const chartH = height - padT - padB
    const barH = (chartH / filtered.length) * 0.6
    const gap = (chartH / filtered.length) * 0.4

    filtered.forEach((item, i) => {
      const y = padT + i * (barH + gap) + gap / 2
      const barW = (item.revenue / maxRev) * chartW
      const costW = (item.cost / maxRev) * chartW
      const color = item.location === "shawarma" ? "#f59e0b" : "#10b981"

      // Revenue bar
      const grad = ctx.createLinearGradient(padL, 0, padL + barW, 0)
      grad.addColorStop(0, color)
      grad.addColorStop(1, `${color}88`)
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.roundRect(padL, y, barW, barH * 0.55, 4)
      ctx.fill()

      // Cost bar
      ctx.fillStyle = "rgba(239,68,68,0.4)"
      ctx.beginPath()
      ctx.roundRect(padL, y + barH * 0.6, costW, barH * 0.35, 3)
      ctx.fill()

      // Label
      ctx.fillStyle = "#e4e4e7"
      ctx.font = "11px sans-serif"
      ctx.textAlign = "right"
      const label = item.name.length > 18 ? item.name.slice(0, 16) + "…" : item.name
      ctx.fillText(label, padL - 8, y + barH * 0.35)

      // Value
      ctx.fillStyle = color
      ctx.textAlign = "left"
      ctx.font = "bold 11px sans-serif"
      ctx.fillText(`${item.revenue} JOD`, padL + barW + 4, y + barH * 0.35)
    })

    // Legend
    ctx.fillStyle = "#f59e0b"
    ctx.fillRect(padL, height - 14, 10, 8)
    ctx.fillStyle = "#a1a1aa"
    ctx.font = "10px sans-serif"
    ctx.textAlign = "left"
    ctx.fillText("Revenue", padL + 14, height - 7)
    ctx.fillStyle = "rgba(239,68,68,0.6)"
    ctx.fillRect(padL + 80, height - 14, 10, 8)
    ctx.fillStyle = "#a1a1aa"
    ctx.fillText("Food Cost", padL + 94, height - 7)
  }, [items, location])

  return <canvas ref={canvasRef} width={700} height={280} className="w-full h-full" />
}

interface DonutChartProps {
  shawarmaRev: number
  beanRev: number
}

function DonutChart({ shawarmaRev, beanRev }: DonutChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const w = canvas.width
    const h = canvas.height
    ctx.clearRect(0, 0, w, h)
    const total = shawarmaRev + beanRev
    const cx = w / 2, cy = h / 2
    const outer = Math.min(w, h) * 0.42
    const inner = outer * 0.58

    const drawArc = (start: number, end: number, color: string) => {
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.arc(cx, cy, outer, start, end)
      ctx.closePath()
      const grad = ctx.createRadialGradient(cx, cy, inner, cx, cy, outer)
      grad.addColorStop(0, `${color}cc`)
      grad.addColorStop(1, color)
      ctx.fillStyle = grad
      ctx.fill()
    }

    const s1 = -Math.PI / 2
    const e1 = s1 + (shawarmaRev / total) * 2 * Math.PI
    drawArc(s1, e1, "#f59e0b")
    drawArc(e1, s1 + 2 * Math.PI, "#10b981")

    // Donut hole
    ctx.beginPath()
    ctx.arc(cx, cy, inner, 0, Math.PI * 2)
    ctx.fillStyle = "#18181b"
    ctx.fill()

    // Center text
    ctx.fillStyle = "#f4f4f5"
    ctx.font = "bold 15px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText("Total", cx, cy - 8)
    ctx.font = "bold 13px sans-serif"
    ctx.fillStyle = "#a1a1aa"
    ctx.fillText(`${total.toLocaleString()}`, cx, cy + 12)
    ctx.font = "10px sans-serif"
    ctx.fillText("JOD", cx, cy + 28)
  }, [shawarmaRev, beanRev])

  return <canvas ref={canvasRef} width={200} height={200} className="w-full h-full" />
}

export default function SalesAnalyticsPage() {
  const [location, setLocation] = useState<Location>("all")
  const [period, setPeriod] = useState<Period>("daily")
  const [activeTab, setActiveTab] = useState<"overview" | "comparison" | "items" | "margins">("overview")

  const periodData = getPeriodData(DAILY_DATA, period === "daily" ? "daily" : period === "weekly" ? "weekly" : "monthly")

  const totalShawarma = DAILY_DATA.reduce((a, b) => a + b.shawarma, 0)
  const totalBean = DAILY_DATA.reduce((a, b) => a + b.bean, 0)
  const totalRev = totalShawarma + totalBean

  const prevShawarma = Math.floor
"use client"

import { useState, useEffect } from "react"

type Location = "shawarma" | "beancorner" | "combined"

interface Order {
  id: string
  item: string
  status: "preparing" | "ready" | "delivered"
  time: string
  amount: number
}

interface StockAlert {
  item: string
  current: number
  minimum: number
  unit: string
}

interface DailyRevenue {
  day: string
  shawarma: number
  beancorner: number
}

interface TopProduct {
  name: string
  shawarma: number
  beancorner: number
  emoji: string
}

interface CategoryRevenue {
  category: string
  shawarma: number
  beancorner: number
  color: string
}

const dailyRevenueData: DailyRevenue[] = [
  { day: "1", shawarma: 820, beancorner: 340 },
  { day: "2", shawarma: 950, beancorner: 420 },
  { day: "3", shawarma: 780, beancorner: 380 },
  { day: "4", shawarma: 1100, beancorner: 510 },
  { day: "5", shawarma: 1250, beancorner: 590 },
  { day: "6", shawarma: 1420, beancorner: 680 },
  { day: "7", shawarma: 1380, beancorner: 720 },
  { day: "8", shawarma: 890, beancorner: 390 },
  { day: "9", shawarma: 760, beancorner: 310 },
  { day: "10", shawarma: 980, beancorner: 450 },
  { day: "11", shawarma: 1050, beancorner: 490 },
  { day: "12", shawarma: 1180, beancorner: 550 },
  { day: "13", shawarma: 1300, beancorner: 620 },
  { day: "14", shawarma: 1450, beancorner: 700 },
  { day: "15", shawarma: 1520, beancorner: 750 },
  { day: "16", shawarma: 1100, beancorner: 480 },
  { day: "17", shawarma: 930, beancorner: 410 },
  { day: "18", shawarma: 1020, beancorner: 470 },
  { day: "19", shawarma: 1150, beancorner: 530 },
  { day: "20", shawarma: 1280, beancorner: 600 },
  { day: "21", shawarma: 1400, beancorner: 660 },
  { day: "22", shawarma: 1480, beancorner: 710 },
  { day: "23", shawarma: 1100, beancorner: 500 },
  { day: "24", shawarma: 880, beancorner: 370 },
  { day: "25", shawarma: 1050, beancorner: 460 },
  { day: "26", shawarma: 1200, beancorner: 560 },
  { day: "27", shawarma: 1350, beancorner: 640 },
  { day: "28", shawarma: 1500, beancorner: 730 },
  { day: "29", shawarma: 1620, beancorner: 780 },
  { day: "30", shawarma: 1750, beancorner: 820 },
]

const topProducts: TopProduct[] = [
  { name: "Chicken Shawarma", shawarma: 342, beancorner: 0, emoji: "🌯" },
  { name: "Mixed Shawarma", shawarma: 289, beancorner: 0, emoji: "🥙" },
  { name: "Cappuccino", shawarma: 0, beancorner: 267, emoji: "☕" },
  { name: "Falafel Wrap", shawarma: 198, beancorner: 0, emoji: "🧆" },
  { name: "Cold Brew", shawarma: 0, beancorner: 214, emoji: "🧋" },
  { name: "Hummus Plate", shawarma: 156, beancorner: 0, emoji: "🫓" },
  { name: "Flat White", shawarma: 0, beancorner: 189, emoji: "☕" },
  { name: "Fattoush Salad", shawarma: 134, beancorner: 0, emoji: "🥗" },
]

const categoryData: CategoryRevenue[] = [
  { category: "Shawarma & Wraps", shawarma: 18400, beancorner: 0, color: "#f59e0b" },
  { category: "Sides & Salads", shawarma: 6200, beancorner: 0, color: "#ef4444" },
  { category: "Hot Drinks", shawarma: 0, beancorner: 8900, color: "#6366f1" },
  { category: "Cold Drinks", shawarma: 0, beancorner: 5400, color: "#22d3ee" },
  { category: "Pastries & Snacks", shawarma: 2100, beancorner: 3200, color: "#a78bfa" },
  { category: "Combos", shawarma: 4800, beancorner: 1200, color: "#34d399" },
]

const shawarmaOrders: Order[] = [
  { id: "SH-1042", item: "Mixed Shawarma + Fries", status: "preparing", time: "2 min ago", amount: 8.5 },
  { id: "SH-1041", item: "Chicken Shawarma x3", status: "ready", time: "8 min ago", amount: 18.0 },
  { id: "SH-1040", item: "Falafel Wrap + Hummus", status: "delivered", time: "15 min ago", amount: 11.5 },
  { id: "SH-1039", item: "Beef Shawarma Platter", status: "delivered", time: "22 min ago", amount: 14.0 },
  { id: "SH-1038", item: "Fattoush + Pita Bread", status: "delivered", time: "31 min ago", amount: 7.5 },
]

const beancornerOrders: Order[] = [
  { id: "BC-0891", item: "Cappuccino + Croissant", status: "preparing", time: "1 min ago", amount: 6.5 },
  { id: "BC-0890", item: "Cold Brew x2 + Muffin", status: "ready", time: "5 min ago", amount: 12.0 },
  { id: "BC-0889", item: "Flat White + Danish", status: "delivered", time: "18 min ago", amount: 8.0 },
  { id: "BC-0888", item: "Iced Latte + Brownie", status: "delivered", time: "25 min ago", amount: 9.5 },
  { id: "BC-0887", item: "Espresso x2", status: "delivered", time: "38 min ago", amount: 5.0 },
]

const shawarmaStock: StockAlert[] = [
  { item: "Chicken Breast", current: 4, minimum: 10, unit: "kg" },
  { item: "Pita Bread", current: 30, minimum: 50, unit: "pcs" },
  { item: "Tahini Sauce", current: 2, minimum: 5, unit: "L" },
]

const beancornerStock: StockAlert[] = [
  { item: "Espresso Beans", current: 1.5, minimum: 5, unit: "kg" },
  { item: "Oat Milk", current: 3, minimum: 8, unit: "L" },
  { item: "Croissants", current: 6, minimum: 15, unit: "pcs" },
]

function MiniLineChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const width = 200
  const height = 60
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((v - min) / range) * height
    return `${x},${y}`
  }).join(" ")

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function RevenueLineChart({ location, data }: { location: Location; data: DailyRevenue[] }) {
  const maxVal = Math.max(...data.map(d => location === "combined" ? d.shawarma + d.beancorner : location === "shawarma" ? d.shawarma : d.beancorner))
  const height = 180
  const width = 700
  const pad = 40

  const getY = (val: number) => height - pad - ((val / (maxVal * 1.1)) * (height - pad))

  const shawarmaPoints = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * (width - pad * 2)
    const y = getY(d.shawarma)
    return `${x},${y}`
  }).join(" ")

  const beancornerPoints = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * (width - pad * 2)
    const y = getY(d.beancorner)
    return `${x},${y}`
  }).join(" ")

  const combinedPoints = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * (width - pad * 2)
    const y = getY(d.shawarma + d.beancorner)
    return `${x},${y}`
  }).join(" ")

  const labels = ["1", "6", "11", "16", "21", "26", "30"]
  const labelIndices = [0, 5, 10, 15, 20, 25, 29]

  return (
    <svg width="100%" height={height + 20} viewBox={`0 0 ${width} ${height + 20}`} preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="amberGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="indigoGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
      </defs>

      {[0.25, 0.5, 0.75, 1].map((pct) => (
        <line
          key={pct}
          x1={pad}
          x2={width - pad}
          y1={getY(maxVal * 1.1 * pct)}
          y2={getY(maxVal * 1.1 * pct)}
          stroke="#3f3f46"
          strokeWidth="1"
          strokeDasharray="4,4"
        />
      ))}

      {labelIndices.map((idx, i) => {
        const x = pad + (idx / (data.length - 1)) * (width - pad * 2)
        return (
          <text key={i} x={x} y={height + 15} textAnchor="middle" fill="#71717a" fontSize="10">
            Day {labels[i]}
          </text>
        )
      })}

      {(location === "shawarma" || location === "combined") && (
        <>
          <polygon
            points={`${shawarmaPoints} ${width - pad},${height - pad} ${pad},${height - pad}`}
            fill="url(#amberGrad)"
          />
          <polyline
            points={shawarmaPoints}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
      {(location === "beancorner" || location === "combined") && (
        <>
          <polygon
            points={`${beancornerPoints} ${width - pad},${height - pad} ${pad},${height - pad}`}
            fill="url(#indigoGrad)"
          />
          <polyline
            points={beancornerPoints}
            fill="none"
            stroke="#6366f1"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
      {location === "combined" && (
        <polyline
          points={combinedPoints}
          fill="none"
          stroke="#10b981"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="6,3"
        />
      )}
    </svg>
  )
}

function TopProductsBar({ location, products }: { location: Location; products: TopProduct[] }) {
  const filtered = products.filter(p => {
    if (location === "combined") return (p.shawarma + p.beancorner) > 0
    if (location === "shawarma") return p.shawarma > 0
    return p.beancorner > 0
  })

  const getVal = (p: TopProduct) => {
    if (location === "combined") return p.shawarma + p.beancorner
    if (location === "shawarma") return p.shawarma
    return p.beancorner
  }

  const maxVal = Math.max(...filtered.map(getVal))

  const getColor = (p: TopProduct) => {
    if (location === "combined") return p.shawarma > 0 ? "#f59e0b" : "#6366f1"
    if
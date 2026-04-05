"use client"

import { useState, useMemo } from "react"

type Location = "shawarma-house" | "bean-corner"

interface MenuItem {
  id: string
  name: string
  nameAr: string
  category: string
  sellingPrice: number
  foodCost: number
  location: Location
  active: boolean
  emoji: string
}

const initialMenuItems: MenuItem[] = [
  { id: "1", name: "Classic Shawarma", nameAr: "شاورما كلاسيك", category: "Shawarma", sellingPrice: 3.5, foodCost: 1.2, location: "shawarma-house", active: true, emoji: "🌯" },
  { id: "2", name: "Chicken Shawarma Plate", nameAr: "طبق شاورما دجاج", category: "Plates", sellingPrice: 6.0, foodCost: 2.1, location: "shawarma-house", active: true, emoji: "🍽️" },
  { id: "3", name: "Mixed Grill Plate", nameAr: "طبق مشاوي مشكلة", category: "Plates", sellingPrice: 8.5, foodCost: 3.4, location: "shawarma-house", active: true, emoji: "🥩" },
  { id: "4", name: "Falafel Wrap", nameAr: "فلافل لفة", category: "Wraps", sellingPrice: 2.5, foodCost: 0.6, location: "shawarma-house", active: true, emoji: "🧆" },
  { id: "5", name: "Hummus Bowl", nameAr: "طبق حمص", category: "Sides", sellingPrice: 2.0, foodCost: 0.5, location: "shawarma-house", active: true, emoji: "🥙" },
  { id: "6", name: "Meat Shawarma Sandwich", nameAr: "ساندويش شاورما لحم", category: "Shawarma", sellingPrice: 4.0, foodCost: 1.7, location: "shawarma-house", active: false, emoji: "🌯" },
  { id: "7", name: "Fattoush Salad", nameAr: "سلطة فتوش", category: "Sides", sellingPrice: 2.5, foodCost: 0.8, location: "shawarma-house", active: true, emoji: "🥗" },
  { id: "8", name: "Garlic Sauce", nameAr: "صلصة ثوم", category: "Extras", sellingPrice: 0.5, foodCost: 0.1, location: "shawarma-house", active: true, emoji: "🧄" },
  { id: "9", name: "Espresso", nameAr: "إسبريسو", category: "Coffee", sellingPrice: 2.0, foodCost: 0.4, location: "bean-corner", active: true, emoji: "☕" },
  { id: "10", name: "Cappuccino", nameAr: "كابتشينو", category: "Coffee", sellingPrice: 3.0, foodCost: 0.7, location: "bean-corner", active: true, emoji: "☕" },
  { id: "11", name: "Flat White", nameAr: "فلات وايت", category: "Coffee", sellingPrice: 3.5, foodCost: 0.9, location: "bean-corner", active: true, emoji: "☕" },
  { id: "12", name: "Cold Brew", nameAr: "كولد برو", category: "Cold Drinks", sellingPrice: 4.0, foodCost: 1.0, location: "bean-corner", active: true, emoji: "🧊" },
  { id: "13", name: "Matcha Latte", nameAr: "ماتشا لاتيه", category: "Specialty", sellingPrice: 4.5, foodCost: 1.4, location: "bean-corner", active: true, emoji: "🍵" },
  { id: "14", name: "Croissant", nameAr: "كرواسون", category: "Food", sellingPrice: 2.5, foodCost: 0.9, location: "bean-corner", active: true, emoji: "🥐" },
  { id: "15", name: "Avocado Toast", nameAr: "توست أفوكادو", category: "Food", sellingPrice: 5.0, foodCost: 1.8, location: "bean-corner", active: false, emoji: "🥑" },
  { id: "16", name: "Cheesecake Slice", nameAr: "تشيزكيك", category: "Desserts", sellingPrice: 3.5, foodCost: 1.1, location: "bean-corner", active: true, emoji: "🍰" },
]

const LOCATION_CONFIG = {
  "shawarma-house": {
    label: "Shawarma House",
    labelAr: "شاورما هاوس",
    accent: "amber",
    bgClass: "from-amber-900/30 to-zinc-950",
    borderClass: "border-amber-500/30",
    badgeClass: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
    activeClass: "bg-amber-500",
    buttonClass: "bg-amber-500 hover:bg-amber-600",
    tabActive: "bg-amber-500 text-zinc-950",
    tabInactive: "text-amber-400 hover:bg-amber-500/10",
    emoji: "🌯",
    headerGlow: "shadow-amber-500/20",
  },
  "bean-corner": {
    label: "Bean Corner Coffee Shop",
    labelAr: "بين كورنر",
    accent: "emerald",
    bgClass: "from-emerald-900/30 to-zinc-950",
    borderClass: "border-emerald-500/30",
    badgeClass: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
    activeClass: "bg-emerald-500",
    buttonClass: "bg-emerald-500 hover:bg-emerald-600",
    tabActive: "bg-emerald-500 text-zinc-950",
    tabInactive: "text-emerald-400 hover:bg-emerald-500/10",
    emoji: "☕",
    headerGlow: "shadow-emerald-500/20",
  },
}

const MARGIN_THRESHOLDS = {
  excellent: 70,
  good: 50,
  fair: 35,
}

function getMarginColor(margin: number) {
  if (margin >= MARGIN_THRESHOLDS.excellent) return { text: "text-emerald-400", bg: "bg-emerald-500", label: "Excellent" }
  if (margin >= MARGIN_THRESHOLDS.good) return { text: "text-amber-400", bg: "bg-amber-500", label: "Good" }
  if (margin >= MARGIN_THRESHOLDS.fair) return { text: "text-orange-400", bg: "bg-orange-500", label: "Fair" }
  return { text: "text-red-400", bg: "bg-red-500", label: "Low" }
}

function calcMargin(selling: number, cost: number) {
  if (selling <= 0) return 0
  return ((selling - cost) / selling) * 100
}

function CircularProgress({ value, size = 56, strokeWidth = 5, color }: { value: number; size?: number; strokeWidth?: number; color: string }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#27272a" strokeWidth={strokeWidth} />
      <circle
        cx={size / 2} cy={size / 2} r={radius} fill="none"
        stroke={color === "emerald" ? "#10b981" : color === "amber" ? "#f59e0b" : color === "orange" ? "#f97316" : "#ef4444"}
        strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset}
        strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.5s ease" }}
      />
    </svg>
  )
}

interface AddItemModalProps {
  location: Location
  onClose: () => void
  onAdd: (item: Omit<MenuItem, "id">) => void
  categories: string[]
}

function AddItemModal({ location, onClose, onAdd, categories }: AddItemModalProps) {
  const config = LOCATION_CONFIG[location]
  const [form, setForm] = useState({
    name: "", nameAr: "", category: categories[0] || "", customCategory: "",
    sellingPrice: "", foodCost: "", emoji: "🍽️", active: true,
  })
  const [useCustomCategory, setUseCustomCategory] = useState(false)

  const selling = parseFloat(form.sellingPrice) || 0
  const cost = parseFloat(form.foodCost) || 0
  const margin = calcMargin(selling, cost)
  const marginInfo = getMarginColor(margin)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || selling <= 0 || cost < 0) return
    onAdd({
      name: form.name, nameAr: form.nameAr,
      category: useCustomCategory ? form.customCategory : form.category,
      sellingPrice: selling, foodCost: cost,
      location, active: form.active, emoji: form.emoji,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl">
        <div className={`bg-gradient-to-r ${config.bgClass} p-6 rounded-t-2xl border-b border-zinc-800`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Add Menu Item</h2>
              <p className="text-sm text-zinc-400 mt-0.5">{config.emoji} {config.label}</p>
            </div>
            <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors text-2xl leading-none">✕</button>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Item Name (EN) *</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-zinc-500"
                placeholder="e.g. Shawarma Wrap" required />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Item Name (AR)</label>
              <input value={form.nameAr} onChange={e => setForm(p => ({ ...p, nameAr: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-zinc-500 text-right"
                placeholder="الاسم بالعربي" dir="rtl" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Emoji Icon</label>
              <input value={form.emoji} onChange={e => setForm(p => ({ ...p, emoji: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm text-center focus:outline-none focus:border-zinc-500"
                maxLength={2} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-zinc-400 mb-1.5">Category</label>
              {useCustomCategory ? (
                <div className="flex gap-2">
                  <input value={form.customCategory} onChange={e => setForm(p => ({ ...p, customCategory: e.target.value }))}
                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-zinc-500"
                    placeholder="New category" />
                  <button type="button" onClick={() => setUseCustomCategory(false)} className="text-zinc-500 hover:text-white text-xs">← Back</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-zinc-500">
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <button type="button" onClick={() => setUseCustomCategory(true)} className="text-xs text-zinc-400 hover:text-white whitespace-nowrap">+ New</button>
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Selling Price (JOD) *</label>
              <input type="number" step="0.01" min="0" value={form.sellingPrice} onChange={e => setForm(p => ({ ...p, sellingPrice: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-zinc-500"
                placeholder="0.00" required />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Est. Food Cost (JOD) *</label>
              <input type="number" step="0.01" min="0" value={form.foodCost} onChange={e => setForm(p => ({ ...p, foodCost: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-zinc-500"
                placeholder="0.00" required />
            </div>
          </div>
          {selling >
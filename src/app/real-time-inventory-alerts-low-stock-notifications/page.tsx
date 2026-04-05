"use client"

import { useState, useEffect, useCallback } from "react"

type Location = "shawarma" | "beancorner" | "all"
type Category = "meat" | "bread" | "sauces" | "vegetables" | "coffee" | "dairy" | "supplies" | "beverages"
type AlertLevel = "critical" | "warning" | "ok"

interface IngredientItem {
  id: string
  name: string
  sku: string
  category: Category
  location: "shawarma" | "beancorner" | "both"
  qty: number
  unit: string
  reorderLevel: number
  reorderQty: number
  costPerUnit: number
  supplier: string
  lastUpdated: string
}

interface StockAdjustment {
  id: string
  itemId: string
  type: "add" | "remove"
  qty: number
  reason: string
  timestamp: string
  user: string
}

interface Notification {
  id: string
  itemId: string
  itemName: string
  location: string
  level: AlertLevel
  message: string
  timestamp: string
  acknowledged: boolean
}

const initialItems: IngredientItem[] = [
  { id: "1", name: "Chicken Thighs", sku: "SH-MEAT-001", category: "meat", location: "shawarma", qty: 8, unit: "kg", reorderLevel: 15, reorderQty: 30, costPerUnit: 7.5, supplier: "Al-Madina Meats", lastUpdated: "2024-01-15 08:30" },
  { id: "2", name: "Lamb Cuts", sku: "SH-MEAT-002", category: "meat", location: "shawarma", qty: 4, unit: "kg", reorderLevel: 10, reorderQty: 20, costPerUnit: 12.0, supplier: "Al-Madina Meats", lastUpdated: "2024-01-15 08:30" },
  { id: "3", name: "Shawarma Bread", sku: "SH-BREAD-001", category: "bread", location: "shawarma", qty: 120, unit: "pcs", reorderLevel: 100, reorderQty: 300, costPerUnit: 0.25, supplier: "Jordan Bakery", lastUpdated: "2024-01-15 09:00" },
  { id: "4", name: "Garlic Sauce", sku: "SH-SAUCE-001", category: "sauces", location: "shawarma", qty: 6, unit: "L", reorderLevel: 5, reorderQty: 15, costPerUnit: 3.5, supplier: "Local Supplier", lastUpdated: "2024-01-15 07:45" },
  { id: "5", name: "Tahini Paste", sku: "SH-SAUCE-002", category: "sauces", location: "shawarma", qty: 3, unit: "kg", reorderLevel: 4, reorderQty: 10, costPerUnit: 5.0, supplier: "Nabulsi Foods", lastUpdated: "2024-01-14 16:00" },
  { id: "6", name: "Tomatoes", sku: "SH-VEG-001", category: "vegetables", location: "both", qty: 25, unit: "kg", reorderLevel: 10, reorderQty: 20, costPerUnit: 1.2, supplier: "Fresh Market", lastUpdated: "2024-01-15 07:00" },
  { id: "7", name: "Pickles", sku: "SH-VEG-002", category: "vegetables", location: "shawarma", qty: 12, unit: "kg", reorderLevel: 8, reorderQty: 15, costPerUnit: 2.0, supplier: "Local Supplier", lastUpdated: "2024-01-14 12:00" },
  { id: "8", name: "Espresso Beans", sku: "BC-COFFEE-001", category: "coffee", location: "beancorner", qty: 3, unit: "kg", reorderLevel: 5, reorderQty: 15, costPerUnit: 18.0, supplier: "Ethiopian Roasters", lastUpdated: "2024-01-15 06:30" },
  { id: "9", name: "Specialty Blend", sku: "BC-COFFEE-002", category: "coffee", location: "beancorner", qty: 7, unit: "kg", reorderLevel: 4, reorderQty: 12, costPerUnit: 22.0, supplier: "Colombian Imports", lastUpdated: "2024-01-14 18:00" },
  { id: "10", name: "Whole Milk", sku: "BC-DAIRY-001", category: "dairy", location: "beancorner", qty: 15, unit: "L", reorderLevel: 20, reorderQty: 40, costPerUnit: 1.1, supplier: "Jordan Dairy", lastUpdated: "2024-01-15 07:15" },
  { id: "11", name: "Oat Milk", sku: "BC-DAIRY-002", category: "dairy", location: "beancorner", qty: 6, unit: "L", reorderLevel: 8, reorderQty: 20, costPerUnit: 2.8, supplier: "Health Foods JO", lastUpdated: "2024-01-15 07:15" },
  { id: "12", name: "Coffee Cups (12oz)", sku: "BC-SUP-001", category: "supplies", location: "beancorner", qty: 180, unit: "pcs", reorderLevel: 200, reorderQty: 500, costPerUnit: 0.15, supplier: "Packaging Co.", lastUpdated: "2024-01-14 14:00" },
  { id: "13", name: "Caramel Syrup", sku: "BC-BEV-001", category: "beverages", location: "beancorner", qty: 4, unit: "bottles", reorderLevel: 3, reorderQty: 10, costPerUnit: 6.5, supplier: "Monin Jordan", lastUpdated: "2024-01-14 10:00" },
  { id: "14", name: "Vanilla Syrup", sku: "BC-BEV-002", category: "beverages", location: "beancorner", qty: 2, unit: "bottles", reorderLevel: 3, reorderQty: 10, costPerUnit: 6.5, supplier: "Monin Jordan", lastUpdated: "2024-01-14 10:00" },
  { id: "15", name: "Onions", sku: "SH-VEG-003", category: "vegetables", location: "both", qty: 30, unit: "kg", reorderLevel: 12, reorderQty: 25, costPerUnit: 0.8, supplier: "Fresh Market", lastUpdated: "2024-01-15 07:00" },
  { id: "16", name: "Hot Sauce", sku: "SH-SAUCE-003", category: "sauces", location: "shawarma", qty: 8, unit: "L", reorderLevel: 4, reorderQty: 12, costPerUnit: 4.0, supplier: "Local Supplier", lastUpdated: "2024-01-14 16:00" },
]

const categoryColors: Record<Category, string> = {
  meat: "bg-red-900/40 text-red-300 border-red-800",
  bread: "bg-amber-900/40 text-amber-300 border-amber-800",
  sauces: "bg-orange-900/40 text-orange-300 border-orange-800",
  vegetables: "bg-green-900/40 text-green-300 border-green-800",
  coffee: "bg-yellow-900/40 text-yellow-300 border-yellow-800",
  dairy: "bg-blue-900/40 text-blue-300 border-blue-800",
  supplies: "bg-purple-900/40 text-purple-300 border-purple-800",
  beverages: "bg-pink-900/40 text-pink-300 border-pink-800",
}

const categoryIcons: Record<Category, string> = {
  meat: "🥩",
  bread: "🫓",
  sauces: "🫙",
  vegetables: "🥗",
  coffee: "☕",
  dairy: "🥛",
  supplies: "📦",
  beverages: "🧃",
}

function getAlertLevel(item: IngredientItem): AlertLevel {
  const ratio = item.qty / item.reorderLevel
  if (ratio <= 0.5) return "critical"
  if (ratio <= 1.0) return "warning"
  return "ok"
}

function getAlertStyle(level: AlertLevel) {
  if (level === "critical") return "bg-red-950/50 border-red-700 text-red-300"
  if (level === "warning") return "bg-amber-950/50 border-amber-700 text-amber-300"
  return "bg-zinc-900 border-zinc-800 text-zinc-300"
}

export default function InventoryAlertsPage() {
  const [items, setItems] = useState<IngredientItem[]>(initialItems)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([])
  const [selectedLocation, setSelectedLocation] = useState<Location>("all")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"dashboard" | "inventory" | "alerts" | "history">("dashboard")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAdjustModal, setShowAdjustModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<IngredientItem | null>(null)
  const [showNotifPanel, setShowNotifPanel] = useState(false)

  const [formData, setFormData] = useState<Partial<IngredientItem>>({})
  const [adjustData, setAdjustData] = useState({ type: "add" as "add" | "remove", qty: 0, reason: "" })

  const generateNotifications = useCallback((itemList: IngredientItem[]) => {
    const notifs: Notification[] = []
    itemList.forEach(item => {
      const level = getAlertLevel(item)
      if (level !== "ok") {
        const locName = item.location === "shawarma" ? "Shawarma House" : item.location === "beancorner" ? "Bean Corner" : "Both Locations"
        notifs.push({
          id: `notif-${item.id}`,
          itemId: item.id,
          itemName: item.name,
          location: locName,
          level,
          message: level === "critical"
            ? `CRITICAL: ${item.name} is at ${item.qty} ${item.unit} — only ${Math.round((item.qty / item.reorderLevel) * 100)}% of reorder threshold. Immediate reorder needed!`
            : `LOW STOCK: ${item.name} is at ${item.qty} ${item.unit} — below reorder level of ${item.reorderLevel} ${item.unit}.`,
          timestamp: new Date().toLocaleString(),
          acknowledged: false,
        })
      }
    })
    setNotifications(notifs)
  }, [])

  useEffect(() => {
    generateNotifications(items)
  }, [items, generateNotifications])

  const filteredItems = items.filter(item => {
    const matchesLocation = selectedLocation === "all" || item.location === selectedLocation || item.location === "both"
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesLocation && matchesCategory && matchesSearch
  })

  const criticalItems = items.filter(i => getAlertLevel(i) === "critical")
  const warningItems = items.filter(i => getAlertLevel(i) === "warning")
  const totalValue = items.reduce((sum, item) => sum + item.qty * item.costPerUnit, 0)
  const reorderItems = items.filter(i => getAlertLevel(i) !== "ok")
  const unacknowledgedNotifs = notifications.filter(n => !n.acknowledged)

  const handleAddItem = () => {
    if (!formData.name || !formData.sku) return
    const newItem: IngredientItem = {
      id: Date.now().toString(),
      name: formData.name || "",
      sku: formData.sku || "",
      category: (formData.category as Category) || "vegetables",
      location: (formData.location as any) || "shawarma",
      qty: Number(formData.qty) || 0,
      unit: formData.unit || "kg",
      reorderLevel: Number(formData.reorderLevel) || 10,
      reorderQty: Number(formData.reorderQty) || 20,
      costPerUnit: Number(formData.costPerUnit) || 0,
      supplier: formData.supplier || "",
      lastUpdated: new Date().toLocaleString(),
    }
    setItems(prev => [...prev, newItem])
    setFormData({})
    setShowAddModal(false)
  }

  const handleEditItem = () => {
    if (!selectedItem) return
    setItems(prev => prev.map(item =>
      item.id === selectedItem.id
        ? { ...item, ...formData, lastUpdated: new Date().toLocaleString() }
        : item
    ))
    setShowEditModal(false)
    setSelectedItem(null)
    setFormData({})
  }

  const handleAdjustStock = () => {
    if (!selectedItem || adjustData.qty <= 0) return
    const newQty = adjustData.type === "add"
      ? selectedItem.qty + adjustData.qty
      : Math.max(0, selectedItem.qty - adjustData.qty)

    setItems(prev => prev.map(item =>
      item.id === selectedItem.id
        ? { ...item, qty: newQty, lastUpdated: new Date().toLocaleString() }
        : item
    ))

    const adj: StockAdjustment = {
      id: Date.now().toString(),
      itemId: selectedItem.id,
      type: adjustData.type,
      qty: adjustData.qty,
      reason: adjustData.reason,
      timestamp: new Date().toLocaleString(),
      user: "Admin",
    }
    setAdjustments(prev => [adj, ...prev])
    setShowAdjustModal(false)
    setSelectedItem(null)
    setAdjustData({ type: "add", qty: 0, reason: "" })
  }

  const acknowledgeNotification = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, acknowledged: true } : n))
  }

  const acknowledgeAll = () => {
    setNotifications(prev => prev.map(n => ({ ...n, acknowledged: true })))
  }

  const openEdit = (item: IngredientItem) => {
    setSelectedItem(item)
    setFormData({ ...item })
    setShowEditModal(true)
  }

  const openAdjust = (item: IngredientItem) => {
    setSelectedItem(item)
    setAdjustData({ type:
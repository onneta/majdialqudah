"use client"

import { useState, useEffect, useMemo } from "react"

type Location = "Shawarma House" | "Bean Corner" | "Both"
type Category = "Meat & Protein" | "Vegetables" | "Spices & Sauces" | "Bread & Grains" | "Dairy" | "Coffee & Beverages" | "Packaging" | "Cleaning Supplies"

interface IngredientItem {
  id: string
  name: string
  sku: string
  category: Category
  location: Location
  qty: number
  unit: string
  reorderLevel: number
  costPerUnit: number
  sellPrice: number
  supplier: string
  lastUpdated: string
  expiryDate?: string
  dailyUsage: number
}

interface StockAdjustment {
  id: string
  itemId: string
  itemName: string
  location: Location
  type: "add" | "remove" | "waste"
  qty: number
  reason: string
  timestamp: string
  user: string
}

interface Alert {
  id: string
  itemId: string
  itemName: string
  location: Location
  type: "low_stock" | "expiring" | "out_of_stock"
  message: string
  timestamp: string
}

const INITIAL_INVENTORY: IngredientItem[] = [
  { id: "1", name: "Chicken Breast", sku: "SH-MEAT-001", category: "Meat & Protein", location: "Shawarma House", qty: 12, unit: "kg", reorderLevel: 20, costPerUnit: 8.5, sellPrice: 0, supplier: "Al-Amal Farms", lastUpdated: "2024-01-15", expiryDate: "2024-01-18", dailyUsage: 15 },
  { id: "2", name: "Lamb Meat", sku: "SH-MEAT-002", category: "Meat & Protein", location: "Shawarma House", qty: 8, unit: "kg", reorderLevel: 15, costPerUnit: 14.0, sellPrice: 0, supplier: "Al-Amal Farms", lastUpdated: "2024-01-15", expiryDate: "2024-01-17", dailyUsage: 10 },
  { id: "3", name: "Shawarma Bread (Khubz)", sku: "SH-BREAD-001", category: "Bread & Grains", location: "Shawarma House", qty: 200, unit: "pcs", reorderLevel: 100, costPerUnit: 0.15, sellPrice: 0, supplier: "Al-Noor Bakery", lastUpdated: "2024-01-15", expiryDate: "2024-01-16", dailyUsage: 150 },
  { id: "4", name: "Garlic Paste", sku: "SH-SAUCE-001", category: "Spices & Sauces", location: "Shawarma House", qty: 5, unit: "kg", reorderLevel: 3, costPerUnit: 4.0, sellPrice: 0, supplier: "Local Supplier", lastUpdated: "2024-01-14", dailyUsage: 2 },
  { id: "5", name: "Tahini Sauce", sku: "SH-SAUCE-002", category: "Spices & Sauces", location: "Both", qty: 18, unit: "kg", reorderLevel: 8, costPerUnit: 5.5, sellPrice: 0, supplier: "Nabulsi Foods", lastUpdated: "2024-01-15", dailyUsage: 3 },
  { id: "6", name: "Tomatoes", sku: "SH-VEG-001", category: "Vegetables", location: "Shawarma House", qty: 7, unit: "kg", reorderLevel: 10, costPerUnit: 1.2, sellPrice: 0, supplier: "Green Valley", lastUpdated: "2024-01-15", expiryDate: "2024-01-17", dailyUsage: 8 },
  { id: "7", name: "Parsley", sku: "SH-VEG-002", category: "Vegetables", location: "Shawarma House", qty: 3, unit: "kg", reorderLevel: 5, costPerUnit: 0.8, sellPrice: 0, supplier: "Green Valley", lastUpdated: "2024-01-15", expiryDate: "2024-01-17", dailyUsage: 2 },
  { id: "8", name: "Onions", sku: "SH-VEG-003", category: "Vegetables", location: "Both", qty: 25, unit: "kg", reorderLevel: 15, costPerUnit: 0.5, sellPrice: 0, supplier: "Green Valley", lastUpdated: "2024-01-14", dailyUsage: 5 },
  { id: "9", name: "Arabic Coffee Beans", sku: "BC-COF-001", category: "Coffee & Beverages", location: "Bean Corner", qty: 6, unit: "kg", reorderLevel: 10, costPerUnit: 22.0, sellPrice: 0, supplier: "Arabica Masters", lastUpdated: "2024-01-15", dailyUsage: 3 },
  { id: "10", name: "Espresso Blend", sku: "BC-COF-002", category: "Coffee & Beverages", location: "Bean Corner", qty: 14, unit: "kg", reorderLevel: 8, costPerUnit: 18.5, sellPrice: 0, supplier: "Arabica Masters", lastUpdated: "2024-01-15", dailyUsage: 4 },
  { id: "11", name: "Full Cream Milk", sku: "BC-DAIRY-001", category: "Dairy", location: "Bean Corner", qty: 40, unit: "L", reorderLevel: 30, costPerUnit: 1.8, sellPrice: 0, supplier: "Marai Dairy", lastUpdated: "2024-01-15", expiryDate: "2024-01-20", dailyUsage: 20 },
  { id: "12", name: "Oat Milk", sku: "BC-DAIRY-002", category: "Dairy", location: "Bean Corner", qty: 8, unit: "L", reorderLevel: 12, costPerUnit: 3.5, sellPrice: 0, supplier: "Oatly", lastUpdated: "2024-01-15", expiryDate: "2024-01-25", dailyUsage: 6 },
  { id: "13", name: "Vanilla Syrup", sku: "BC-SYR-001", category: "Coffee & Beverages", location: "Bean Corner", qty: 3, unit: "bottles", reorderLevel: 5, costPerUnit: 6.0, sellPrice: 0, supplier: "Monin", lastUpdated: "2024-01-13", dailyUsage: 1 },
  { id: "14", name: "Caramel Syrup", sku: "BC-SYR-002", category: "Coffee & Beverages", location: "Bean Corner", qty: 4, unit: "bottles", reorderLevel: 5, costPerUnit: 6.0, sellPrice: 0, supplier: "Monin", lastUpdated: "2024-01-13", dailyUsage: 1 },
  { id: "15", name: "Shawarma Spice Mix", sku: "SH-SPICE-001", category: "Spices & Sauces", location: "Shawarma House", qty: 2, unit: "kg", reorderLevel: 3, costPerUnit: 12.0, sellPrice: 0, supplier: "Nabulsi Foods", lastUpdated: "2024-01-12", dailyUsage: 0.5 },
  { id: "16", name: "Shawarma Wrap Foil", sku: "SH-PKG-001", category: "Packaging", location: "Shawarma House", qty: 500, unit: "pcs", reorderLevel: 300, costPerUnit: 0.05, sellPrice: 0, supplier: "Pack Co.", lastUpdated: "2024-01-10", dailyUsage: 120 },
  { id: "17", name: "Coffee Cups (Medium)", sku: "BC-PKG-001", category: "Packaging", location: "Bean Corner", qty: 150, unit: "pcs", reorderLevel: 200, costPerUnit: 0.12, sellPrice: 0, supplier: "Pack Co.", lastUpdated: "2024-01-14", dailyUsage: 80 },
  { id: "18", name: "Sugar", sku: "BC-MISC-001", category: "Coffee & Beverages", location: "Both", qty: 20, unit: "kg", reorderLevel: 10, costPerUnit: 1.0, sellPrice: 0, supplier: "Local Supplier", lastUpdated: "2024-01-14", dailyUsage: 2 },
  { id: "19", name: "Labneh", sku: "SH-DAIRY-001", category: "Dairy", location: "Shawarma House", qty: 9, unit: "kg", reorderLevel: 8, costPerUnit: 4.5, sellPrice: 0, supplier: "Marai Dairy", lastUpdated: "2024-01-15", expiryDate: "2024-01-19", dailyUsage: 4 },
  { id: "20", name: "Pickled Vegetables", sku: "SH-VEG-004", category: "Vegetables", location: "Shawarma House", qty: 15, unit: "kg", reorderLevel: 10, costPerUnit: 2.0, sellPrice: 0, supplier: "Local Supplier", lastUpdated: "2024-01-14", dailyUsage: 5 },
]

const INITIAL_ADJUSTMENTS: StockAdjustment[] = [
  { id: "a1", itemId: "1", itemName: "Chicken Breast", location: "Shawarma House", type: "remove", qty: 5, reason: "Daily order fulfillment", timestamp: "2024-01-15 14:30", user: "Ahmad" },
  { id: "a2", itemId: "9", itemName: "Arabic Coffee Beans", location: "Bean Corner", type: "waste", qty: 0.5, reason: "Expired batch", timestamp: "2024-01-15 09:15", user: "Sara" },
  { id: "a3", itemId: "3", itemName: "Shawarma Bread", location: "Shawarma House", type: "add", qty: 100, reason: "Morning delivery", timestamp: "2024-01-15 08:00", user: "Ahmad" },
  { id: "a4", itemId: "11", itemName: "Full Cream Milk", location: "Bean Corner", type: "remove", qty: 8, reason: "Daily usage", timestamp: "2024-01-15 18:00", user: "Sara" },
]

const categories: Category[] = ["Meat & Protein", "Vegetables", "Spices & Sauces", "Bread & Grains", "Dairy", "Coffee & Beverages", "Packaging", "Cleaning Supplies"]
const locations: Location[] = ["Shawarma House", "Bean Corner", "Both"]

function getDaysUntilDepletion(qty: number, dailyUsage: number): number | null {
  if (dailyUsage <= 0) return null
  return Math.floor(qty / dailyUsage)
}

function getStatusColor(item: IngredientItem): string {
  if (item.qty === 0) return "text-red-400 bg-red-950/40 border-red-800"
  if (item.qty < item.reorderLevel) return "text-amber-400 bg-amber-950/40 border-amber-800"
  return "text-emerald-400 bg-emerald-950/40 border-emerald-800"
}

function getStatusLabel(item: IngredientItem): string {
  if (item.qty === 0) return "Out of Stock"
  if (item.qty < item.reorderLevel) return "Low Stock"
  return "In Stock"
}

function getCategoryIcon(category: Category): string {
  const icons: Record<Category, string> = {
    "Meat & Protein": "🥩",
    "Vegetables": "🥬",
    "Spices & Sauces": "🧄",
    "Bread & Grains": "🫓",
    "Dairy": "🥛",
    "Coffee & Beverages": "☕",
    "Packaging": "📦",
    "Cleaning Supplies": "🧹",
  }
  return icons[category]
}

function getLocationBadge(location: Location): string {
  if (location === "Shawarma House") return "bg-amber-500/20 text-amber-300 border-amber-700"
  if (location === "Bean Corner") return "bg-emerald-500/20 text-emerald-300 border-emerald-700"
  return "bg-indigo-500/20 text-indigo-300 border-indigo-700"
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<IngredientItem[]>(INITIAL_INVENTORY)
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>(INITIAL_ADJUSTMENTS)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<Category | "All">("All")
  const [locationFilter, setLocationFilter] = useState<Location | "All">("All")
  const [activeTab, setActiveTab] = useState<"inventory" | "adjustments" | "alerts" | "insights">("inventory")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showAdjustModal, setShowAdjustModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<IngredientItem | null>(null)
  const [adjustForm, setAdjustForm] = useState({ type: "add" as "add" | "remove" | "waste", qty: 0, reason: "", user: "" })
  const [newItem, setNewItem] = useState<Partial<IngredientItem>>({ category: "Meat & Protein", location: "Shawarma House" })

  useEffect(() => {
    const newAlerts: Alert[] = []
    inventory.forEach(item => {
      if (item.qty === 0) {
        newAlerts.push({ id: `oos-${item.id}`, itemId: item.id, itemName: item.name, location: item.location, type: "out_of_stock", message: `${item.name} is completely out of stock at ${item.location}!`, timestamp: new Date().toISOString() })
      } else if (item.qty < item.reorderLevel) {
        newAlerts.push({ id: `low-${item.id}`, itemId: item.id, itemName: item.name, location: item.location, type: "low_stock", message: `${item.name} is below reorder level (${item.qty} ${item.unit} remaining, reorder at ${item.reorderLevel})`, timestamp: new Date().toISOString() })
      }
      if (item.expiryDate) {
        const daysLeft = Math.ceil((new Date(item.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        if (daysLeft <= 2 && daysLeft > 0) {
          newAlerts.push({ id: `exp-${item.id
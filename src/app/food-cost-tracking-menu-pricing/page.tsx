"use client"

import { useState, useMemo } from "react"

type Brand = "Shawarma House" | "Bean Corner"
type Category = "Main" | "Side" | "Drink" | "Dessert" | "Coffee" | "Sandwich"

interface Ingredient {
  id: string
  name: string
  unit: string
  costPerUnit: number
  category: string
  brand: Brand | "Both"
}

interface RecipeIngredient {
  ingredientId: string
  quantity: number
}

interface MenuItem {
  id: string
  name: string
  brand: Brand
  category: Category
  sellingPrice: number
  recipe: RecipeIngredient[]
  targetMargin: number
  isActive: boolean
}

const initialIngredients: Ingredient[] = [
  { id: "i1", name: "Chicken Shawarma Meat", unit: "kg", costPerUnit: 8.5, category: "Protein", brand: "Shawarma House" },
  { id: "i2", name: "Beef Shawarma Meat", unit: "kg", costPerUnit: 11.0, category: "Protein", brand: "Shawarma House" },
  { id: "i3", name: "Pita Bread", unit: "piece", costPerUnit: 0.15, category: "Bread", brand: "Shawarma House" },
  { id: "i4", name: "Tahini Sauce", unit: "kg", costPerUnit: 3.2, category: "Sauce", brand: "Shawarma House" },
  { id: "i5", name: "Garlic Sauce", unit: "kg", costPerUnit: 2.8, category: "Sauce", brand: "Shawarma House" },
  { id: "i6", name: "Mixed Vegetables", unit: "kg", costPerUnit: 1.5, category: "Vegetables", brand: "Both" },
  { id: "i7", name: "French Fries", unit: "kg", costPerUnit: 1.2, category: "Sides", brand: "Shawarma House" },
  { id: "i8", name: "Hummus Base", unit: "kg", costPerUnit: 2.0, category: "Sides", brand: "Shawarma House" },
  { id: "i9", name: "Arabica Coffee Beans", unit: "kg", costPerUnit: 22.0, category: "Coffee", brand: "Bean Corner" },
  { id: "i10", name: "Fresh Milk", unit: "liter", costPerUnit: 1.4, category: "Dairy", brand: "Bean Corner" },
  { id: "i11", name: "Oat Milk", unit: "liter", costPerUnit: 3.2, category: "Dairy", brand: "Bean Corner" },
  { id: "i12", name: "Simple Syrup", unit: "liter", costPerUnit: 0.8, category: "Sweetener", brand: "Bean Corner" },
  { id: "i13", name: "Chocolate Powder", unit: "kg", costPerUnit: 9.5, category: "Flavoring", brand: "Bean Corner" },
  { id: "i14", name: "Caramel Sauce", unit: "kg", costPerUnit: 7.0, category: "Flavoring", brand: "Bean Corner" },
  { id: "i15", name: "Croissant", unit: "piece", costPerUnit: 0.9, category: "Pastry", brand: "Bean Corner" },
  { id: "i16", name: "Disposable Cup Large", unit: "piece", costPerUnit: 0.12, category: "Packaging", brand: "Both" },
  { id: "i17", name: "Foil Wrap", unit: "piece", costPerUnit: 0.05, category: "Packaging", brand: "Shawarma House" },
  { id: "i18", name: "Pickles", unit: "kg", costPerUnit: 1.8, category: "Condiments", brand: "Shawarma House" },
]

const initialMenuItems: MenuItem[] = [
  {
    id: "m1", name: "Classic Chicken Shawarma", brand: "Shawarma House", category: "Main",
    sellingPrice: 3.5, targetMargin: 65,
    recipe: [
      { ingredientId: "i1", quantity: 0.2 },
      { ingredientId: "i3", quantity: 1 },
      { ingredientId: "i5", quantity: 0.03 },
      { ingredientId: "i18", quantity: 0.02 },
      { ingredientId: "i17", quantity: 1 },
    ],
    isActive: true,
  },
  {
    id: "m2", name: "Beef Shawarma Plate", brand: "Shawarma House", category: "Main",
    sellingPrice: 6.5, targetMargin: 60,
    recipe: [
      { ingredientId: "i2", quantity: 0.25 },
      { ingredientId: "i3", quantity: 2 },
      { ingredientId: "i4", quantity: 0.04 },
      { ingredientId: "i6", quantity: 0.1 },
      { ingredientId: "i8", quantity: 0.1 },
    ],
    isActive: true,
  },
  {
    id: "m3", name: "Shawarma Fries Combo", brand: "Shawarma House", category: "Main",
    sellingPrice: 5.0, targetMargin: 62,
    recipe: [
      { ingredientId: "i1", quantity: 0.18 },
      { ingredientId: "i3", quantity: 1 },
      { ingredientId: "i5", quantity: 0.03 },
      { ingredientId: "i7", quantity: 0.2 },
      { ingredientId: "i17", quantity: 1 },
    ],
    isActive: true,
  },
  {
    id: "m4", name: "Hummus Side", brand: "Shawarma House", category: "Side",
    sellingPrice: 2.0, targetMargin: 70,
    recipe: [
      { ingredientId: "i8", quantity: 0.15 },
      { ingredientId: "i4", quantity: 0.02 },
    ],
    isActive: true,
  },
  {
    id: "m5", name: "Espresso", brand: "Bean Corner", category: "Coffee",
    sellingPrice: 2.5, targetMargin: 72,
    recipe: [
      { ingredientId: "i9", quantity: 0.018 },
      { ingredientId: "i16", quantity: 1 },
    ],
    isActive: true,
  },
  {
    id: "m6", name: "Cappuccino", brand: "Bean Corner", category: "Coffee",
    sellingPrice: 3.5, targetMargin: 70,
    recipe: [
      { ingredientId: "i9", quantity: 0.018 },
      { ingredientId: "i10", quantity: 0.15 },
      { ingredientId: "i16", quantity: 1 },
    ],
    isActive: true,
  },
  {
    id: "m7", name: "Oat Latte", brand: "Bean Corner", category: "Coffee",
    sellingPrice: 4.5, targetMargin: 68,
    recipe: [
      { ingredientId: "i9", quantity: 0.018 },
      { ingredientId: "i11", quantity: 0.2 },
      { ingredientId: "i12", quantity: 0.02 },
      { ingredientId: "i16", quantity: 1 },
    ],
    isActive: true,
  },
  {
    id: "m8", name: "Mocha", brand: "Bean Corner", category: "Coffee",
    sellingPrice: 4.0, targetMargin: 68,
    recipe: [
      { ingredientId: "i9", quantity: 0.018 },
      { ingredientId: "i10", quantity: 0.15 },
      { ingredientId: "i13", quantity: 0.02 },
      { ingredientId: "i12", quantity: 0.015 },
      { ingredientId: "i16", quantity: 1 },
    ],
    isActive: true,
  },
  {
    id: "m9", name: "Caramel Macchiato", brand: "Bean Corner", category: "Coffee",
    sellingPrice: 4.5, targetMargin: 66,
    recipe: [
      { ingredientId: "i9", quantity: 0.018 },
      { ingredientId: "i10", quantity: 0.18 },
      { ingredientId: "i14", quantity: 0.025 },
      { ingredientId: "i16", quantity: 1 },
    ],
    isActive: true,
  },
  {
    id: "m10", name: "Croissant", brand: "Bean Corner", category: "Dessert",
    sellingPrice: 2.0, targetMargin: 55,
    recipe: [
      { ingredientId: "i15", quantity: 1 },
    ],
    isActive: true,
  },
]

const DRIFT_THRESHOLD = 5

export default function FoodCostTracking() {
  const [ingredients, setIngredients] = useState<Ingredient[]>(initialIngredients)
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems)
  const [activeBrand, setActiveBrand] = useState<Brand | "All">("All")
  const [activeCategory, setActiveCategory] = useState<string>("All")
  const [activeTab, setActiveTab] = useState<"menu" | "ingredients" | "alerts">("menu")
  const [editingIngredient, setEditingIngredient] = useState<string | null>(null)
  const [editingPrice, setEditingPrice] = useState<{ [key: string]: string }>({})
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const calcFoodCost = (item: MenuItem) => {
    return item.recipe.reduce((total, ri) => {
      const ing = ingredients.find(i => i.id === ri.ingredientId)
      return total + (ing ? ing.costPerUnit * ri.quantity : 0)
    }, 0)
  }

  const calcFoodCostPct = (item: MenuItem) => {
    const cost = calcFoodCost(item)
    return item.sellingPrice > 0 ? (cost / item.sellingPrice) * 100 : 0
  }

  const calcSuggestedPrice = (item: MenuItem) => {
    const cost = calcFoodCost(item)
    return cost / (1 - item.targetMargin / 100)
  }

  const isDrifted = (item: MenuItem) => {
    const actualCostPct = calcFoodCostPct(item)
    const targetCostPct = 100 - item.targetMargin
    return actualCostPct > targetCostPct + DRIFT_THRESHOLD
  }

  const processedItems = useMemo(() => {
    return menuItems.map(item => ({
      ...item,
      foodCost: calcFoodCost(item),
      foodCostPct: calcFoodCostPct(item),
      suggestedPrice: calcSuggestedPrice(item),
      drifted: isDrifted(item),
    }))
  }, [menuItems, ingredients])

  const filteredItems = useMemo(() => {
    return processedItems.filter(item => {
      const brandMatch = activeBrand === "All" || item.brand === activeBrand
      const categoryMatch = activeCategory === "All" || item.category === activeCategory
      const searchMatch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
      return brandMatch && categoryMatch && searchMatch
    })
  }, [processedItems, activeBrand, activeCategory, searchQuery])

  const driftedItems = useMemo(() => processedItems.filter(i => i.drifted), [processedItems])

  const stats = useMemo(() => {
    const shItems = processedItems.filter(i => i.brand === "Shawarma House")
    const bcItems = processedItems.filter(i => i.brand === "Bean Corner")
    const avgCostPctSH = shItems.length ? shItems.reduce((s, i) => s + i.foodCostPct, 0) / shItems.length : 0
    const avgCostPctBC = bcItems.length ? bcItems.reduce((s, i) => s + i.foodCostPct, 0) / bcItems.length : 0
    return { avgCostPctSH, avgCostPctBC, totalDrifted: driftedItems.length }
  }, [processedItems, driftedItems])

  const handleIngredientPriceUpdate = (id: string, newPrice: string) => {
    const price = parseFloat(newPrice)
    if (!isNaN(price) && price > 0) {
      setIngredients(prev => prev.map(i => i.id === id ? { ...i, costPerUnit: price } : i))
    }
    setEditingIngredient(null)
  }

  const getCostPctColor = (pct: number, target: number) => {
    const targetCostPct = 100 - target
    if (pct <= targetCostPct) return "text-emerald-400"
    if (pct <= targetCostPct + DRIFT_THRESHOLD) return "text-amber-400"
    return "text-red-400"
  }

  const getCostPctBg = (pct: number, target: number) => {
    const targetCostPct = 100 - target
    if (pct <= targetCostPct) return "bg-emerald-400"
    if (pct <= targetCostPct + DRIFT_THRESHOLD) return "bg-amber-400"
    return "bg-red-400"
  }

  const categories = ["All", ...Array.from(new Set(menuItems.map(i => i.category)))]

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-sm font-bold">🌯</div>
                <div className="w-8 h-8 rounded-lg bg-amber-700 flex items-center justify-center text-sm font-bold">☕</div>
                <h1 className="text-xl font-bold text-white">Food Cost Tracking & Menu Pricing</h1>
              </div>
              <p className="text-zinc-400 text-sm">Shawarma House & Bean Corner — Amman, Jordan</p>
            </div>
            <div className="flex items-center gap-2">
              {driftedItems.length > 0 && (
                <button
                  onClick={() => setActiveTab("alerts")}
                  className="flex items-center gap-2 bg-red-900/30 border border-red-700 text-red-400 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-900/50 transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-red
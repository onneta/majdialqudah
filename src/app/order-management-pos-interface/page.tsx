"use client"

import { useState, useEffect, useCallback } from "react"

type Location = "shawarma-house" | "bean-corner"
type OrderType = "dine-in" | "takeaway"
type OrderStatus = "pending" | "preparing" | "ready" | "completed"
type PaymentMethod = "cash" | "card" | "digital-wallet"

interface MenuItem {
  id: string
  name: string
  nameAr: string
  price: number
  category: string
  location: Location
  emoji: string
  description: string
}

interface CartItem extends MenuItem {
  qty: number
  notes?: string
}

interface Order {
  id: string
  items: CartItem[]
  customer: string
  phone: string
  orderType: OrderType
  location: Location
  status: OrderStatus
  paymentMethod: PaymentMethod
  total: number
  createdAt: Date
  tableNumber?: string
}

const menuItems: MenuItem[] = [
  // Shawarma House
  { id: "sh1", name: "Chicken Shawarma", nameAr: "شاورما دجاج", price: 3.5, category: "Shawarma", location: "shawarma-house", emoji: "🌯", description: "Marinated grilled chicken, garlic sauce, pickles" },
  { id: "sh2", name: "Meat Shawarma", nameAr: "شاورما لحم", price: 4.0, category: "Shawarma", location: "shawarma-house", emoji: "🥙", description: "Seasoned beef & lamb blend, tahini, veggies" },
  { id: "sh3", name: "Mixed Shawarma", nameAr: "شاورما مشكل", price: 4.5, category: "Shawarma", location: "shawarma-house", emoji: "🌯", description: "Chicken & meat combination, special sauce" },
  { id: "sh4", name: "Falafel Wrap", nameAr: "ساندويش فلافل", price: 2.0, category: "Street Food", location: "shawarma-house", emoji: "🧆", description: "Crispy falafel, tahini, fresh salad" },
  { id: "sh5", name: "Hummus Plate", nameAr: "حمص", price: 2.5, category: "Sides", location: "shawarma-house", emoji: "🫙", description: "Creamy hummus with olive oil & paprika" },
  { id: "sh6", name: "Fattoush Salad", nameAr: "فتوش", price: 2.5, category: "Sides", location: "shawarma-house", emoji: "🥗", description: "Fresh veggies, crispy bread, pomegranate dressing" },
  { id: "sh7", name: "French Fries", nameAr: "بطاطا مقلية", price: 1.5, category: "Sides", location: "shawarma-house", emoji: "🍟", description: "Crispy seasoned fries" },
  { id: "sh8", name: "Shawarma Plate", nameAr: "طبق شاورما", price: 7.5, category: "Plates", location: "shawarma-house", emoji: "🍽️", description: "Shawarma over rice with salad & sauce" },
  { id: "sh9", name: "Soft Drink", nameAr: "مشروب غازي", price: 1.0, category: "Drinks", location: "shawarma-house", emoji: "🥤", description: "Pepsi, 7UP, or Miranda" },
  { id: "sh10", name: "Jallab Juice", nameAr: "جلاب", price: 1.5, category: "Drinks", location: "shawarma-house", emoji: "🍇", description: "Traditional grape & rose water blend" },
  // Bean Corner
  { id: "bc1", name: "Espresso", nameAr: "إسبريسو", price: 2.0, category: "Espresso", location: "bean-corner", emoji: "☕", description: "Double shot, rich & bold" },
  { id: "bc2", name: "Cappuccino", nameAr: "كابتشينو", price: 3.0, category: "Espresso", location: "bean-corner", emoji: "☕", description: "Espresso with steamed milk foam" },
  { id: "bc3", name: "Flat White", nameAr: "فلات وايت", price: 3.0, category: "Espresso", location: "bean-corner", emoji: "☕", description: "Velvety microfoam espresso" },
  { id: "bc4", name: "Latte", nameAr: "لاتيه", price: 3.5, category: "Espresso", location: "bean-corner", emoji: "🥛", description: "Smooth espresso & steamed milk" },
  { id: "bc5", name: "Cold Brew", nameAr: "كولد برو", price: 4.0, category: "Cold Drinks", location: "bean-corner", emoji: "🧊", description: "12-hour slow brewed, refreshing" },
  { id: "bc6", name: "Iced Caramel Latte", nameAr: "لاتيه كراميل مثلج", price: 4.5, category: "Cold Drinks", location: "bean-corner", emoji: "🍮", description: "Espresso, milk, caramel, ice" },
  { id: "bc7", name: "Matcha Latte", nameAr: "ماتشا لاتيه", price: 4.0, category: "Specialty", location: "bean-corner", emoji: "🍵", description: "Premium ceremonial matcha, oat milk" },
  { id: "bc8", name: "Croissant", nameAr: "كرواسون", price: 2.5, category: "Pastries", location: "bean-corner", emoji: "🥐", description: "Buttery, flaky, freshly baked" },
  { id: "bc9", name: "Chocolate Muffin", nameAr: "مافن شوكولاتة", price: 2.0, category: "Pastries", location: "bean-corner", emoji: "🧁", description: "Double chocolate chip muffin" },
  { id: "bc10", name: "Avocado Toast", nameAr: "توست أفوكادو", price: 4.5, category: "Food", location: "bean-corner", emoji: "🥑", description: "Sourdough, avocado, feta, chili flakes" },
]

const statusColors: Record<OrderStatus, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  preparing: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  ready: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  completed: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
}

const statusLabels: Record<OrderStatus, string> = {
  pending: "⏳ Pending",
  preparing: "👨‍🍳 Preparing",
  ready: "✅ Ready",
  completed: "🎉 Completed",
}

const locationConfig = {
  "shawarma-house": {
    name: "Shawarma House",
    nameAr: "شاورما هاوس",
    accent: "amber",
    emoji: "🥙",
    tagline: "Authentic Middle Eastern Street Food",
    accentClass: "text-amber-400",
    accentBg: "bg-amber-500/20",
    accentBorder: "border-amber-500/40",
    accentBtn: "bg-amber-500 hover:bg-amber-400",
    accentBtnOutline: "border-amber-500/50 text-amber-400 hover:bg-amber-500/10",
  },
  "bean-corner": {
    name: "Bean Corner",
    nameAr: "بين كورنر",
    accent: "sky",
    emoji: "☕",
    tagline: "Specialty Coffee & Café",
    accentClass: "text-sky-400",
    accentBg: "bg-sky-500/20",
    accentBorder: "border-sky-500/40",
    accentBtn: "bg-sky-500 hover:bg-sky-400",
    accentBtnOutline: "border-sky-500/50 text-sky-400 hover:bg-sky-500/10",
  },
}

function generateOrderId() {
  return `ORD-${Date.now().toString(36).toUpperCase()}`
}

export default function POSInterface() {
  const [activeLocation, setActiveLocation] = useState<Location>("shawarma-house")
  const [orderType, setOrderType] = useState<OrderType>("dine-in")
  const [cart, setCart] = useState<CartItem[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [activeView, setActiveView] = useState<"pos" | "orders" | "receipt">("pos")
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "checkout" | "confirm">("cart")
  const [currentReceipt, setCurrentReceipt] = useState<Order | null>(null)
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [tableNumber, setTableNumber] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash")
  const [searchQuery, setSearchQuery] = useState("")
  const [notification, setNotification] = useState<string | null>(null)

  const loc = locationConfig[activeLocation]

  const filteredItems = menuItems.filter((item) => {
    const matchesLocation = item.location === activeLocation
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.nameAr.includes(searchQuery)
    return matchesLocation && matchesCategory && matchesSearch
  })

  const categories = ["All", ...Array.from(new Set(menuItems.filter((i) => i.location === activeLocation).map((i) => i.category)))]

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0)
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0)

  const showNotification = useCallback((msg: string) => {
    setNotification(msg)
    setTimeout(() => setNotification(null), 2000)
  }, [])

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id)
      if (existing) return prev.map((c) => (c.id === item.id ? { ...c, qty: c.qty + 1 } : c))
      return [...prev, { ...item, qty: 1 }]
    })
    showNotification(`${item.emoji} ${item.name} added!`)
  }

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => (c.id === id ? { ...c, qty: c.qty + delta } : c))
        .filter((c) => c.qty > 0)
    )
  }

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((c) => c.id !== id))
  }

  const handleCheckout = () => {
    if (!customerName.trim()) return
    const order: Order = {
      id: generateOrderId(),
      items: [...cart],
      customer: customerName,
      phone: customerPhone,
      orderType,
      location: activeLocation,
      status: "pending",
      paymentMethod,
      total: cartTotal,
      createdAt: new Date(),
      tableNumber: orderType === "dine-in" ? tableNumber : undefined,
    }
    setOrders((prev) => [order, ...prev])
    setCurrentReceipt(order)
    setCart([])
    setCustomerName("")
    setCustomerPhone("")
    setTableNumber("")
    setCheckoutStep("confirm")
  }

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)))
  }

  const switchLocation = (loc: Location) => {
    setActiveLocation(loc)
    setSelectedCategory("All")
    setCart([])
    setCheckoutStep("cart")
    setSearchQuery("")
  }

  const locationOrders = orders.filter((o) => o.location === activeLocation)

  useEffect(() => {
    if (checkoutStep === "confirm") {
      const timer = setTimeout(() => {
        setCheckoutStep("cart")
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [checkoutStep])

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 shadow-2xl text-sm font-medium animate-pulse">
          {notification}
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800">
        <div className="max-w-screen-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-2">
                <span className="text-2xl">{activeLocation === "shawarma-house" ? "🥙" : "☕"}</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-zinc-100 leading-tight">
                  <span className="text-amber-400">Shawarma House</span>
                  <span className="text-zinc-600 mx-2">&</span>
                  <span className="text-sky-400">Bean Corner</span>
                </h1>
                <p className="text-xs text-zinc-500">POS & Order Management · Amman, Jordan</p>
              </div>
            </div>

            {/* Location Switcher */}
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
              {(["shawarma-house", "bean-corner"] as Location[]).map((loc) => (
                <button
                  key={loc}
                  onClick={() => switchLocation(loc)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeLocation === loc
                      ? loc === "shawarma-house"
                        ? "bg-amber-500 text-zinc-950"
                        : "bg-sky-500 text-zinc-950"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
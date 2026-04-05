"use client"

import { useState, useEffect, useCallback } from "react"

type Location = "shawarma" | "beancorner"
type OrderStatus = "pending" | "preparing" | "ready" | "completed" | "cancelled"
type ServiceType = "dine-in" | "pickup" | "delivery"

interface MenuItem {
  id: string
  name: string
  nameAr: string
  price: number
  category: string
  location: Location | "both"
  emoji: string
  description: string
  prepTime: number
}

interface CartItem extends MenuItem {
  quantity: number
  notes?: string
}

interface Table {
  id: number
  name: string
  capacity: number
  status: "available" | "occupied" | "reserved" | "cleaning"
  orderId?: string
}

interface Order {
  id: string
  items: CartItem[]
  customerName: string
  serviceType: ServiceType
  tableId?: number
  queueNumber?: number
  status: OrderStatus
  location: Location
  total: number
  createdAt: Date
  estimatedTime: number
  paymentMethod: string
  phone?: string
}

const MENU_ITEMS: MenuItem[] = [
  { id: "sh1", name: "Classic Shawarma Wrap", nameAr: "شاورما كلاسيك", price: 3.5, category: "Shawarma", location: "shawarma", emoji: "🌯", description: "Marinated chicken or meat with garlic sauce", prepTime: 8 },
  { id: "sh2", name: "Meat Shawarma Plate", nameAr: "صحن شاورما لحم", price: 5.5, category: "Plates", location: "shawarma", emoji: "🍽️", description: "Served with rice, salad and garlic sauce", prepTime: 12 },
  { id: "sh3", name: "Chicken Shawarma Plate", nameAr: "صحن شاورما دجاج", price: 4.8, category: "Plates", location: "shawarma", emoji: "🍗", description: "Tender chicken with fries and pickles", prepTime: 10 },
  { id: "sh4", name: "Falafel Wrap", nameAr: "فلافل بالخبز", price: 2.0, category: "Wraps", location: "shawarma", emoji: "🧆", description: "Fresh falafel with tahini and vegetables", prepTime: 6 },
  { id: "sh5", name: "Hummus Bowl", nameAr: "حمص", price: 2.5, category: "Sides", location: "shawarma", emoji: "🥣", description: "Creamy hummus with olive oil", prepTime: 3 },
  { id: "sh6", name: "Mixed Grill Platter", nameAr: "مشاوي مشكلة", price: 12.0, category: "Plates", location: "shawarma", emoji: "🥩", description: "Assorted grilled meats for sharing", prepTime: 20 },
  { id: "sh7", name: "Fattoush Salad", nameAr: "فتوش", price: 2.2, category: "Sides", location: "both", emoji: "🥗", description: "Fresh Lebanese salad with crispy bread", prepTime: 5 },
  { id: "bc1", name: "Specialty Espresso", nameAr: "اسبريسو مميز", price: 2.8, category: "Coffee", location: "beancorner", emoji: "☕", description: "Single origin specialty espresso", prepTime: 4 },
  { id: "bc2", name: "Flat White", nameAr: "فلات وايت", price: 3.2, category: "Coffee", location: "beancorner", emoji: "🥛", description: "Double ristretto with steamed milk", prepTime: 5 },
  { id: "bc3", name: "Cold Brew", nameAr: "كولد برو", price: 3.5, category: "Coffee", location: "beancorner", emoji: "🧊", description: "18-hour cold brewed coffee over ice", prepTime: 3 },
  { id: "bc4", name: "Cardamom Latte", nameAr: "لاتيه هيل", price: 3.8, category: "Coffee", location: "beancorner", emoji: "🫖", description: "Espresso with cardamom & steamed milk", prepTime: 6 },
  { id: "bc5", name: "Croissant", nameAr: "كرواسون", price: 2.0, category: "Pastry", location: "beancorner", emoji: "🥐", description: "Buttery fresh-baked croissant", prepTime: 2 },
  { id: "bc6", name: "Avocado Toast", nameAr: "توست أفوكادو", price: 4.5, category: "Food", location: "beancorner", emoji: "🥑", description: "Sourdough with avocado & poached egg", prepTime: 8 },
  { id: "bc7", name: "Matcha Latte", nameAr: "ماتشا لاتيه", price: 4.0, category: "Specialty", location: "beancorner", emoji: "🍵", description: "Premium ceremonial matcha with oat milk", prepTime: 5 },
  { id: "both1", name: "Fresh Lemonade", nameAr: "عصير ليمون", price: 2.0, category: "Drinks", location: "both", emoji: "🍋", description: "Freshly squeezed lemon juice", prepTime: 3 },
  { id: "both2", name: "Water Bottle", nameAr: "مياه", price: 0.5, category: "Drinks", location: "both", emoji: "💧", description: "Still or sparkling water", prepTime: 1 },
]

const INITIAL_TABLES: Table[] = [
  { id: 1, name: "T1", capacity: 2, status: "available" },
  { id: 2, name: "T2", capacity: 2, status: "occupied", orderId: "ORD-001" },
  { id: 3, name: "T3", capacity: 4, status: "available" },
  { id: 4, name: "T4", capacity: 4, status: "reserved" },
  { id: 5, name: "T5", capacity: 4, status: "occupied", orderId: "ORD-002" },
  { id: 6, name: "T6", capacity: 6, status: "cleaning" },
  { id: 7, name: "T7", capacity: 6, status: "available" },
  { id: 8, name: "T8", capacity: 8, status: "available" },
]

const SAMPLE_ORDERS: Order[] = [
  {
    id: "ORD-001", items: [{ ...MENU_ITEMS[0], quantity: 2 }, { ...MENU_ITEMS[4], quantity: 1 }],
    customerName: "Ahmad Al-Khalidi", serviceType: "dine-in", tableId: 2, status: "preparing",
    location: "shawarma", total: 10.5, createdAt: new Date(Date.now() - 12 * 60000), estimatedTime: 8,
    paymentMethod: "cash"
  },
  {
    id: "ORD-002", items: [{ ...MENU_ITEMS[2], quantity: 1 }, { ...MENU_ITEMS[6], quantity: 1 }],
    customerName: "Sara Mansour", serviceType: "dine-in", tableId: 5, status: "ready",
    location: "shawarma", total: 7.0, createdAt: new Date(Date.now() - 25 * 60000), estimatedTime: 0,
    paymentMethod: "card"
  },
  {
    id: "ORD-003", items: [{ ...MENU_ITEMS[7], quantity: 1 }, { ...MENU_ITEMS[11], quantity: 1 }],
    customerName: "Layla Hassan", serviceType: "pickup", queueNumber: 12, status: "pending",
    location: "beancorner", total: 7.6, createdAt: new Date(Date.now() - 3 * 60000), estimatedTime: 5,
    paymentMethod: "card"
  },
  {
    id: "ORD-004", items: [{ ...MENU_ITEMS[9], quantity: 2 }, { ...MENU_ITEMS[12], quantity: 1 }],
    customerName: "Omar Nasser", serviceType: "pickup", queueNumber: 13, status: "preparing",
    location: "beancorner", total: 10.5, createdAt: new Date(Date.now() - 7 * 60000), estimatedTime: 3,
    paymentMethod: "cash"
  },
]

export default function POSInterface() {
  const [activeLocation, setActiveLocation] = useState<Location>("shawarma")
  const [activeTab, setActiveTab] = useState<"order" | "tables" | "queue" | "kitchen" | "orders">("order")
  const [cart, setCart] = useState<CartItem[]>([])
  const [orders, setOrders] = useState<Order[]>(SAMPLE_ORDERS)
  const [tables, setTables] = useState<Table[]>(INITIAL_TABLES)
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [selectedTable, setSelectedTable] = useState<number | null>(null)
  const [serviceType, setServiceType] = useState<ServiceType>("dine-in")
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "checkout" | "confirmation">("cart")
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [currentQueueNumber, setCurrentQueueNumber] = useState(14)
  const [notifications, setNotifications] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [lastOrder, setLastOrder] = useState<Order | null>(null)

  const filteredMenu = MENU_ITEMS.filter(item => {
    const locationMatch = item.location === activeLocation || item.location === "both"
    const categoryMatch = selectedCategory === "All" || item.category === selectedCategory
    const searchMatch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nameAr.includes(searchQuery)
    return locationMatch && categoryMatch && searchMatch
  })

  const categories = ["All", ...Array.from(new Set(
    MENU_ITEMS.filter(i => i.location === activeLocation || i.location === "both").map(i => i.category)
  ))]

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id)
      if (existing) return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i).filter(i => i.quantity > 0))
  }

  const removeFromCart = (id: string) => setCart(prev => prev.filter(i => i.id !== id))

  const addNotification = useCallback((msg: string) => {
    setNotifications(prev => [msg, ...prev.slice(0, 4)])
    setTimeout(() => setNotifications(prev => prev.filter(n => n !== msg)), 5000)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setOrders(prev => prev.map(order => {
        if (order.status === "pending" && Math.random() > 0.7) {
          addNotification(`🔥 Order ${order.id} is now being prepared!`)
          return { ...order, status: "preparing" }
        }
        if (order.status === "preparing" && Math.random() > 0.85) {
          addNotification(`✅ Order ${order.id} is READY for ${order.serviceType === "dine-in" ? `Table ${order.tableId}` : `Queue #${order.queueNumber}`}!`)
          return { ...order, status: "ready", estimatedTime: 0 }
        }
        return order
      }))
    }, 8000)
    return () => clearInterval(interval)
  }, [addNotification])

  const placeOrder = () => {
    if (!customerName || cart.length === 0) return
    const newOrder: Order = {
      id: `ORD-${String(orders.length + 1).padStart(3, "0")}`,
      items: [...cart],
      customerName,
      serviceType,
      tableId: serviceType === "dine-in" ? selectedTable ?? undefined : undefined,
      queueNumber: serviceType === "pickup" ? currentQueueNumber : undefined,
      status: "pending",
      location: activeLocation,
      total: cartTotal,
      createdAt: new Date(),
      estimatedTime: Math.max(...cart.map(i => i.prepTime)),
      paymentMethod,
      phone: customerPhone,
    }
    if (serviceType === "dine-in" && selectedTable) {
      setTables(prev => prev.map(t => t.id === selectedTable ? { ...t, status: "occupied", orderId: newOrder.id } : t))
    }
    if (serviceType === "pickup") setCurrentQueueNumber(prev => prev + 1)
    setOrders(prev => [newOrder, ...prev])
    setLastOrder(newOrder)
    addNotification(`🎉 New order ${newOrder.id} placed for ${customerName}!`)
    setCart([])
    setCustomerName("")
    setCustomerPhone("")
    setSelectedTable(null)
    setCheckoutStep("confirmation")
  }

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o))
    if (status === "completed") {
      const order = orders.find(o => o.id === orderId)
      if (order?.tableId) {
        setTables(prev => prev.map(t => t.id === order.tableId ? { ...t, status: "cleaning", orderId: undefined } : t))
      }
    }
  }

  const statusColor = (status: OrderStatus) => {
    switch (status) {
      case "pending": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "preparing": return "bg-orange-500/20 text-orange-400 border-orange-500/30"
      case "ready": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
      case "completed": return "bg-zinc-500/20 text-zinc-400 border-zinc-500/30"
      case "cancelled": return "bg-red-500/20 text-red-400 border-red-500/30"
    }
  }

  const tableStatusColor = (status: Table["status"]) => {
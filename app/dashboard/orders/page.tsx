"use client"

import { useState, useEffect } from "react"
import axios from "axios" // Import axios
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Eye, Search } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Fuse from "fuse.js"
import axiosAPI from "@/services/api"

// Types for the API data
type OrderItem = {
  id: string
  pesananId: string
  produkId: string
  jumlah: number
  harga: number
  produk: {
    nama: string
  }
}

type Order = {
  id: string
  namaDepan: string
  namaBelakang: string
  email: string
  alamat: string
  kota: string
  provinsi: string
  kodePos: string
  telepon: string
  catatan: string
  totalHarga: number
  statusPembayaran: "PENDING" | "PAID" | "FAILED"
  tokenSnap: string | null
  dibuatPada: string
  diperbarui: string
  penggunaId: string
  itemPesanan: OrderItem[]
}

type OrdersResponse = {
  status: boolean
  pesan: string
  data: Order[]
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null)

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        // IMPORTANT: Replace '/api/orders' with your actual API endpoint for orders
        const response = await axiosAPI.get<OrdersResponse>('/pesanan')
        if (response.data.status) {
          setOrders(response.data.data)
        } else {
          setError(response.data.pesan || "Failed to fetch orders.")
        }
      } catch (err) {
        console.error("Error fetching orders:", err)
        setError("An error occurred while fetching orders.")
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, []) // Empty dependency array means this effect runs once on mount

  // Initialize Fuse.js for fuzzy search
  // Re-initialize fuse whenever orders change
  const fuse = new Fuse(orders, {
    keys: ['id', 'namaDepan', 'namaBelakang', 'email'],
    includeScore: true,
    threshold: 0.4,
  })

  const filteredOrders = () => {
    let result = orders

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(order => order.statusPembayaran.toLowerCase() === statusFilter.toLowerCase())
    }

    // Apply search query with Fuse.js if there's a search term
    if (searchQuery.trim()) {
      const searchResults = fuse.search(searchQuery)
      result = searchResults.map(item => item.item)
    }

    return result
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return <Badge className="bg-green-500">Paid</Badge>
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>
      case "failed":
        return <Badge className="bg-red-500">Failed</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getFullName = (order: Order) => {
    return `${order.namaDepan} ${order.namaBelakang}`
  }

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 md:ml-64 flex items-center justify-center h-screen">
        <div className="text-lg">Loading orders...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 md:ml-64 flex items-center justify-center h-screen">
        <div className="text-lg text-red-500">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 md:ml-64">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Orders</CardTitle>
          <CardDescription>
            View and manage all customer orders. You can view order details and track their status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders().length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders().map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>
                        <div>
                          <div>{getFullName(order)}</div>
                          <div className="text-sm text-muted-foreground">{order.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatDate(order.dibuatPada)}
                      </TableCell>
                      <TableCell>{getStatusBadge(order.statusPembayaran)}</TableCell>
                      <TableCell>{formatCurrency(order.totalHarga)}</TableCell>
                      <TableCell className="text-right">
                        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setCurrentOrder(order)}>
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader>
                              <DialogTitle>Order Details</DialogTitle>
                              <DialogDescription>Order ID: {currentOrder?.id}</DialogDescription>
                            </DialogHeader>
                            {currentOrder && (
                              <div className="space-y-6">
                                <div className="flex flex-col md:flex-row justify-between gap-4">
                                  <div>
                                    <h3 className="font-semibold">Customer Information</h3>
                                    <p>{getFullName(currentOrder)}</p>
                                    <p className="text-sm text-muted-foreground">{currentOrder.email}</p>
                                    <p className="text-sm text-muted-foreground">{currentOrder.telepon}</p>
                                  </div>
                                  <div className="text-right">
                                    <h3 className="font-semibold">Order Date</h3>
                                    <p>{formatDate(currentOrder.dibuatPada)}</p>
                                    <p className="mt-2">Status: {getStatusBadge(currentOrder.statusPembayaran)}</p>
                                  </div>
                                </div>

                                <Tabs defaultValue="items">
                                  <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="items">Order Items</TabsTrigger>
                                    <TabsTrigger value="shipping">Shipping Info</TabsTrigger>
                                    <TabsTrigger value="notes">Customer Notes</TabsTrigger>
                                  </TabsList>
                                  <TabsContent value="items" className="space-y-4 pt-4">
                                    <div className="rounded-md border">
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead>Product</TableHead>
                                            <TableHead className="text-right">Price</TableHead>
                                            <TableHead className="text-right">Quantity</TableHead>
                                            <TableHead className="text-right">Subtotal</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {currentOrder.itemPesanan.map((item) => (
                                            <TableRow key={item.id}>
                                              <TableCell>{item.produk.nama}</TableCell>
                                              <TableCell className="text-right">
                                                {formatCurrency(item.harga)}
                                              </TableCell>
                                              <TableCell className="text-right">{item.jumlah}</TableCell>
                                              <TableCell className="text-right">
                                                {formatCurrency(item.harga * item.jumlah)}
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                          <TableRow>
                                            <TableCell colSpan={3} className="text-right font-bold">
                                              Total
                                            </TableCell>
                                            <TableCell className="text-right font-bold">
                                              {formatCurrency(currentOrder.totalHarga)}
                                            </TableCell>
                                          </TableRow>
                                        </TableBody>
                                      </Table>
                                    </div>
                                  </TabsContent>
                                  <TabsContent value="shipping" className="space-y-4 pt-4">
                                    <div className="rounded-md border p-4">
                                      <h3 className="font-semibold mb-2">Shipping Address</h3>
                                      <p>{currentOrder.alamat}</p>
                                      <p>
                                        {currentOrder.kota}, {currentOrder.provinsi}
                                      </p>
                                      <p>{currentOrder.kodePos}</p>
                                    </div>
                                    <div className="rounded-md border p-4">
                                      <h3 className="font-semibold mb-2">Payment Information</h3>
                                      <p>Method: {currentOrder.tokenSnap ? "Midtrans" : "Unknown"}</p>
                                      <p>Status: {getStatusBadge(currentOrder.statusPembayaran)}</p>
                                    </div>
                                  </TabsContent>
                                  <TabsContent value="notes" className="space-y-4 pt-4">
                                    <div className="rounded-md border p-4">
                                      <h3 className="font-semibold mb-2">Customer Notes</h3>
                                      <p>{currentOrder.catatan || "No notes provided"}</p>
                                    </div>
                                  </TabsContent>
                                </Tabs>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {filteredOrders().length} of {orders.length} orders
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
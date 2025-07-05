"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import axiosAPI from "@/services/api"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Truck, Shield, Headphones, ArrowRight } from "lucide-react"

type Product = {
  id: string
  nama: string
  harga: number
  gambar: string
  kategori: {
    nama: string
  }
}

const CACHE_KEYS = {
  product: "/produk",
  productCache: "products-cache",
  imageCache: "images-cache",
}

const cacheProducts = async (products: Product[]) => {
  const cache = await caches.open(CACHE_KEYS.productCache)
  const response = new Response(JSON.stringify(products), {
    headers: { "Content-Type": "application/json" },
  })
  await cache.put(CACHE_KEYS.product, response)
}

const cacheImages = async (products: Product[]) => {
  const imageCache = await caches.open(CACHE_KEYS.imageCache)
  await Promise.all(
    products.map(async (product) => {
      const url = product.gambar
      if (url) {
        try {
          const req = new Request(url, { mode: "no-cors", cache: "no-store" })
          const res = await fetch(req)
          if (res.ok || res.type === "opaque") {
            await imageCache.put(url, res.clone())
            console.log("🖼️ Gambar dicache:", url)
          }
        } catch (err) {
          console.warn("⚠️ Gagal caching gambar:", url, err)
        }
      }
    })
  )
}

const loadFromCache = async (): Promise<Product[] | null> => {
  const cache = await caches.open(CACHE_KEYS.productCache)
  const match = await cache.match(CACHE_KEYS.product)
  if (match) {
    try {
      const data = await match.json()
      console.log("📦 Produk dari cache:", data.length)
      return data
    } catch (err) {
      console.error("❌ Error parsing cache:", err)
    }
  }
  return null
}

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await axiosAPI.get("/produk")
        const data = response.data.slice(0, 3)
        setFeaturedProducts(data)
        await cacheProducts(data)
        await cacheImages(data)
      } catch (error: any) {
        console.error("❌ Fetch gagal:", error)

        if (!navigator.onLine || error.message === "Network Error") {
          console.log("🌐 Offline - load dari cache...")
          const cached = await loadFromCache()
          if (cached) setFeaturedProducts(cached.slice(0, 3))
          else console.warn("⚠️ Tidak ada cache ditemukan")
        }
      }
    }

    fetchFeatured()
  }, [])

  const features = [
    {
      icon: Truck,
      title: "Pengiriman Gratis",
      description: "Gratis ongkir untuk pembelian di atas Rp 500.000",
    },
    {
      icon: Shield,
      title: "Garansi Resmi",
      description: "Semua produk bergaransi resmi dari distributor",
    },
    {
      icon: Headphones,
      title: "Customer Service 24/7",
      description: "Tim support siap membantu Anda kapan saja",
    },
  ]

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-300 to-pink-500/5 py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                Belanja Online
                <span className="text-primary block">Mudah & Terpercaya</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-md">
                Temukan ribuan produk berkualitas dengan harga terbaik.
                Pengiriman cepat ke seluruh Indonesia.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg">
                  <Link href="/product">
                    Mulai Belanja
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg">
                  Pelajari Lebih Lanjut
                </Button>
              </div>
            </div>
            <div className="relative">
              <Image
                src="/galerynavila.jpg?height=500&width=600"
                alt="galerynavila"
                width={600}
                height={500}
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Mengapa Memilih Kami?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Kami berkomitmen memberikan pengalaman belanja online terbaik
              dengan layanan yang memuaskan.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gradient-to-b from-blue-400 to-pink-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2">Produk Unggulan</h2>
              <p className="text-muted-foreground">
                Produk terpopuler pilihan pelanggan
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/product">
                Lihat Semua
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <Card
                key={product.id}
                className="group hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-0">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <Image
                      src={product.gambar || "/placeholder.svg"}
                      alt={product.nama}
                      width={300}
                      height={300}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className="absolute top-2 left-2">
                      {product.kategori?.nama || "Tanpa Kategori"}
                    </Badge>
                  </div>
                  <div className="p-6">
                    <h3 className="font-semibold mb-2">{product.nama}</h3>
                    <p className="text-2xl font-bold text-primary mb-4">
                      Rp {product.harga.toLocaleString("id-ID")}
                    </p>
                    <Button asChild className="w-full">
                      <Link href={`/product/${product.id}`}>Lihat Detail</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl font-bold mb-4">Siap Mulai Belanja?</h2>
              <p className="text-white/90 mb-8 max-w-2xl mx-auto">
                Bergabunglah dengan ribuan pelanggan yang sudah merasakan
                kemudahan berbelanja di toko online kami.
              </p>
              <Button asChild size="lg" variant="secondary">
                <Link href="/product">
                  Jelajahi Produk
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
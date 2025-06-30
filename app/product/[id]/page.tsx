"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Star,
  Minus,
  Plus,
  ShoppingCart,
  ArrowLeft,
  Truck,
  Shield,
  RotateCcw,
} from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { useToast } from "@/hooks/use-toast";
import axiosAPI from "@/services/api";

interface Product {
  id: string;
  nama: string;
  deskripsi: string;
  harga: number;
  jumlah: number;
  gambar: string;
  ukuran?: string;
  warna?: string;
  kategoriId: string;
  kategori: {
    id: string;
    nama: string;
  };
  // Add other fields as needed
}

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);
  const { toast } = useToast();
  const { id } = use(params);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axiosAPI.get(`/produk/${id}`);
        setProduct(response.data);
      } catch (error) {
        console.error("Failed to fetch product:", error);
        toast({
          title: "Gagal memuat produk",
          description: "Terjadi kesalahan saat memuat detail produk.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, toast]);

  const handleAddToCart = () => {
    if (!product) return;

    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.nama,
        price: product.harga,
        image: product.gambar,
        description: product.deskripsi,
        stock: product.jumlah,
        category: product.kategori.nama,
        warna: product.warna,
        ukuran: product.ukuran,
      });
    }

    toast({
      title: "Produk ditambahkan ke keranjang",
      description: `${quantity}x ${product.nama} berhasil ditambahkan ke keranjang.`,
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <p>Memuat produk...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Produk Tidak Ditemukan</h1>
          <Button asChild>
            <Link href="/product">Kembali ke Produk</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Mock multiple images - in a real app, you might have multiple images from API
  const images = [product.gambar, product.gambar, product.gambar];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-primary">
          Beranda
        </Link>
        <span>/</span>
        <Link href="/product" className="hover:text-primary">
          Produk
        </Link>
        <span>/</span>
        <span className="text-foreground">{product.nama}</span>
      </div>

      {/* Back Button */}
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/product">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Produk
        </Link>
      </Button>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-lg border">
            <Image
              src={images[selectedImage] || "/placeholder.svg"}
              alt={product.nama}
              width={500}
              height={500}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`aspect-square overflow-hidden rounded-lg border-2 ${
                  selectedImage === index ? "border-primary" : "border-muted"
                }`}
              >
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`${product.nama} ${index + 1}`}
                  width={150}
                  height={150}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <Badge className="mb-2 capitalize">{product.kategori.nama}</Badge>
            <h1 className="text-3xl font-bold mb-4">{product.nama}</h1>
            <div className="flex items-center gap-4 mb-4">
              <Separator orientation="vertical" className="h-4" />
              <span className="text-muted-foreground">
                Stok: {product.jumlah}
              </span>
            </div>
            <p className="text-4xl font-bold text-primary mb-6">
              Rp {product.harga.toLocaleString("id-ID")}
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Deskripsi</h3>
            <p className="text-muted-foreground leading-relaxed">
              {product.deskripsi}
            </p>
          </div>

          {/* Features - You might want to add this to your API if needed */}
          {product.ukuran && (
            <div>
              <h3 className="font-semibold mb-2">Ukuran</h3>
              <p className="text-muted-foreground">{product.ukuran}</p>
            </div>
          )}

          {product.warna && (
            <div>
              <h3 className="font-semibold mb-2">Warna</h3>
              <p className="text-muted-foreground">{product.warna}</p>
            </div>
          )}

          {/* Quantity and Add to Cart */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Jumlah</label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setQuantity(Math.min(product.jumlah, quantity + 1))
                  }
                  disabled={quantity >= product.jumlah}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                className="flex-1"
                size="lg"
                onClick={handleAddToCart}
                disabled={product.jumlah === 0}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {product.jumlah === 0 ? "Stok Habis" : "Tambah ke Keranjang"}
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/checkout">Beli Sekarang</Link>
              </Button>
            </div>
          </div>

          {/* Service Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t">
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-sm">Pengiriman Gratis</p>
                <p className="text-xs text-muted-foreground">
                  Min. pembelian 500rb
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-sm">Garansi Resmi</p>
                <p className="text-xs text-muted-foreground">1 tahun garansi</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <RotateCcw className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-sm">Retur Mudah</p>
                <p className="text-xs text-muted-foreground">7 hari retur</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications - You might want to add this to your API if needed */}
      <div className="mt-16">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-6">Informasi Produk</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex justify-between py-2 border-b">
                <span className="font-medium">Kategori</span>
                <span className="text-muted-foreground capitalize">
                  {product.kategori.nama}
                </span>
              </div>
              {product.ukuran && (
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">Ukuran</span>
                  <span className="text-muted-foreground">
                    {product.ukuran}
                  </span>
                </div>
              )}
              {product.warna && (
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">Warna</span>
                  <span className="text-muted-foreground">{product.warna}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

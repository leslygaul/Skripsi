"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Star, Filter } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { useToast } from "@/hooks/use-toast";
import axiosAPI from "@/services/api";
import Fuse from "fuse.js";

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
  dibuatPada: string;
  diperbarui: string;
  kategori: {
    id: string;
    nama: string;
    dibuatPada: string;
    diperbarui: string;
  };
}

interface Category {
  id: string;
  nama: string;
  dibuatPada: string;
  diperbarui: string;
}

export default function ProductPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("nama");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch products and categories in parallel
        const [productsResponse, categoriesResponse] = await Promise.all([
          axiosAPI.get("/produk"),
          axiosAPI.get("/kategori"),
        ]);

        setProducts(productsResponse.data);
        setCategories(categoriesResponse.data);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast({
          title: "Gagal memuat data",
          description:
            "Terjadi kesalahan saat memuat data produk atau kategori.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const fuse = useMemo(() => {
    const options = {
      keys: ["nama", "deskripsi", "kategori.nama"],
      threshold: 0.4,
    };
    return new Fuse(products, options);
  }, [products]);

  const categoryOptions = useMemo(() => {
    const baseCategories = [{ value: "all", label: "Semua Kategori" }];
    const apiCategories = categories.map((category) => ({
      value: category.id,
      label: category.nama,
    }));
    return [...baseCategories, ...apiCategories];
  }, [categories]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Apply search with Fuse.js if search query exists
    if (searchQuery) {
      const searchResults = fuse.search(searchQuery);
      result = searchResults.map((item) => item.item);
    }

    // Apply category filter
    if (selectedCategory !== "all") {
      result = result.filter(
        (product) => product.kategoriId === selectedCategory
      );
    }

    // Sort products
    result.sort((a, b) => {
      switch (sortBy) {
        case "harga-rendah":
          return a.harga - b.harga;
        case "harga-tinggi":
          return b.harga - a.harga;
        case "nama":
        default:
          return a.nama.localeCompare(b.nama);
      }
    });

    return result;
  }, [products, searchQuery, selectedCategory, sortBy, fuse]);

  const handleAddToCart = (product: Product) => {
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

    toast({
      title: "Produk ditambahkan ke keranjang",
      description: `${product.nama} berhasil ditambahkan ke keranjang belanja.`,
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <p>Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Semua Produk</h1>
        <p className="text-muted-foreground">
          Temukan produk yang Anda butuhkan
        </p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari produk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filter */}
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger>
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categoryOptions.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger>
            <SelectValue placeholder="Urutkan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="nama">Nama A-Z</SelectItem>
            <SelectItem value="harga-rendah">Harga Terendah</SelectItem>
            <SelectItem value="harga-tinggi">Harga Tertinggi</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-muted-foreground">
          Menampilkan {filteredProducts.length} dari {products.length} produk
        </p>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
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
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <Badge className="absolute top-2 left-2 capitalize">
                  {product.kategori.nama}
                </Badge>
                {product.jumlah < 10 && (
                  <Badge
                    variant="destructive"
                    className="absolute top-2 right-2"
                  >
                    Stok Terbatas
                  </Badge>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center gap-1 mb-2">
                  <span className="text-sm text-muted-foreground">
                    • Stok: {product.jumlah}
                  </span>
                </div>
                <h3 className="font-semibold mb-2 line-clamp-2">
                  {product.nama}
                </h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {product.deskripsi}
                </p>
                <p className="text-xl font-bold text-primary mb-4">
                  Rp {product.harga.toLocaleString("id-ID")}
                </p>
                <div className="flex gap-2">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Link href={`/product/${product.id}`}>Detail</Link>
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => handleAddToCart(product)}
                    disabled={product.jumlah === 0}
                  >
                    {product.jumlah === 0 ? "Habis" : "Tambah"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {filteredProducts.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            Tidak ada produk yang ditemukan
          </p>
          <Button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
            }}
          >
            Reset Filter
          </Button>
        </div>
      )}
    </div>
  );
}

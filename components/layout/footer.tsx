import Link from "next/link"
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-blue-300 to-purple-600">
                <span className="text-primary-foreground font-bold text-sm">GN</span>
              </div>
              <span className="font-bold text-xl">Galery Navila</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Toko online terpercaya dengan produk berkualitas dan pelayanan terbaik untuk kebutuhan Anda.
            </p>
            <div className="flex space-x-4">
              <Facebook className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer" />
              <Instagram className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer" />
              <Twitter className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">Tautan Cepat</h3>
            <div className="space-y-2">
              <Link href="/" className="block text-sm text-muted-foreground hover:text-primary">
                Beranda
              </Link>
              <Link href="/product" className="block text-sm text-muted-foreground hover:text-primary">
                Produk
              </Link>
              <Link href="/cart" className="block text-sm text-muted-foreground hover:text-primary">
                Keranjang
              </Link>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="font-semibold">Kategori</h3>
            <div className="space-y-2">
              <Link href="/product?category=fashion" className="block text-sm text-muted-foreground hover:text-primary">
                Fashion
              </Link>
              <Link href="/product?category=rumah" className="block text-sm text-muted-foreground hover:text-primary">
                Rumah & Taman
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold">Kontak</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>info@tokoonline.com</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+62 123 456 7890</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Jakarta, Indonesia</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">© 2024 Toko Online. Semua hak dilindungi.</p>
        </div>
      </div>
    </footer>
  )
}

"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { useCartStore } from "@/stores/cart-store"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import axiosAPI from "@/services/api"
import Script from "next/script"

interface OrderItemPayload {
  id: string;
  jumlah: number;
}

interface OrderResponse {
  idPesanan: string;
  token: string;
  redirectUrl: string;
}

declare global {
  interface Window {
    snap: {
      pay: (token: string, options?: {
        onSuccess?: (result: any) => void
        onPending?: (result: any) => void
        onError?: (error: any) => void
        onClose?: () => void
      }) => void
    }
  }
}

const checkoutSchema = z.object({
  namaDepan: z.string().min(2, "Nama depan minimal 2 karakter"),
  namaBelakang: z.string().min(2, "Nama belakang minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  telepon: z.string()
    .min(10, "Nomor telepon minimal 10 digit")
    .regex(/^[0-9]+$/, "Hanya angka yang diperbolehkan"),
  alamat: z.string().min(10, "Alamat minimal 10 karakter"),
  kota: z.string().min(2, "Kota harus diisi"),
  provinsi: z.string().min(2, "Provinsi harus diisi"),
  kodePos: z.string()
    .min(5, "Kode pos minimal 5 digit")
    .regex(/^[0-9]+$/, "Hanya angka yang diperbolehkan"),
  catatan: z.string().optional(),
})

type CheckoutForm = z.infer<typeof checkoutSchema>

export default function CheckoutPage() {
  const { items, total, clearCart } = useCartStore()
  const { toast } = useToast()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [isScriptLoaded, setIsScriptLoaded] = useState(false)

  const form = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      namaDepan: "",
      namaBelakang: "",
      email: "",
      telepon: "",
      alamat: "",
      kota: "",
      provinsi: "",
      kodePos: "",
      catatan: "",
    },
  })

  const shippingCost = total >= 500000 ? 0 : 25000
  const finalTotal = total + shippingCost

  useEffect(() => {
    // Check if script is already loaded
    if (window.snap) {
      setIsScriptLoaded(true)
      return
    }

    console.log(process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY)

    const script = document.createElement('script')
    script.src = 'https://app.sandbox.midtrans.com/snap/snap.js'
    script.async = true
    script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '')
    script.onload = () => setIsScriptLoaded(true)
    script.onerror = () => {
      toast({
        title: "Gagal memuat pembayaran",
        description: "Tidak dapat memuat sistem pembayaran. Silakan coba lagi.",
        variant: "destructive",
      })
    }

    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [toast])

 const onSubmit = async (data: CheckoutForm) => {
  if (items.length === 0) {
    toast({
      title: "Keranjang kosong",
      description: "Silakan tambahkan produk sebelum checkout.",
      variant: "destructive",
    });
    return;
  }

  if (!isScriptLoaded) {
    toast({
      title: "Sistem pembayaran belum siap",
      description: "Silakan tunggu sebentar dan coba lagi.",
      variant: "destructive",
    });
    return;
  }

  setIsProcessing(true);

  try {
    const orderPayload = {
      namaDepan: data.namaDepan,
      namaBelakang: data.namaBelakang,
      email: data.email,
      telepon: data.telepon,
      alamat: data.alamat,
      kota: data.kota,
      provinsi: data.provinsi,
      kodePos: data.kodePos,
      catatan: data.catatan,
      items: items.map((item) => ({
        id: item.id,
        jumlah: item.quantity,
      })),
    };

    const response = await axiosAPI.post<OrderResponse>("/pesanan", orderPayload);
    const { token, idPesanan } = response.data;

    window.snap.pay(token, {
      onSuccess: (result) => {
        toast({
          title: "Pembayaran sukses!",
          description: `Order ID: ${idPesanan}`,
        });
        clearCart();
        router.push('/');
      },
      onPending: (result) => {
        toast({
          title: "Menunggu pembayaran",
          description: `Silakan selesaikan pembayaran untuk order ID: ${idPesanan}`,
        });
        clearCart();
        router.push(`/order/${idPesanan}`);
      },
      onError: (error) => {
        console.error("Payment error:", error);
        toast({
          title: "Gagal memproses pembayaran",
          description: error.message || "Terjadi kesalahan saat memproses pembayaran",
          variant: "destructive",
        });
      },
      onClose: () => {
        toast({
          title: "Pembayaran dibatalkan",
          description: "Anda menutup jendela pembayaran.",
        });
      },
    });
  } catch (error: any) {
    console.error("Checkout error:", error);
    toast({
      title: "Terjadi kesalahan",
      description: error.response?.data?.message || "Gagal menyelesaikan transaksi",
      variant: "destructive",
    });
  } finally {
    setIsProcessing(false);
  }
};

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-4">Keranjang Kosong</h1>
          <p className="text-muted-foreground mb-8">
            Tidak ada produk untuk di-checkout. Silakan tambahkan produk ke keranjang terlebih dahulu.
          </p>
          <Button asChild size="lg">
            <a href="/product">Mulai Belanja</a>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Script 
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        strategy="afterInteractive"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        onLoad={() => setIsScriptLoaded(true)}
        onError={() => {
          toast({
            title: "Gagal memuat pembayaran",
            description: "Tidak dapat memuat sistem pembayaran. Silakan coba lagi.",
            variant: "destructive",
          })
        }}
      />

      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Shipping Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Informasi Pengiriman</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="namaDepan"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nama Depan</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Masukkan nama depan" 
                              {...field} 
                              autoComplete="given-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="namaBelakang"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nama Belakang</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Masukkan nama belakang" 
                              {...field} 
                              autoComplete="family-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="nama@email.com" 
                              {...field} 
                              autoComplete="email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="telepon"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nomor Telepon</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="08123456789" 
                              {...field} 
                              autoComplete="tel"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="alamat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alamat Lengkap</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Masukkan alamat lengkap termasuk nama jalan, nomor rumah, RT/RW"
                            {...field}
                            autoComplete="street-address"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="kota"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kota</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Kalimantan barat" 
                              {...field} 
                              autoComplete="address-level2"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="provinsi"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Provinsi</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih provinsi" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Kalimantan Barat">Pontianak</SelectItem>
                              <SelectItem value="Mempawah">Mempawah</SelectItem>
                              <SelectItem value="Singkawang">Singkwang</SelectItem>
                              <SelectItem value="Sambas">Sambas</SelectItem>
                              <SelectItem value="Jawai">Jawai</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="kodePos"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kode Pos</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="12345" 
                              {...field} 
                              autoComplete="postal-code"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Order Notes */}
              <Card>
                <CardHeader>
                  <CardTitle>Catatan Pesanan (Opsional)</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="catatan"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea 
                            placeholder="Tambahkan catatan khusus untuk pesanan Anda..." 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Ringkasan Pesanan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Order Items */}
                  <div className="space-y-3">
  {items.map((item) => (
    <div key={item.id} className="flex gap-3">
      <div className="relative w-16 h-16 flex-shrink-0">
        <Image
          src={item.image || "/placeholder.svg"}
          alt={item.name}
          fill
          className="object-cover rounded-lg"
          sizes="64px"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm line-clamp-2">{item.name}</h4>
        <p className="text-sm text-muted-foreground">
          {item.quantity}x Rp {item.price.toLocaleString("id-ID")}
        </p>
      </div>
      <div className="text-right">
        <p className="font-medium text-sm">
          Rp {(item.price * item.quantity).toLocaleString("id-ID")}
        </p>
      </div>
    </div>
  ))}
</div>

                  <Separator />

                  {/* Price Breakdown */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)} item)</span>
                      <span>Rp {total.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ongkos Kirim</span>
                      <span>
                        {shippingCost === 0 ? (
                          <span className="text-green-600">Gratis</span>
                        ) : (
                          `Rp ${shippingCost.toLocaleString("id-ID")}`
                        )}
                      </span>
                    </div>
                    {total < 500000 && (
                      <p className="text-xs text-muted-foreground">
                        Belanja Rp {(500000 - total).toLocaleString("id-ID")} lagi untuk gratis ongkir
                      </p>
                    )}
                  </div>

                  <Separator />

                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>Rp {finalTotal.toLocaleString("id-ID")}</span>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg" 
                    disabled={isProcessing || !isScriptLoaded}
                  >
                    {isProcessing ? "Memproses..." : "Buat Pesanan"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}
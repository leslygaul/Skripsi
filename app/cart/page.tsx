"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCartStore } from "@/stores/cart-store";

export default function CartPage() {
  const { items, total, updateQuantity, removeItem } = useCartStore();
  const { toast } = useToast();

  const shippingCost = total >= 500_000 ? 0 : 25_000;
  const finalTotal = total + shippingCost;

  const handleRemove = (id: string, name: string) => {
    removeItem(id);
    toast({
      title: "Produk dihapus",
      description: `${name} berhasil dihapus dari keranjang.`,
    });
  };

  const handleUpdateQuantity = (id: string, quantity: number, name: string) => {
    if (quantity <= 0) {
      handleRemove(id, name);
    } else {
      updateQuantity(id, quantity);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-md mx-auto">
          <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground mb-6" />
          <h1 className="text-2xl font-bold mb-4">Keranjang Kosong</h1>
          <p className="text-muted-foreground mb-8">
            Belum ada produk di keranjang Anda. Mulai berbelanja sekarang!
          </p>
          <Button asChild size="lg">
            <Link href="/product">Mulai Belanja</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Keranjang Belanja</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{item.name}</h3>
                        {item.warna && (
                          <p className="text-sm text-muted-foreground">
                            Warna: {item.warna}
                          </p>
                        )}
                        {item.ukuran && (
                          <p className="text-sm text-muted-foreground">
                            Ukuran: {item.ukuran}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemove(item.id, item.name)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleUpdateQuantity(
                              item.id,
                              item.quantity - 1,
                              item.name
                            )
                          }
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          disabled={item.quantity >= item.stock}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          Rp {item.price.toLocaleString("id-ID")} x{" "}
                          {item.quantity}
                        </p>
                        <p className="font-bold text-lg">
                          Rp{" "}
                          {(item.price * item.quantity).toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Ringkasan Pesanan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>
                    Subtotal (
                    {items.reduce((sum, item) => sum + item.quantity, 0)} item)
                  </span>
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
                {total < 500_000 && (
                  <p className="text-xs text-muted-foreground">
                    Belanja Rp {(500_000 - total).toLocaleString("id-ID")} lagi
                    untuk gratis ongkir
                  </p>
                )}
              </div>

              <Separator />

              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>Rp {finalTotal.toLocaleString("id-ID")}</span>
              </div>

              <Button asChild className="w-full" size="lg">
                <Link href="/checkout">Lanjut ke Checkout</Link>
              </Button>

              <Button asChild variant="outline" className="w-full">
                <Link href="/product">Lanjut Belanja</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

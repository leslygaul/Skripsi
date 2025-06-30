import { z } from "zod"

export const checkoutSchema = z.object({
  firstName: z.string().min(2, "Nama depan minimal 2 karakter"),
  lastName: z.string().min(2, "Nama belakang minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  phone: z.string().min(10, "Nomor telepon minimal 10 digit"),
  address: z.string().min(10, "Alamat minimal 10 karakter"),
  city: z.string().min(2, "Kota harus diisi"),
  state: z.string().min(2, "Provinsi harus diisi"),
  zipCode: z.string().min(5, "Kode pos minimal 5 digit"),
  paymentMethod: z.enum(["transfer", "cod", "ewallet"]),
  shippingMethod: z.enum(["regular", "express"]),
})

export type CheckoutFormData = z.infer<typeof checkoutSchema>

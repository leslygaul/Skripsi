"use client";

import { useState, useEffect } from "react";
import { CldUploadWidget, CldImage } from "next-cloudinary";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm, UseFormSetValue } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Eye, ImageIcon, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import axiosAPI from "@/services/api";
import Fuse from "fuse.js";
import { ChangeEvent } from "react";

// Types
type Product = {
  id: string;
  nama: string;
  deskripsi: string;
  harga: number;
  jumlah: number;
  gambar: string;
  ukuran: string;
  warna: string;
  kategoriId: string;
  dibuatPada: string;
  diperbarui: string;
  kategori: {
    id: string;
    nama: string;
    dibuatPada: string;
    diperbarui: string;
  };
};

type Category = {
  id: string;
  nama: string;
  dibuatPada: string;
  diperbarui: string;
};

type ApiResponse = Product[]; // langsung array

type CategoryResponse = {
  status: boolean;
  pesan: string;
  data: Category[];
};

// Validation schema
const productSchema = z.object({
  nama: z.string().min(2, "Product name must be at least 2 characters"),
  kategoriId: z.string().min(1, "Please select a category"),
  deskripsi: z.string().min(10, "Description must be at least 10 characters"),
  harga: z.coerce.number().positive("Price must be positive"),
  jumlah: z.coerce
    .number()
    .int()
    .nonnegative("Stock must be a non-negative integer"),
  gambar: z.string().optional(),
  ukuran: z.string().optional(),
  warna: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function ProductPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Initialize Fuse.js for fuzzy search
  const fuseOptions = {
    keys: ["nama", "deskripsi", "kategori.nama"],
    threshold: 0.3,
  };
  const [fuse, setFuse] = useState<Fuse<Product>>(new Fuse([], fuseOptions));

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      nama: "",
      kategoriId: "",
      deskripsi: "",
      harga: 0,
      jumlah: 0,
      gambar: "",
      ukuran: "",
      warna: "",
    },
  });

  const editForm = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      nama: "",
      kategoriId: "",
      deskripsi: "",
      harga: 0,
      jumlah: 0,
      gambar: "",
      ukuran: "",
      warna: "",
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch products
        const productsResponse = await axiosAPI.get<ApiResponse>("/produk");
        const produk = productsResponse.data;
        console.log(produk);
        setProducts(produk);
        setFilteredProducts(produk);
        setFuse(new Fuse(produk, fuseOptions));

        // Fetch categories
        const categoriesResponse = await axiosAPI.get("/kategori");
        const kategori = categoriesResponse.data;
        console.log(kategori);
        setCategories(kategori);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update filtered products when search query or category filter changes
  useEffect(() => {
    if (searchQuery.trim() === "") {
      if (categoryFilter === "all") {
        setFilteredProducts(products);
      } else {
        setFilteredProducts(
          products.filter((product) => product.kategoriId === categoryFilter)
        );
      }
    } else {
      const results = fuse.search(searchQuery);
      const searchedProducts = results.map((result) => result.item);

      if (categoryFilter === "all") {
        setFilteredProducts(searchedProducts);
      } else {
        setFilteredProducts(
          searchedProducts.filter(
            (product) => product.kategoriId === categoryFilter
          )
        );
      }
    }
  }, [searchQuery, categoryFilter, products, fuse]);

  useEffect(() => {
    if (currentProduct) {
      editForm.reset({
        nama: currentProduct.nama,
        kategoriId: currentProduct.kategoriId,
        deskripsi: currentProduct.deskripsi,
        harga: currentProduct.harga,
        jumlah: currentProduct.jumlah,
        gambar: currentProduct.gambar,
        ukuran: currentProduct.ukuran,
        warna: currentProduct.warna,
      });
    }
  }, [currentProduct, editForm]);

  const getProduct = async () => {
    const productsResponse = await axiosAPI.get<ApiResponse>("/produk");
    const produk = productsResponse.data;
    setProducts(produk);
  };

  const handleUpload = async (
    e: ChangeEvent<HTMLInputElement>,
    setValue: UseFormSetValue<ProductFormValues>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    const CLOUD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!CLOUD_PRESET) {
      throw new Error(
        "Missing NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET in environment variables"
      );
    }

    formData.append("file", file);
    formData.append("upload_preset", CLOUD_PRESET);

    const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();
    if (data.secure_url) {
      setValue("gambar", data.secure_url);
    }
  };

  const handleAddProduct = async (data: ProductFormValues) => {
    try {
      const response = await axiosAPI.post("/produk", data);

      if (response.status === 201 || response.status === 200) {
        setProducts((prev) => [...prev, response.data]);
        setIsAddDialogOpen(false);
        setCurrentProduct(null);
        form.reset();

        toast({
          title: "Success",
          description: "Product added successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Unexpected server response",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add product",
        variant: "destructive",
      });
    }
  };

  const handleEditProduct = async (data: ProductFormValues) => {
    if (!currentProduct) return;

    try {
      const response = await axiosAPI.patch(
        `/produk/${currentProduct.id}`,
        data
      );

      if (response.status === 200 || response.status === 204) {
        setProducts((prev) =>
          prev.map((product) =>
            product.id === currentProduct.id ? response.data : product
          )
        );

        setIsEditDialogOpen(false);
        setCurrentProduct(null);

        toast({
          title: "Success",
          description: "Product updated successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Unexpected server response.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update product.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async () => {
    if (!currentProduct) return;

    try {
      const response = await axiosAPI.delete(`/produk/${currentProduct.id}`);

      if (response.status === 200 || response.status === 204) {
        // Hapus dari state lokal — cukup, tanpa fetch ulang
        setProducts((prev) =>
          prev.filter((product) => product.id !== currentProduct.id)
        );

        setIsDeleteDialogOpen(false);
        setCurrentProduct(null);

        toast({
          title: "Success",
          description: "Product deleted successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Unexpected response from server.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 md:ml-64">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Products</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>
                Create a new product. Fill in all the required fields.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleAddProduct)}
                className="space-y-4"
              >
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="variants">Variants</TabsTrigger>
                  </TabsList>
                  <TabsContent value="basic" className="space-y-4 pt-4">
                    <FormField
                      control={form.control}
                      name="nama"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter product name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="kategoriId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories?.map((category) => (
                                <SelectItem
                                  key={category.id}
                                  value={category.id}
                                >
                                  {category.nama}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="deskripsi"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter product description"
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                  <TabsContent value="details" className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="harga"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price (Rp)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Enter price"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="jumlah"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Stock</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Enter stock quantity"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="gambar"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Image</FormLabel>
                          <FormControl>
                            <div className="space-y-4">
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleUpload(e, form.setValue)}
                              />

                              {field.value ? (
                                <div className="border rounded-md p-4 flex flex-col items-center">
                                  <img
                                    src={field.value}
                                    alt="Preview"
                                    className="rounded-md object-contain max-h-[200px]"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    className="mt-2 text-red-500 hover:text-red-600"
                                    onClick={() => form.setValue("gambar", "")}
                                  >
                                    Remove Image
                                  </Button>
                                </div>
                              ) : (
                                <div className="border rounded-md p-8 flex flex-col items-center text-muted-foreground">
                                  <ImageIcon className="h-16 w-16 mb-2" />
                                  <span>No image uploaded</span>
                                </div>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                  <TabsContent value="variants" className="space-y-4 pt-4">
                    <FormField
                      control={form.control}
                      name="ukuran"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Size</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter product size"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="warna"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter product color"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                </Tabs>
                <DialogFooter>
                  <Button type="submit">Save Product</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Products</CardTitle>
          <CardDescription>
            View and manage all products. You can add, edit, or delete products.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Loading products...
                    </TableCell>
                  </TableRow>
                ) : filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No products found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts?.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={product.gambar || "/placeholder.svg"}
                            alt={product.nama}
                            className="h-10 w-10 rounded-md object-cover"
                          />
                          <div>
                            <div className="font-medium">{product.nama}</div>
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {product.deskripsi}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{product?.kategori?.nama}</TableCell>
                      <TableCell>
                        Rp {product.harga?.toLocaleString("id-ID")}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            product.jumlah > 10
                              ? "bg-green-100 text-green-800"
                              : product.jumlah > 0
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {product.jumlah} in stock
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Dialog
                            open={isViewDialogOpen}
                            onOpenChange={setIsViewDialogOpen}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setCurrentProduct(product)}
                              >
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">View</span>
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl">
                              <DialogHeader>
                                <DialogTitle>Product Details</DialogTitle>
                              </DialogHeader>
                              {currentProduct && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div>
                                    <img
                                      src={
                                        currentProduct.gambar ||
                                        "/placeholder.svg"
                                      }
                                      alt={currentProduct.nama}
                                      className="w-full h-auto rounded-md object-cover"
                                    />
                                  </div>
                                  <div className="space-y-4">
                                    <div>
                                      <h3 className="text-xl font-bold">
                                        {currentProduct.nama}
                                      </h3>
                                      <p className="text-sm text-muted-foreground">
                                        Category: {currentProduct?.kategori?.nama}
                                      </p>
                                    </div>
                                    <div>
                                      <h4 className="font-medium">
                                        Description
                                      </h4>
                                      <p className="text-sm">
                                        {currentProduct.deskripsi}
                                      </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <h4 className="font-medium">Price</h4>
                                        <p className="text-lg font-bold">
                                          Rp{" "}
                                          {currentProduct?.harga?.toLocaleString(
                                            "id-ID"
                                          )}
                                        </p>
                                      </div>
                                      <div>
                                        <h4 className="font-medium">Stock</h4>
                                        <p className="text-lg font-bold">
                                          {currentProduct.jumlah}
                                        </p>
                                      </div>
                                    </div>
                                    {currentProduct.ukuran && (
                                      <div>
                                        <h4 className="font-medium">Size</h4>
                                        <p className="text-sm">
                                          {currentProduct.ukuran}
                                        </p>
                                      </div>
                                    )}
                                    {currentProduct.warna && (
                                      <div>
                                        <h4 className="font-medium">Color</h4>
                                        <p className="text-sm">
                                          {currentProduct.warna}
                                        </p>
                                      </div>
                                    )}
                                    <div>
                                      <h4 className="font-medium">
                                        Created At
                                      </h4>
                                      <p className="text-sm">
                                        {new Date(
                                          currentProduct.dibuatPada
                                        ).toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>

                          <Dialog
                            open={isEditDialogOpen}
                            onOpenChange={setIsEditDialogOpen}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setCurrentProduct(product)}
                              >
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl">
                              <DialogHeader>
                                <DialogTitle>Edit Product</DialogTitle>
                                <DialogDescription>
                                  Update product information. Click save when
                                  you're done.
                                </DialogDescription>
                              </DialogHeader>
                              <Form {...editForm}>
                                <form
                                  onSubmit={editForm.handleSubmit(
                                    handleEditProduct
                                  )}
                                  className="space-y-4"
                                >
                                  <Tabs defaultValue="basic" className="w-full">
                                    <TabsList className="grid w-full grid-cols-3">
                                      <TabsTrigger value="basic">
                                        Basic Info
                                      </TabsTrigger>
                                      <TabsTrigger value="details">
                                        Details
                                      </TabsTrigger>
                                      <TabsTrigger value="variants">
                                        Variants
                                      </TabsTrigger>
                                    </TabsList>
                                    <TabsContent
                                      value="basic"
                                      className="space-y-4 pt-4"
                                    >
                                      <FormField
                                        control={editForm.control}
                                        name="nama"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Product Name</FormLabel>
                                            <FormControl>
                                              <Input
                                                placeholder="Enter product name"
                                                {...field}
                                              />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={editForm.control}
                                        name="kategoriId"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Category</FormLabel>
                                            <Select
                                              onValueChange={field.onChange}
                                              defaultValue={field.value}
                                            >
                                              <FormControl>
                                                <SelectTrigger>
                                                  <SelectValue placeholder="Select category" />
                                                </SelectTrigger>
                                              </FormControl>
                                              <SelectContent>
                                                {categories.map((category) => (
                                                  <SelectItem
                                                    key={category.id}
                                                    value={category.id}
                                                  >
                                                    {category.nama}
                                                  </SelectItem>
                                                ))}
                                              </SelectContent>
                                            </Select>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={editForm.control}
                                        name="deskripsi"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                              <Textarea
                                                placeholder="Enter product description"
                                                className="min-h-[100px]"
                                                {...field}
                                              />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                    </TabsContent>
                                    <TabsContent
                                      value="details"
                                      className="space-y-4 pt-4"
                                    >
                                      <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                          control={editForm.control}
                                          name="harga"
                                          render={({ field }) => (
                                            <FormItem>
                                              <FormLabel>Price (Rp)</FormLabel>
                                              <FormControl>
                                                <Input
                                                  type="number"
                                                  placeholder="Enter price"
                                                  {...field}
                                                  onChange={(e) =>
                                                    field.onChange(
                                                      Number(e.target.value)
                                                    )
                                                  }
                                                />
                                              </FormControl>
                                              <FormMessage />
                                            </FormItem>
                                          )}
                                        />
                                        <FormField
                                          control={editForm.control}
                                          name="jumlah"
                                          render={({ field }) => (
                                            <FormItem>
                                              <FormLabel>Stock</FormLabel>
                                              <FormControl>
                                                <Input
                                                  type="number"
                                                  placeholder="Enter stock quantity"
                                                  {...field}
                                                  onChange={(e) =>
                                                    field.onChange(
                                                      Number(e.target.value)
                                                    )
                                                  }
                                                />
                                              </FormControl>
                                              <FormMessage />
                                            </FormItem>
                                          )}
                                        />
                                      </div>
                                      <FormField
                                        control={editForm.control}
                                        name="gambar"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Image URL</FormLabel>
                                            <FormControl>
                                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <Input
                                                  placeholder="Enter image URL"
                                                  {...field}
                                                />
                                                <div className="border rounded-md p-2 flex items-center justify-center">
                                                  {field.value ? (
                                                    <img
                                                      src={field.value}
                                                      alt="Product preview"
                                                      className="max-h-[100px] object-contain"
                                                    />
                                                  ) : (
                                                    <div className="flex flex-col items-center text-muted-foreground">
                                                      <ImageIcon className="h-10 w-10 mb-2" />
                                                      <span>No image</span>
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                    </TabsContent>
                                    <TabsContent
                                      value="variants"
                                      className="space-y-4 pt-4"
                                    >
                                      <FormField
                                        control={editForm.control}
                                        name="ukuran"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Size</FormLabel>
                                            <FormControl>
                                              <Input
                                                placeholder="Enter product size"
                                                {...field}
                                              />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={editForm.control}
                                        name="warna"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Color</FormLabel>
                                            <FormControl>
                                              <Input
                                                placeholder="Enter product color"
                                                {...field}
                                              />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                    </TabsContent>
                                  </Tabs>
                                  <DialogFooter>
                                    <Button type="submit">Save Changes</Button>
                                  </DialogFooter>
                                </form>
                              </Form>
                            </DialogContent>
                          </Dialog>

                          <Dialog
                            open={isDeleteDialogOpen}
                            onOpenChange={setIsDeleteDialogOpen}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={() => setCurrentProduct(product)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Delete Product</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to delete "
                                  {currentProduct?.nama}"? This action cannot be
                                  undone.
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => setIsDeleteDialogOpen(false)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={handleDeleteProduct}
                                  className="ml-2"
                                >
                                  Delete
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
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
            Showing {filteredProducts.length} of {products.length} products
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

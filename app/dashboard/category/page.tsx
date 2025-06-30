"use client";

import { useState, useEffect } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Pencil, Plus, Search, Tag, Trash2 } from "lucide-react";
import axiosAPI from "@/services/api";
import Fuse from "fuse.js";

// Validation schema
const categorySchema = z.object({
  name: z.string().min(2, "Nama kategori minimal 2 karakter"),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface Category {
  id: string;
  nama: string;
  dibuatPada: string;
  diperbarui: string;
}

export default function CategoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fuse = new Fuse(categories, {
    keys: ["nama"],
    threshold: 0.3, // semakin kecil, semakin ketat pencariannya
  });
  const filteredCategories =
    searchQuery.trim() === ""
      ? categories
      : fuse.search(searchQuery).map((result) => result.item);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
    },
  });

  const editForm = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
    },
  });

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const response = await axiosAPI.get("/kategori");
        setCategories(response.data);
      } catch (error) {
        toast({
          title: "Gagal memuat kategori",
          description: "Terjadi kesalahan saat memuat data kategori",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const getCategories = async () => {
    const response = await axiosAPI.get("/kategori");
    setCategories(response.data);
  };

  const handleAddCategory = async (data: CategoryFormValues) => {
    try {
      setIsLoading(true);
      const response = await axiosAPI.post("/kategori", {
        nama: data.name,
      });

      setCategories((prev) => [...prev, response.data]); // Optional: optimistik
      await getCategories(); // Ambil ulang produk terbaru
      setIsAddDialogOpen(false);
      form.reset();

      toast({
        title: "Kategori berhasil ditambahkan",
        description: `${data.name} telah berhasil ditambahkan.`,
      });
    } catch (error) {
      toast({
        title: "Gagal menambahkan kategori",
        description: "Terjadi kesalahan saat menambahkan kategori",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCategory = async (data: CategoryFormValues) => {
    if (!currentCategory) return;

    try {
      setIsLoading(true);
      const response = await axiosAPI.patch(`/kategori/${currentCategory.id}`, {
        nama: data.name,
      });

      await getCategories();
      setIsEditDialogOpen(false);
      setCurrentCategory(null);

      toast({
        title: "Kategori berhasil diperbarui",
        description: `Kategori telah diperbarui menjadi ${data.name}.`,
      });
    } catch (error) {
      toast({
        title: "Gagal memperbarui kategori",
        description: "Terjadi kesalahan saat memperbarui kategori",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!currentCategory) return;

    try {
      setIsLoading(true);
      await axiosAPI.delete(`/kategori/${currentCategory.id}`);

      await getCategories();
      setIsDeleteDialogOpen(false);
      setCurrentCategory(null);

      toast({
        title: "Kategori berhasil dihapus",
        description: `${currentCategory.nama} telah berhasil dihapus.`,
      });
    } catch (error) {
      toast({
        title: "Gagal menghapus kategori",
        description: "Terjadi kesalahan saat menghapus kategori",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openEditDialog = (category: Category) => {
    setCurrentCategory(category);
    editForm.reset({ name: category.nama });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 md:ml-64">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Kategori</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={isLoading}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Kategori
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Kategori Baru</DialogTitle>
              <DialogDescription>
                Buat kategori produk baru. Klik simpan ketika sudah selesai.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleAddCategory)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Kategori</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Tag className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Masukkan nama kategori"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Menyimpan..." : "Simpan Kategori"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kelola Kategori</CardTitle>
          <CardDescription>
            Lihat dan kelola kategori produk. Anda dapat menambah, mengedit,
            atau menghapus kategori.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari kategori..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Kategori</TableHead>
                  <TableHead>Dibuat Pada</TableHead>
                  <TableHead>Diperbarui</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Tidak ada kategori yang ditemukan
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">
                        {category.nama}
                      </TableCell>
                      <TableCell>
                        {new Date(category.dibuatPada).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(category.diperbarui).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Dialog
                            open={isEditDialogOpen}
                            onOpenChange={setIsEditDialogOpen}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog(category)}
                                disabled={isLoading}
                              >
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Kategori</DialogTitle>
                                <DialogDescription>
                                  Perbarui nama kategori. Klik simpan ketika
                                  sudah selesai.
                                </DialogDescription>
                              </DialogHeader>
                              <Form {...editForm}>
                                <form
                                  onSubmit={editForm.handleSubmit(
                                    handleEditCategory
                                  )}
                                  className="space-y-4"
                                >
                                  <FormField
                                    control={editForm.control}
                                    name="name"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Nama Kategori</FormLabel>
                                        <FormControl>
                                          <div className="relative">
                                            <Tag className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                              placeholder="Masukkan nama kategori"
                                              className="pl-10"
                                              {...field}
                                            />
                                          </div>
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <DialogFooter>
                                    <Button type="submit" disabled={isLoading}>
                                      {isLoading
                                        ? "Menyimpan..."
                                        : "Simpan Perubahan"}
                                    </Button>
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
                                onClick={() => setCurrentCategory(category)}
                                disabled={isLoading}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Hapus</span>
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Hapus Kategori</DialogTitle>
                                <DialogDescription>
                                  Apakah Anda yakin ingin menghapus kategori "
                                  {currentCategory?.nama}"? Tindakan ini tidak
                                  dapat dibatalkan.
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => setIsDeleteDialogOpen(false)}
                                  disabled={isLoading}
                                >
                                  Batal
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={handleDeleteCategory}
                                  className="ml-2"
                                  disabled={isLoading}
                                >
                                  {isLoading ? "Menghapus..." : "Hapus"}
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
            Menampilkan {categories.length} dari {categories.length} kategori
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

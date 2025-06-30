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
import { Eye, EyeOff, Pencil, Plus, Search, Trash2, User } from "lucide-react";
import { FileInputIcon as InputIcon } from "lucide-react";
import Fuse from "fuse.js";
import axiosAPI from "@/services/api";

type Peran = "ADMIN" | "PENGGUNA";

// Types
type User = {
  id: string;
  nama: string;
  email: string;
  peran: Peran;
  dibuatPada: string;
  diperbarui: string;
};

type ApiResponse = {
  status: boolean;
  pesan: string;
  data: User[];
};

// Validation schema
const userSchema = z.object({
  nama: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  sandi: z
    .string()
    .min(6, "sandi must be at least 6 characters")
    .optional()
    .or(z.literal("")),
  peran: z.enum(["PENGGUNA", "ADMIN"]),
});

type UserFormValues = z.infer<typeof userSchema>;

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showsandi, setShowsandi] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Initialize Fuse.js for fuzzy search
  const fuseOptions = {
    keys: ["nama", "email", "peran"],
    threshold: 0.3,
  };
  const [fuse, setFuse] = useState<Fuse<User>>(new Fuse([], fuseOptions));

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      nama: "",
      email: "",
      sandi: "",
      peran: "PENGGUNA",
    },
  });

  const editForm = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      nama: "",
      email: "",
      sandi: "",
      peran: "PENGGUNA",
    },
  });

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const response = await axiosAPI.get<ApiResponse>("/pengguna");
        if (response.data.status) {
          setUsers(response.data.data);
          setFilteredUsers(response.data.data);
          setFuse(new Fuse(response.data.data, fuseOptions));
        } else {
          toast({
            title: "Error",
            description: response.data.pesan,
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch users",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Update filtered users when search query changes
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users);
    } else {
      const results = fuse.search(searchQuery);
      setFilteredUsers(results.map((result) => result.item));
    }
  }, [searchQuery, users, fuse]);

  useEffect(() => {
    if (currentUser) {
      editForm.reset({
        nama: currentUser.nama,
        email: currentUser.email,
        sandi: "",
        peran: currentUser.peran,
      });
    }
  }, [currentUser, editForm]);

  const getUsers = async () => {
    const response = await axiosAPI.get<ApiResponse>("/pengguna");
    if (response.data.status) {
      setUsers(response.data.data);
    }
  };

  const handleAddUser = async (data: UserFormValues) => {
    try {
      const response = await axiosAPI.post<ApiResponse>("/pengguna", data);

      if (response.data.status) {
        await getUsers(); // refresh daftar pengguna dari server
        setIsAddDialogOpen(false);
        form.reset();

        toast({
          title: "User added",
          description: `${data.nama} has been added successfully.`,
        });
      } else {
        toast({
          title: "Error",
          description: response.data.pesan,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add user",
        variant: "destructive",
      });
    }
  };

  const handleEditUser = async (data: UserFormValues) => {
    if (!currentUser) return;

    try {
      const response = await axiosAPI.patch<ApiResponse>(
        `/pengguna/${currentUser.id}`,
        data
      );

      if (response.data.status) {
        await getUsers(); // Refresh data pengguna dari server
        setIsEditDialogOpen(false);
        setCurrentUser(null);

        toast({
          title: "User updated",
          description: `${data.nama} has been updated successfully.`,
        });
      } else {
        toast({
          title: "Error",
          description: response.data.pesan,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!currentUser) return;

    try {
      const response = await axiosAPI.delete<ApiResponse>(
        `/pengguna/${currentUser.id}`
      );
      if (response.data.status) {
        const updatedUsers = users.filter((user) => user.id !== currentUser.id);
        setUsers(updatedUsers);
        setIsDeleteDialogOpen(false);
        setCurrentUser(null);

        toast({
          title: "User deleted",
          description: `${currentUser.nama} has been deleted successfully.`,
        });
      } else {
        toast({
          title: "Error",
          description: response.data.pesan,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 md:ml-64">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Users</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user account. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleAddUser)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="nama"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Enter name"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <InputIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="email"
                            placeholder="Enter email"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sandi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>sandi</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <InputIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            type={showsandi ? "text" : "sandi"}
                            placeholder="Enter sandi"
                            className="pl-10 pr-10"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowsandi(!showsandi)}
                          >
                            {showsandi ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="peran"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PENGGUNA">User</SelectItem>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">Save User</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Users</CardTitle>
          <CardDescription>
            View and manage all user accounts. You can add, edit, or delete
            users.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
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
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created At</TableHead>
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
                      Loading users...
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.nama}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            user.peran === "ADMIN"
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {user.peran}
                        </span>
                      </TableCell>
                      <TableCell>
                        {new Date(user.dibuatPada).toLocaleDateString()}
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
                                onClick={() => setCurrentUser(user)}
                              >
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit User</DialogTitle>
                                <DialogDescription>
                                  Update user information. Click save when
                                  you're done.
                                </DialogDescription>
                              </DialogHeader>
                              <Form {...editForm}>
                                <form
                                  onSubmit={editForm.handleSubmit(
                                    handleEditUser
                                  )}
                                  className="space-y-4"
                                >
                                  <FormField
                                    control={editForm.control}
                                    name="nama"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                          <div className="relative">
                                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                              placeholder="Enter name"
                                              className="pl-10"
                                              {...field}
                                            />
                                          </div>
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={editForm.control}
                                    name="email"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                          <div className="relative">
                                            <InputIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                              type="email"
                                              placeholder="Enter email"
                                              className="pl-10"
                                              {...field}
                                            />
                                          </div>
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={editForm.control}
                                    name="sandi"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>
                                          sandi{" "}
                                          <span className="text-muted-foreground text-xs">
                                            (Leave blank to keep current)
                                          </span>
                                        </FormLabel>
                                        <FormControl>
                                          <div className="relative">
                                            <InputIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                              type={
                                                showsandi ? "text" : "sandi"
                                              }
                                              placeholder="Enter new sandi"
                                              className="pl-10 pr-10"
                                              {...field}
                                            />
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="sm"
                                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                              onClick={() =>
                                                setShowsandi(!showsandi)
                                              }
                                            >
                                              {showsandi ? (
                                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                                              ) : (
                                                <Eye className="h-4 w-4 text-muted-foreground" />
                                              )}
                                            </Button>
                                          </div>
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={editForm.control}
                                    name="peran"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Role</FormLabel>
                                        <Select
                                          onValueChange={field.onChange}
                                          defaultValue={field.value}
                                        >
                                          <FormControl>
                                            <SelectTrigger>
                                              <SelectValue placeholder="Select role" />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                            <SelectItem value="PENGGUNA">
                                              User
                                            </SelectItem>
                                            <SelectItem value="ADMIN">
                                              Admin
                                            </SelectItem>
                                          </SelectContent>
                                        </Select>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
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
                                onClick={() => setCurrentUser(user)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Delete User</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to delete this user?
                                  This action cannot be undone.
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
                                  onClick={handleDeleteUser}
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
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import useAuthStore from "@/stores/auth-store";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Package,
  Tag,
  LogOut,
  Menu,
  Home,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface UserInfo {
  email: string | null;
  name: string | null;
  role: string | null;
}

export default function DashboardSidebar({ user }: { user: UserInfo }) {
  const pathname = usePathname();
  const { logout } = useAuthStore();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleLogout = () => {
    logout();
    toast({
      title: "Berhasil logout",
      description: "Anda telah berhasil keluar dari akun.",
    });
  };

  const isActive = (path: string) => {
    if (path === "/dashboard" && pathname === "/dashboard") {
      return true;
    }
    if (path !== "/dashboard" && pathname?.startsWith(path)) {
      return true;
    }
    return false;
  };

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Users",
      href: "/dashboard/users",
      icon: Users,
    },
    {
      name: "Categories",
      href: "/dashboard/category",
      icon: Tag,
    },
    {
      name: "Products",
      href: "/dashboard/product",
      icon: ShoppingBag,
    },
    {
      name: "Orders",
      href: "/dashboard/orders",
      icon: Package,
    },
  ];

  // Mobile sidebar
  if (isMobile) {
    return (
      <>
        <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b p-4 md:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">
                  TO
                </span>
              </div>
              <span className="font-bold text-lg">Galery Navila</span>
            </div>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] p-0">
                <div className="flex h-full flex-col">
                  <div className="p-4 border-b">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                        <span className="text-primary-foreground font-bold text-sm">
                          TO
                        </span>
                      </div>
                      <span className="font-bold text-lg">Galery Navila</span>
                    </div>
                  </div>
                  <ScrollArea className="flex-1 py-2">
                    <div className="flex flex-col gap-1 px-2">
                      {navigation.map((item) => (
                        <Button
                          key={item.name}
                          variant={isActive(item.href) ? "secondary" : "ghost"}
                          className="justify-start"
                          asChild
                          onClick={() => setOpen(false)}
                        >
                          <Link href={item.href}>
                            <item.icon className="mr-2 h-4 w-4" />
                            {item.name}
                          </Link>
                        </Button>
                      ))}
                      <Button
                        variant="ghost"
                        className="justify-start mt-2"
                        asChild
                        onClick={() => setOpen(false)}
                      >
                        <Link href="/">
                          <Home className="mr-2 h-4 w-4" />
                          Back to Store
                        </Link>
                      </Button>
                    </div>
                  </ScrollArea>
                  <div className="border-t p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {user?.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {user?.email}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        <div className="h-16 md:hidden" /> {/* Spacer for fixed header */}
      </>
    );
  }

  // Desktop sidebar
  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className="flex flex-col flex-grow border-r bg-background overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4 py-4 border-b">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">
                TO
              </span>
            </div>
            <span className="font-bold text-lg">Galery Navila</span>
          </div>
        </div>
        <div className="mt-5 flex-grow flex flex-col">
          <nav className="flex-1 px-2 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  isActive(item.href)
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted hover:text-foreground",
                  "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors"
                )}
              >
                <item.icon
                  className={cn(
                    isActive(item.href)
                      ? "text-primary-foreground"
                      : "text-muted-foreground group-hover:text-foreground",
                    "mr-3 flex-shrink-0 h-5 w-5"
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            ))}
            <Link
              href="/"
              className="text-foreground hover:bg-muted hover:text-foreground group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors mt-4"
            >
              <Home
                className="text-muted-foreground group-hover:text-foreground mr-3 flex-shrink-0 h-5 w-5"
                aria-hidden="true"
              />
              Back to Store
            </Link>
          </nav>
        </div>
        <div className="flex-shrink-0 border-t p-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-medium">{user?.name}</span>
              <span className="text-xs text-muted-foreground">
                {user?.email}
              </span>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

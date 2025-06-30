'use client'

import type React from 'react'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import useAuthStore from '@/stores/auth-store'
import DashboardSidebar from '@/components/dashboard/dashboard-sidebar'
import { Loader2 } from 'lucide-react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const {
    isAuthenticated,
    userRole,
    userEmail,
    userName,
  } = useAuthStore()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (isMounted) {
      if (!isAuthenticated) {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
      } else if (userRole !== 'ADMIN') {
        router.push('/') // Atau redirect ke halaman 'Access Denied'
      }
    }
  }, [isAuthenticated, userRole, isMounted, pathname, router])

  if (!isMounted || !isAuthenticated || userRole !== 'ADMIN') {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <DashboardSidebar user={{ email: userEmail, name: userName, role: userRole }} />
        <main className="flex-1 min-h-screen">{children}</main>
      </div>
    </div>
  )
}

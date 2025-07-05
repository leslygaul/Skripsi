'use client'

import { useEffect } from "react"

export default function PWARegistrar() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const registerServiceWorker = async () => {
        try {
          // const registration = await navigator.serviceWorker.register('/sw.js')
          // console.log('✅ ServiceWorker registered with scope:', registration.scope)
        } catch (err) {
          // console.error('❌ ServiceWorker registration failed:', err)
        }
      }

      // Untuk halaman yang sudah dimuat
      registerServiceWorker()
      
      // Untuk halaman yang dimuat kemudian
      window.addEventListener('load', registerServiceWorker)
      
      return () => {
        window.removeEventListener('load', registerServiceWorker)
      }
    }
  }, [])

  return null // Komponen ini tidak merender apa-apa
}
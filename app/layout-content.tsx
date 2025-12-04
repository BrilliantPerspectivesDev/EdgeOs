'use client'

import { useAuth } from '@/lib/auth-context'
import MainSidebar from '@/components/main-sidebar'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'
import { Toaster } from '@/components/ui/toaster'

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const isPublicPage = pathname === '/signin' || pathname === '/register' || pathname === '/forgot-password' || pathname === '/company-setup' || pathname === '/landing'

  // Public pages render immediately without waiting for auth
  if (isPublicPage) {
    return (
      <>
        <div className="min-h-screen w-full">
          {children}
        </div>
        <Toaster />
      </>
    )
  }

  // Only show loading for authenticated pages
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <>
      <div className="flex h-screen w-full bg-[#1E1E1E]">
        {user && <MainSidebar />}
        <main className={cn("flex-1", user && "ml-64")}>
          <div className="h-full p-8">
            <style jsx global>{`
              .custom-scrollbar {
                scrollbar-width: thin;
                scrollbar-color: rgba(0, 0, 0, 0.8) transparent;
              }
              
              .custom-scrollbar::-webkit-scrollbar {
                width: 4px;
              }
              
              .custom-scrollbar::-webkit-scrollbar-track {
                background: transparent;
              }
              
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background-color: rgba(0, 0, 0, 0.8);
                border-radius: 20px;
              }
              
              .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background-color: rgba(0, 0, 0, 1);
              }
            `}</style>
            <div className={cn(
              "bg-white rounded-[32px] h-[calc(100vh-4rem)] w-full overflow-y-auto",
              "custom-scrollbar"
            )}>
              {children}
            </div>
          </div>
        </main>
      </div>
      <Toaster />
    </>
  )
}


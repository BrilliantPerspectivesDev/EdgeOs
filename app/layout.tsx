import { Suspense } from 'react'
import { AuthProvider } from '@/lib/auth-context'
import { ThemeProvider } from '@/components/theme-provider'
import { LoadingScreen } from '@/components/loading-screen'
import { SidebarProvider } from '@/components/ui/sidebar'
import './globals.css'
import './styles/shared.css'
import { LayoutContent } from './layout-content'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <AuthProvider>
          <ThemeProvider>
            <SidebarProvider>
              <Suspense fallback={<LoadingScreen />}>
                <LayoutContent>{children}</LayoutContent>
              </Suspense>
            </SidebarProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

import './globals.css'
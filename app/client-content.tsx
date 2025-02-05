'use client'

import { useOnboarding } from '@/lib/hooks/use-onboarding'
import { OnboardingModal } from '@/components/onboarding-modal'
import { Toaster } from '@/components/ui/toaster'
import { useAuth } from '@/lib/auth-context'
import { Button } from "@/components/ui/button"
import { Menu } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from 'next/link'

export default function ClientContent({ children }: { children: React.ReactNode }) {
  const { showOnboarding, setShowOnboarding, loading } = useOnboarding()
  const { user, userRole } = useAuth()

  if (loading) return null

  return (
    <>
      {user && userRole && (
        <div className="md:hidden absolute top-4 right-4 z-50">
          <MobileMenu />
        </div>
      )}
      {children}
      <OnboardingModal 
        isOpen={showOnboarding} 
        onClose={() => setShowOnboarding(false)} 
      />
      <Toaster />
    </>
  )
}

function MobileMenu() {
  const { user, userRole, companyName } = useAuth()

  if (!user || !userRole) return null

  const navigationItems = {
    team_member: [
      { name: 'My Learning', href: '/', icon: 'BookOpen' },
      { name: 'Training Library', href: '/training-library', icon: 'Library' },
      { name: 'Bold Actions', href: '/bold-actions', icon: 'Target' },
      { name: 'Account Settings', href: '/account', icon: 'Settings' }
    ],
    supervisor: [
      { name: 'My Learning', href: '/', icon: 'BookOpen' },
      { name: 'Training Library', href: '/training-library', icon: 'Library' },
      { name: 'Bold Actions', href: '/bold-actions', icon: 'Target' },
      { name: 'My Team', href: '/', icon: 'Users' },
      ...(companyName === 'Brilliant Perspectives' ? [{ name: 'Admin', href: '/admin', icon: 'LayoutDashboard' }] : []),
      { name: 'Account Settings', href: '/account', icon: 'Settings' }
    ],
    executive: [
      { name: 'My Learning', href: '/', icon: 'BookOpen' },
      { name: 'Training Library', href: '/training-library', icon: 'Library' },
      { name: 'Bold Actions', href: '/bold-actions', icon: 'Target' },
      { name: 'My Team', href: '/supervisor', icon: 'Users' },
      { name: 'Executive Dashboard', href: '/executive', icon: 'Building' },
      ...(companyName === 'Brilliant Perspectives' ? [{ name: 'Admin', href: '/admin', icon: 'LayoutDashboard' }] : []),
      { name: 'Company Settings', href: '/company-settings', icon: 'Cog' },
      { name: 'Account Settings', href: '/account', icon: 'Settings' }
    ]
  }

  const navigation = navigationItems[userRole as keyof typeof navigationItems] || []

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Menu className="h-6 w-6" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {navigation.map((item) => (
          <DropdownMenuItem key={item.name} asChild>
            <Link href={item.href} className="flex items-center gap-2 w-full">
              <span>{item.name}</span>
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 
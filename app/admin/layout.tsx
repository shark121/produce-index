import { redirect } from 'next/navigation'
import { AdminSidebar } from '@/components/nav/admin-sidebar'
import { MOCK_USERS } from '@/lib/mock'

import { isMockMode } from '@/lib/is-mock-mode'
const MOCK_MODE = isMockMode()


export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let userName = MOCK_USERS.admin.fullName

  if (!MOCK_MODE) {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.user_metadata?.role !== 'admin') redirect('/auth/login')
    userName = user.user_metadata?.full_name ?? user.email ?? ''
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar userName={userName} />
      <main className="flex-1 md:ml-60 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 md:px-8 pt-[calc(3.5rem+1.5rem)] md:pt-8 pb-24 md:pb-8">{children}</div>
      </main>
    </div>
  )
}

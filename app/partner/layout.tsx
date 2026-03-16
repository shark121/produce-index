import { redirect } from 'next/navigation'
import { PartnerSidebar } from '@/components/nav/partner-sidebar'
import { MOCK_USERS } from '@/lib/mock'

const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_MODE === 'true'

export default async function PartnerLayout({ children }: { children: React.ReactNode }) {
  let userName = MOCK_USERS.partner.fullName

  if (!MOCK_MODE) {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.user_metadata?.role !== 'partner') redirect('/auth/login')
    userName = user.user_metadata?.full_name ?? user.email ?? ''
  }

  return (
    <div className="flex min-h-screen">
      <PartnerSidebar userName={userName} />
      <main className="flex-1 ml-60 min-h-screen">
        <div className="max-w-5xl mx-auto px-8 py-8">{children}</div>
      </main>
    </div>
  )
}

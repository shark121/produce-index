import Link from 'next/link'
import { Leaf } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#34C759]">
          <Leaf className="h-5 w-5 text-white" />
        </div>
        <span className="text-xl font-semibold text-[#1C1C1E]">PRI</span>
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  )
}

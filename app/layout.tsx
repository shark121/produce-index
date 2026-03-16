import type { CSSProperties } from 'react'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'PRI — Produce Reliability Index',
    template: '%s | PRI',
  },
  description:
    'Verified nutrition and supply intelligence for lenders, health systems, and buyers working with small farms.',
  keywords: ['produce reliability index', 'farm financing', 'health systems', 'food access', 'community health'],
}

export const viewport: Viewport = {
  themeColor: '#34C759',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const fontVariables = {
    '--font-geist-sans': '"SF Pro Display", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
    '--font-geist-mono': '"SFMono-Regular", "SF Mono", Consolas, "Liberation Mono", monospace',
  } as CSSProperties

  return (
    <html lang="en" style={fontVariables}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  )
}

import type { Metadata } from 'next'
import './globals.css'
import { QueryProvider } from '@/components/query-provider'

export const metadata: Metadata = {
  title: 'Zyra - Project Management',
  description: 'Multi-tenant project management system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  )
}
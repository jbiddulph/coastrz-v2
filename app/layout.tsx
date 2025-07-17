import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import './fonts.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Coastrz - Custom Coasters',
  description: 'Design and order custom coasters for your home or business',
}

export const dynamic = 'force-dynamic'

// Debug: Log environment variables (redacted)
console.log('Environment check:', {
  hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
  hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  hasStripeKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  hasBaseUrl: !!process.env.NEXT_PUBLIC_BASE_URL,
  nodeEnv: process.env.NODE_ENV,
  port: process.env.PORT
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}

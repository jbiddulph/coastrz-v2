import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import './fonts.css'
import { Providers } from './providers'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Coastrz - Custom Coasters',
  description: 'Design and order custom coasters for your home or business',
}

export const dynamic = 'force-dynamic'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function getInitialTheme() {
                  const savedTheme = localStorage.getItem('theme');
                  if (savedTheme) return savedTheme;
                  
                  return window.matchMedia('(prefers-color-scheme: dark)').matches
                    ? 'dark'
                    : 'light';
                }
                
                document.documentElement.setAttribute(
                  'data-theme',
                  getInitialTheme()
                );
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}

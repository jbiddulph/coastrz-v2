import './globals.css'
import './fonts.css'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast';
import { CartProvider } from '@/contexts/CartContext';
import Footer from '@/components/Footer';
import { Providers } from './providers';
import Navbar from '@/components/Navbar';
import { headers } from 'next/headers';

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'CoastrZ Shop',
  description: 'Your one-stop shop for all your needs',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get the current pathname from headers
  const headersList = headers();
  const pathname = headersList.get("x-pathname") || "";
  const isAdminRoute = pathname.startsWith('/admin');

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
      <body className={inter.className}>
        <Providers>
          <CartProvider>
            <div className="flex min-h-screen flex-col">
              {!isAdminRoute && <Navbar />}
              <main className="flex-grow">
                {children}
              </main>
              {!isAdminRoute && <Footer />}
            </div>
          </CartProvider>
          <Toaster position="bottom-right" />
        </Providers>
      </body>
    </html>
  )
}

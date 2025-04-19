import './globals.css'
import './fonts.css'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast';
import { CartProvider } from '@/contexts/CartContext';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Shop - Your Online Store',
  description: 'Find the best products at great prices',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
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
        <CartProvider>
          <div className="min-h-screen flex flex-col">
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </div>
          <Toaster position="bottom-right" />
        </CartProvider>
      </body>
    </html>
  )
}

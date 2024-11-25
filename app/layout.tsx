import type { Metadata } from 'next'
import { Roboto } from 'next/font/google'
import './globals.css'
import { ChildProps } from '@/types'
import { ThemeProvider } from '@/components/providers/theme.provider'
import QueryProvider from '@/components/providers/query.provider'
import { Toaster } from '@/components/ui/toaster'
import SessionProvider from '@/components/providers/session.provider'

const roboto = Roboto({
  weight: ['100', '300', '400', '500', '700', '900'],
  subsets: ['latin'],
  variable: '--font-roboto',
})

export const metadata: Metadata = {
  title: 'Telegram',
  description: 'Telegram web application clone created by Otabek Tulaganov',
  icons: { icon: '/logo.svg' },
}

export default function RootLayout({ children }: Readonly<ChildProps>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body
        className={`${roboto.variable} antialiased font-roboto overflow-x-hidden sidebar-custom-scrollbar`}
      >
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <SessionProvider>
              {children}
              <Toaster />
            </SessionProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

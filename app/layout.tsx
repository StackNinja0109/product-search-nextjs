import '@/styles/globals.scss'
import { StrictMode } from 'react'
import HolyLoader from 'holy-loader'
import { type Metadata, type Viewport } from 'next'
import Providers from './providers'
import ScrollTopButton from '@/components/scroll-top-button'
import TailwindIndicator from '@/components/tailwind-indicator'
import { env } from '@/lib/config'

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#030712' },
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
  ],
  colorScheme: 'dark light',
  width: 'device-width',
  initialScale: 1.0,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_HOST),
  title: '商品サーチャー',
  applicationName: '商品サーチャー',
  description: 'Amazon、Yahooショッピング、楽天市場に掲載されている商品を検索・比較するシステムです。',
  openGraph: {
    title: '商品サーチャー',
    siteName: '商品サーチャー',
    description: 'Amazon、Yahooショッピング、楽天市場に掲載されている商品を検索・比較するシステムです。',
    type: 'website',
  },
  icons: [
    {
      rel: 'icon',
      url: '/favicon-16x16.png',
      sizes: '16x16',
      type: 'image/png',
    },
    {
      rel: 'icon',
      url: '/favicon-32x32.png',
      sizes: '32x32',
      type: 'image/png',
    },
    {
      url: '/android-chrome-192x192.png',
      sizes: '192x192',
      type: 'image/png',
    },
    {
      url: '/android-chrome-512x512.png',
      sizes: '512x512',
      type: 'image/png',
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <StrictMode>
      <html lang='jp' suppressHydrationWarning>
        <body>
          <HolyLoader
            color="#9333ea"
            height="1px"
            easing="linear"
          />
          <Providers>
            <div className='flex flex-col w-full min-h-screen overflow-y-auto'>
              {children}
              <ScrollTopButton />
            </div>

            {env.NEXT_PUBLIC_APP_ENV === 'staging' && <TailwindIndicator />}
          </Providers>
        </body>
      </html>
    </StrictMode>
  )
}
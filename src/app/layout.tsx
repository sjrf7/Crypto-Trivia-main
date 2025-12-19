
'use client';

import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { Providers } from './providers';
import { Dock } from '@/components/layout/Dock';
import { Inter, Space_Grotesk } from 'next/font/google';
import { Header } from '@/components/layout/Header';
import { BackgroundMusicProvider } from '@/components/layout/BackgroundMusic';
import { useEffect } from 'react';
import Script from 'next/script';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});




export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  useEffect(() => {
    // This tells the Farcaster client that the app is ready to be displayed.
    // We check if the SDK is available on the window object before calling it.
    if (window.FarcasterSDK) {
      window.FarcasterSDK.actions.ready();
    }
  }, []);

  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} dark`}>

      <body
        className={cn(
          'min-h-screen bg-background font-body antialiased',
          'flex flex-col'
        )}
      >
        <Script src="https://farcaster.dev/miniapp-sdk.js" strategy="beforeInteractive" />
        <Providers>
          <BackgroundMusicProvider>
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8 pb-24 relative">
              {children}
            </main>
            <Dock />
            <Toaster />
          </BackgroundMusicProvider>
        </Providers>
      </body>
    </html>
  );
}

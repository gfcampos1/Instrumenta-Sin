import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Instrumenta-Sin - Monitoramento de Dispositivos Médicos',
  description: 'Sistema de monitoramento e gamificação para instrumentadores em campo',
  manifest: '/manifest.json',
  themeColor: '#4DB5E8',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Instrumenta-Sin',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}

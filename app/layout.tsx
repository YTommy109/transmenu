import type { Metadata } from 'next';
import EmotionCacheProvider from './providers';

export const metadata: Metadata = {
  title: 'TransMenu - Menu Translation App',
  description: 'AI-powered menu translation application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <EmotionCacheProvider>{children}</EmotionCacheProvider>
      </body>
    </html>
  );
}
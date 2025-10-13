import type { Metadata } from 'next';

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
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from 'next';
import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-heading',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'UniFeed AI — Content Idea Generator | UniforMeFy',
  description:
    'AI-powered content blueprint generator for UniforMeFy. Create targeted LinkedIn, Instagram, and Reels content for B2B uniform delivery.',
  keywords: [
    'UniforMeFy',
    'content generator',
    'AI content',
    'B2B marketing',
    'uniform delivery',
    'LinkedIn content',
    'Instagram marketing',
  ],
  openGraph: {
    title: 'UniFeed AI — Smart Content Blueprints for UniforMeFy',
    description:
      'Generate hyper-targeted content ideas for LinkedIn, Instagram, and Reels — tailored specifically for B2B uniform delivery.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-[#030304] text-white antialiased" style={{ fontFamily: 'var(--font-body)' }}>
        <a href="#main-content" className="skip-link">Skip to main content</a>
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';
import '@/styles/globals.css';
import { Providers } from '@/components/providers/Providers';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-space',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Nobal EduConductor',
    template: '%s | Nobal EduConductor',
  },
  description:
    'Conductor dashboard for managing student admissions, tasks, and university roadmaps.',
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={spaceGrotesk.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import './globals.css';

import { Inter, Poppins } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const poppins = Poppins({ weight: ['500', '600', '700', '800'], subsets: ['latin'], variable: '--font-poppins' });

export const metadata: Metadata = {
  title: 'AI Smart Parking Management System',
  description: 'Next-Generation Full-Stack AI Parking Management System powered by YOLO Computer Vision and Real-time Slot Analytics',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-blue-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
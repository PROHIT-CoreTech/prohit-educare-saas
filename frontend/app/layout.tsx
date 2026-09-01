import './globals.css';
import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react';

export const metadata: Metadata = {
  title: 'PROHIT Educare - Multi-Tenant Academy Management Platform',
  description: 'Enterprise ERP SaaS for coaching institutes, academies, and schools by PROHIT CoreTech.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}

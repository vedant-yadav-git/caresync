import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CareSync - Shared Home Support Planner',
  description: 'A shared home support planner for families juggling school, work, and caregiving.',
  icons: {
    icon: '/favicon.ico',
  },
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

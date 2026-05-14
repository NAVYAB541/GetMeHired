import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SydneyDevJobs — CS & SWE Roles in Sydney',
  description: 'AI-powered job board for CS graduates and software engineers in Sydney, Australia.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

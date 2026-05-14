import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SydneyDevJobs — CS & SWE roles in Sydney',
  description: 'AI-powered job board for graduate and junior software engineers in Sydney, Australia.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

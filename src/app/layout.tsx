import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GetMeHired — CS & SWE Jobs in Sydney',
  description: 'Find your next Sydney CS or software engineering role. AI-powered, built for grads.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

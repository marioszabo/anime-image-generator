import type { Metadata } from 'next'
import '../styles/global.css'
import { Toaster } from "@/components/ui/toaster"


export const metadata: Metadata = {
  title: 'AI Image Generator',
  description: 'Generate images using SDXL',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
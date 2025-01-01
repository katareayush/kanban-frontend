import './globals.css'
import Navbar from '@/components/Navbar'

export const metadata = {
  title: 'Kanban',
  description: 'Organize tasks, boost productivity, and collaborate seamlessly - all in one place.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        
        {/* <Navbar /> */}

        
        {children}
      </body>
    </html>
  )
}

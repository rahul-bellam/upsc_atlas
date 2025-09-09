import './globals.css'

export const metadata = {
  title: 'UPSC Atlas AI Final',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

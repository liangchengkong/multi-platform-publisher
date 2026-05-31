import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '多平台内容发布工具',
  description: '面向创作者的多平台内容适配与模拟发布工作台',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}

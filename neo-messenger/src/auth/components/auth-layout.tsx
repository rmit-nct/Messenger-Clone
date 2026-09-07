// centered card layout for guest screens

// TODO: implement

import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'

interface AuthLayoutProps {
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export function AuthLayout({ title, children, footer }: AuthLayoutProps) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
      <Link to="/" className="text-2xl font-bold">
        NEO Messenger
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>

      {footer && <div className="text-muted-foreground text-sm">{footer}</div>}
    </div>
  )
}

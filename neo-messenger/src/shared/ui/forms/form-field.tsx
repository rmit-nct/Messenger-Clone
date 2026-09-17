// label + error + input wrapper

// TODO: implement

import { AlertCircle } from 'lucide-react'
import { Label } from '@/shared/ui/label'

interface FormFieldProps {
  id: string
  label: string
  error?: string
  hint?: React.ReactNode
  children: React.ReactNode
}

export function FormField({ id, label, error, hint, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm">
        {label}
      </Label>
      {children}
      {hint && !error && <div id={`${id}-hint`}>{hint}</div>}
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="text-destructive flex items-center gap-1.5 text-sm"
        >
          <AlertCircle size={14} aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'
import { ImagePlus, Trash2 } from 'lucide-react'
import { Button } from './button'
import { cn } from '../lib/utils'
import { validateImage } from '../lib/api/uploads'
import { IMAGE_MIME } from '../constants/limits'

interface ImageUploaderProps {
  initialUrl?: string | null
  onSelect: (file: File) => void
  onRemove?: () => void
  disabled?: boolean
  className?: string
}

export function ImageUploader({
  initialUrl = null,
  onSelect,
  onRemove,
  disabled,
  className,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const objectUrlRef = useRef<string | null>(null)
  const [preview, setPreview] = useState<string | null>(initialUrl)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(
    () => () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    },
    [],
  )

  function choose(file: File | null) {
    if (!file || disabled) return
    const result = validateImage(file)
    if (!result.ok) {
      setError(result.error ?? 'Invalid image')
      return
    }
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    const url = URL.createObjectURL(file)
    objectUrlRef.current = url
    setError(null)
    setPreview(url)
    if (inputRef.current) inputRef.current.value = ''
    onSelect(file)
  }

  function remove() {
    if (disabled) return
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
    setError(null)
    setPreview(initialUrl)
    if (inputRef.current) inputRef.current.value = ''
    onRemove?.()
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div
        onDragOver={(e) => {
          e.preventDefault()
          if (!disabled) setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          choose(e.dataTransfer.files?.[0] ?? null)
        }}
        className={cn(
          'flex items-center gap-4 rounded-lg border border-dashed border-border p-3',
          dragOver && 'border-cyan bg-cyan/10',
          disabled && 'opacity-60',
        )}
      >
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-muted">
          {preview ? (
            <img src={preview} alt="Image preview" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <ImagePlus className="h-5 w-5" />
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={disabled}
              onClick={() => inputRef.current?.click()}
            >
              Choose image
            </Button>
            {preview && onRemove && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={disabled}
                onClick={remove}
                aria-label="Remove image"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">JPEG, PNG or WebP, up to 5 MB.</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={IMAGE_MIME.join(',')}
          className="hidden"
          onChange={(e) => choose(e.target.files?.[0] ?? null)}
        />
      </div>
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

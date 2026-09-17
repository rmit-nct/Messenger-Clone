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
  variant?: 'avatar' | 'square'
}

export function ImageUploader({
  initialUrl = null,
  onSelect,
  onRemove,
  disabled,
  className,
  variant = 'avatar',
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

  const dropHandlers = {
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault()
      if (!disabled) setDragOver(true)
    },
    onDragLeave: () => setDragOver(false),
    onDrop: (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      choose(e.dataTransfer.files?.[0] ?? null)
    },
  }

  const hiddenInput = (
    <input
      ref={inputRef}
      type="file"
      accept={IMAGE_MIME.join(',')}
      className="hidden"
      onChange={(e) => choose(e.target.files?.[0] ?? null)}
    />
  )

  if (variant === 'square') {
    return (
      <div className={cn('space-y-2', className)}>
        <div
          {...dropHandlers}
          className={cn(
            'relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-muted/30',
            dragOver && 'border-cyan bg-cyan/10',
            disabled && 'opacity-60',
          )}
        >
          {preview ? (
            <>
              <img src={preview} alt="Story preview" className="absolute inset-0 h-full w-full object-cover" />
              {onRemove && (
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  className="absolute right-2 top-2"
                  aria-label="Remove image"
                  disabled={disabled}
                  onClick={remove}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="absolute bottom-2 left-2"
                disabled={disabled}
                onClick={() => inputRef.current?.click()}
              >
                Replace
              </Button>
            </>
          ) : (
            <button
              type="button"
              disabled={disabled}
              onClick={() => inputRef.current?.click()}
              className="flex flex-col items-center gap-2 p-6 text-center"
            >
              <ImagePlus className="h-6 w-6 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Drag and drop or browse</span>
              <span className="text-xs text-muted-foreground">JPEG, PNG or WebP, up to 5 MB.</span>
            </button>
          )}
          {hiddenInput}
        </div>
        {error && (
          <p role="alert" className="text-xs text-destructive">
            {error}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div
        {...dropHandlers}
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
        {hiddenInput}
      </div>
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

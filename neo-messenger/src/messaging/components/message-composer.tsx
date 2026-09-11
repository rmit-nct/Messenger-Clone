import { useRef, useState } from 'react'
import { ImagePlus, Loader2, Send, X } from 'lucide-react'
import { Button } from '../../shared/ui/button'
import { cn } from '../../shared/lib/utils'
import { MESSAGE_MAX, IMAGE_MIME } from '../../shared/constants/limits'
import { validateImage } from '../../shared/lib/api/uploads'

interface MessageComposerProps {
  onSendText: (content: string) => Promise<void>
  onSendImage: (file: File, onProgress: (percent: number) => void) => Promise<void>
  disabled?: boolean
  notifyTyping: () => void
  onError: (message: string) => void
}

export function MessageComposer({
  onSendText,
  onSendImage,
  disabled,
  notifyTyping,
  onError,
}: MessageComposerProps) {
  const [text, setText] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function resize() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = '0px'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }

  async function submitText() {
    const content = text.trim()
    if (!content || busy) return
    setBusy(true)
    setText('')
    resize()
    try {
      await onSendText(content)
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to send message')
    } finally {
      setBusy(false)
    }
  }

  function pickFile(selected: File | null) {
    if (!selected) return
    const result = validateImage(selected)
    if (!result.ok) {
      onError(result.error ?? 'Invalid image')
      return
    }
    setFile(selected)
  }

  async function submitImage() {
    if (!file || busy) return
    setBusy(true)
    setProgress(0)
    try {
      await onSendImage(file, setProgress)
      setFile(null)
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to send image')
    } finally {
      setBusy(false)
      setProgress(null)
    }
  }

  return (
    <div className="border-t border-border bg-panel p-3">
      {file && (
        <div className="mb-2 flex items-center gap-2 rounded-lg border border-border p-2">
          <span className="flex-1 truncate text-sm">{file.name}</span>
          {progress !== null && (
            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full bg-cyan transition-all" style={{ width: `${progress}%` }} />
            </div>
          )}
          <Button variant="ghost" size="icon-xs" aria-label="Remove image" onClick={() => setFile(null)}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      <div className="flex items-end gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept={IMAGE_MIME.join(',')}
          className="hidden"
          onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
        />
        <Button
          variant="ghost"
          size="icon"
          aria-label="Attach image"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || busy}
        >
          <ImagePlus className="h-5 w-5" />
        </Button>

        <textarea
          ref={textareaRef}
          value={text}
          rows={1}
          maxLength={MESSAGE_MAX}
          placeholder="Type a message..."
          onChange={(e) => {
            setText(e.target.value)
            resize()
            notifyTyping()
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              void submitText()
            }
          }}
          className={cn(
            'max-h-40 min-h-10 flex-1 resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none',
            'focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40',
          )}
        />

        {file ? (
          <Button onClick={submitImage} disabled={busy} aria-label="Send image">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        ) : (
          <Button onClick={submitText} disabled={disabled || busy || !text.trim()} aria-label="Send message">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        )}
      </div>
    </div>
  )
}

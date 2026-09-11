import { Dialog, DialogContent } from './dialog'

interface ImageLightboxProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  src: string | null
  alt: string
}

export function ImageLightbox({ open, onOpenChange, src, alt }: ImageLightboxProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] bg-transparent p-0 ring-0 sm:max-w-3xl">
        {src && <img src={src} alt={alt} className="max-h-[80vh] w-full rounded-xl object-contain" />}
      </DialogContent>
    </Dialog>
  )
}

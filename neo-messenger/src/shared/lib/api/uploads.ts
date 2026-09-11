import { supabase } from '../supabase/client'
import { env } from '../env'
import { IMAGE_MAX_BYTES, IMAGE_MIME } from '../../constants/limits'

interface ValidationResult {
  ok: boolean
  error?: string
}

export function validateImage(file: File): ValidationResult {
  if (!IMAGE_MIME.includes(file.type as (typeof IMAGE_MIME)[number])) {
    return { ok: false, error: 'Only JPEG, PNG, or WebP images are allowed.' }
  }
  if (file.size > IMAGE_MAX_BYTES) {
    return { ok: false, error: 'Image must be 5 MB or smaller.' }
  }
  return { ok: true }
}

function extensionFor(file: File): string {
  const fromName = file.name.split('.').pop()?.toLowerCase()
  if (fromName && fromName.length <= 5) return fromName
  if (file.type === 'image/png') return 'png'
  if (file.type === 'image/webp') return 'webp'
  return 'jpg'
}

export async function uploadMessageImage(
  conversationId: string,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<string> {
  const { data: sessionData } = await supabase.auth.getSession()
  const token = sessionData.session?.access_token
  if (!token) throw new Error('Not authenticated')

  const path = `${conversationId}/${crypto.randomUUID()}.${extensionFor(file)}`
  const url = `${env.supabaseUrl}/storage/v1/object/messages/${path}`

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', url)
    xhr.setRequestHeader('apikey', env.supabaseAnonKey)
    xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    xhr.setRequestHeader('Content-Type', file.type)
    xhr.setRequestHeader('x-upsert', 'false')
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100))
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve()
      else reject(new Error(`Upload failed (${xhr.status})`))
    }
    xhr.onerror = () => reject(new Error('Upload failed'))
    xhr.send(file)
  })

  return path
}

export async function createSignedUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage.from('messages').createSignedUrl(path, 3600)
  if (error) throw new Error(error.message)
  return data.signedUrl
}

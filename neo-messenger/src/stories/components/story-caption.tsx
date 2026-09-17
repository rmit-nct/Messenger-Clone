export function StoryCaption({ caption }: { caption: string | null }) {
  if (!caption) return null
  return <p className="max-w-prose text-sm text-white drop-shadow-md">{caption}</p>
}

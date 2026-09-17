import { ErrorState } from '../../shared/ui/error-state'
import { Skeleton } from '../../shared/ui/skeleton'
import { ProfileForm } from '../components/profile-form'
import { useMyProfile } from '../hooks/use-profile'

export function ProfilePage() {
  const { profile, isLoading, isError, refetch } = useMyProfile()

  if (isLoading) {
    return (
      <div className="mx-auto max-w-md space-y-4 p-4" aria-busy="true">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-24 rounded-full" />
      </div>
    )
  }

  if (isError) {
    return <ErrorState title="Couldn't load profile" onRetry={() => void refetch()} />
  }

  return (
    <div className="mx-auto max-w-md space-y-4 p-4">
      <h1 className="text-lg font-bold text-foreground">Profile</h1>
      <ProfileForm initialProfile={profile} submitLabel="Save changes" />
    </div>
  )
}

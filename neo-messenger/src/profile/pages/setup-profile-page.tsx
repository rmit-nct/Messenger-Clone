import { useNavigate } from 'react-router-dom'
import { AuthLayout } from '../../auth'
import { ErrorState } from '../../shared/ui/error-state'
import { Skeleton } from '../../shared/ui/skeleton'
import { ProfileForm } from '../components/profile-form'
import { useMyProfile } from '../hooks/use-profile'

export function SetupProfilePage() {
  const navigate = useNavigate()
  const { profile, isLoading, isError, refetch } = useMyProfile()

  return (
    <AuthLayout title="Set up your profile">
      {isLoading ? (
        <div className="space-y-3" aria-busy="true">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : isError ? (
        <ErrorState title="Couldn't load profile" onRetry={() => void refetch()} />
      ) : (
        <ProfileForm
          initialProfile={profile}
          submitLabel="Finish"
          onSaved={() => navigate('/inbox', { replace: true })}
        />
      )}
    </AuthLayout>
  )
}

import { useNavigate } from 'react-router-dom'
import { AuthLayout } from '../../auth'
import { Skeleton } from '../../shared/ui/skeleton'
import { ProfileForm } from '../components/profile-form'
import { useMyProfile } from '../hooks/use-profile'

export function SetupProfilePage() {
  const navigate = useNavigate()
  const { profile, isLoading } = useMyProfile()

  return (
    <AuthLayout title="Set up your profile">
      {isLoading ? (
        <div className="space-y-3" aria-busy="true">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
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

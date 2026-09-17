import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { ShellLayout } from '../layouts/shell-layout'
import {
  GuestOnly,
  RequireAuth,
  LandingPage,
  LoginPage,
  SignupPage,
  RecoverPage,
  ResetPasswordPage,
} from '../../auth'
import { InboxPage } from '../../inbox'
import { ConversationPage } from '../../conversations'
import { ProfilePage, SettingsPage, SetupProfilePage } from '../../profile'
import { StoryComposePage, StoryViewerPage } from '../../stories'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          element={
            <GuestOnly>
              <Outlet />
            </GuestOnly>
          }
        >
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/recover" element={<RecoverPage />} />
        </Route>

        <Route
          element={
            <RequireAuth>
              <Outlet />
            </RequireAuth>
          }
        >
          <Route path="/setup-profile" element={<SetupProfilePage />} />
          <Route path="/story/create" element={<StoryComposePage />} />
          <Route path="/stories/:userId" element={<StoryViewerPage />} />
        </Route>

        <Route
          element={
            <RequireAuth>
              <ShellLayout />
            </RequireAuth>
          }
        >
          <Route path="/inbox" element={<InboxPage />} />
          <Route path="/conversation/:id" element={<ConversationPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        <Route path="/landing-page" element={<Navigate to="/" replace />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

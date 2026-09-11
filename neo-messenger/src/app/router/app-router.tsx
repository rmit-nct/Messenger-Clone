// route table, lazy-loaded pages, guard wrapping
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AppShell } from '../layouts/app-shell'
import { PaneEmptyState } from '../components/pane-empty-state'
import { InboxListRegion } from '../../inbox'
import {
  GuestOnly,
  RequireAuth,
  LandingPage,
  LoginPage,
  SignupPage,
  RecoverPage,
  ResetPasswordPage,
} from '../../auth'

// TODO 1.6: wire real NewConversationDialog trigger; 2.1: /conversation/:id route + conversation pane
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
          <Route
            path="/inbox"
            element={
              <AppShell
                sidebar={(collapsed, onExpand) => (
                  <InboxListRegion collapsed={collapsed} onExpand={onExpand} />
                )}
                main={<PaneEmptyState />}
              />
            }
          />
        </Route>

        <Route path="/landing-page" element={<Navigate to="/" replace />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

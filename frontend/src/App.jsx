import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import RouteEffects from './components/RouteEffects'
import { ProtectedRoute, RoleGate } from './components/RouteGuards'
import DashboardLayout from './layouts/DashboardLayout'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ConnectAccounts from './pages/ConnectAccounts'
import Chatbot from './pages/Chatbot'
import Dashboard from './pages/Dashboard'
import ComingSoon from './pages/ComingSoon'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <>
      <Toaster position="top-right" />
      <RouteEffects />
      <Routes>
        {/* Sab ke liye khule pages */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Yahan se aage login zaroori hai */}
        <Route element={<ProtectedRoute />}>
          <Route path="/connect" element={<ConnectAccounts />} />
          <Route
            path="/assistant"
            element={
              <RoleGate roles={['creator', 'manager']}>
                <Chatbot />
              </RoleGate>
            }
          />

          {/* Sidebar aur top bar ke andar khulne wale pages */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/posts" element={<ComingSoon title="Posts" />} />
            <Route path="/calendar" element={<ComingSoon title="Calendar" />} />
            <Route
              path="/posts/new"
              element={
                <RoleGate roles={['creator']}>
                  <ComingSoon title="Create Post" />
                </RoleGate>
              }
            />
            <Route
              path="/approvals"
              element={
                <RoleGate roles={['manager']}>
                  <ComingSoon title="Approvals" />
                </RoleGate>
              }
            />
            <Route
              path="/users"
              element={
                <RoleGate roles={['admin']}>
                  <ComingSoon title="Users" />
                </RoleGate>
              }
            />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}
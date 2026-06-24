import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import MyTickets from './pages/MyTickets'
import ScreeningsList from './pages/ScreeningsList'
import ScreeningDetails from './pages/ScreeningDetails'
import Users from './pages/admin/Users'
import UserEdit from './pages/admin/UserEdit'
import CreateScreening from './pages/admin/CreateScreening'

function AppRoutes() {
  const location = useLocation()
  return (
    <div className="container mt-4 mb-5 page-enter" key={location.pathname}>
      <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/screenings" element={<ScreeningsList />} />
            <Route path="/screenings/:id" element={<ScreeningDetails />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-tickets"
              element={
                <ProtectedRoute>
                  <MyTickets />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute adminOnly>
                  <Users />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users/:id/edit"
              element={
                <ProtectedRoute adminOnly>
                  <UserEdit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/screenings/create"
              element={
                <ProtectedRoute adminOnly>
                  <CreateScreening />
                </ProtectedRoute>
              }
            />
            {/* Any unknown path (including /index.html on first load) shows home */}
            <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter basename="/app">
      <AuthProvider>
        <Navbar />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

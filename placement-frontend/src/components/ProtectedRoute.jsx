import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { getCurrentUser } from '../features/auth/authSlice'

export default function ProtectedRoute() {
  const dispatch = useDispatch()
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')
  const user = useSelector((s) => s.auth.user)
  const location = useLocation()

  useEffect(() => {
    if (token && !user) {
      dispatch(getCurrentUser())
    }
  }, [dispatch, token, role, user])

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}


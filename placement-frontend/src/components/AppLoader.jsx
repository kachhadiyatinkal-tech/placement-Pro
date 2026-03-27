import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import Loader from './Loader'

const MIN_LOAD_TIME = 600

/** Full-screen loader shown during app initialization */
export default function AppLoader({ children }) {
  const [showLoader, setShowLoader] = useState(true)
  const [minElapsed, setMinElapsed] = useState(false)
  const authStatus = useSelector((s) => s.auth.status)

  useEffect(() => {
    const t = setTimeout(() => setMinElapsed(true), MIN_LOAD_TIME)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!minElapsed) return

    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')

    if (!token || role === 'company') {
      setShowLoader(false)
      return
    }

    if (authStatus !== 'loading') {
      const t = setTimeout(() => setShowLoader(false), 200)
      return () => clearTimeout(t)
    }
  }, [minElapsed, authStatus])

  if (!showLoader) return children

  return (
    <Loader
      label="Loading Placement Suite..."
      fullScreen
    />
  )
}

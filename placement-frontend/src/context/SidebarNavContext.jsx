import { createContext, useContext, useMemo, useState } from 'react'

const SidebarNavContext = createContext(null)

export function SidebarNavProvider({ children }) {
  const [open, setOpen] = useState(false)
  const value = useMemo(
    () => ({
      open,
      setOpen,
      toggle: () => setOpen((o) => !o),
      close: () => setOpen(false),
    }),
    [open],
  )
  return <SidebarNavContext.Provider value={value}>{children}</SidebarNavContext.Provider>
}

export function useSidebarNav() {
  const ctx = useContext(SidebarNavContext)
  if (!ctx) {
    return { open: false, setOpen: () => {}, toggle: () => {}, close: () => {} }
  }
  return ctx
}

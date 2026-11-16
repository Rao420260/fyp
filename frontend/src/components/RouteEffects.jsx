import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Har page ka tab title
const titles = {
  '/': 'PostFlow - Social Media Scheduler',
  '/login': 'Login | PostFlow',
  '/signup': 'Sign up | PostFlow',
  '/connect': 'Connect accounts | PostFlow',
  '/assistant': 'AI Assistant | PostFlow',
}

export default function RouteEffects() {
  const { pathname, hash } = useLocation()

  // Page badle to tab ka title badal do
  useEffect(() => {
    document.title = titles[pathname] || 'Page not found | PostFlow'
  }, [pathname])

  // Page badle to upar se shuru karo (lekin #features jaise links par nahi)
  useEffect(() => {
    if (hash) return
    window.scrollTo(0, 0)
  }, [pathname, hash])

  return null
}
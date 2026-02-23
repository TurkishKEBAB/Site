import { lazy, Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navigation from './Navigation'
import Footer from './Footer'
import PageTransition from './PageTransition'

const AnimatedBackground = lazy(() => import('./AnimatedBackground'))

export default function Layout() {
  const location = useLocation()
  
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Global Animated Background */}
      <Suspense
        fallback={<div aria-hidden="true" className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-950 via-primary-950 to-slate-900" />}
      >
        <AnimatedBackground />
      </Suspense>
      
      <Navigation />
      <main className="flex-1 relative z-10">
        <PageTransition key={location.pathname}>
          <Outlet />
        </PageTransition>
      </main>
      <footer className="relative z-10">
        <Footer />
      </footer>
    </div>
  )
}

import { lazy, Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navigation from './Navigation'
import Footer from './Footer'
import PageTransition from './PageTransition'

const AnimatedBackground = lazy(() => import('./AnimatedBackground'))

export default function Layout() {
  const location = useLocation()

  return (
    <div className="min-h-screen flex flex-col relative bg-white dark:bg-gray-950 transition-colors duration-300">
      {/* Theme-aware animated background */}
      <Suspense
        fallback={
          <div
            aria-hidden="true"
            className="fixed inset-0 -z-10 bg-gray-50 dark:bg-gray-950"
          />
        }
      >
        <AnimatedBackground />
      </Suspense>

      <Navigation />
      <main className="flex-1 relative z-10 pt-16 md:pt-20">
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

import { Outlet, useLocation } from 'react-router-dom'
import Navigation from './Navigation'
import Footer from './Footer'
import AnimatedBackground from './AnimatedBackground'
import PageTransition from './PageTransition'

export default function Layout() {
  const location = useLocation()
  
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Global Animated Background */}
      <AnimatedBackground />
      
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

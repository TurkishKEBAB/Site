import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { LanguageProvider } from './contexts/LanguageContext'
import { ToastProvider } from './components/Toast'
import GlobalApiErrorListener from './components/GlobalApiErrorListener'
import ProtectedRoute from './components/ProtectedRoute'
import RouteSeo from './components/RouteSeo'
import Layout from './components/Layout'

const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))
const Projects = lazy(() => import('./pages/Projects'))
const Blog = lazy(() => import('./pages/Blog'))
const BlogDetail = lazy(() => import('./pages/BlogDetail'))
const Contact = lazy(() => import('./pages/Contact'))
const Login = lazy(() => import('./pages/Login'))
const Admin = lazy(() => import('./pages/Admin'))
const NotFound = lazy(() => import('./pages/NotFound'))

function PageFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center text-white">
      <span className="h-8 w-8 rounded-full border-2 border-primary-400 border-t-transparent animate-spin" aria-hidden="true" />
      <span className="ml-3 text-sm text-gray-300">Loading page...</span>
    </div>
  )
}

function App() {
  return (
    <ToastProvider>
      <LanguageProvider>
        <AuthProvider>
          <GlobalApiErrorListener />
          <RouteSeo />
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="about" element={<About />} />
                <Route path="projects" element={<Projects />} />
                <Route path="blog" element={<Blog />} />
                <Route path="blog/:slug" element={<BlogDetail />} />
                <Route path="contact" element={<Contact />} />
                <Route
                  path="admin"
                  element={(
                    <ProtectedRoute>
                      <Admin />
                    </ProtectedRoute>
                  )}
                />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </Suspense>
        </AuthProvider>
      </LanguageProvider>
    </ToastProvider>
  )
}

export default App

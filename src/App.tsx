import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { TopBar } from './components/TopBar'
import Home from './pages/Home'

const Draw = lazy(() => import('./pages/Draw'))
const Reveal = lazy(() => import('./pages/Reveal'))
const Journal = lazy(() => import('./pages/Journal'))
const Method = lazy(() => import('./pages/Method'))

function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollTop />
      <TopBar />
      <main>
        <Suspense fallback={<div className="page muted">טוען</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/draw" element={<Draw />} />
            <Route path="/reveal/:id" element={<Reveal />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/method" element={<Method />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </Suspense>
      </main>
    </BrowserRouter>
  )
}

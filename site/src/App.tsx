import { useEffect, useState } from 'react'
import Home from './pages/Home'
import Project from './pages/Project'

const projectSections: Record<string, string> = {
  '#project-demo': 'demonstration',
  '#project-policy': 'policy',
  '#project-evidence': 'evidence',
  '#project-stage': 'stage',
}

export default function App() {
  const [hash, setHash] = useState(window.location.hash || '#home')

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash || '#home')
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const isProject = hash.startsWith('#project')

  useEffect(() => {
    const sectionId = projectSections[hash] || (isProject ? '' : hash.slice(1))
    const frame = window.requestAnimationFrame(() => {
      if (sectionId && sectionId !== 'home' && sectionId !== 'project') {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      } else {
        window.scrollTo({ top: 0, behavior: 'instant' })
      }
    })
    return () => window.cancelAnimationFrame(frame)
  }, [hash, isProject])

  return isProject ? <Project /> : <Home />
}

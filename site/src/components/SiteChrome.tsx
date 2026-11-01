import { useState } from 'react'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import type { Decision } from '../lib/governance'

const navigation = [
  { label: 'About', href: '#about' },
  { label: 'Expertise', href: '#expertise' },
  { label: 'Projects', href: '#project' },
  { label: 'Research', href: '#research' },
  { label: 'Insights', href: '#insights' },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  return (
    <header className="site-header">
      <div className="container header-inner">
        <a className="wordmark" href="#home" onClick={() => setOpen(false)} aria-label="Grace Adjeli home">
          <span className="gold-dot" aria-hidden="true" />
          <span>Grace Adjeli</span>
        </a>
        <button className="menu-button" type="button" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
        <nav className={open ? 'main-nav is-open' : 'main-nav'} aria-label="Primary navigation">
          {navigation.map((item) => <a key={item.href} href={item.href} onClick={() => setOpen(false)}>{item.label}</a>)}
          <a className="nav-contact" href="#contact" onClick={() => setOpen(false)}>Contact</a>
        </nav>
      </div>
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <span>Grace Adjeli</span>
        <span>Governance at Execution™</span>
        <a href="https://www.linkedin.com/in/graceadjeli" target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight size={14} aria-hidden="true" /></a>
      </div>
    </footer>
  )
}

export function SectionIntro({ eyebrow, id }: { eyebrow: string; id?: string }) {
  return (
    <div className="section-intro" id={id}>
      <span>{eyebrow}</span>
      <span className="section-rule" aria-hidden="true" />
    </div>
  )
}

export function DecisionBadge({ decision, small = false }: { decision: Decision; small?: boolean }) {
  const className = decision === 'HUMAN REVIEW' ? 'decision-badge review' : decision === 'PERMIT' ? 'decision-badge permit' : 'decision-badge block'
  return <span className={small ? `${className} small` : className}>{decision}</span>
}

export function FlowDiagram({ central = false }: { central?: boolean }) {
  const labels = central ? ['Request', 'Recommend', 'Decide'] : ['Agent', 'Supervisor', 'Gateway']
  const descriptions = central ? ['Exact action', 'Untrusted input', 'Independent control'] : ['Requests action', 'Recommends', 'Decides']
  return (
    <div className="flow-diagram">
      <div className="flow-nodes">
        {labels.map((label, index) => (
          <div className="flow-node-wrap" key={label}>
            <div className="flow-node">
              <strong>{label}</strong>
              <span>{descriptions[index]}</span>
            </div>
            {index < 2 && <span className="flow-connector" aria-hidden="true" />}
          </div>
        ))}
      </div>
      <div className="flow-decision">
        <DecisionBadge decision="HUMAN REVIEW" />
        <p>{central ? 'High risk actions require independent human approval.' : 'The supervisor recommends. The independent gateway decides.'}</p>
      </div>
    </div>
  )
}

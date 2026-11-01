import { ArrowDown, ArrowRight, ArrowUpRight } from 'lucide-react'
import { DecisionBadge, FlowDiagram, SectionIntro, SiteFooter, SiteHeader } from '../components/SiteChrome'

const progression = [
  {
    number: '01',
    title: 'DevOps and Cybersecurity',
    text: 'Cloud engineering, CI/CD, deployment validation, security controls, and release readiness.',
  },
  {
    number: '02',
    title: 'Agile Delivery',
    text: 'Team coaching, risk facilitation, delivery metrics, stakeholder decisions, and process improvement.',
  },
  {
    number: '03',
    title: 'AI Governance Engineering',
    text: 'Risk classification, execution controls, human oversight, technical validation, and evidence.',
  },
]

const expertise = [
  ['AI Governance Engineering', 'Intake, risk classification, policy translation, execution gates, approvals, and evidence.'],
  ['Cybersecurity', 'Control assessment, STIG validation, vulnerability review, PII protection, and remediation.'],
  ['DevOps and DevSecOps', 'AWS, CI/CD, infrastructure automation, security integration, and technical validation.'],
  ['Agile Delivery', 'Scrum, SAFe, team coaching, delivery metrics, ROAM, and stakeholder coordination.'],
]

const evidenceLinks = [
  ['Architecture', 'See how governance requirements become technical controls.', '#project'],
  ['Policy', 'Inspect the decision matrix and approval conditions.', '#project-policy'],
  ['Test Evidence', 'Review executed results, control coverage, and limitations.', '#project-evidence'],
  ['Case Study', 'Read what was built, tested, and learned.', '#project-stage'],
]

export default function Home() {
  return (
    <div className="site-shell">
      <SiteHeader />
      <main>
        <section className="container hero" id="about">
          <div className="hero-copy">
            <p className="eyebrow">AI Governance Engineering</p>
            <h1>Governance at Execution<sup className="trademark">™</sup></h1>
            <h2 className="hero-subtitle">Governance Holds at Execution</h2>
            <p className="hero-text">I design evidence backed governance controls grounded in DevOps, cybersecurity, and agile delivery. The focus is simple: decide whether an AI action may execute, then preserve the evidence.</p>
            <div className="button-row">
              <a className="button button-gold" href="#project">Explore the flagship project <ArrowRight size={17} aria-hidden="true" /></a>
              <a className="text-link" href="#journey">View professional journey <ArrowDown size={16} aria-hidden="true" /></a>
            </div>
          </div>
          <div className="panel hero-panel">
            <p className="eyebrow">Flagship reference implementation</p>
            <h2>AI Execution<br />Governance</h2>
            <FlowDiagram />
          </div>
        </section>

        <section className="container proof-strip" aria-label="Professional credentials">
          <div><strong>10+ Years</strong><span>Enterprise technology</span></div>
          <div><strong>AIGP CISSP SSCP PMP</strong><span>Verified professional credentials</span></div>
          <div><strong>PhD Candidate</strong><span>Technology and research methods</span></div>
        </section>

        <section className="container section" id="journey">
          <SectionIntro eyebrow="Professional Progression" />
          <h2 className="section-title wide">Delivery, security, and control form one continuous story.</h2>
          <div className="three-column progression-grid">
            {progression.map((item) => (
              <article key={item.number}>
                <span className="item-number">{item.number}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="container section" id="expertise">
          <SectionIntro eyebrow="Expertise" />
          <div className="two-column expertise-grid">
            {expertise.map(([title, text]) => (
              <article key={title}><h3>{title}</h3><p>{text}</p></article>
            ))}
          </div>
        </section>

        <section className="container section project-feature">
          <div className="feature-copy">
            <p className="eyebrow">Featured project | Stage 1</p>
            <h2>AI Execution Governance</h2>
            <p>A browser based reference demonstration showing why an AI supervisor recommendation must not become execution authority.</p>
            <a className="button button-gold" href="#project">Open the project <ArrowRight size={17} aria-hidden="true" /></a>
          </div>
          <div className="decision-matrix-preview">
            <p className="eyebrow">Illustrative decision matrix</p>
            <div><span>Read public information</span><DecisionBadge decision="PERMIT" small /></div>
            <div><span>Export synthetic internal data</span><DecisionBadge decision="HUMAN REVIEW" small /></div>
            <div><span>Delete production data</span><DecisionBadge decision="BLOCK" small /></div>
          </div>
        </section>

        <section className="container section" id="research">
          <SectionIntro eyebrow="Education and Research" />
          <div className="research-grid">
            <article>
              <p className="eyebrow">PhD Dissertation</p>
              <h3>Ethical Frameworks for Human AI Collaboration in Cybersecurity Decision Making</h3>
              <p>In progress | Capitol Technology University</p>
            </article>
            <article>
              <p className="eyebrow">Master's Capstone</p>
              <h3>Ethical AI in Healthcare</h3>
              <p>Completed</p>
              <p>BS Cybersecurity Management and Policy | UMGC</p>
            </article>
          </div>
          <p className="research-note">The reference implementation is a practical technical exploration related to these research interests. It is not presented as validation of dissertation findings.</p>
        </section>

        <section className="container section" id="insights">
          <SectionIntro eyebrow="Evidence and Insights" />
          <div className="four-column evidence-grid">
            {evidenceLinks.map(([title, text, href]) => (
              <a href={href} key={title}>
                <h3>{title}</h3><p>{text}</p><ArrowUpRight size={18} aria-hidden="true" />
              </a>
            ))}
          </div>
        </section>

        <section className="container quote-section">
          <blockquote>“Governance is not what is defined. It is what is enforced at execution.”</blockquote>
        </section>

        <section className="container contact-panel" id="contact">
          <div><h2>Let's discuss governance that works in practice.</h2><p>Professional conversations, research collaboration, and technical review.</p></div>
          <a className="text-link" href="https://www.linkedin.com/in/graceadjeli" target="_blank" rel="noreferrer">linkedin.com/in/graceadjeli <ArrowUpRight size={17} aria-hidden="true" /></a>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}

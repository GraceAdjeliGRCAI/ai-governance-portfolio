import { ArrowDown } from 'lucide-react'
import GovernanceDemo from '../components/GovernanceDemo'
import TestEvidence from '../components/TestEvidence'
import { DecisionBadge, FlowDiagram, SectionIntro, SiteFooter, SiteHeader } from '../components/SiteChrome'
import { SCENARIOS } from '../lib/governance'

export default function Project() {
  return (
    <div className="site-shell">
      <SiteHeader />
      <main>
        <section className="container project-hero">
          <div className="breadcrumb">Projects <span>/</span> AI Execution Governance</div>
          <div className="project-hero-grid">
            <div className="project-hero-copy">
              <span className="stage-badge">Stage 1 reference demonstration</span>
              <h1>AI Execution Governance</h1>
              <h2>An AI supervisor can recommend.<br />Execution Governance decides.</h2>
              <p>A synthetic scenario showing how an independent control layer evaluates the exact action, policy, and approval before any simulated execution.</p>
              <a className="text-link" href="#project-demo">Explore the demonstration <ArrowDown size={16} aria-hidden="true" /></a>
            </div>
            <div className="panel principle-panel">
              <p className="eyebrow">Central control principle</p>
              <h2>Recommendation is<br />not authority.</h2>
              <FlowDiagram central />
              <p className="panel-footnote">Synthetic data | No production system access</p>
            </div>
          </div>
        </section>

        <section className="container section">
          <SectionIntro eyebrow="The Problem and the Control" />
          <div className="two-column narrative-grid">
            <article><h2>The governance gap</h2><p>An AI system may recommend or request a consequential action. If that recommendation directly triggers execution, governance remains advisory and the control boundary disappears.</p></article>
            <article><h2>The control response</h2><p>An independent gateway evaluates the exact request, versioned policy, risk tier, and approval validity. It returns PERMIT, HUMAN REVIEW, or BLOCK and records the decision.</p></article>
          </div>
        </section>

        <section className="container section" id="demonstration">
          <SectionIntro eyebrow="Interactive Demonstration" />
          <GovernanceDemo />
        </section>

        <section className="container section" id="policy">
          <SectionIntro eyebrow="Policy and Decision Matrix" />
          <p className="section-lead">The gateway evaluates policy independently of the supervisor recommendation.</p>
          <div className="policy-table" role="table" aria-label="Governance policy matrix">
            <div className="policy-header" role="row"><span>Requested action</span><span>Risk tier</span><span>Decision</span></div>
            {Object.values(SCENARIOS).map((scenario) => (
              <div className="policy-row" role="row" key={scenario.id}>
                <span>{scenario.action}</span><span>{scenario.risk}</span><DecisionBadge decision={scenario.decision} small />
              </div>
            ))}
          </div>
        </section>

        <section className="container section" id="evidence">
          <SectionIntro eyebrow="Executed Test Evidence" />
          <TestEvidence />
        </section>

        <section className="container section implementation-section" id="stage">
          <SectionIntro eyebrow="Implementation Boundary" />
          <div className="two-column narrative-grid">
            <article><h2>Stage 1 | Portfolio release</h2><p>Browser simulation, synthetic data, visible decisions, approval scenarios, automated test evidence, and session based evidence records.</p><p>The browser demonstration illustrates control logic. It is not production security enforcement.</p></article>
            <article><h2>Stage 2 | Technical implementation</h2><p>Real gateway, Jira integration, server side validation, tamper evident evidence, automated tests, and monitoring.</p><p>Stage 2 requires an independent execution boundary and protected infrastructure.</p></article>
          </div>
          <div className="limitation-note"><strong>Evidence limitation</strong><p>Hash chained evidence is tamper evident, not truly immutable. Session evidence resets when this page reloads.</p></div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}

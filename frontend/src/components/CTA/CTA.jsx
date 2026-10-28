import React from 'react';

export default function CTA() {
  return (
    <section className="cta-section" id="contact">
      <div className="cta-glow-bg" aria-hidden="true"></div>
      <div className="container">
        <div className="cta-inner text-center">
          <div className="section-eyebrow">GET STARTED</div>
          <h2 className="cta-title">Ready to Get Your Customer Data Under Control?</h2>
          <p className="cta-subtitle">
            Bring your leads, customers, deals and team into one organized workspace.
          </p>
          <div className="cta-actions">
            <a href="#pricing" className="btn btn-primary btn-lg">Start Free</a>
            <a href="#pricing" className="btn btn-secondary btn-lg">Book a Demo</a>
          </div>
          <p className="cta-secondary-note">Set up your workspace in minutes.</p>
        </div>
      </div>
    </section>
  );
}

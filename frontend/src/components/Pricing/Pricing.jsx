import React from 'react';

const plansData = [
  {
    name: 'STARTER',
    typeTag: 'ENTRY',
    tagline: 'For small teams getting started with structured customer management.',
    monthlyPrice: '999',
    yearlyPrice: '799',
    monthlyNote: 'Billed monthly',
    yearlyNote: '₹9,588 billed annually (Save 20%)',
    featured: false,
    ctaText: 'Start Free',
    btnClass: 'btn-secondary',
    features: [
      { text: '5 Team Members', highlight: false },
      { text: '1 Workspace', highlight: false },
      { text: 'Lead Management', highlight: false },
      { text: 'Contact Management', highlight: false },
      { text: 'Sales Pipeline', highlight: false },
      { text: 'Tasks & Reminders', highlight: false },
      { text: 'Basic Reports', highlight: false }
    ]
  },
  {
    name: 'GROWTH',
    typeTag: 'RECOMMENDED',
    badge: 'MOST POPULAR',
    tagline: 'For growing businesses expanding sales operations and active pipelines.',
    monthlyPrice: '2,499',
    yearlyPrice: '1,999',
    monthlyNote: 'Billed monthly',
    yearlyNote: '₹23,988 billed annually (Save 20%)',
    featured: true,
    ctaText: 'Start Free',
    btnClass: 'btn-primary',
    features: [
      { text: '20 Team Members', highlight: true },
      { text: 'Multiple Workspaces', highlight: true },
      { text: 'Advanced Pipeline', highlight: false },
      { text: 'Automation Workflows', highlight: false },
      { text: 'Reports & Analytics', highlight: false },
      { text: 'Team Permissions', highlight: false },
      { text: 'Activity Tracking', highlight: false }
    ]
  },
  {
    name: 'SCALE',
    typeTag: 'ENTERPRISE',
    tagline: 'For larger organizations needing complete multi-workspace governance.',
    monthlyPrice: '5,999',
    yearlyPrice: '4,799',
    monthlyNote: 'Billed monthly',
    yearlyNote: '₹57,588 billed annually (Save 20%)',
    featured: false,
    ctaText: 'Contact Sales',
    btnClass: 'btn-secondary',
    features: [
      { text: 'Unlimited Team Members', highlight: false },
      { text: 'Multiple Workspaces', highlight: false },
      { text: 'Advanced Permissions', highlight: false },
      { text: 'Advanced Reports', highlight: false },
      { text: 'Custom Automation', highlight: false },
      { text: 'Priority Support', highlight: false },
      { text: 'Custom Configuration', highlight: false }
    ]
  }
];

export default function Pricing({ isYearly, setIsYearly, onSelectPlan }) {
  return (
    <section className="section pricing-section" id="pricing">
      <div className="container">
        <div className="section-intro text-center">
          <div className="section-eyebrow">TRANSPARENT PRICING</div>
          <h2 className="section-heading">Simple Plans for Teams of Every Size</h2>
          <p className="section-text">
            Choose the workspace scale that fits your business. Easily change plans as your sales team expands.
          </p>

          {/* Pricing Toggle */}
          <div className="pricing-toggle-wrap">
            <span
              className={`toggle-text ${!isYearly ? 'active' : ''}`}
              id="label-monthly"
              style={{ cursor: 'pointer' }}
              onClick={() => setIsYearly(false)}
            >
              MONTHLY
            </span>
            <button
              type="button"
              className="pricing-switch"
              id="pricingToggle"
              role="switch"
              aria-checked={isYearly}
              aria-label="Toggle between monthly and yearly billing"
              onClick={() => setIsYearly(!isYearly)}
            >
              <span className="switch-handle"></span>
            </button>
            <span
              className={`toggle-text ${isYearly ? 'active' : ''}`}
              id="label-yearly"
              style={{ cursor: 'pointer' }}
              onClick={() => setIsYearly(true)}
            >
              YEARLY
              <span className="save-badge">SAVE 20%</span>
            </span>
          </div>
        </div>

        <div className="pricing-grid">
          {plansData.map((plan) => {
            const currentPrice = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
            const currentNote = isYearly ? plan.yearlyNote : plan.monthlyNote;

            return (
              <div
                key={plan.name}
                className={`pricing-card ${plan.featured ? 'card-featured' : ''}`}
                data-plan={plan.name}
              >
                {plan.featured && (
                  <div className="featured-badge font-mono">{plan.badge}</div>
                )}
                <div className="plan-header">
                  <div className={`plan-type-tag font-mono ${plan.featured ? 'accent-tag' : ''}`}>
                    {plan.typeTag}
                  </div>
                  <h3 className="plan-name">{plan.name}</h3>
                  <p className="plan-tagline">{plan.tagline}</p>
                  <div className="plan-price-row">
                    <span className="currency font-mono">₹</span>
                    <span
                      className="price-amount font-mono"
                      data-monthly={plan.monthlyPrice}
                      data-yearly={plan.yearlyPrice}
                    >
                      {currentPrice}
                    </span>
                    <span className="price-cycle">/ month</span>
                  </div>
                  <div
                    className="plan-billing-info"
                    data-monthly-note={plan.monthlyNote}
                    data-yearly-note={plan.yearlyNote}
                  >
                    {currentNote}
                  </div>
                </div>

                <div className="plan-divider"></div>

                <ul className="plan-features">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx}>
                      <span className="checkmark">&#10003;</span>{' '}
                      {feature.highlight ? (
                        <strong>{feature.text}</strong>
                      ) : (
                        feature.text
                      )}
                    </li>
                  ))}
                </ul>

                <div className="plan-cta">
                  <button
                    type="button"
                    className={`btn ${plan.btnClass} btn-full plan-order-btn`}
                    data-plan={plan.name}
                    onClick={() => onSelectPlan(plan.name, currentPrice, isYearly)}
                  >
                    {plan.ctaText}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="guarantee-note">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
          <span><strong>14-Day Free Trial:</strong> Full platform access. No credit card required to start. Cancel anytime.</span>
        </div>
      </div>
    </section>
  );
}

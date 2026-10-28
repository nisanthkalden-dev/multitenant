import React from 'react';

const footerLinks = {
  product: [
    { label: 'CRM', href: '#home' },
    { label: 'Lead Management', href: '#features' },
    { label: 'Contact Management', href: '#features' },
    { label: 'Tasks & Activities', href: '#features' },
    { label: 'Reports & Analytics', href: '#features' }
  ],
  solutions: [
    { label: 'Small Business', href: '#features' },
    { label: 'Sales Teams', href: '#features' },
    { label: 'Enterprise Security', href: '#security' },
    { label: 'Agencies', href: '#pricing' }
  ],
  company: [
    { label: 'About', href: '#home' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Contact', href: '#contact' },
    { label: 'Careers', href: '#' }
  ],
  resources: [
    { label: 'Documentation', href: '#' },
    { label: 'Help Center', href: '#' },
    { label: 'Guides', href: '#' },
    { label: 'API', href: '#' }
  ]
};

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand-col">
            <a href="#home" className="logo footer-logo" aria-label="Nexora CRM Home">
              <span className="logo-accent">nexora</span>crm<span className="logo-dot">.</span>
            </a>
            <p className="footer-bio">
              Modern multi-tenant customer relationship management platform. Bring your sales pipelines, contacts, tasks, and isolated workspaces into one place.
            </p>
            <div className="footer-socials">
              <a href="#" aria-label="Twitter">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18.3346 3.33368C18.3346 3.33368 17.7513 5.08368 16.668 6.16701C18.0013 14.5003 8.83464 20.5837 1.66797 15.8337C3.5013 15.917 5.33464 15.3337 6.66797 14.167C2.5013 12.917 0.417969 8.00034 2.5013 4.16701C4.33464 6.33368 7.16797 7.58368 10.0013 7.50034C9.2513 4.00034 13.3346 2.00034 15.8346 4.33368C16.7513 4.33368 18.3346 3.33368 18.3346 3.33368Z"/>
                </svg>
              </a>
              <a href="#" aria-label="GitHub">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
                </svg>
              </a>
              <a href="#" aria-label="LinkedIn">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13.3346 6.66699C14.6607 6.66699 15.9325 7.19378 16.8702 8.13146C17.8079 9.06914 18.3346 10.3409 18.3346 11.667V17.5003H15.0013V11.667C15.0013 11.225 14.8257 10.801 14.5131 10.4885C14.2006 10.1759 13.7767 10.0003 13.3346 10.0003C12.8926 10.0003 12.4687 10.1759 12.1561 10.4885C11.8436 10.801 11.668 11.225 11.668 11.667V17.5003H8.33464V11.667C8.33464 10.3409 8.86142 9.06914 9.7991 8.13146C10.7368 7.19378 12.0086 6.66699 13.3346 6.66699Z"/>
                  <path d="M5.0013 7.50033H1.66797V17.5003H5.0013V7.50033Z"/>
                  <path d="M3.33464 5.00033C4.25511 5.00033 5.0013 4.25413 5.0013 3.33366C5.0013 2.41318 4.25511 1.66699 3.33464 1.66699C2.41416 1.66699 1.66797 2.41318 1.66797 3.33366C1.66797 4.25413 2.41416 5.00033 3.33464 5.00033Z"/>
                </svg>
              </a>
            </div>
          </div>

          <div className="footer-links-grid-wrap">
            <div className="footer-col">
              <div className="footer-heading font-mono">PRODUCT</div>
              <ul className="footer-links">
                {footerLinks.product.map((link, idx) => (
                  <li key={idx}><a href={link.href}>{link.label}</a></li>
                ))}
              </ul>
            </div>

            <div className="footer-col">
              <div className="footer-heading font-mono">SOLUTIONS</div>
              <ul className="footer-links">
                {footerLinks.solutions.map((link, idx) => (
                  <li key={idx}><a href={link.href}>{link.label}</a></li>
                ))}
              </ul>
            </div>

            <div className="footer-col">
              <div className="footer-heading font-mono">COMPANY</div>
              <ul className="footer-links">
                {footerLinks.company.map((link, idx) => (
                  <li key={idx}><a href={link.href}>{link.label}</a></li>
                ))}
              </ul>
            </div>

            <div className="footer-col">
              <div className="footer-heading font-mono">RESOURCES</div>
              <ul className="footer-links">
                {footerLinks.resources.map((link, idx) => (
                  <li key={idx}><a href={link.href}>{link.label}</a></li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>&copy; 2026 Nexora CRM. All rights reserved.</span>
          <span>Secure multi-tenant customer management platform.</span>
        </div>
      </div>
    </footer>
  );
}

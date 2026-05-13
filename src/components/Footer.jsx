import React from "react";
import "../styles/Footer.css";

export default function Footer() {
  return (
    <footer className="main-footer glass">
      <div className="footer-content container">
        <div className="footer-brand">
          <div className="dev-badge">Software Engineer</div>
          <h2 className="dev-name">ELIKEM</h2>
          <p className="dev-tagline">
            Custom Dashboard Architecture & UI/UX Design
          </p>
        </div>

        <div className="footer-links">
          <div className="link-group">
            <h4>Contact</h4>
            <a href="mailto:elikemejay@gmail.com" className="footer-link">
              📧 elikemejay@gmail.com
            </a>
            <a href="tel:0593320375" className="footer-link">
              📞 +233 593 320 375
            </a>
          </div>

          <div className="link-group">
            <h4>Social Connect</h4>
            <div className="social-grid">
              <a
                href="https://wa.me/233503841074"
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp
              </a>
              <a
                href="https://www.linkedin.com/in/james-ganyo-aa0593360"
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn
              </a>
              <a
                href="https://github.com/Jganyo-dotcom/"
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          &copy; 2026 Elitech Mart. All Rights Reserved. Built with Precision.
        </p>
      </div>
    </footer>
  );
}

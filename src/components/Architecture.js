export function renderAbout() {
  return `
    <section class="section" id="about">
      <div class="container">
        <div class="section-header reveal">
          <div class="section-tag">About Us</div>
          <h2 class="section-title">Company Overview</h2>
          <p class="section-desc">
            We are a privately incorporated Rwandan technology company, registered with the
            Rwanda Development Board and engaged in software and IT services.
          </p>
        </div>

        <div class="about-grid">
          <!-- Left: narrative -->
          <div class="about-intro reveal">
            <p>
              We were incorporated on <strong>20 October 2025</strong> under
              Rwandan company law (Law N&deg; 007/2021 of 05/02/2021) as a private company limited
              by shares, with our registered office in Niboye, Kicukiro, Umujyi wa Kigali.
            </p>
            <p>
              Our primary business activity is <strong>Software Publishing</strong>
              (RDB code J5820), complemented by a range of computer programming, IT consultancy,
              data processing, and web portal services.
            </p>
            <p>
              We are led by our <strong>Managing Director and Chair, Theophile HARUSHYAMAGARA</strong>,
              and were co-founded with shareholder <strong>Yvette NSABARUGIRA</strong>.
            </p>
            <p>
              We hold an authorised share capital of <strong>RWF 1,000,000,000</strong>
              (one billion Rwandan francs) divided across ordinary, preferential, non-voting, and
              redeemable share classes.
            </p>
          </div>

          <!-- Right: registration card -->
          <div class="reveal">
            <div class="reg-card">
              <p class="reg-card-title">Registration Details</p>

              <div class="reg-row">
                <span class="reg-label">Serial Number</span>
                <span class="reg-value mono">1628324</span>
              </div>
              <div class="reg-row">
                <span class="reg-label">Date of Issuance</span>
                <span class="reg-value">20 October 2025</span>
              </div>
              <div class="reg-row">
                <span class="reg-label">Company Type</span>
                <span class="reg-value">Private &mdash; Limited by Shares</span>
              </div>
              <div class="reg-row">
                <span class="reg-label">Registered Address</span>
                <span class="reg-value" style="text-align:right; line-height:1.5;">
                  Niboye, Kicukiro<br>Umujyi wa Kigali, Rwanda
                </span>
              </div>
              <div class="reg-row">
                <span class="reg-label">Managing Director</span>
                <span class="reg-value">Theophile HARUSHYAMAGARA</span>
              </div>
              <div class="reg-row">
                <span class="reg-label">Share Capital</span>
                <span class="reg-value">RWF 1,000,000,000</span>
              </div>
              <div class="reg-row">
                <span class="reg-label">Main Activity</span>
                <span class="reg-value">Software Publishing (J5820)</span>
              </div>
              <div class="reg-row">
                <span class="reg-label">Governing Law</span>
                <span class="reg-value">Law N&deg; 007/2021 of 05/02/2021</span>
              </div>
            </div>

            <div class="rdb-verify" style="margin-top:1rem;">
              <p class="rdb-verify-text">
                Verify this certificate on the Rwanda Development Board portal using
                <strong>Serial No. 1628324</strong>.
              </p>
              <a href="http://www.rdb.rw/" target="_blank" rel="noopener noreferrer">
                Verify at RDB
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

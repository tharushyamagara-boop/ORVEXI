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
                <span class="reg-label">TIN Number</span>
                <span class="reg-value mono">
                  <a href="https://etax.rra.gov.rw/nidAssignedTIN/" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: none;">1628324</a>
                </span>
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
            </div>

          </div>
        </div>
      </div>
    </section>
  `;
}

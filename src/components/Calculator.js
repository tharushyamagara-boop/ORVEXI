export function renderCalculator() {
  return `
    <section class="section" id="calculator">
      <div class="container">
        <div class="section-header reveal">
          <div class="section-tag">Value Engineering</div>
          <h2 class="section-title">Enterprise ROI & Efficiency Calculator</h2>
          <p class="section-desc">
            Quantify the direct economic leverage of deploying ORVEXI’s autonomous infrastructure and intelligent mesh routing across your organization.
          </p>
        </div>

        <div class="calculator-card reveal">
          <div class="calculator-grid">
            <div class="calc-input-group">
              <div class="slider-wrapper">
                <div class="slider-label-row">
                  <span class="slider-title">Monthly Cloud & Compute Spend</span>
                  <span class="slider-val-badge" id="spendDisplay">$150,000</span>
                </div>
                <input 
                  type="range" 
                  min="20000" 
                  max="1000000" 
                  step="10000" 
                  value="150000" 
                  class="custom-range" 
                  id="spendSlider"
                  aria-label="Monthly Cloud Infrastructure Spend Slider"
                >
                <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-dim);">
                  <span>$20k/mo</span>
                  <span>$500k/mo</span>
                  <span>$1M+/mo</span>
                </div>
              </div>

              <div class="slider-wrapper">
                <div class="slider-label-row">
                  <span class="slider-title">Engineering & DevOps Headcount</span>
                  <span class="slider-val-badge" id="teamDisplay">45 engineers</span>
                </div>
                <input 
                  type="range" 
                  min="5" 
                  max="500" 
                  step="5" 
                  value="45" 
                  class="custom-range" 
                  id="teamSlider"
                  aria-label="Engineering Team Size Slider"
                >
                <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-dim);">
                  <span>5 engineers</span>
                  <span>250 engineers</span>
                  <span>500+ engineers</span>
                </div>
              </div>

              <div style="padding: 1rem; background: rgba(255,255,255,0.02); border: 1px dashed var(--border-subtle); border-radius: var(--radius-sm); font-size: 0.85rem; color: var(--text-secondary);">
                💡 <strong>Audit Metric:</strong> Calculations derived from empirical deployment telemetry: average 38% reduction in over-provisioned GPU/cloud instances and 260 hours saved per engineer/year via automated orchestration.
              </div>
            </div>

            <div class="calc-result-box">
              <div class="result-main">
                <span class="result-main-label">Projected Annual Financial Impact</span>
                <span class="result-main-value" id="savingsAnnual">$684,000</span>
              </div>

              <div class="result-subgrid">
                <div class="result-subitem">
                  <span class="subitem-label">Engineering Hours Saved / Yr</span>
                  <span class="subitem-val" id="hoursSaved">11,700 hrs</span>
                </div>
                <div class="result-subitem">
                  <span class="subitem-label">Throughput Multiplier</span>
                  <span class="subitem-val" id="throughputMult" style="color: #34d399;">3.6x</span>
                </div>
              </div>

              <button class="btn btn-primary open-modal-btn" style="width: 100%; margin-top: 0.5rem;">
                <span>Download Executive Financial Dossier</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

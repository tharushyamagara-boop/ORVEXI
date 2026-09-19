export function renderCaseStudies() {
  const testimonials = [
    {
      quote: "ORVEXI fundamentally transformed our algorithmic settlement pipeline. We compressed P99 edge latency from 14ms down to 1.1ms while maintaining rigorous zero-knowledge cryptographic enclave compliance.",
      name: "Elena Rostova",
      role: "Chief Technology Officer, Nexus Capital Global",
      initials: "ER"
    },
    {
      quote: "Deploying ORVEXI’s autonomous cloud mesh allowed our autonomous robotic fleet of over 250,000 units to synchronize continuous telemetry with zero downtime across three continents simultaneously.",
      name: "Marcus Vance",
      role: "VP of Cloud Engineering, Apex Dynamics",
      initials: "MV"
    },
    {
      quote: "Our multi-petabyte generative molecular modeling models previously bottlenecked our entire team. ORVEXI halved our compute spend while boosting throughput by 3.8x within the first quarter.",
      name: "Dr. Aris Thorne",
      role: "Chief Information Officer, Hyperion BioSystems",
      initials: "AT"
    }
  ];

  return `
    <section class="section" id="casestudies">
      <div class="container">
        <div class="section-header reveal">
          <div class="section-tag">Enterprise Validation</div>
          <h2 class="section-title">Proven in Mission-Critical Scenarios</h2>
          <p class="section-desc">
            How Fortune 500 engineering leaders and visionary deep-tech pioneers rely on ORVEXI for their most critical computing workloads.
          </p>
        </div>

        <div class="testimonial-box reveal" id="testimonialBox">
          <div class="testimonial-quote" id="testimonialQuote">
            "${testimonials[0].quote}"
          </div>

          <div class="testimonial-author-row">
            <div class="author-meta">
              <div class="author-avatar" id="testimonialAvatar">${testimonials[0].initials}</div>
              <div>
                <div class="author-name" id="testimonialName">${testimonials[0].name}</div>
                <div class="author-role" id="testimonialRole">${testimonials[0].role}</div>
              </div>
            </div>

            <div class="carousel-nav-btns">
              <button class="carousel-btn" id="prevTestimonialBtn" aria-label="Previous Testimonial">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
              </button>
              <button class="carousel-btn" id="nextTestimonialBtn" aria-label="Next Testimonial">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

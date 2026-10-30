export function renderHeroSlider(slides = []) {
  const activeSlides = slides.filter(s => s.enabled !== false);
  if (!activeSlides.length) {
    return `<section class="section hero-section" id="home"><div class="container"><p>No active slides.</p></div></section>`;
  }

  const slidesHtml = activeSlides.map((slide, index) => {
    const isFirst = index === 0;
    const bgImage = slide.image || '/images/slide1_kigali_tech.jpg';
    const badge = (slide.badge && 
      !slide.badge.includes('1628324') && 
      !slide.badge.includes('RDB Registered') && 
      !slide.badge.includes('Code') && 
      !slide.badge.includes('J6311') && 
      !slide.badge.includes('J5820')
    ) ? slide.badge : '';
    const title = slide.title || 'Technology Solutions';
    const highlight = slide.highlight ? `<em>${slide.highlight}</em>` : '';
    const subtitle = slide.subtitle || '';
    const ctaPrimary = slide.ctaPrimary || { label: 'Our Services', url: '#services' };
    const ctaSecondary = slide.ctaSecondary || { label: 'Explore Portfolio', url: '#portfolio' };

    return `
      <div class="hero-slide ${isFirst ? 'active' : ''}" data-index="${index}">
        <!-- Ambient background aura extracted from the slide photo -->
        <div class="hero-slide-ambient-bg" style="background-image: url('${bgImage}');"></div>
        <div class="hero-slide-ambient-overlay"></div>

        <div class="hero-slide-inner">
          <div class="hero-slide-grid">
            
            <!-- LEFT: Featured Photo Showcase -->
            <div class="hero-slide-media">
              <div class="hero-slide-photo-frame">
                <img src="${bgImage}" alt="${title}" class="hero-slide-img" loading="${isFirst ? 'eager' : 'lazy'}">
                <div class="hero-slide-photo-overlay"></div>
                ${badge ? `
                  <div class="hero-slide-photo-badge">
                    <span class="photo-pulse-dot"></span>
                    <span>${badge}</span>
                  </div>
                ` : ''}
              </div>
            </div>

            <!-- RIGHT: Typography & Actions -->
            <div class="hero-slide-info">
              ${badge ? `
                <div class="hero-badge">
                  <span class="hero-badge-dot"></span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span>${badge}</span>
                </div>
              ` : ''}

              <h1 class="hero-title">
                <span class="hero-title-line">${title}</span>
                ${highlight ? `<span class="hero-title-line hero-title-highlight">${highlight}</span>` : ''}
              </h1>

              <p class="hero-subtitle">
                ${subtitle}
              </p>

              <div class="hero-cta-group">
                ${ctaPrimary.label ? `
                  <a href="${ctaPrimary.url || '#services'}" class="btn btn-primary btn-hero">
                    <span>${ctaPrimary.label}</span>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </a>
                ` : ''}
                ${ctaSecondary.label ? `
                  <a href="${ctaSecondary.url || '#portfolio'}" class="btn btn-secondary btn-hero">
                    <span>${ctaSecondary.label}</span>
                  </a>
                ` : ''}
              </div>
            </div>

          </div>
        </div>
      </div>
    `;
  }).join('');

  const dotsHtml = activeSlides.map((_, i) => `
    <button class="slider-dot ${i === 0 ? 'active' : ''}" data-index="${i}" aria-label="Go to slide ${i + 1}">
      <span class="slider-dot-progress"></span>
    </button>
  `).join('');

  return `
    <section class="section hero-slider-section" id="home" aria-label="Highlighted announcements and solutions">
      <!-- Background Ambient Glow & Grid -->
      <div class="hero-bg-effects">
        <div class="hero-glow"></div>
        <div class="hero-ring hero-ring-1"></div>
        <div class="hero-ring hero-ring-2"></div>
        <div class="hero-scan-line"></div>
      </div>

      <div class="hero-slider-track" id="heroSliderTrack">
        ${slidesHtml}
      </div>

      <!-- Navigation Arrows -->
      <button class="slider-nav-arrow slider-nav-prev" id="sliderPrevBtn" aria-label="Previous Slide">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>

      <button class="slider-nav-arrow slider-nav-next" id="sliderNextBtn" aria-label="Next Slide">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>

      <!-- Bottom Bar: Indicators & Counter -->
      <div class="hero-slider-controls">
        <div class="hero-slider-controls-inner">
          <div class="slider-dots" id="sliderDots">
            ${dotsHtml}
          </div>
          <div class="slider-counter" id="sliderCounter">
            <span class="current-slide">01</span>
            <span class="counter-sep">/</span>
            <span class="total-slides">${String(activeSlides.length).padStart(2, '0')}</span>
          </div>
        </div>
      </div>
    </section>
  `;
}

let sliderInterval = null;
let currentSlideIndex = 0;

export function initHeroSlider() {
  const section = document.getElementById('home');
  const track = document.getElementById('heroSliderTrack');
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.slider-dot');
  const prevBtn = document.getElementById('sliderPrevBtn');
  const nextBtn = document.getElementById('sliderNextBtn');
  const counterEl = document.querySelector('#sliderCounter .current-slide');

  if (!track || slides.length === 0) return;

  const total = slides.length;
  currentSlideIndex = 0;

  function showSlide(index) {
    if (index < 0) {
      currentSlideIndex = total - 1;
    } else if (index >= total) {
      currentSlideIndex = 0;
    } else {
      currentSlideIndex = index;
    }

    slides.forEach((slide, i) => {
      const isActive = i === currentSlideIndex;
      slide.classList.toggle('active', isActive);
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlideIndex);
    });

    if (counterEl) {
      counterEl.textContent = String(currentSlideIndex + 1).padStart(2, '0');
    }
  }

  function nextSlide() {
    showSlide(currentSlideIndex + 1);
  }

  function prevSlide() {
    showSlide(currentSlideIndex - 1);
  }

  function startAutoplay() {
    stopAutoplay();
    sliderInterval = setInterval(nextSlide, 6000);
  }

  function stopAutoplay() {
    if (sliderInterval) {
      clearInterval(sliderInterval);
      sliderInterval = null;
    }
  }

  // Event handlers
  if (nextBtn) {
    nextBtn.onclick = () => {
      nextSlide();
      startAutoplay();
    };
  }

  if (prevBtn) {
    prevBtn.onclick = () => {
      prevSlide();
      startAutoplay();
    };
  }

  dots.forEach(dot => {
    dot.onclick = () => {
      const idx = parseInt(dot.getAttribute('data-index'), 10);
      showSlide(idx);
      startAutoplay();
    };
  });

  // Pause on hover
  if (section) {
    section.onmouseenter = stopAutoplay;
    section.onmouseleave = startAutoplay;
  }

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
    if (e.key === 'ArrowRight') {
      nextSlide();
      startAutoplay();
    } else if (e.key === 'ArrowLeft') {
      prevSlide();
      startAutoplay();
    }
  });

  // Touch Swipe Support
  let touchStartX = 0;
  let touchEndX = 0;

  track.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
      startAutoplay();
    }
  }, { passive: true });

  // Initial show & autoplay
  showSlide(0);
  startAutoplay();
}

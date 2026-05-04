const revealElements = document.querySelectorAll('.reveal');
const heroWatermark = document.querySelector('.hero-watermark');

const revealOnScroll = () => {
  const viewportHeight = window.innerHeight;

  revealElements.forEach((element, index) => {
    const { top } = element.getBoundingClientRect();
    if (top < viewportHeight - 80) {
      setTimeout(() => element.classList.add('is-visible'), index * 80);
    }
  });
};

const parallaxHero = () => {
  if (!heroWatermark) return;
  const scrollY = window.scrollY;
  const offset = Math.min(scrollY * 0.18, 80);
  heroWatermark.style.transform = `translate(12%, ${-8 + offset}px) rotate(-6deg)`;
};

window.addEventListener('load', () => {
  revealOnScroll();
  parallaxHero();
});

window.addEventListener('scroll', () => {
  revealOnScroll();
  parallaxHero();
}, { passive: true });

// ==========================================
// Lógica del Carrusel (Hero Visual)
// ==========================================
const initCarousel = () => {
  const slides = document.querySelectorAll('.carousel-slide');
  const dots = document.querySelectorAll('.carousel-dot');
  const prevBtn = document.querySelector('.carousel-nav.prev');
  const nextBtn = document.querySelector('.carousel-nav.next');
  if (slides.length === 0) return;

  let currentSlide = 0;
  let slideInterval;

  const goToSlide = (index) => {
    slides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');
    
    currentSlide = (index + slides.length) % slides.length;
    
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
  };

  const nextSlide = () => goToSlide(currentSlide + 1);
  const prevSlide = () => goToSlide(currentSlide - 1);

  // Click manual en puntos
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      goToSlide(index);
      resetInterval();
    });
  });

  // Click en flechas
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      prevSlide();
      resetInterval();
    });
  }
  
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      nextSlide();
      resetInterval();
    });
  }

  // Autoplay
  const resetInterval = () => {
    clearInterval(slideInterval);
    slideInterval = setInterval(nextSlide, 7000); // Cambia cada 7 segundos para dar más tiempo de lectura
  };

  resetInterval();
};

window.addEventListener('load', () => {
  initCarousel();
});

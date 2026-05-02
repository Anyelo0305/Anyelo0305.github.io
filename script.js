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

// Smooth scroll para links de navegación
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Navbar scroll effect
const navbar = document.querySelector('.navbar');
let lastScrollTop = 0;

window.addEventListener('scroll', () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  
  if (scrollTop > 100) {
    navbar.style.boxShadow = '0 5px 30px rgba(233, 78, 27, 0.1)';
  } else {
    navbar.style.boxShadow = 'none';
  }
  
  lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
}, { passive: true });

// Intersection Observer para animaciones en scroll
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// Animar elementos al entrar en viewport
document.querySelectorAll('.service-card, .portfolio-item, .section-header').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'all 0.6s ease-out';
  observer.observe(el);
});

// Efecto hover en tarjetas de servicios
const serviceCards = document.querySelectorAll('.service-card');
serviceCards.forEach(card => {
  card.addEventListener('mouseenter', function() {
    this.style.background = 'rgba(26, 26, 46, 0.8)';
  });
  
  card.addEventListener('mouseleave', function() {
    this.style.background = 'rgba(26, 26, 46, 0.5)';
  });
});

// Efecto de pulsación en botones
const buttons = document.querySelectorAll('.btn');
buttons.forEach(btn => {
  btn.addEventListener('click', function(e) {
    const ripple = document.createElement('span');
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
});

// Contador de números en scroll
let hasAnimated = false;

const animateNumbers = () => {
  if (hasAnimated) return;
  
  const serviceCards = document.querySelectorAll('.service-card');
  if (serviceCards.length > 0) {
    const rect = serviceCards[0].getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      hasAnimated = true;
      // Aquí puedes agregar más animaciones si es necesario
    }
  }
};

window.addEventListener('scroll', animateNumbers, { passive: true });

// Efecto parallax suave
window.addEventListener('scroll', () => {
  const scrolled = window.pageYOffset;
  const parallaxElements = document.querySelectorAll('.hero::before, .hero::after');
  
  // Efecto visual sutil
  document.body.style.backgroundPosition = `0 ${scrolled * 0.5}px`;
}, { passive: true });

// Agregar clase activa al nav link basado en scroll
const updateActiveNavLink = () => {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  
  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    if (scrollY >= sectionTop - 200) {
      current = section.getAttribute('id');
    }
  });
  
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href').slice(1) === current) {
      link.classList.add('active');
    }
  });
};

window.addEventListener('scroll', updateActiveNavLink, { passive: true });

// Event delegation para manejar clicks en portfolio items
document.addEventListener('click', (e) => {
  if (e.target.closest('.portfolio-item')) {
    const portfolioItem = e.target.closest('.portfolio-item');
    portfolioItem.style.transform = 'scale(0.95)';
    setTimeout(() => {
      portfolioItem.style.transform = 'scale(1)';
    }, 200);
  }
});

// Efecto de fade-in al cargar la página
window.addEventListener('load', () => {
  document.body.style.opacity = '1';
});

// Prevenir comportamiento por defecto del scroll en mobile
if (window.innerWidth < 768) {
  // Mobile optimizations
  document.addEventListener('touchmove', function(e) {
    // Permitir scroll normal
  }, { passive: true });
}

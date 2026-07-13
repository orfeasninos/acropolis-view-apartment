/* ==========================================================================
   Acropolis View Monastiraki — Vanilla JS
   Handles: sticky header state, mobile nav, gallery lightbox, contact form
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  /* ---------------------------------------------------------------------
     1. Sticky header shadow on scroll
     --------------------------------------------------------------------- */
  const header = document.getElementById('site-header');

  const toggleHeaderShadow = () => {
    header.classList.toggle('scrolled', window.scrollY > 12);
  };
  toggleHeaderShadow();
  window.addEventListener('scroll', toggleHeaderShadow, { passive: true });

  /* ---------------------------------------------------------------------
     2. Mobile hamburger menu
     --------------------------------------------------------------------- */
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');

  const closeMenu = () => {
    navToggle.classList.remove('active');
    navMenu.classList.remove('active');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  const toggleMenu = () => {
    const isActive = navMenu.classList.toggle('active');
    navToggle.classList.toggle('active', isActive);
    navToggle.setAttribute('aria-expanded', String(isActive));
    document.body.style.overflow = isActive ? 'hidden' : '';
  };

  navToggle.addEventListener('click', toggleMenu);

  // Close the mobile menu whenever a nav link is tapped
  navMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  /* ---------------------------------------------------------------------
     3. Gallery lightbox
     --------------------------------------------------------------------- */
  const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const closeBtn = document.getElementById('lightbox-close');
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');

  // Build a lookup of { src, alt } for every gallery image up front
  const slides = galleryItems.map((item) => {
    const img = item.querySelector('img');
    return { src: img.src, alt: img.alt };
  });

  let currentIndex = 0;

  const showSlide = (index) => {
    currentIndex = (index + slides.length) % slides.length; // wrap around
    const slide = slides[currentIndex];
    lightboxImg.src = slide.src;
    lightboxImg.alt = slide.alt;
    lightboxCaption.textContent = slide.alt;
  };

  const openLightbox = (index) => {
    showSlide(index);
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => openLightbox(index));
  });

  closeBtn.addEventListener('click', closeLightbox);
  prevBtn.addEventListener('click', () => showSlide(currentIndex - 1));
  nextBtn.addEventListener('click', () => showSlide(currentIndex + 1));

  // Click outside the image (on the dark backdrop) closes the modal
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  // Keyboard support: Escape closes, arrow keys navigate
  document.addEventListener('keydown', (event) => {
    if (!lightbox.classList.contains('active')) return;

    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowRight') showSlide(currentIndex + 1);
    if (event.key === 'ArrowLeft') showSlide(currentIndex - 1);
  });

  /* ---------------------------------------------------------------------
     4. Contact / inquiry form
     --------------------------------------------------------------------- */
  const contactForm = document.getElementById('contact-form');
  const formNote = document.getElementById('form-note');
  const checkInInput = document.getElementById('check-in');
  const checkOutInput = document.getElementById('check-out');

  // Prevent selecting a check-in/check-out date in the past
  const today = new Date().toISOString().split('T')[0];
  checkInInput.setAttribute('min', today);
  checkOutInput.setAttribute('min', today);

  // Keep check-out from being earlier than the chosen check-in date
  checkInInput.addEventListener('change', () => {
    checkOutInput.setAttribute('min', checkInInput.value);
  });

  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      return;
    }

    formNote.textContent = 'Thank you! Your inquiry has been sent — we’ll be in touch shortly.';
    contactForm.reset();
    checkInInput.setAttribute('min', today);
    checkOutInput.setAttribute('min', today);
  });
});

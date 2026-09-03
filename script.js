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
     4. Amenities modal
     --------------------------------------------------------------------- */
  const amenitiesToggle = document.getElementById('amenities-toggle');
  const amenitiesModal = document.getElementById('amenities-modal');
  const amenitiesClose = document.getElementById('amenities-modal-close');

  const openAmenitiesModal = () => {
    amenitiesModal.classList.add('active');
    amenitiesModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeAmenitiesModal = () => {
    amenitiesModal.classList.remove('active');
    amenitiesModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  amenitiesToggle.addEventListener('click', openAmenitiesModal);
  amenitiesClose.addEventListener('click', closeAmenitiesModal);

  // Click outside the panel (on the dark backdrop) closes the modal
  amenitiesModal.addEventListener('click', (event) => {
    if (event.target === amenitiesModal) closeAmenitiesModal();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && amenitiesModal.classList.contains('active')) {
      closeAmenitiesModal();
    }
  });
/* ---------------------------------------------------------------------
   Airbnb / Accommodation Inquiry Form Handler
   --------------------------------------------------------------------- */
window.addEventListener("DOMContentLoaded", function () {
  const contactForm = document.getElementById('contact-form');
  if (!contactForm) return;

  const formNote = document.getElementById('form-note');
  const submitBtn = contactForm.querySelector('.form-submit');
  const checkInInput = document.getElementById('check-in');
  const checkOutInput = document.getElementById('check-out');

  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx8L2PWCMkKdlN-WMXLPQyA7IStkBRrSM-JpiP5ZqMubGtIcD8bVm0A7x_7yQZnZTDK/exec';

  const isGreek = (document.documentElement.lang || '').toLowerCase().startsWith('el');
  const messages = isGreek
    ? {
        success: 'Ευχαριστούμε! Το αίτημά σας εστάλη με επιτυχία.',
        error: 'Κάτι πήγε στραβά. Παρακαλούμε δοκιμάστε ξανά ή επικοινωνήστε απευθείας.',
        rateLimited: 'Παρακαλούμε περιμένετε λίγα δευτερόλεπτα πριν στείλετε ξανά.',
        pastDate: 'Η ημερομηνία άφιξης δεν μπορεί να είναι στο παρελθόν.',
        badRange: 'Η ημερομηνία αναχώρησης πρέπει να είναι μετά την άφιξη.',
        sending: 'Αποστολή...'
      }
    : {
        success: 'Thank you! Your inquiry has been sent successfully.',
        error: 'Something went wrong. Please try again or contact us directly.',
        rateLimited: 'Please wait a few seconds before trying again.',
        pastDate: 'Check-in date cannot be in the past.',
        badRange: 'Check-out date must be after check-in.',
        sending: 'Sending...'
      };

  const todayStr = () => new Date().toISOString().split('T')[0];

  const addOneDay = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const today = todayStr();
  if (checkInInput) checkInInput.setAttribute('min', today);
  if (checkOutInput) checkOutInput.setAttribute('min', today);

  if (checkInInput && checkOutInput) {
    checkInInput.addEventListener('change', () => {
      if (!checkInInput.value) return;
      const minCheckOut = addOneDay(checkInInput.value);
      checkOutInput.setAttribute('min', minCheckOut);

      if (checkOutInput.value && checkOutInput.value < minCheckOut) {
        checkOutInput.value = '';
      }
    });
  }

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (submitBtn.disabled) return;

    if (formNote) {
      formNote.textContent = '';
      formNote.style.color = '';
    }

    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      return;
    }

    const checkInVal = checkInInput ? checkInInput.value : '';
    const checkOutVal = checkOutInput ? checkOutInput.value : '';
    const todayVal = todayStr();

    if (checkInVal && checkInVal < todayVal) {
      if (formNote) {
        formNote.style.color = '#c62828';
        formNote.textContent = messages.pastDate;
      }
      return;
    }

    if (checkInVal && checkOutVal && checkOutVal <= checkInVal) {
      if (formNote) {
        formNote.style.color = '#c62828';
        formNote.textContent = messages.badRange;
      }
      return;
    }

    // Fingerprint / User ID setup
    let userId = localStorage.getItem('ac_user_id');
    if (!userId) {
      userId = 'usr_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('ac_user_id', userId);
    }

    const originalBtnText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = messages.sending;

    // Honeypot check (Client-side fast fail for bots)
    const hpField = contactForm.querySelector('input[name="website_hp"]');
    if (hpField && hpField.value.trim() !== '') {
      if (formNote) {
        formNote.style.color = '#2e7d32';
        formNote.textContent = messages.success;
      }
      contactForm.reset();
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
      return;
    }

    const formData = new FormData(contactForm);
    formData.append('user_id', userId);
    formData.append('ts', Date.now());

    const searchParams = new URLSearchParams(formData);

    try {
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: searchParams.toString(),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const resData = await response.json();

      if (resData.result === 'success') {
        if (formNote) {
          formNote.style.color = '#2e7d32';
          formNote.textContent = messages.success;
        }
        contactForm.reset();
        if (checkInInput) checkInInput.setAttribute('min', today);
        if (checkOutInput) checkOutInput.setAttribute('min', today);
      } else if (resData.reason === 'rate_limited') {
        if (formNote) {
          formNote.style.color = '#c62828';
          formNote.textContent = messages.rateLimited;
        }
      } else {
        throw new Error(resData.reason || resData.error || 'Unknown server response');
      }
    } catch (err) {
      console.error('Submission error:', err);
      if (formNote) {
        formNote.style.color = '#c62828';
        formNote.textContent = messages.error;
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    }
  });
});
});
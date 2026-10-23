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

  // Escape closes the mobile menu
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && navMenu.classList.contains('active')) {
      closeMenu();
      navToggle.focus();
    }
  });

  // If the screen grows past the mobile breakpoint (e.g. a tablet is rotated)
  // while the menu is open, close it so the page doesn't stay scroll-locked
  const desktopNav = window.matchMedia('(min-width: 1181px)');
  desktopNav.addEventListener('change', (event) => {
    if (event.matches && navMenu.classList.contains('active')) closeMenu();
  });

  /* ---------------------------------------------------------------------
     Modal focus helpers: move focus into a modal, keep Tab inside it,
     and return focus to whatever opened it once it closes
     --------------------------------------------------------------------- */
  const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

  const trapFocus = (modal, event) => {
    if (event.key !== 'Tab') return;
    const focusable = Array.from(modal.querySelectorAll(FOCUSABLE))
      .filter((el) => !el.disabled && el.getClientRects().length > 0);
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

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
  let lightboxOpener = null;

  const showSlide = (index) => {
    currentIndex = (index + slides.length) % slides.length; // wrap around
    const slide = slides[currentIndex];
    lightboxImg.src = slide.src;
    lightboxImg.alt = slide.alt;
    lightboxCaption.textContent = slide.alt;
  };

  const openLightbox = (index) => {
    lightboxOpener = document.activeElement;
    showSlide(index);
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  };

  const closeLightbox = () => {
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lightboxOpener) lightboxOpener.focus();
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

  // Keyboard support: Escape closes, arrow keys navigate, Tab stays inside
  document.addEventListener('keydown', (event) => {
    if (!lightbox.classList.contains('active')) return;

    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowRight') showSlide(currentIndex + 1);
    if (event.key === 'ArrowLeft') showSlide(currentIndex - 1);
    trapFocus(lightbox, event);
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
    amenitiesClose.focus();
  };

  const closeAmenitiesModal = () => {
    amenitiesModal.classList.remove('active');
    amenitiesModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    amenitiesToggle.focus();
  };

  amenitiesToggle.addEventListener('click', openAmenitiesModal);
  amenitiesClose.addEventListener('click', closeAmenitiesModal);

  // Click outside the panel (on the dark backdrop) closes the modal
  amenitiesModal.addEventListener('click', (event) => {
    if (event.target === amenitiesModal) closeAmenitiesModal();
  });

  document.addEventListener('keydown', (event) => {
    if (!amenitiesModal.classList.contains('active')) return;

    if (event.key === 'Escape') closeAmenitiesModal();
    trapFocus(amenitiesModal, event);
  });

  /* ---------------------------------------------------------------------
     5. Accommodation inquiry form
     --------------------------------------------------------------------- */
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
        badRange: 'Η ελάχιστη διαμονή είναι 2 νύχτες. Επιλέξτε αναχώρηση τουλάχιστον 2 ημέρες μετά την άφιξη.',
        invalidEmail: 'Παρακαλούμε ελέγξτε τη διεύθυνση e-mail σας.',
        busy: 'Ο διακομιστής είναι απασχολημένος. Δοκιμάστε ξανά σε λίγο.',
        sending: 'Αποστολή...'
      }
    : {
        success: 'Thank you! Your inquiry has been sent successfully.',
        error: 'Something went wrong. Please try again or contact us directly.',
        rateLimited: 'Please wait a few seconds before trying again.',
        pastDate: 'Check-in date cannot be in the past.',
        badRange: 'The minimum stay is 2 nights. Please choose a check-out date at least 2 days after check-in.',
        invalidEmail: 'Please check your email address.',
        busy: 'The server is busy. Please try again in a moment.',
        sending: 'Sending...'
      };

  // Format a Date as YYYY-MM-DD in the visitor's local time zone
  // (toISOString() would convert to UTC and can shift the day)
  const toDateStr = (d) => {
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  const todayStr = () => toDateStr(new Date());

  const MIN_NIGHTS = 2;

  const addDays = (dateStr, days) => {
    const d = new Date(dateStr + 'T00:00:00');
    d.setDate(d.getDate() + days);
    return toDateStr(d);
  };

  // localStorage can throw in some privacy modes / in-app browsers
  const getUserId = () => {
    const fresh = 'usr_' + Math.random().toString(36).slice(2, 11);
    try {
      let userId = localStorage.getItem('ac_user_id');
      if (!userId) {
        userId = fresh;
        localStorage.setItem('ac_user_id', userId);
      }
      return userId;
    } catch (err) {
      return fresh;
    }
  };

  const resetDateLimits = () => {
    const today = todayStr();
    if (checkInInput) checkInInput.setAttribute('min', today);
    if (checkOutInput) checkOutInput.setAttribute('min', addDays(today, MIN_NIGHTS));
  };

  const showNote = (text, color) => {
    if (!formNote) return;
    formNote.style.color = color;
    formNote.textContent = text;
  };

  resetDateLimits();

  if (checkInInput && checkOutInput) {
    checkInInput.addEventListener('change', () => {
      if (!checkInInput.value) return;
      const minCheckOut = addDays(checkInInput.value, MIN_NIGHTS);
      checkOutInput.setAttribute('min', minCheckOut);

      if (checkOutInput.value && checkOutInput.value < minCheckOut) {
        checkOutInput.value = '';
      }
    });
  }

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (submitBtn.disabled) return;

    showNote('', '');

    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      return;
    }

    const checkInVal = checkInInput ? checkInInput.value : '';
    const checkOutVal = checkOutInput ? checkOutInput.value : '';

    if (checkInVal && checkInVal < todayStr()) {
      showNote(messages.pastDate, '#c62828');
      return;
    }

    if (checkInVal && checkOutVal && checkOutVal < addDays(checkInVal, MIN_NIGHTS)) {
      showNote(messages.badRange, '#c62828');
      return;
    }

    const originalBtnText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = messages.sending;

    // The honeypot (website_hp) is checked by the server only: browser autofill
    // can fill it for real guests, who must then see an error, never a fake success
    const formData = new FormData(contactForm);
    formData.append('user_id', getUserId());
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
        showNote(messages.success, '#2e7d32');
        contactForm.reset();
        resetDateLimits();
      } else if (resData.reason === 'rate_limited') {
        showNote(messages.rateLimited, '#c62828');
      } else if (resData.reason === 'invalid_email') {
        showNote(messages.invalidEmail, '#c62828');
      } else if (resData.reason === 'invalid_dates') {
        showNote(messages.badRange, '#c62828');
      } else if (resData.reason === 'server_busy') {
        showNote(messages.busy, '#c62828');
      } else {
        throw new Error(resData.reason || resData.error || 'Unknown server response');
      }
    } catch (err) {
      console.error('Submission error:', err);
      showNote(messages.error, '#c62828');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    }
  });
});

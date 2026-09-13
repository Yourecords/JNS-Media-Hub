/**
 * JNS MEDIA HUB — Interactive Engine
 * Handling Navigation, Format Sync, Live Estimator, Gallery Lightbox, Video Modals, and Booking Form
 */

function initAll() {
  initNavigation();
  initFormatSync();
  initProductsCarousel();
  initEstimator();
  initGallery();
  initVideoModal();
  initBookingForm();
  initTeamModal();
  initScrollAnimations();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAll);
} else {
  initAll();
}


/* ==========================================================================
   1. Navigation & Header Scroll State
   ========================================================================== */
function initNavigation() {
  const header = document.querySelector('.site-header');
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  // Sticky header background transition
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Mobile menu toggle
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      const isOpen = navMenu.classList.contains('open');
      mobileToggle.setAttribute('aria-expanded', isOpen);
      mobileToggle.innerHTML = isOpen
        ? `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>`
        : `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>`;
    });

    // Close menu when clicking nav links
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        mobileToggle.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>`;
      });
    });
  }
}

/* ==========================================================================
   2. Format Sync (One-click "Book this Setup" into Booking Form)
   ========================================================================== */
function initFormatSync() {
  const ctaButtons = document.querySelectorAll('[data-select-format]');
  const formatSelect = document.getElementById('projectFormat');
  const contactSection = document.getElementById('contact');

  ctaButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetFormat = btn.getAttribute('data-select-format');
      if (formatSelect && targetFormat) {
        formatSelect.value = targetFormat;
        
        // Add subtle flash animation to the format dropdown to confirm selection
        formatSelect.style.borderColor = 'var(--gold-primary)';
        formatSelect.style.boxShadow = '0 0 15px rgba(229, 184, 66, 0.4)';
        setTimeout(() => {
          formatSelect.style.borderColor = '';
          formatSelect.style.boxShadow = '';
        }, 1800);
      }

      // Smoothly scroll to contact form
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

/* ==========================================================================
   2b. Production Formats Mobile Carousel
   ========================================================================== */
function initProductsCarousel() {
  const grid = document.getElementById('productsGrid');
  const prevBtn = document.getElementById('formatPrevBtn');
  const nextBtn = document.getElementById('formatNextBtn');
  const dots = document.querySelectorAll('#formatCarouselDots .carousel-dot');

  if (!grid || !dots.length) return;

  const cards = grid.querySelectorAll('.product-card');

  // Smoothly scroll the targeted card into the center of the grid viewport
  const scrollToCard = (index) => {
    if (!cards[index]) return;
    const card = cards[index];
    const gridRect = grid.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const currentScroll = grid.scrollLeft;
    const offset = (cardRect.left - gridRect.left) + currentScroll - (grid.clientWidth - card.clientWidth) / 2;
    grid.scrollTo({
      left: Math.max(0, offset),
      behavior: 'smooth'
    });
  };

  // Update active dot indicator and button disabled states based on scroll position
  const updateActiveDot = () => {
    const scrollLeft = grid.scrollLeft;
    const gridWidth = grid.offsetWidth;
    let closestIndex = 0;
    let minDistance = Infinity;

    cards.forEach((card, index) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2 - grid.offsetLeft;
      const viewCenter = scrollLeft + gridWidth / 2;
      const distance = Math.abs(cardCenter - viewCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === closestIndex);
    });

    if (prevBtn) {
      const isFirst = closestIndex === 0;
      prevBtn.classList.toggle('disabled', isFirst);
      prevBtn.setAttribute('aria-disabled', isFirst ? 'true' : 'false');
    }

    if (nextBtn) {
      const isLast = closestIndex === cards.length - 1;
      nextBtn.classList.toggle('disabled', isLast);
      nextBtn.setAttribute('aria-disabled', isLast ? 'true' : 'false');
    }
  };

  // Debounced scroll listener using requestAnimationFrame
  let ticking = false;
  grid.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateActiveDot();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // Dot navigation click handlers
  dots.forEach((dot, index) => {
    dot.addEventListener('click', (e) => {
      e.preventDefault();
      scrollToCard(index);
    });
  });

  // Prev / Next arrow buttons on the sides
  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const activeDot = document.querySelector('#formatCarouselDots .carousel-dot.active');
      const currentIndex = activeDot ? parseInt(activeDot.getAttribute('data-index'), 10) : 0;
      if (currentIndex > 0) {
        scrollToCard(currentIndex - 1);
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const activeDot = document.querySelector('#formatCarouselDots .carousel-dot.active');
      const currentIndex = activeDot ? parseInt(activeDot.getAttribute('data-index'), 10) : 0;
      if (currentIndex < cards.length - 1) {
        scrollToCard(currentIndex + 1);
      }
    });
  }

  // Initialize button and dot states
  updateActiveDot();
}

/* ==========================================================================
   3. Interactive Pricing Estimator
   ========================================================================== */
function initEstimator() {
  const formatButtons = document.querySelectorAll('.calc-format-btn');
  const hoursSlider = document.getElementById('calcHours');
  const hoursDisplay = document.getElementById('calcHoursVal');
  const episodesSlider = document.getElementById('calcEpisodes');
  const episodesDisplay = document.getElementById('calcEpisodesVal');
  
  const addLiveCheck = document.getElementById('calcAddLive');
  const addEditCheck = document.getElementById('calcAddEdit');
  const addPrompterCheck = document.getElementById('calcAddPrompter');
  const addRemoteCheck = document.getElementById('calcAddRemote');
  const addFridayCheck = document.getElementById('calcAddFriday');

  // Summary Elements
  const summaryFormat = document.getElementById('summaryFormatName');
  const summaryBaseRate = document.getElementById('summaryBaseRate');
  const summarySubtotal = document.getElementById('summarySubtotal');
  const summaryDiscountRow = document.getElementById('summaryDiscountRow');
  const summaryDiscountRate = document.getElementById('summaryDiscountRate');
  const summaryDiscountAmount = document.getElementById('summaryDiscountAmount');
  const summaryTotal = document.getElementById('summaryTotal');
  const transferEstimateBtn = document.getElementById('transferEstimateBtn');

  // Format base hourly rates
  const baseRates = {
    'solo': { name: 'Solo / Monologue', rate: 280 },
    'interview': { name: 'Interview Setup', rate: 350 },
    'panel': { name: 'Panel / TV Show', rate: 450 }
  };

  let currentFormatKey = 'interview';

  const updateSliderTrackFill = (slider) => {
    if (!slider) return;
    const min = parseFloat(slider.min) || 0;
    const max = parseFloat(slider.max) || 100;
    const val = parseFloat(slider.value);
    const percentage = ((val - min) / (max - min)) * 100;
    slider.style.background = `linear-gradient(to right, #e5b842 0%, #e5b842 ${percentage}%, #1f2738 ${percentage}%, #1f2738 100%)`;
  };

  function updateCalculator() {
    if (!hoursSlider || !episodesSlider) return;

    const hours = parseInt(hoursSlider.value, 10);
    const episodes = parseInt(episodesSlider.value, 10);

    if (hoursDisplay) hoursDisplay.textContent = `${hours} hr${hours > 1 ? 's' : ''}/ep`;
    if (episodesDisplay) episodesDisplay.textContent = `${episodes} episode${episodes > 1 ? 's' : ''}`;

    updateSliderTrackFill(hoursSlider);
    updateSliderTrackFill(episodesSlider);

    const activeFormat = baseRates[currentFormatKey];
    let hourlyBase = activeFormat.rate;

    // Hourly Add-ons (Studio hourly services)
    let hourlyAddons = 0;
    if (addLiveCheck && addLiveCheck.checked) hourlyAddons += 150; // Live switching +$150/hr
    if (addPrompterCheck && addPrompterCheck.checked) hourlyAddons += 80; // Teleprompter operator +$80/hr
    if (addEditCheck && addEditCheck.checked) hourlyAddons += 100; // Professional video editing +$100/hr

    const totalHourlyRate = hourlyBase + hourlyAddons;

    // Per-episode cost
    let episodeBaseCost = totalHourlyRate * hours;

    // Flat per-session / per-episode Add-ons
    if (addRemoteCheck && addRemoteCheck.checked) {
      episodeBaseCost += 80; // Remote guest integration $80/session
    }

    // Friday surcharge (+50% on studio hours)
    if (addFridayCheck && addFridayCheck.checked) {
      episodeBaseCost += (totalHourlyRate * hours) * 0.50;
    }

    const rawSubtotal = episodeBaseCost * episodes;

    // Series Discounts
    let discountPercent = 0;
    if (episodes >= 20) {
      discountPercent = 0.20; // 20+ episodes: Individual / custom pricing tier
    } else if (episodes >= 10) {
      discountPercent = 0.15; // 10-19 episodes: 15% discount
    } else if (episodes >= 5) {
      discountPercent = 0.10; // 5-9 episodes: 10% discount
    }

    const discountAmount = rawSubtotal * discountPercent;
    const finalTotal = rawSubtotal - discountAmount;

    // Update Summary UI
    if (summaryFormat) summaryFormat.textContent = activeFormat.name;
    if (summaryBaseRate) summaryBaseRate.textContent = `$${activeFormat.rate}/hr`;
    if (summarySubtotal) summarySubtotal.textContent = `$${Math.round(rawSubtotal).toLocaleString()}`;

    if (discountPercent > 0) {
      if (summaryDiscountRow) summaryDiscountRow.style.display = 'flex';
      if (summaryDiscountRate) {
        summaryDiscountRate.textContent = episodes >= 20 ? '20+ Volume Package' : `${Math.round(discountPercent * 100)}% Volume Discount`;
      }
      if (summaryDiscountAmount) summaryDiscountAmount.textContent = `-$${Math.round(discountAmount).toLocaleString()}`;
    } else {
      if (summaryDiscountRow) summaryDiscountRow.style.display = 'none';
    }

    if (summaryTotal) {
      summaryTotal.textContent = `$${Math.round(finalTotal).toLocaleString()}`;
    }

    // Style checkbox containers
    [addLiveCheck, addEditCheck, addPrompterCheck, addRemoteCheck, addFridayCheck].forEach(chk => {
      if (chk) {
        const container = chk.closest('.calc-addon-check');
        if (container) {
          if (chk.checked) {
            container.classList.add('checked');
          } else {
            container.classList.remove('checked');
          }
        }
      }
    });
  }

  let lastGeneratedPhrase = '';

  function buildHumanEstimatePhrase() {
    const setupDisplayNames = {
      'solo': 'Solo / Monologue setup',
      'interview': 'Interview setup',
      'panel': 'Panel / TV Show setup'
    };
    const setupName = setupDisplayNames[currentFormatKey] || `${baseRates[currentFormatKey]?.name || 'Studio'} setup`;

    const hours = hoursSlider ? parseInt(hoursSlider.value, 10) : 1;
    const eps = episodesSlider ? parseInt(episodesSlider.value, 10) : 1;

    const epsText = eps === 1 ? '1 episode' : `${eps} episodes`;
    const hoursText = hours === 1 ? '1 hr per episode' : `${hours} hrs per episode`;

    const addons = [];
    if (addLiveCheck && addLiveCheck.checked) addons.push('Live Switching');
    if (addPrompterCheck && addPrompterCheck.checked) addons.push('Teleprompter Operator');
    if (addRemoteCheck && addRemoteCheck.checked) addons.push('Remote Guest Integration');
    if (addEditCheck && addEditCheck.checked) addons.push('Professional Video Editing');
    if (addFridayCheck && addFridayCheck.checked) addons.push('Friday Production Session');

    let phrase = `I would like to book the ${setupName}, for ${epsText}, ${hoursText}`;

    if (addons.length > 0) {
      let addonsText = '';
      if (addons.length === 1) {
        addonsText = addons[0];
      } else if (addons.length === 2) {
        addonsText = `${addons[0]} and ${addons[1]}`;
      } else {
        addonsText = `${addons.slice(0, -1).join(', ')} and ${addons[addons.length - 1]}`;
      }
      phrase += ` and I would like to add ${addonsText}.`;
    } else {
      phrase += '.';
    }

    return { phrase, hasAddons: addons.length > 0 };
  }

  function syncEstimateToBookingForm(force = false) {
    const formatSelect = document.getElementById('projectFormat');
    const episodesSelect = document.getElementById('projectEpisodes');
    const projectDetails = document.getElementById('projectMessage');

    const formatNamesMap = {
      'solo': 'Solo Podcast / Monologue',
      'interview': 'Interview',
      'panel': 'Panel / TV Show'
    };

    if (formatSelect && formatNamesMap[currentFormatKey]) {
      formatSelect.value = formatNamesMap[currentFormatKey];
    }

    if (episodesSelect && episodesSlider) {
      const eps = parseInt(episodesSlider.value, 10);
      if (eps === 1) episodesSelect.value = 'One';
      else if (eps <= 4) episodesSelect.value = '2–4';
      else if (eps <= 9) episodesSelect.value = '5–9';
      else if (eps <= 19) episodesSelect.value = '10–19';
      else episodesSelect.value = '20+';
    }

    if (!projectDetails) return;

    const { phrase, hasAddons } = buildHumanEstimatePhrase();

    // If no add-ons are checked and force is false (not explicit lock-in CTA)
    if (!hasAddons && !force) {
      if (lastGeneratedPhrase && projectDetails.value.includes(lastGeneratedPhrase)) {
        projectDetails.value = projectDetails.value.replace(lastGeneratedPhrase, '').replace(/^\s+/, '');
        lastGeneratedPhrase = '';
      }
      return;
    }

    let currentVal = projectDetails.value;

    // Clean out legacy bracketed estimate notes if present
    if (currentVal.includes('[Calculator Estimate:')) {
      currentVal = currentVal.replace(/\[Calculator Estimate:[^\]]*\]\n*/g, '').trim();
    }

    if (lastGeneratedPhrase && currentVal.includes(lastGeneratedPhrase)) {
      currentVal = currentVal.replace(lastGeneratedPhrase, phrase);
    } else if (/^I would like to book the [^.\n]+?\./.test(currentVal)) {
      currentVal = currentVal.replace(/^I would like to book the [^.\n]+?\./, phrase);
    } else if (!currentVal.trim()) {
      currentVal = phrase;
    } else {
      currentVal = `${phrase}\n\n${currentVal.trim()}`;
    }

    projectDetails.value = currentVal;
    lastGeneratedPhrase = phrase;
  }

  // Format button listeners
  formatButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      formatButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFormatKey = btn.getAttribute('data-format');
      updateCalculator();
      if (lastGeneratedPhrase) {
        syncEstimateToBookingForm(false);
      }
    });
  });

  // Sliders input listeners
  [hoursSlider, episodesSlider].forEach(el => {
    if (el) {
      const handleSliderChange = () => {
        updateCalculator();
        if (lastGeneratedPhrase) {
          syncEstimateToBookingForm(false);
        }
      };
      el.addEventListener('input', handleSliderChange);
      el.addEventListener('change', handleSliderChange);
    }
  });

  // Add-on checkboxes input listeners (Section 4: Optional Add-ons & Scheduling)
  [addLiveCheck, addEditCheck, addPrompterCheck, addRemoteCheck, addFridayCheck].forEach(el => {
    if (el) {
      const handleAddonChange = () => {
        updateCalculator();
        syncEstimateToBookingForm(false);
      };
      el.addEventListener('input', handleAddonChange);
      el.addEventListener('change', handleAddonChange);
    }
  });

  // Transfer Estimate to Booking Form
  if (transferEstimateBtn) {
    transferEstimateBtn.addEventListener('click', () => {
      syncEstimateToBookingForm(true);

      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // Initial calculation
  updateCalculator();
}

/* ==========================================================================
   4. Studio Editorial Gallery & Photo Galleries Engine
   ========================================================================== */
const studioGalleries = {
  configurations: {
    name: "Set Configurations",
    tag: "SET CONFIGURATIONS",
    photos: [
      {
        src: "assets/images/set_config_1.png",
        alt: "Solo Host Broadcast Setup at JNS Media Hub",
        title: "Solo Host Broadcast Setup",
        desc: "Curved broadcast desk framing, dynamic studio lighting, professional Shure SM7B microphone, and branded newsroom elements."
      },
      {
        src: "assets/images/set_config_2.png",
        alt: "Teleprompter & Script Optics at JNS Media Hub",
        title: "Teleprompter & Script Optics",
        desc: "Through-the-lens high-contrast 17\" glass teleprompter system positioned before the presenter with acoustic wood slats backdrop."
      },
      {
        src: "assets/images/set_config_3.png",
        alt: "Interview & Guest Setup at JNS Media Hub",
        title: "Interview & Guest Setup",
        desc: "Dynamic digital graphic wall configuration with studio blue illumination, sharp key lighting, and multi-mic recording."
      },
      {
        src: "assets/images/set_config_4.png",
        alt: "Feature Discussion & Panel Look at JNS Media Hub",
        title: "Feature Discussion & Panel Look",
        desc: "Customizable RGB backdrop illumination with vibrant high-definition digital display and calibrated studio acoustics."
      },
      {
        src: "assets/images/set_config_5.png",
        alt: "Anchor Close-Up Configuration at JNS Media Hub",
        title: "Anchor Close-Up Configuration",
        desc: "Cinema prime lens optical framing with custom JNS microphone flag, clean audio capture, and soft studio bokeh."
      }
    ]
  },
  control: {
    name: "Control Room",
    tag: "CONTROL ROOM",
    photos: [
      {
        src: "assets/images/control_room_1.png",
        alt: "Multi-Camera Live Switching Suite at JNS Media Hub",
        title: "Multi-Camera Live Switching Suite",
        desc: "Broadcast director monitoring live panel show cameras, multi-view feeds, and real-time graphics automation."
      },
      {
        src: "assets/images/control_room_2.png",
        alt: "Program Master Control & Teleprompter Feed at JNS Media Hub",
        title: "Program Master Control & Teleprompter Feed",
        desc: "Synchronized dual-multiview display suite with live prompter feed, return monitor, and audio level monitoring."
      },
      {
        src: "assets/images/control_room_3.jpg",
        alt: "Director's Observation Suite & Audio Console at JNS Media Hub",
        title: "Director's Observation Suite & Audio Console",
        desc: "Panoramic view of the production gallery featuring studio window line-of-sight, Yamaha audio mixing, and live switching decks."
      },
      {
        src: "assets/images/control_room_4.jpg",
        alt: "Broadcast Multiviewer & Segment Clock at JNS Media Hub",
        title: "Broadcast Multiviewer & Segment Clock",
        desc: "High-resolution wall monitor displaying Preview, Program, 3-camera tallies, segment timer, and scrolling prompter copy."
      },
      {
        src: "assets/images/control_room_5.jpg",
        alt: "Live Switching & Audio Engineering at JNS Media Hub",
        title: "Live Switching & Audio Engineering",
        desc: "Hands-on switching with dedicated hardware broadcast control surface, vMix engine, and precision studio talkback."
      }
    ]
  },
  gear: {
    name: "Cameras & Optics",
    tag: "CAMERAS & OPTICS",
    photos: [
      {
        src: "assets/images/real_blackmagic_6k_prompter.png",
        alt: "Blackmagic Studio Camera 6K Pro with teleprompter",
        title: "Blackmagic Studio 6K Pro & Prompter",
        desc: "Super 35 6K sensor, cinema optics, illuminated on-air tally lamp, and 17-inch through-the-glass prompter."
      },
      {
        src: "assets/images/real_camera_slider_stage.png",
        alt: "Camera Pedestal and Slider System at JNS Media Hub",
        title: "Pedestals & Motorized Tracking",
        desc: "Heavy-duty studio tripod pedestals and precision slider system for smooth on-air camera movements."
      },
      {
        src: "assets/images/real_cinema_optics_monitoring.jpg",
        alt: "Blackmagic Studio Camera with cinema lens and monitoring at JNS Media Hub",
        title: "Cinema Optics & Monitoring",
        desc: "Ultra-sharp cinema primes, continuous zoom lenses, and calibrated 7-inch high-bright HDR field monitors."
      },
      {
        src: "assets/images/camera.jpg",
        alt: "Multi-Angle Studio Rigging at JNS Media Hub",
        title: "Multi-Camera Sync Rigging",
        desc: "Three genlocked camera positions calibrated for instantaneous live switching and cinematic color science."
      }
    ]
  }
};

function initGallery() {
  const tabs = document.querySelectorAll('.gallery-tab');
  const items = document.querySelectorAll('.gallery-item');
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImage = document.getElementById('lightboxImage');
  const lightboxClose = document.getElementById('lightboxClose');
  const categoryBadge = document.getElementById('galleryCategoryBadge');
  const counter = document.getElementById('galleryCounter');
  const photoTitle = document.getElementById('galleryPhotoTitle');
  const photoDesc = document.getElementById('galleryPhotoDesc');
  const thumbsTrack = document.getElementById('galleryThumbsTrack');
  const prevBtn = document.getElementById('galleryPrevBtn');
  const nextBtn = document.getElementById('galleryNextBtn');
  const switcherBtns = document.querySelectorAll('[data-switch-cat]');
  const galleryStage = document.getElementById('galleryStage');

  let activeCategory = 'configurations';
  let activeIndex = 0;

  // Render thumbnail buttons for the currently active category
  function renderThumbnails() {
    if (!thumbsTrack) return;
    thumbsTrack.innerHTML = '';
    const currentList = studioGalleries[activeCategory]?.photos || [];

    currentList.forEach((photo, idx) => {
      const thumbBtn = document.createElement('button');
      thumbBtn.type = 'button';
      thumbBtn.className = `gallery-thumb ${idx === activeIndex ? 'active' : ''}`;
      thumbBtn.setAttribute('aria-label', `View ${photo.title}`);
      
      const thumbImg = document.createElement('img');
      thumbImg.src = photo.src;
      thumbImg.alt = photo.title;
      thumbImg.loading = 'lazy';
      
      thumbBtn.appendChild(thumbImg);
      thumbBtn.addEventListener('click', () => {
        showSlide(idx);
      });

      thumbsTrack.appendChild(thumbBtn);
    });
  }

  // Display a specific slide within active category
  function showSlide(index) {
    const currentList = studioGalleries[activeCategory]?.photos || [];
    if (!currentList.length) return;

    // Wrap around gracefully
    if (index < 0) {
      index = currentList.length - 1;
    } else if (index >= currentList.length) {
      index = 0;
    }

    activeIndex = index;
    const photo = currentList[activeIndex];

    if (lightboxImage) {
      lightboxImage.style.opacity = '0.3';
      lightboxImage.src = photo.src;
      lightboxImage.alt = photo.alt;
      setTimeout(() => {
        lightboxImage.style.opacity = '1';
      }, 50);
    }

    if (categoryBadge) {
      categoryBadge.textContent = studioGalleries[activeCategory].tag;
    }

    if (counter) {
      counter.textContent = `Photo ${activeIndex + 1} of ${currentList.length}`;
    }

    if (photoTitle) {
      photoTitle.textContent = photo.title;
    }

    if (photoDesc) {
      photoDesc.textContent = photo.desc;
    }

    // Update in-modal switcher tabs
    switcherBtns.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-switch-cat') === activeCategory);
    });

    // Update thumbnail highlights
    if (thumbsTrack) {
      const thumbs = thumbsTrack.querySelectorAll('.gallery-thumb');
      thumbs.forEach((t, i) => {
        t.classList.toggle('active', i === activeIndex);
        if (i === activeIndex) {
          t.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      });
    }
  }

  // Open the photo gallery modal
  function openPhotoGallery(category, startIndex = 0) {
    if (!studioGalleries[category]) {
      category = 'configurations';
    }

    activeCategory = category;
    activeIndex = startIndex;

    renderThumbnails();
    showSlide(activeIndex);

    if (lightboxModal) {
      lightboxModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  // Close the photo gallery modal
  function closePhotoGallery() {
    if (lightboxModal) {
      lightboxModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  // Filter tabs on the page
  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      const filter = tab.getAttribute('data-filter');
      const targetGallery = tab.getAttribute('data-open-gallery');

      // Filter the grid items on page
      items.forEach(item => {
        const itemCategory = item.getAttribute('data-category');
        if (filter === 'all' || itemCategory === filter) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });

      // If user chose one of the 3 categories, open its photo gallery immediately
      if (targetGallery && studioGalleries[targetGallery]) {
        openPhotoGallery(targetGallery, 0);
      }
    });
  });

  // Clicking any picture card in the studio section opens its category gallery
  items.forEach(item => {
    item.addEventListener('click', () => {
      const category = item.getAttribute('data-category') || 'configurations';
      const photoIndex = parseInt(item.getAttribute('data-photo-index') || '0', 10);
      openPhotoGallery(category, photoIndex);
    });

    // Keyboard enter/space access on cards
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const category = item.getAttribute('data-category') || 'configurations';
        const photoIndex = parseInt(item.getAttribute('data-photo-index') || '0', 10);
        openPhotoGallery(category, photoIndex);
      }
    });
  });

  // In-modal category switcher buttons
  switcherBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const newCat = btn.getAttribute('data-switch-cat');
      if (newCat && studioGalleries[newCat] && newCat !== activeCategory) {
        activeCategory = newCat;
        activeIndex = 0;
        renderThumbnails();
        showSlide(0);

        // Also sync page tabs
        tabs.forEach(t => {
          t.classList.toggle('active', t.getAttribute('data-filter') === newCat);
        });
      }
    });
  });

  // Next / Previous buttons
  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showSlide(activeIndex - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showSlide(activeIndex + 1);
    });
  }

  // Close button and backdrop click
  if (lightboxClose && lightboxModal) {
    lightboxClose.addEventListener('click', closePhotoGallery);

    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) {
        closePhotoGallery();
      }
    });
  }

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (!lightboxModal || !lightboxModal.classList.contains('active')) return;

    if (e.key === 'Escape') {
      closePhotoGallery();
    } else if (e.key === 'ArrowLeft') {
      showSlide(activeIndex - 1);
    } else if (e.key === 'ArrowRight') {
      showSlide(activeIndex + 1);
    }
  });

  // Mobile touch swipe gestures on gallery stage
  if (galleryStage) {
    let touchStartX = 0;
    let touchEndX = 0;

    galleryStage.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    galleryStage.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const swipeDistance = touchEndX - touchStartX;
      if (Math.abs(swipeDistance) > 40) {
        if (swipeDistance < 0) {
          // Swiped left -> Next photo
          showSlide(activeIndex + 1);
        } else {
          // Swiped right -> Previous photo
          showSlide(activeIndex - 1);
        }
      }
    }, { passive: true });
  }
}

/* ==========================================================================
   5. Video Modal Showcase
   ========================================================================== */
function initVideoModal() {
  const showcaseTriggers = document.querySelectorAll('[data-showcase-video]');
  const videoModal = document.getElementById('videoModal');
  const videoClose = document.getElementById('videoModalClose');
  const modalVideoIframe = document.getElementById('modalVideoIframe');
  const modalVideoTitle = document.getElementById('modalVideoTitle');
  const modalVideoDesc = document.getElementById('modalVideoDesc');
  const modalVideoTag = document.getElementById('modalVideoTag');
  const modalBookSetupBtn = document.getElementById('modalBookSetup');

  const showcaseData = {
    'interview': {
      title: 'Two-Person In-Depth Interview Configuration',
      tag: 'Multi-Camera 6K · 2 Hosts/Guests',
      desc: 'Demonstration of our flagship interview configuration: two angled armchairs, calibrated soft key lights, Shure SM7B broadcast sound, and multi-camera live switching with smooth shallow depth-of-field background separation.',
      videoUrl: 'https://www.youtube-nocookie.com/embed/3kNGzwkRcyY?autoplay=1&rel=0',
      formatKey: 'Interview'
    },
    'panel': {
      title: 'Four-Person Broadcast Roundtable Panel',
      tag: '4-Camera ISO · LED Video Wall',
      desc: 'Watch the dynamic multi-camera coverage of our curved broadcast desk setup. Features independent microphone feeds for 4 participants, teleprompter integration, and master control room live switching.',
      videoUrl: 'https://www.youtube-nocookie.com/embed/j-VsG5bEsAw?start=124&autoplay=1&rel=0',
      formatKey: 'Panel / TV Show'
    },
    'solo': {
      title: 'Authoritative Commentary & Solo Thought Leadership',
      tag: 'Teleprompter · Glass Optics',
      desc: 'Engineered for maximum presenter confidence: high-definition on-axis teleprompter, broadcast microphone positioning, clean graphic branding overlay, and master color grading.',
      videoUrl: 'https://www.youtube-nocookie.com/embed/AhE_tk9ihMI?autoplay=1&rel=0',
      formatKey: 'Solo Podcast / Monologue'
    },
    'control': {
      title: 'Remote Guest Integration & Master Control Feeds',
      tag: 'vMix Broadcast · Multi-View Switching',
      desc: 'A look inside our master control room: professional vMix operator desks, Blackmagic ATEM production switcher, remote guest integration via high-bandwidth fiber, and multi-channel ISO recording.',
      videoUrl: 'https://www.youtube-nocookie.com/embed/ZAuTMy6PpwI?autoplay=1&rel=0',
      formatKey: 'Livestream'
    }
  };

  let currentModalFormat = '';

  function closeVideoModal() {
    if (!videoModal) return;
    videoModal.classList.remove('active');
    document.body.style.overflow = '';
    if (modalVideoIframe) {
      modalVideoIframe.src = '';
    }
  }

  showcaseTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const type = trigger.getAttribute('data-showcase-video');
      const item = showcaseData[type];

      if (item && videoModal) {
        if (modalVideoIframe) {
          modalVideoIframe.src = item.videoUrl;
        }
        if (modalVideoTitle) modalVideoTitle.textContent = item.title;
        if (modalVideoTag) modalVideoTag.textContent = item.tag;
        if (modalVideoDesc) modalVideoDesc.textContent = item.desc;
        currentModalFormat = item.formatKey;

        videoModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  // Modal Book Setup CTA
  if (modalBookSetupBtn) {
    modalBookSetupBtn.addEventListener('click', () => {
      closeVideoModal();

      const formatSelect = document.getElementById('projectFormat');
      const contactSection = document.getElementById('contact');

      if (formatSelect && currentModalFormat) {
        formatSelect.value = currentModalFormat;
      }
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // Close Video Modal handlers
  if (videoClose) {
    videoClose.addEventListener('click', closeVideoModal);
  }

  if (videoModal) {
    videoModal.addEventListener('click', (e) => {
      if (e.target === videoModal) {
        closeVideoModal();
      }
    });
  }

  // Global ESC key listener for both modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (videoModal && videoModal.classList.contains('active')) {
        closeVideoModal();
      }
      const lightbox = document.getElementById('lightboxModal');
      if (lightbox && lightbox.classList.contains('active')) {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
      }
    }
  });
}

/* ==========================================================================
   6. Conversion Booking Form
   ========================================================================== */
function initBookingForm() {
  const form = document.getElementById('bookingForm');
  const successOverlay = document.getElementById('formSuccessOverlay');
  const resetBtn = document.getElementById('formSuccessReset');
  const confirmationName = document.getElementById('confirmClientName');
  const confirmationFormat = document.getElementById('confirmFormatSummary');
  const emailDraftLink = document.getElementById('emailDraftLink');
  const copyDetailsBtn = document.getElementById('copyDetailsBtn');
  const copyBtnText = document.getElementById('copyBtnText');

  let currentDraftBody = '';

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Collect form values
      const name = document.getElementById('clientName').value.trim();
      const org = document.getElementById('clientOrg').value.trim();
      const email = document.getElementById('clientEmail').value.trim();
      const phone = document.getElementById('clientPhone').value.trim();
      const format = document.getElementById('projectFormat').value;
      const episodes = document.getElementById('projectEpisodes').value;
      const date = document.getElementById('preferredDate').value;
      const notes = document.getElementById('projectMessage').value.trim();

      // Form validation
      if (!name || !email || !phone) {
        alert('Please complete all required fields (Name, Email, and Phone/WhatsApp).');
        return;
      }

      // Format clean, structured inquiry body for production@jns.org
      const emailSubject = `Studio Reservation & Quote Request: ${format || 'Studio Production'} - ${name}`;
      
      const emailBodyRaw = 
`JNS MEDIA HUB — STUDIO RESERVATION & QUOTE REQUEST
Target Recipient: production@jns.org

CLIENT INFORMATION:
-----------------------------------------
• Full Name: ${name}
• Organization / Company: ${org || 'Not provided'}
• Email Address: ${email}
• Phone / WhatsApp: ${phone}

PRODUCTION SPECIFICATIONS:
-----------------------------------------
• Format Requested: ${format || 'Custom / To be coordinated'}
• Volume / Episodes: ${episodes || '1 Episode'}
• Preferred Studio Date: ${date || 'Flexible / To be coordinated'}

PROJECT DESCRIPTION & REQUIREMENTS:
-----------------------------------------
${notes || 'No additional notes provided.'}

-----------------------------------------
Facility: JNS Media Hub, Yad Harutzim 4, Talpiot, Jerusalem (https://maps.app.goo.gl/NcHBkWKmsiEJr4Aa7)
Direct Production Desk: production@jns.org`;

      currentDraftBody = emailBodyRaw;

      // Construct mailto link directly addressed to production@jns.org
      const mailtoUrl = `mailto:production@jns.org?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBodyRaw)}`;

      // Update link on success overlay
      if (emailDraftLink) {
        emailDraftLink.href = mailtoUrl;
      }

      // Display customized success modal
      if (confirmationName) confirmationName.textContent = name;
      if (confirmationFormat) {
        confirmationFormat.textContent = `${format || 'Studio Production'} · ${episodes || '1'} Episode(s)`;
      }

      if (successOverlay) {
        successOverlay.classList.add('active');
      }

      // Trigger user's email client to send to production@jns.org
      try {
        window.location.href = mailtoUrl;
      } catch (err) {
        console.warn('Mailto protocol handler error:', err);
      }

      // Log submission for audit/analytics
      console.log('JNS Media Hub — Studio Reservation Sent to production@jns.org:', {
        recipient: 'production@jns.org',
        name, org, email, phone, format, episodes, date, notes,
        timestamp: new Date().toISOString()
      });
    });
  }

  // Copy details button in success overlay
  if (copyDetailsBtn && copyBtnText) {
    copyDetailsBtn.addEventListener('click', async () => {
      try {
        if (navigator.clipboard && currentDraftBody) {
          await navigator.clipboard.writeText(currentDraftBody);
          copyBtnText.textContent = 'Copied to Clipboard!';
          setTimeout(() => {
            copyBtnText.textContent = 'Copy Details';
          }, 3000);
        }
      } catch (err) {
        console.error('Clipboard copy failed:', err);
      }
    });
  }

  if (resetBtn && successOverlay) {
    resetBtn.addEventListener('click', () => {
      if (form) form.reset();
      successOverlay.classList.remove('active');
    });
  }
}

/* ========================================================================
   7. Section & Element Scroll Entrance Animations (IntersectionObserver)
   ======================================================================== */
function initScrollAnimations() {
  // Respect user accessibility preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('section').forEach(sec => sec.classList.add('section-entered'));
    return;
  }

  // Select all elements to reveal smoothly as they enter viewport
  const targetSelectors = [
    '.section-header',
    '.product-card',
    '.addon-banner',
    '.showcase-card',
    '.gallery-item',
    '.capability-card',
    '.service-card',
    '.rate-card',
    '.discounts-banner',
    '.calculator-container',
    '.contact-card-item',
    '.contact-form-card'
  ];

  targetSelectors.forEach(selector => {
    const items = document.querySelectorAll(selector);
    items.forEach(el => {
      el.classList.add('reveal-on-scroll');

      // Automatically calculate staggered delay for sibling grid items
      const parent = el.parentElement;
      if (parent && (parent.classList.contains('products-grid') || 
                     parent.classList.contains('showcase-grid') || 
                     parent.classList.contains('gallery-grid') || 
                     parent.classList.contains('capabilities-grid') ||
                     parent.classList.contains('services-grid') ||
                     parent.classList.contains('pricing-rates-grid'))) {
        const siblingIndex = Array.from(parent.children).indexOf(el);
        const staggerClass = `stagger-${(siblingIndex % 6) + 1}`;
        el.classList.add(staggerClass);
      }
    });
  });

  // Observer for smooth element entrance
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  document.querySelectorAll('.reveal-on-scroll').forEach(el => {
    revealObserver.observe(el);
  });

  // Observer for section transitions & active nav link tracking
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('section-entered');

        const currentId = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${currentId}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, {
    root: null,
    threshold: 0.25
  });

  sections.forEach(sec => sectionObserver.observe(sec));
}

/* ==========================================================================
   9. About Us Team Member Full Portrait Lightbox Modal
   ========================================================================== */
function initTeamModal() {
  const teamCards = document.querySelectorAll('.team-card');
  const teamModal = document.getElementById('teamModal');
  const teamModalClose = document.getElementById('teamModalClose');
  const teamModalImg = document.getElementById('teamModalImage');
  const teamModalName = document.getElementById('teamModalName');
  const teamModalRole = document.getElementById('teamModalRole');
  const teamModalBio = document.getElementById('teamModalBio');
  const teamPrevBtn = document.getElementById('teamPrevBtn');
  const teamNextBtn = document.getElementById('teamNextBtn');
  const teamModalStage = document.getElementById('teamModalStage');

  if (!teamCards.length || !teamModal) return;

  const teamMembersData = [];
  let currentTeamIndex = 0;

  // Build team members data array from DOM
  teamCards.forEach((card, idx) => {
    const imgEl = card.querySelector('.team-photo');
    const nameEl = card.querySelector('.team-name');
    const roleEl = card.querySelector('.team-role');
    const bioEl = card.querySelector('.team-bio');

    const memberData = {
      src: imgEl ? imgEl.src : '',
      alt: imgEl ? imgEl.alt : (nameEl ? nameEl.textContent : 'Team Member'),
      name: nameEl ? nameEl.textContent.trim() : '',
      role: roleEl ? roleEl.textContent.trim() : '',
      bio: bioEl ? bioEl.textContent.trim() : ''
    };

    teamMembersData.push(memberData);

    card.addEventListener('click', () => {
      openTeamModal(idx);
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openTeamModal(idx);
      }
    });
  });

  function openTeamModal(idx) {
    if (idx < 0) idx = teamMembersData.length - 1;
    if (idx >= teamMembersData.length) idx = 0;

    currentTeamIndex = idx;
    const member = teamMembersData[currentTeamIndex];
    if (!member) return;

    if (teamModalImg) {
      teamModalImg.src = member.src;
      teamModalImg.alt = member.alt;
    }
    if (teamModalName) teamModalName.textContent = member.name;
    if (teamModalRole) teamModalRole.textContent = member.role;
    if (teamModalBio) teamModalBio.textContent = member.bio;

    teamModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeTeamModal() {
    teamModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (teamModalClose) {
    teamModalClose.addEventListener('click', closeTeamModal);
  }

  if (teamModal) {
    teamModal.addEventListener('click', (e) => {
      if (e.target === teamModal) {
        closeTeamModal();
      }
    });
  }

  if (teamPrevBtn) {
    teamPrevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openTeamModal(currentTeamIndex - 1);
    });
  }

  if (teamNextBtn) {
    teamNextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openTeamModal(currentTeamIndex + 1);
    });
  }

  // Keyboard Navigation & Escape listener
  document.addEventListener('keydown', (e) => {
    if (!teamModal || !teamModal.classList.contains('active')) return;
    if (e.key === 'Escape') {
      closeTeamModal();
    } else if (e.key === 'ArrowLeft') {
      openTeamModal(currentTeamIndex - 1);
    } else if (e.key === 'ArrowRight') {
      openTeamModal(currentTeamIndex + 1);
    }
  });

  // Touch Swipe Support on Mobile
  if (teamModalStage) {
    let touchStartX = 0;
    let touchEndX = 0;

    teamModalStage.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    teamModalStage.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const swipeDistance = touchEndX - touchStartX;
      if (Math.abs(swipeDistance) > 40) {
        if (swipeDistance < 0) {
          openTeamModal(currentTeamIndex + 1);
        } else {
          openTeamModal(currentTeamIndex - 1);
        }
      }
    }, { passive: true });
  }
}


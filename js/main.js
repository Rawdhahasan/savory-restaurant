/**
 * Savory — site interactions
 *
 * Sections:
 *   1. Config & helpers
 *   2. Header (scroll state, mobile nav, active link)
 *   3. Menu tabs
 *   4. Opening hours & live "open now" status
 *   5. Gallery lightbox
 *   6. Reservation form
 *   7. Scroll reveal, back-to-top, footer year
 */
(function () {
  "use strict";

  /* ---------- 1. Config & helpers ---------- */

  // Restaurant time zone, so "Open now" is correct for visitors anywhere.
  const TIME_ZONE = "America/Los_Angeles";

  // Opening hours in 24h decimal format, keyed by day (0 = Sunday).
  // Keep in sync with the hours table in index.html.
  const HOURS = {
    0: { open: 12, close: 21 },
    1: null, // Closed Monday
    2: { open: 17, close: 22 },
    3: { open: 17, close: 22 },
    4: { open: 17, close: 22 },
    5: { open: 17, close: 23.5 },
    6: { open: 12, close: 23.5 },
  };

  // Last reservation slot is this many hours before closing.
  const LAST_SEATING_OFFSET = 1;
  const BOOKING_WINDOW_DAYS = 90;
  const IMAGE_BASE = "https://images.unsplash.com/photo-";

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /** Create an element with attributes and children (strings become text). */
  function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([key, value]) => {
      if (key === "className") node.className = value;
      else if (key === "style") node.style.cssText = value;
      else node.setAttribute(key, value);
    });
    children.forEach((child) => {
      node.append(typeof child === "string" ? document.createTextNode(child) : child);
    });
    return node;
  }

  /** Current date/time parts in the restaurant's time zone. */
  function restaurantNow() {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
      weekday: "short",
    }).formatToParts(new Date());

    const get = (type) => parts.find((p) => p.type === type).value;
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return {
      isoDate: `${get("year")}-${get("month")}-${get("day")}`,
      day: weekdays.indexOf(get("weekday")),
      hours: Number(get("hour")) + Number(get("minute")) / 60,
    };
  }

  /** Format decimal hours (e.g. 17.5) as "5:30 PM". */
  function formatTime(decimalHours) {
    const h = Math.floor(decimalHours);
    const m = Math.round((decimalHours - h) * 60);
    const suffix = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
  }

  /** Parse "YYYY-MM-DD" into a local Date at midnight (avoids UTC shifts). */
  function parseISODate(iso) {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  function toISODate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  /* ---------- 2. Header ---------- */

  function initHeader() {
    const header = $(".site-header");
    const nav = $("#site-nav");
    const toggle = $(".nav-toggle");
    const links = $$(".nav-link");

    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const setOpen = (open) => {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      document.body.classList.toggle("no-scroll", open);
    };

    toggle.addEventListener("click", () => setOpen(!nav.classList.contains("is-open")));

    // Close the mobile menu after choosing a link.
    $$("a", nav).forEach((a) => a.addEventListener("click", () => setOpen(false)));

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        setOpen(false);
        toggle.focus();
      }
    });

    // Reset state if the window grows to desktop size while the menu is open.
    window.matchMedia("(width >= 960px)").addEventListener("change", (e) => {
      if (e.matches) setOpen(false);
    });

    // Highlight the nav link for the section currently in view.
    const sections = links
      .map((link) => document.querySelector(link.getAttribute("href")))
      .filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((link) => {
            const active = link.getAttribute("href") === `#${entry.target.id}`;
            link.classList.toggle("is-active", active);
            if (active) link.setAttribute("aria-current", "true");
            else link.removeAttribute("aria-current");
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );

    sections.forEach((section) => observer.observe(section));
  }

  /* ---------- 3. Menu tabs ---------- */

  function initMenu() {
    const data = window.SAVORY_MENU;
    const tabList = $(".menu-tabs");
    const panel = $("#menu-panel");
    if (!data || !tabList || !panel) return;

    const tabs = data.categories.map((cat, index) =>
      el(
        "button",
        {
          className: "menu-tab",
          type: "button",
          role: "tab",
          id: `tab-${cat.id}`,
          "aria-controls": "menu-panel",
          "aria-selected": index === 0 ? "true" : "false",
          tabindex: index === 0 ? "0" : "-1",
          "data-category": cat.id,
        },
        [cat.label]
      )
    );
    tabList.append(...tabs);

    function dishCard(item, index) {
      const tags = (item.tags || []).filter((t) => t !== "Signature");
      const media = el("div", { className: "dish-media" }, [
        el("img", {
          src: `${IMAGE_BASE}${item.image}?w=640&h=480&q=75&auto=format&fit=crop`,
          alt: item.name,
          loading: "lazy",
          width: "640",
          height: "480",
        }),
      ]);
      if ((item.tags || []).includes("Signature")) {
        media.append(el("span", { className: "dish-badge" }, ["Chef's pick"]));
      }

      return el("article", { className: "dish", style: `--i: ${index}` }, [
        media,
        el("div", { className: "dish-body" }, [
          el("div", { className: "dish-head" }, [
            el("h3", { className: "dish-name" }, [item.name]),
            el("span", { className: "dish-price" }, [`$${item.price}`]),
          ]),
          el("p", { className: "dish-desc" }, [item.description]),
          el(
            "div",
            { className: "dish-tags" },
            tags.map((t) =>
              el("span", { className: t === "Spicy" ? "tag tag-spicy" : "tag" }, [t])
            )
          ),
        ]),
      ]);
    }

    function render(categoryId) {
      const items =
        categoryId === "all"
          ? data.items
          : data.items.filter((item) => item.category === categoryId);
      panel.replaceChildren(...items.map(dishCard));
      panel.setAttribute("aria-labelledby", `tab-${categoryId}`);
    }

    function select(tab, focus = false) {
      tabs.forEach((t) => {
        const selected = t === tab;
        t.setAttribute("aria-selected", String(selected));
        t.tabIndex = selected ? 0 : -1;
      });
      if (focus) tab.focus();
      tab.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
      render(tab.dataset.category);
    }

    tabList.addEventListener("click", (e) => {
      const tab = e.target.closest(".menu-tab");
      if (tab) select(tab);
    });

    // Arrow-key navigation between tabs (WAI-ARIA tabs pattern).
    tabList.addEventListener("keydown", (e) => {
      const current = tabs.indexOf(document.activeElement);
      if (current === -1) return;
      let next = null;
      if (e.key === "ArrowRight") next = (current + 1) % tabs.length;
      if (e.key === "ArrowLeft") next = (current - 1 + tabs.length) % tabs.length;
      if (e.key === "Home") next = 0;
      if (e.key === "End") next = tabs.length - 1;
      if (next !== null) {
        e.preventDefault();
        select(tabs[next], true);
      }
    });

    render(data.categories[0].id);
  }

  /* ---------- 4. Opening hours ---------- */

  function initHours() {
    const status = $("#open-status");
    if (!status) return;
    const text = $(".status-text", status);

    function update() {
      const now = restaurantNow();
      const today = HOURS[now.day];

      $$("#hours-table tr").forEach((row) => {
        row.classList.toggle("is-today", Number(row.dataset.day) === now.day);
      });

      const isOpen = Boolean(today) && now.hours >= today.open && now.hours < today.close;
      status.classList.toggle("is-open", isOpen);
      status.classList.toggle("is-closed", !isOpen);

      if (isOpen) {
        text.textContent = `Open now · until ${formatTime(today.close)}`;
      } else if (today && now.hours < today.open) {
        text.textContent = `Closed · opens today at ${formatTime(today.open)}`;
      } else {
        // Find the next day we're open.
        for (let i = 1; i <= 7; i++) {
          const day = (now.day + i) % 7;
          if (HOURS[day]) {
            const label = i === 1 ? "tomorrow" : new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(new Date(2024, 0, 7 + day));
            text.textContent = `Closed · opens ${label} at ${formatTime(HOURS[day].open)}`;
            break;
          }
        }
      }
    }

    update();
    setInterval(update, 60 * 1000);
  }

  /* ---------- 5. Gallery lightbox ---------- */

  function initLightbox() {
    const lightbox = $("#lightbox");
    const buttons = $$(".gallery-btn");
    if (!lightbox || !buttons.length) return;

    const img = $("img", lightbox);
    const caption = $("figcaption", lightbox);
    const closeBtn = $(".lightbox-close", lightbox);
    const prevBtn = $(".lightbox-prev", lightbox);
    const nextBtn = $(".lightbox-next", lightbox);
    let index = 0;
    let lastFocused = null;

    function show(i) {
      index = (i + buttons.length) % buttons.length;
      const thumb = $("img", buttons[index]);
      img.src = buttons[index].dataset.full;
      img.alt = thumb.alt;
      caption.textContent = `${thumb.alt} — ${index + 1} / ${buttons.length}`;
      // Restart the zoom animation for each image.
      img.style.animation = "none";
      void img.offsetWidth;
      img.style.animation = "";
    }

    function open(i) {
      lastFocused = document.activeElement;
      show(i);
      lightbox.hidden = false;
      document.body.classList.add("no-scroll");
      closeBtn.focus();
    }

    function close() {
      lightbox.hidden = true;
      document.body.classList.remove("no-scroll");
      if (lastFocused) lastFocused.focus();
    }

    buttons.forEach((btn, i) => btn.addEventListener("click", () => open(i)));
    closeBtn.addEventListener("click", close);
    prevBtn.addEventListener("click", () => show(index - 1));
    nextBtn.addEventListener("click", () => show(index + 1));

    // Click on the dark backdrop closes the viewer.
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) close();
    });

    document.addEventListener("keydown", (e) => {
      if (lightbox.hidden) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(index - 1);
      if (e.key === "ArrowRight") show(index + 1);

      // Keep keyboard focus inside the dialog.
      if (e.key === "Tab") {
        const focusables = [closeBtn, prevBtn, nextBtn];
        const pos = focusables.indexOf(document.activeElement);
        e.preventDefault();
        const step = e.shiftKey ? -1 : 1;
        focusables[(pos + step + focusables.length) % focusables.length].focus();
      }
    });

    // Basic swipe support on touch devices.
    let touchX = null;
    lightbox.addEventListener("touchstart", (e) => (touchX = e.touches[0].clientX), { passive: true });
    lightbox.addEventListener("touchend", (e) => {
      if (touchX === null) return;
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
      touchX = null;
    });
  }

  /* ---------- 6. Reservation form ---------- */

  function initReservationForm() {
    const form = $("#reserve-form");
    if (!form) return;

    const dateInput = $("#date", form);
    const timeSelect = $("#time", form);
    const submitBtn = $('button[type="submit"]', form);
    const success = $("#form-success", form);

    // Limit the date picker to today → booking window (restaurant time).
    const todayISO = restaurantNow().isoDate;
    const maxDate = parseISODate(todayISO);
    maxDate.setDate(maxDate.getDate() + BOOKING_WINDOW_DAYS);
    dateInput.min = todayISO;
    dateInput.max = toISODate(maxDate);

    /** Build 30-minute time slots for the chosen date. */
    function populateTimes() {
      timeSelect.replaceChildren();
      const value = dateInput.value;

      if (!value) {
        timeSelect.append(el("option", { value: "" }, ["Choose a date first"]));
        timeSelect.disabled = true;
        return;
      }

      const hours = HOURS[parseISODate(value).getDay()];
      const now = restaurantNow();
      const slots = [];

      if (hours) {
        for (let t = hours.open; t <= hours.close - LAST_SEATING_OFFSET; t += 0.5) {
          // Skip times that have already passed today (+30 min notice).
          if (value === now.isoDate && t < now.hours + 0.5) continue;
          slots.push(t);
        }
      }

      if (!slots.length) {
        timeSelect.append(el("option", { value: "" }, ["No times available"]));
        timeSelect.disabled = true;
        return;
      }

      timeSelect.append(el("option", { value: "" }, ["Select a time"]));
      slots.forEach((t) => timeSelect.append(el("option", { value: formatTime(t) }, [formatTime(t)])));
      timeSelect.disabled = false;
    }

    const validators = {
      name: (v) => (v.trim().length >= 2 ? "" : "Please enter your full name."),
      email: (v) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "Please enter a valid email address.",
      phone: (v) =>
        v.replace(/\D/g, "").length >= 7 ? "" : "Please enter a valid phone number.",
      guests: (v) => (v ? "" : "Please choose the number of guests."),
      date: (v) => {
        if (!v) return "Please choose a date.";
        if (v < dateInput.min) return "Please choose a date from today onwards.";
        if (v > dateInput.max) return `We take bookings up to ${BOOKING_WINDOW_DAYS} days ahead.`;
        if (!HOURS[parseISODate(v).getDay()]) return "Sorry, we're closed on Mondays.";
        return "";
      },
      time: (v) => (v ? "" : timeSelect.disabled ? "" : "Please choose a time."),
    };

    function validateField(name) {
      const input = form.elements[name];
      const message = validators[name](input.value);
      const field = input.closest(".field");
      const error = $(`#${name}-error`, form);
      field.classList.toggle("has-error", Boolean(message));
      input.setAttribute("aria-invalid", String(Boolean(message)));
      if (message) input.setAttribute("aria-describedby", error.id);
      else input.removeAttribute("aria-describedby");
      error.textContent = message;
      return !message;
    }

    dateInput.addEventListener("change", () => {
      populateTimes();
      validateField("date");
    });

    // Validate as the user leaves each field, then live once they've seen an error.
    Object.keys(validators).forEach((name) => {
      const input = form.elements[name];
      input.addEventListener("blur", () => validateField(name));
      input.addEventListener("input", () => {
        if (input.closest(".field").classList.contains("has-error")) validateField(name);
      });
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const results = Object.keys(validators).map(validateField);
      // An open date with no remaining slots still needs a time.
      if (timeSelect.disabled && dateInput.value && validators.date(dateInput.value) === "") {
        $("#time-error", form).textContent = "No times left on this date — please pick another.";
        results.push(false);
      }

      if (results.includes(false)) {
        const firstError = $(".has-error input, .has-error select", form);
        if (firstError) firstError.focus();
        return;
      }

      const data = Object.fromEntries(new FormData(form));
      submitBtn.classList.add("is-loading");
      submitBtn.disabled = true;

      // Demo only: replace this timeout with a real request, e.g.
      // fetch("https://formspree.io/f/your-id", { method: "POST", body: new FormData(form),
      //   headers: { Accept: "application/json" } })
      setTimeout(() => {
        const prettyDate = new Intl.DateTimeFormat("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        }).format(parseISODate(data.date));

        const firstName = data.name.trim().split(/\s+/)[0];
        $("p", success).textContent =
          `We've received your request, ${firstName}, for a party of ${data.guests} on ${prettyDate} at ${data.time}. ` +
          `A confirmation will be sent to ${data.email.trim()} shortly.`;
        success.hidden = false;

        form.reset();
        populateTimes();
        submitBtn.classList.remove("is-loading");
        submitBtn.disabled = false;
        success.setAttribute("tabindex", "-1");
        success.focus();

        // Show the form again after a short while.
        setTimeout(() => (success.hidden = true), 8000);
      }, 1200);
    });
  }

  /* ---------- 7. Reveal, back-to-top, year ---------- */

  function initReveal() {
    const items = $$(".reveal");
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      items.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    // Stagger siblings that enter together.
    items.forEach((item) => {
      const siblings = $$(":scope > .reveal", item.parentElement);
      const pos = siblings.indexOf(item);
      if (pos > 0) item.style.setProperty("--reveal-delay", `${Math.min(pos, 6) * 0.08}s`);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    items.forEach((item) => observer.observe(item));
  }

  function initBackToTop() {
    const button = $(".to-top");
    if (!button) return;
    const onScroll = () => button.classList.toggle("is-visible", window.scrollY > 700);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    button.addEventListener("click", () =>
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" })
    );
  }

  function initYear() {
    const year = $("#year");
    if (year) year.textContent = String(new Date().getFullYear());
  }

  document.addEventListener("DOMContentLoaded", () => {
    initHeader();
    initMenu();
    initHours();
    initLightbox();
    initReservationForm();
    initReveal();
    initBackToTop();
    initYear();
  });
})();

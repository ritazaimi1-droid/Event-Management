document.addEventListener("DOMContentLoaded", function () {
  const yearEl = document.getElementById("rz-year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  function setActiveNav() {
    const links = document.querySelectorAll("#rz-navbar .nav-link");
    const current = location.pathname.split("/").pop() || "index.html";
    links.forEach((link) => {
      const href = link.getAttribute("href");
      if (!href) return;

      if (href === current || (href === "index.html" && current === "")) {
        link.classList.add("active");
      } else if (location.href.endsWith(href) || location.href.includes(href)) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  }
  setActiveNav();

  const eventDate = new Date("2026-05-15T09:00:00");
  const daysEl = document.getElementById("rz-days");
  const hoursEl = document.getElementById("rz-hours");
  const minsEl = document.getElementById("rz-mins");
  const secsEl = document.getElementById("rz-secs");

  function updateCountdown() {
    const now = new Date();
    let diff = Math.max(0, eventDate - now);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    diff -= days * (1000 * 60 * 60 * 24);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    diff -= hours * (1000 * 60 * 60);
    const mins = Math.floor(diff / (1000 * 60));
    diff -= mins * (1000 * 60);
    const secs = Math.floor(diff / 1000);

    if (daysEl) daysEl.textContent = days;
    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, "0");
    if (minsEl) minsEl.textContent = String(mins).padStart(2, "0");
    if (secsEl) secsEl.textContent = String(secs).padStart(2, "0");
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  const ticketButtons = document.querySelectorAll(".rz-ticket-buy");
  const ticketModalEl = document.getElementById("rzTicketModal");
  let ticketModal = null;
  if (ticketModalEl) ticketModal = new bootstrap.Modal(ticketModalEl);

  ticketButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      const type = btn.getAttribute("data-ticket-type") || "";
      const hiddenType = document.getElementById("rz-ticket-type");
      if (hiddenType) hiddenType.value = type;
      if (ticketModal) ticketModal.show();
    });
  });

  const ticketSubmit = document.getElementById("rz-ticket-submit");
  if (ticketSubmit) {
    ticketSubmit.addEventListener("click", function () {
      const name = document.getElementById("rz-ticket-name").value || "";
      const email = document.getElementById("rz-ticket-email").value || "";
      const type = document.getElementById("rz-ticket-type").value || "ticket";
      if (!name || !email) {
        alert("Please provide name and email to register.");
        return;
      }

      alert(`Registered (${type}): ${name} — ${email}`);
      if (ticketModal) ticketModal.hide();
    });
  }

  const contactForm = document.getElementById("rz-contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const name = document.getElementById("rz-contact-name").value.trim();
      const email = document.getElementById("rz-contact-email").value.trim();
      const message = document
        .getElementById("rz-contact-message")
        .value.trim();
      if (!name || !email || !message) {
        alert("Please complete all fields before sending.");
        return;
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        alert("Please enter a valid email address.");
        return;
      }
      alert("Thank you — your message has been sent.");
      contactForm.reset();
    });
  }

  const navbarCollapseEl = document.getElementById("rzNavMenu");
  if (navbarCollapseEl) {
    const bsCollapse = new bootstrap.Collapse(navbarCollapseEl, {
      toggle: false,
    });
    document.querySelectorAll("#rzNavMenu .nav-link").forEach((link) => {
      link.addEventListener("click", function () {
        const toggler = document.querySelector(".navbar-toggler");
        if (toggler && window.getComputedStyle(toggler).display !== "none") {
          bsCollapse.hide();
        }
      });
    });
  }

  const speakerRoot = document.getElementById("rz-speaker-root");
  if (speakerRoot) {
    function getQueryParam(name) {
      const params = new URLSearchParams(location.search);
      return params.get(name);
    }

    function loadSpeakers() {
      return fetch("data/speakers.json")
        .then((r) => {
          if (!r.ok) throw new Error("Network response not ok");
          return r.json();
        })
        .catch((err) => {
          console.warn(
            "Failed to fetch data/speakers.json, falling back to window.RZ_SPEAKERS",
            err
          );
          if (Array.isArray(window.RZ_SPEAKERS)) return window.RZ_SPEAKERS;
          return Promise.reject(err);
        });
    }

    const speakerId = getQueryParam("id");
    if (!speakerId) {
      loadSpeakers()
        .then((data) => {
          if (!Array.isArray(data) || data.length === 0) {
            speakerRoot.innerHTML =
              '<div class="alert alert-warning">No speakers available.</div>';
            return;
          }
          const cards = data
            .map(
              (s) => `
          <div class="col-md-4 mb-3">
            <div class="card rz-speaker-card h-100">
              <img src="${s.img}" loading="lazy" class="card-img-top" alt="${s.name}">
              <div class="card-body d-flex flex-column">
                <h5 class="card-title mb-1">${s.name}</h5>
                <p class="card-text text-muted mb-2">${s.title}</p>
                <p class="mb-3 fst-italic">${s.talkTitle}</p>
                <div class="mt-auto">
                  <a href="speaker-details.html?id=${s.id}" class="btn btn-sm btn-primary">View details</a>
                </div>
              </div>
            </div>
          </div>
        `
            )
            .join("");
          speakerRoot.innerHTML = `<div class="row">${cards}</div>`;
        })
        .catch((err) => {
          console.error(err);
          speakerRoot.innerHTML =
            '<div class="alert alert-danger">Failed to load speakers.</div>';
        });
    } else {
      loadSpeakers()
        .then((data) => {
          const speaker = data.find((s) => s.id === speakerId);
          if (!speaker) {
            speakerRoot.innerHTML =
              '<div class="alert alert-danger">Speaker not found.</div>';
            return;
          }

          speakerRoot.innerHTML = `
          <div class="row">
            <div class="col-md-4">
              <img src="${speaker.img}" loading="lazy" class="img-fluid rounded" alt="${speaker.name}">
            </div>
            <div class="col-md-8">
              <h2>${speaker.name}</h2>
              <p class="text-muted">${speaker.title}</p>
              <h5>Talk: ${speaker.talkTitle}</h5>
              <p class="fst-italic">${speaker.talkAbstract}</p>
              <hr>
              <p>${speaker.bio}</p>
            </div>
          </div>
        `;
        })
        .catch((err) => {
          console.error(err);
          speakerRoot.innerHTML =
            '<div class="alert alert-danger">Failed to load speaker data.</div>';
        });
    }
  }
});

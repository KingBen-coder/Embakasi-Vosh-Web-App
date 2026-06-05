const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const menu = document.querySelector("[data-menu]");
const slides = [...document.querySelectorAll(".hero-slide")];
const countdown = document.querySelector("[data-countdown]");
const prayerForm = document.querySelector("[data-prayer-form]");
const prayerStatus = document.querySelector("[data-prayer-status]");
const authForm = document.querySelector("[data-auth-form]");
const authStatus = document.querySelector("[data-auth-status]");
const paymentForm = document.querySelector("[data-payment-form]");
const paymentStatus = document.querySelector("[data-payment-status]");
const gallery = document.querySelector("[data-gallery]");
const lightbox = document.querySelector("[data-lightbox]");
const year = document.querySelector("[data-year]");

year.textContent = new Date().getFullYear();

const routes = {
  "/": "home",
  "/home": "home",
  "/about": "about",
  "/ministries": "ministries",
  "/sermons": "sermons",
  "/events": "events",
  "/portal": "portal",
  "/gallery": "gallery",
  "/give": "give",
  "/prayer": "prayer",
  "/contact": "contact",
  "/member": "member"
};

function getRoute() {
  const route = window.location.hash.replace("#", "") || "/home";
  return route.startsWith("/") ? route : `/${route}`;
}

function navigateToRoute() {
  const id = routes[getRoute()] || "home";
  const target = document.getElementById(id);
  if (!target) return;

  target.scrollIntoView({ behavior: "smooth", block: "start" });
}

window.addEventListener("hashchange", navigateToRoute);
window.addEventListener("load", () => {
  if (!window.location.hash) {
    history.replaceState(null, "", "#/home");
  }
  navigateToRoute();
});

function updateHeader() {
  header.classList.toggle("is-scrolled", window.scrollY > 16);
}

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

menuToggle.addEventListener("click", () => {
  const isOpen = menu.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  header.classList.toggle("menu-open", isOpen);
});

menu.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    menu.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    header.classList.remove("menu-open");
  }
});

let activeSlide = 0;
setInterval(() => {
  slides[activeSlide].classList.remove("is-active");
  activeSlide = (activeSlide + 1) % slides.length;
  slides[activeSlide].classList.add("is-active");
}, 5200);

function getNextSundayService() {
  const now = new Date();
  const target = new Date(now);
  const daysUntilSunday = (7 - now.getDay()) % 7;
  target.setDate(now.getDate() + daysUntilSunday);
  target.setHours(9, 0, 0, 0);
  if (target <= now) {
    target.setDate(target.getDate() + 7);
  }
  return target;
}

function updateCountdown() {
  const distance = getNextSundayService() - new Date();
  const days = Math.floor(distance / 86400000);
  const hours = Math.floor((distance % 86400000) / 3600000);
  const minutes = Math.floor((distance % 3600000) / 60000);
  countdown.textContent = `Next Sunday service begins in ${days}d ${hours}h ${minutes}m`;
}

updateCountdown();
setInterval(updateCountdown, 60000);

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14 }
);

document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));

prayerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  prayerForm.reset();
  prayerStatus.textContent = "Your prayer request has been received. We are praying with you.";
});

authForm.addEventListener("submit", (event) => {
  event.preventDefault();
  authStatus.textContent = "Supabase Auth ready: connect this form to sign in and trigger OTP or email verification.";
});

paymentForm.addEventListener("submit", (event) => {
  event.preventDefault();
  paymentStatus.textContent = "Supabase Edge Function ready: connect this form to Daraja STK Push and webhook confirmation.";
});

gallery.addEventListener("click", (event) => {
  const image = event.target.closest("img");
  if (!image || !lightbox.showModal) return;
  const preview = lightbox.querySelector("img");
  preview.src = image.src;
  preview.alt = image.alt;
  lightbox.showModal();
});

document.querySelector("[data-close-lightbox]").addEventListener("click", () => {
  lightbox.close();
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js");
  });
}

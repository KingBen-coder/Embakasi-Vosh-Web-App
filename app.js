const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const menu = document.querySelector("[data-menu]");
const slides = [...document.querySelectorAll(".hero-slide")];
const countdown = document.querySelector("[data-countdown]");
const prayerForm = document.querySelector("[data-prayer-form]");
const prayerStatus = document.querySelector("[data-prayer-status]");
const registerForm = document.querySelector("[data-register-form]");
const registerStatus = document.querySelector("[data-register-status]");
const authForm = document.querySelector("[data-auth-form]");
const authStatus = document.querySelector("[data-auth-status]");
const paymentForm = document.querySelector("[data-payment-form]");
const paymentStatus = document.querySelector("[data-payment-status]");
const gallery = document.querySelector("[data-gallery]");
const lightbox = document.querySelector("[data-lightbox]");
const year = document.querySelector("[data-year]");

year.textContent = new Date().getFullYear();

const SUPABASE_URL = "https://dwjodjrwoubuyefpxwpm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_ZCr12Hb5lkEbrkKSi97PTQ_qtLcHSkg";
const supabaseClient = window.supabase?.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

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

async function writeAuditLog(action, metadata = {}) {
  if (!supabaseClient) return;
  const { data } = await supabaseClient.auth.getUser();
  const userId = data?.user?.id;
  if (!userId) return;

  await supabaseClient.from("audit_logs").insert({
    user_id: userId,
    action,
    entity_type: "auth",
    metadata
  });
}

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!supabaseClient) {
    registerStatus.textContent = "Supabase could not load. Please check your internet connection and try again.";
    return;
  }

  const formData = new FormData(registerForm);
  const fullName = String(formData.get("full_name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const password = String(formData.get("password") || "");

  registerStatus.textContent = "Creating your member account...";
  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone
      }
    }
  });

  if (error) {
    registerStatus.textContent = error.message;
    return;
  }

  registerForm.reset();
  registerStatus.textContent = data.session
    ? "Registration successful. Your member profile has been saved."
    : "Registration received. Please check your email to confirm your account.";
});

authForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!supabaseClient) {
    authStatus.textContent = "Supabase could not load. Please check your internet connection and try again.";
    return;
  }

  const formData = new FormData(authForm);
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  authStatus.textContent = "Signing you in...";
  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });

  if (error) {
    authStatus.textContent = error.message;
    return;
  }

  await writeAuditLog("member_logged_in", { email });
  authForm.reset();
  authStatus.textContent = "Login successful. Welcome back to the member portal.";
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

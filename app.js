const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const menu = document.querySelector("[data-menu]");
const slides = [...document.querySelectorAll(".hero-slide")];
const countdown = document.querySelector("[data-countdown]");
const prayerForm = document.querySelector("[data-prayer-form]");
const prayerStatus = document.querySelector("[data-prayer-status]");
const signupForm = document.querySelector("[data-signup-form]");
const signupStatus = document.querySelector("[data-signup-status]");
const loginForm = document.querySelector("[data-login-form]");
const loginStatus = document.querySelector("[data-login-status]");
const forgotForm = document.querySelector("[data-forgot-form]");
const forgotStatus = document.querySelector("[data-forgot-status]");
const resetForm = document.querySelector("[data-reset-form]");
const resetStatus = document.querySelector("[data-reset-status]");
const paymentForm = document.querySelector("[data-payment-form]");
const paymentStatus = document.querySelector("[data-payment-status]");
const guestLinks = [...document.querySelectorAll("[data-guest-link]")];
const authLinks = [...document.querySelectorAll("[data-auth-link]")];
const adminLinks = [...document.querySelectorAll("[data-admin-link]")];
const logoutButton = document.querySelector("[data-logout-button]");
const gallery = document.querySelector("[data-gallery]");
const lightbox = document.querySelector("[data-lightbox]");
const year = document.querySelector("[data-year]");

year.textContent = new Date().getFullYear();

const SUPABASE_URL = "https://dwjodjrwoubuyefpxwpm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_ZCr12Hb5lkEbrkKSi97PTQ_qtLcHSkg";
const supabaseClient = window.supabase?.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

let currentSession = null;
let currentProfile = null;
let isAuthReady = false;

const routes = {
  "/": { id: "home" },
  "/home": { id: "home" },
  "/about": { id: "about" },
  "/ministries": { id: "ministries" },
  "/sermons": { id: "sermons" },
  "/events": { id: "events" },
  "/portal": { id: "portal" },
  "/login": { id: "login", guestOnly: true },
  "/signup": { id: "signup", guestOnly: true },
  "/forgot-password": { id: "forgot-password", guestOnly: true },
  "/reset-password": { id: "reset-password" },
  "/dashboard": { id: "dashboard", protected: true },
  "/admin": { id: "admin", protected: true, roles: ["admin", "leader"] },
  "/gallery": { id: "gallery" },
  "/give": { id: "give" },
  "/prayer": { id: "prayer" },
  "/contact": { id: "contact" },
  "/member": { id: "login", guestOnly: true }
};

function getRoute() {
  const rawRoute = window.location.hash.replace("#", "") || "/home";
  const route = rawRoute.split("?")[0];
  return route.startsWith("/") ? route : `/${route}`;
}

function setRoute(route) {
  window.location.hash = route;
}

function getRole() {
  return currentProfile?.role || "member";
}

function getDefaultAuthedRoute() {
  return ["admin", "leader"].includes(getRole()) ? "/admin" : "/dashboard";
}

function closeMobileMenu() {
  menu.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
  header.classList.remove("menu-open");
}

function updateHeader() {
  header.classList.toggle("is-scrolled", window.scrollY > 16);
}

function updateNavbar() {
  const isSignedIn = Boolean(currentSession);
  guestLinks.forEach((link) => {
    link.hidden = isSignedIn;
  });
  authLinks.forEach((link) => {
    link.hidden = !isSignedIn;
  });
  adminLinks.forEach((link) => {
    link.hidden = !isSignedIn || !["admin", "leader"].includes(getRole());
  });
  logoutButton.hidden = !isSignedIn;
}

function updateDashboard() {
  const user = currentSession?.user;
  const fullName = currentProfile?.full_name || user?.user_metadata?.full_name || "Member";
  const email = currentProfile?.email || user?.email || "Signed in member";
  const role = getRole();
  const dashboardTitle = document.querySelector("[data-dashboard-title]");
  const dashboardCopy = document.querySelector("[data-dashboard-copy]");
  const profileName = document.querySelector("[data-profile-name]");
  const profileEmail = document.querySelector("[data-profile-email]");
  const profileRole = document.querySelector("[data-profile-role]");

  if (dashboardTitle) dashboardTitle.textContent = `Welcome, ${fullName}`;
  if (dashboardCopy) dashboardCopy.textContent = `Your current role is ${role}. This protected route is only visible after login.`;
  if (profileName) profileName.textContent = fullName;
  if (profileEmail) profileEmail.textContent = email;
  if (profileRole) profileRole.textContent = `Role: ${role}`;
}

async function loadProfile() {
  if (!supabaseClient || !currentSession?.user) {
    currentProfile = null;
    updateNavbar();
    updateDashboard();
    return;
  }

  const { data, error } = await supabaseClient
    .from("profiles")
    .select("id, full_name, email, phone, role, ministry")
    .eq("id", currentSession.user.id)
    .single();

  currentProfile = error ? null : data;
  updateNavbar();
  updateDashboard();
}

function navigateToRoute() {
  const routePath = getRoute();
  const route = routes[routePath] || routes["/home"];

  if (route.protected && isAuthReady && !currentSession) {
    setRoute("/login");
    return;
  }

  if (route.protected && route.roles && currentSession) {
    const isAllowed = route.roles.includes(getRole());
    if (!isAllowed) {
      setRoute("/dashboard");
      return;
    }
  }

  if (route.guestOnly && isAuthReady && currentSession) {
    setRoute(getDefaultAuthedRoute());
    return;
  }

  const target = document.getElementById(route.id);
  if (!target) return;

  target.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function refreshSession() {
  if (!supabaseClient) {
    isAuthReady = true;
    updateNavbar();
    navigateToRoute();
    return;
  }

  const { data } = await supabaseClient.auth.getSession();
  currentSession = data.session;
  await loadProfile();
  isAuthReady = true;
  navigateToRoute();
}

async function writeAuditLog(action, metadata = {}) {
  if (!supabaseClient || !currentSession?.user) return;

  await supabaseClient.from("audit_logs").insert({
    user_id: currentSession.user.id,
    action,
    entity_type: "auth",
    metadata
  });
}

window.addEventListener("scroll", updateHeader, { passive: true });
window.addEventListener("hashchange", navigateToRoute);
updateHeader();

menuToggle.addEventListener("click", () => {
  const isOpen = menu.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  header.classList.toggle("menu-open", isOpen);
});

menu.addEventListener("click", (event) => {
  if (event.target.matches("a, button")) {
    closeMobileMenu();
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

signupForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!supabaseClient) {
    signupStatus.textContent = "Supabase could not load. Please check your internet connection and try again.";
    return;
  }

  const formData = new FormData(signupForm);
  const fullName = String(formData.get("full_name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const password = String(formData.get("password") || "");

  signupStatus.textContent = "Creating your member account...";
  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone
      },
      emailRedirectTo: `${window.location.origin}${window.location.pathname}#/login`
    }
  });

  if (error) {
    signupStatus.textContent = error.message;
    return;
  }

  signupForm.reset();
  if (data.session) {
    currentSession = data.session;
    await loadProfile();
    signupStatus.textContent = "Registration successful. Redirecting to your dashboard...";
    setRoute(getDefaultAuthedRoute());
    return;
  }

  signupStatus.textContent = "Registration received. Please check your email to confirm your account.";
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!supabaseClient) {
    loginStatus.textContent = "Supabase could not load. Please check your internet connection and try again.";
    return;
  }

  const formData = new FormData(loginForm);
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  loginStatus.textContent = "Signing you in...";
  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

  if (error) {
    loginStatus.textContent = error.message;
    return;
  }

  currentSession = data.session;
  await loadProfile();
  await writeAuditLog("member_logged_in", { email });
  loginForm.reset();
  loginStatus.textContent = "Login successful. Redirecting...";
  setRoute(getDefaultAuthedRoute());
});

forgotForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!supabaseClient) {
    forgotStatus.textContent = "Supabase could not load. Please check your internet connection and try again.";
    return;
  }

  const formData = new FormData(forgotForm);
  const email = String(formData.get("email") || "").trim();

  forgotStatus.textContent = "Sending password reset link...";
  const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}${window.location.pathname}#/reset-password`
  });

  if (error) {
    forgotStatus.textContent = error.message;
    return;
  }

  forgotForm.reset();
  forgotStatus.textContent = "Password reset link sent. Please check your email.";
});

resetForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!supabaseClient) {
    resetStatus.textContent = "Supabase could not load. Please check your internet connection and try again.";
    return;
  }

  const formData = new FormData(resetForm);
  const password = String(formData.get("password") || "");

  resetStatus.textContent = "Updating password...";
  const { error } = await supabaseClient.auth.updateUser({ password });

  if (error) {
    resetStatus.textContent = error.message;
    return;
  }

  resetForm.reset();
  await writeAuditLog("member_password_updated", { email: currentSession?.user?.email });
  resetStatus.textContent = "Password updated. Redirecting to your dashboard...";
  setRoute(getDefaultAuthedRoute());
});

logoutButton.addEventListener("click", async () => {
  if (supabaseClient) {
    await writeAuditLog("member_logged_out", { email: currentSession?.user?.email });
    await supabaseClient.auth.signOut();
  }

  currentSession = null;
  currentProfile = null;
  updateNavbar();
  updateDashboard();
  setRoute("/login");
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

if (supabaseClient) {
  supabaseClient.auth.onAuthStateChange(async (event, session) => {
    currentSession = session;
    if (event === "PASSWORD_RECOVERY") {
      await loadProfile();
      isAuthReady = true;
      setRoute("/reset-password");
      return;
    }

    if (event === "SIGNED_OUT") {
      currentProfile = null;
      updateNavbar();
      updateDashboard();
      navigateToRoute();
      return;
    }

    await loadProfile();
    navigateToRoute();
  });
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js");
  });
}

window.addEventListener("load", () => {
  if (!window.location.hash) {
    history.replaceState(null, "", "#/home");
  }
  refreshSession();
});

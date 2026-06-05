# Embakasi Vosh Church PWA

A mobile-first Progressive Web App for Embakasi Vosh Church with offline caching, installable app manifest, responsive navigation, hero carousel, sermons, events, giving, prayer requests, gallery, and contact sections.

The current version is a static PWA prototype. The recommended production platform architecture is documented in `PLATFORM_ARCHITECTURE.md`.

## Run locally

Use any static server from this folder. For example:

```powershell
python -m http.server 4173
```

Then open `http://localhost:4173`.

Service workers require a local server or HTTPS, so opening `index.html` directly will show the site but will not fully enable offline PWA behavior.

## Hash routes

The app uses hash routing so it can be hosted on static servers without rewrite rules:

- `#/home`
- `#/about`
- `#/ministries`
- `#/sermons`
- `#/events`
- `#/portal`
- `#/gallery`
- `#/give`
- `#/prayer`
- `#/contact`

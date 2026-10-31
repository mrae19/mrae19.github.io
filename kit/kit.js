/* ============================================================
   STUDIO KIT — kit.js   (runtime)
   Reads window.SITE (set by /site/site.config.js) and renders
   the shared chrome: topbar, nav, footer, alert banner, mobile
   action bar. Plus analytics, nav behaviour, scroll-reveal and
   the contact-form handler.

   Load order in every page, at the end of <body>:
     <script src="/site/site.config.js"></script>
     <script src="/kit/kit.js"></script>

   Never edit this file per-project. Behaviour is driven by
   window.SITE; look-and-feel by /site/theme.css.
   ============================================================ */
(function () {
  "use strict";

  var S = window.SITE || {};
  if (!window.SITE) console.warn("[studio-kit] window.SITE is not defined — did /site/site.config.js load first?");

  var KIT_VERSION = "1.8.0";

  /* ---------- helpers ------------------------------------- */
  function esc(v) {
    return String(v == null ? "" : v)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function telHref(p) { return "tel:" + String(p || "").replace(/[^0-9+]/g, ""); }
  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }
  var ICON = {
    phone: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.71 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l.95-.95a2 2 0 0 1 2.11-.45c.91.35 1.85.58 2.81.71A2 2 0 0 1 22 17z"/></svg>',
    mail: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
    instagram: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>',
    facebook: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>',
    chevron: '<svg class="nav-chevron" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',
    linkedin: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05C20.4 8.65 22 10.9 22 14.3V21h-4v-6c0-1.43-.03-3.27-2-3.27-2 0-2.3 1.56-2.3 3.17V21H9z"/></svg>',
    x: '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 2H22l-7.5 8.6L23 22h-6.8l-5.3-6.9L4.8 22H1.7l8-9.2L1 2h7l4.8 6.3zM17.7 20h1.7L6.4 3.9H4.6z"/></svg>',
    twitter: '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 2H22l-7.5 8.6L23 22h-6.8l-5.3-6.9L4.8 22H1.7l8-9.2L1 2h7l4.8 6.3zM17.7 20h1.7L6.4 3.9H4.6z"/></svg>',
    github: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48l-.01-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.1-1.47-1.1-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85l-.01 2.75c0 .27.18.58.69.48A10 10 0 0 0 12 2z"/></svg>',
    youtube: '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M23 12s0-3.2-.4-4.7c-.23-.83-.9-1.48-1.73-1.7C19.34 5.2 12 5.2 12 5.2s-7.34 0-8.87.4c-.83.22-1.5.87-1.73 1.7C1 8.8 1 12 1 12s0 3.2.4 4.7c.23.83.9 1.48 1.73 1.7 1.53.4 8.87.4 8.87.4s7.34 0 8.87-.4c.83-.22 1.5-.87 1.73-1.7.4-1.5.4-4.7.4-4.7zM9.75 15.02V8.98L15.5 12z"/></svg>',
    medium: '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M4.37 7.3c.02-.2-.05-.4-.2-.53L2.6 4.96V4.7h5.03l3.88 8.52 3.42-8.52H23v.26l-1.5 1.44c-.13.1-.2.27-.17.43v10.8c-.03.16.04.33.17.43l1.46 1.44v.26h-7.34v-.26l1.5-1.47c.16-.16.16-.2.16-.44V8.4l-4.2 10.66h-.56L7.3 8.4v7.15c-.04.32.06.63.28.86l1.96 2.38v.26H4.2v-.26l1.96-2.38c.22-.23.32-.55.27-.87z"/></svg>',
    behance: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8.2 5.5c1.9 0 3.3.9 3.3 2.9 0 1.1-.5 1.9-1.5 2.4 1.3.4 2 1.4 2 2.9 0 2.2-1.8 3.3-3.9 3.3H2V5.5zM4.6 10.3h3c1 0 1.6-.5 1.6-1.4 0-1-.7-1.4-1.7-1.4H4.6zm0 4.9h3.2c1 0 1.7-.5 1.7-1.5s-.7-1.5-1.8-1.5H4.6zM19 8.3c2.3 0 3.8 1.7 3.8 4.2 0 .2 0 .4-.03.6h-6c.1 1.3.9 2 2.1 2 .9 0 1.5-.4 1.8-1h2c-.5 1.7-1.9 2.7-3.9 2.7-2.5 0-4.1-1.7-4.1-4.3S16.4 8.3 19 8.3zm-2.1 3.4h3.9c-.1-1.1-.8-1.8-1.9-1.8s-1.8.7-2 1.8zM15.5 6.5h4.9v1.2h-4.9z"/></svg>',
    dribbble: '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm6.6 4.6a8.3 8.3 0 0 1 1.9 5.2c-.3-.06-3-.6-5.8-.26-.1-.28-.2-.56-.33-.85 3-1.2 4.2-2.9 4.2-3zm-1.2-1.35c-.1.16-1.2 1.8-4.1 2.86A31 31 0 0 0 10 4.3a8.3 8.3 0 0 1 7.4.95zM8.3 5A31 31 0 0 1 11.5 9C7.7 10 4.5 10 4.1 10a8.3 8.3 0 0 1 4.2-5zM3.7 12v-.26c.4 0 4.2.06 8.2-1.14.24.45.45.9.65 1.37-3.9 1.1-6.4 4.4-6.6 4.7A8.3 8.3 0 0 1 3.7 12zm2.9 6.4c.15-.3 1.9-3.6 6.1-5 1.5 3.8 2.1 7 2.2 7.4a8.3 8.3 0 0 1-8.3-2.4zm10 1.5c-.1-.5-.6-3.6-2-7.3 2.7-.4 5 .3 5.3.4a8.3 8.3 0 0 1-3.4 6.9z"/></svg>',
    close: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    calendar: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    phoneLg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.71 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l.95-.95a2 2 0 0 1 2.11-.45c.91.35 1.85.58 2.81.71A2 2 0 0 1 22 17z"/></svg>'
  };

  var SOCIAL_URL = {
    instagram: function (h) { return "https://www.instagram.com/" + h + "/"; },
    facebook:  function (h) { return "https://www.facebook.com/" + h + "/"; },
    linkedin:  function (h) { return /^https?:/.test(h) ? h : "https://www.linkedin.com/in/" + h + "/"; },
    x:         function (h) { return "https://x.com/" + h; },
    twitter:   function (h) { return "https://x.com/" + h; },
    github:    function (h) { return "https://github.com/" + h; },
    youtube:   function (h) { return /^https?:/.test(h) ? h : "https://www.youtube.com/@" + h; },
    medium:    function (h) { return /^https?:/.test(h) ? h : "https://medium.com/@" + h; },
    behance:   function (h) { return "https://www.behance.net/" + h; },
    dribbble:  function (h) { return "https://dribbble.com/" + h; }
  };

  /* Some social keys carry a full URL (or a handle that maps cleanly);
     anything not in SOCIAL_URL is treated as an already-complete href. */
  function socialHref(key, val) {
    return SOCIAL_URL[key] ? SOCIAL_URL[key](val) : val;
  }

  /* ============================================================
     ANALYTICS
     ============================================================ */
  (function analytics() {
    if (window.__KIT_PRERENDER) return;
    var a = S.analytics || {};
    if (a.vercel !== false) {
      var v = document.createElement("script");
      v.defer = true; v.src = "/_vercel/insights/script.js";
      document.head.appendChild(v);
    }
    if (a.ga4) {
      var g = document.createElement("script");
      g.async = true; g.src = "https://www.googletagmanager.com/gtag/js?id=" + a.ga4;
      document.head.appendChild(g);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag("js", new Date());
      window.gtag("config", a.ga4);
    }
  })();

  function track(name, params) {
    if (typeof window.gtag === "function") window.gtag("event", name, params || {});
  }
  function pageSlug() {
    var p = location.pathname.replace(/index\.html$/, "").replace(/\.html$/, "");
    var parts = p.split("/").filter(Boolean);
    return parts.length ? parts[parts.length - 1] : "home";
  }
  function inferLocation(el) {
    if (el.closest(".cta-banner")) return "cta_banner";
    if (el.closest(".hero, .page-hero")) return "hero";
    if (el.closest(".detail-sidebar, .sidebar-card")) return "sidebar";
    if (el.closest(".mobile-action-bar")) return "floating_bar";
    if (el.closest(".topbar")) return "topbar";
    if (el.closest(".site-header")) return "header";
    if (el.closest(".site-footer")) return "footer";
    return "body";
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href]");
    if (!a) return;
    var href = a.getAttribute("href") || "";
    var loc = a.getAttribute("data-ga-location") || inferLocation(a);
    var page = pageSlug();
    if (href.indexOf("tel:") === 0)    { track("phone_call_click", { location: loc, page: page }); return; }
    if (href.indexOf("mailto:") === 0) { track("email_click",       { location: loc, page: page }); return; }
    var url; try { url = new URL(href, location.href); } catch (err) { return; }
    if (url.hostname === location.hostname) {
      var isBook = a.getAttribute("data-ga") === "book" || /book/i.test(a.textContent || "");
      if (isBook) track("book_click", { method: "internal", page: page, location: loc });
      return;
    }
    track("outbound_click", { link_url: url.href, location: loc });
  }, true);

  /* ============================================================
     MARKUP BUILDERS
     ============================================================ */
  function buildTopbar() {
    var addr = S.address || {};
    var line = [addr.street, addr.city && (addr.city + ", " + (addr.region || "")), addr.postal]
      .filter(Boolean).join(" · ");
    var socials = Object.keys(S.socials || {}).map(function (k) {
      var u = SOCIAL_URL[k] ? SOCIAL_URL[k](S.socials[k]) : S.socials[k];
      return '<a href="' + esc(u) + '" target="_blank" rel="noopener" aria-label="' + esc(k) + '">' +
        (ICON[k] || "") + " " + esc(k.charAt(0).toUpperCase() + k.slice(1)) + "</a>";
    }).join("");
    return '' +
      '<div class="topbar">' +
        '<div class="topbar-left">' +
          (S.phone ? '<a href="' + telHref(S.phone) + '">' + ICON.phone + " " + esc(S.phone) + "</a>" : "") +
          (S.email ? '<a href="mailto:' + esc(S.email) + '">' + ICON.mail + " " + esc(S.email) + "</a>" : "") +
        '</div>' +
        (line ? '<div class="topbar-center">' + esc(line) + "</div>" : "") +
        '<div class="topbar-right">' + socials + "</div>" +
      "</div>";
  }

  function logoMarkup(forFooter) {
    var l = S.logo || {};
    if (l.img) return '<img src="' + esc(l.img) + '" alt="' + esc(S.name || "") + '" class="' +
      (forFooter ? "footer-logo-img" : "nav-logo-img") + '" />';
    return '<span class="' + (forFooter ? "footer-logo-text" : "nav-logo-text") + '">' +
      esc(S.short || S.name || "") + "</span>";
  }

  function navItemMarkup(item) {
    if (item.menu) {
      // compact single-column dropdown: nav: [{ label, href, menu: [{label, href}, …] }]
      var mlinks = (item.menu || []).map(function (lk) {
        return '<a href="' + esc(lk.href) + '">' + esc(lk.label) + "</a>";
      }).join("");
      return '<li class="nav-has-dropdown">' +
        '<div class="nav-dropdown-toggle">' +
          '<a href="' + esc(item.href || (item.menu[0] || {}).href || "#") + '" class="nav-dropdown-link">' + esc(item.label) + "</a>" +
          '<button class="nav-chevron-btn" aria-label="Toggle ' + esc(item.label) + ' menu" aria-expanded="false">' + ICON.chevron + "</button>" +
        "</div>" +
        '<div class="nav-dropdown nav-dropdown--compact">' + mlinks + "</div></li>";
    }
    if (item.dropdown) {
      var cols = item.dropdown.map(function (col) {
        return '<div class="nav-dropdown-col">' +
          (col.heading ? '<span class="nav-dropdown-heading">' + esc(col.heading) + "</span>" : "") +
          (col.links || []).map(function (lk) {
            return '<a href="' + esc(lk.href) + '">' + esc(lk.label) + "</a>";
          }).join("") + "</div>";
      }).join("");
      return '<li class="nav-has-dropdown">' +
        '<div class="nav-dropdown-toggle">' +
          '<a href="' + esc(item.href) + '" class="nav-dropdown-link">' + esc(item.label) + "</a>" +
          '<button class="nav-chevron-btn" aria-label="Toggle ' + esc(item.label) + ' menu" aria-expanded="false">' + ICON.chevron + "</button>" +
        "</div>" +
        '<div class="nav-dropdown"><div class="nav-dropdown-inner">' + cols + "</div>" +
          (item.footerLink ? '<div class="nav-dropdown-footer"><a href="' + esc(item.footerLink.href) + '">' + esc(item.footerLink.label) + "</a></div>" : "") +
        "</div></li>";
    }
    return '<li><a href="' + esc(item.href) + '">' + esc(item.label) + "</a></li>";
  }

  function buildNav() {
    var cta = S.cta || { label: "Contact", href: "/contact" };
    var items = (S.nav || []).map(navItemMarkup).join("");
    return '' +
      '<header class="site-header" id="site-header"><nav class="nav-inner">' +
        '<a href="/" class="nav-logo" aria-label="' + esc(S.name || "Home") + '">' + logoMarkup(false) + "</a>" +
        '<button class="nav-toggle" aria-label="Open menu" id="nav-toggle"><span></span><span></span><span></span></button>' +
        '<ul class="nav-links" id="nav-links">' +
          '<li class="mobile-nav-bar">' +
            '<a href="/" class="nav-logo">' + logoMarkup(false) + "</a>" +
            '<button class="nav-toggle open" id="nav-close" aria-label="Close menu"><span></span><span></span><span></span></button>' +
          "</li>" +
          items +
          '<li><a href="' + esc(cta.href) + '" class="nav-cta" data-ga="book">' + esc(cta.label) + "</a></li>" +
        "</ul>" +
      "</nav></header>";
  }

  function buildFooter() {
    var addr = S.address || {};
    var socials = Object.keys(S.socials || {}).map(function (k) {
      var u = SOCIAL_URL[k] ? SOCIAL_URL[k](S.socials[k]) : S.socials[k];
      return '<a href="' + esc(u) + '" target="_blank" rel="noopener" aria-label="' + esc(k) + '">' + (ICON[k] || "") + "</a>";
    }).join("");
    var navLinks = (S.nav || []).concat(S.footerNav || []).map(function (i) {
      return '<li><a href="' + esc(i.href) + '">' + esc(i.label) + "</a></li>";
    }).join("");
    var hours = (S.hours || []).map(function (r) {
      return '<div class="footer-hours-row' + (/closed/i.test(r.time) ? " closed" : "") + '"><span>' +
        esc(r.days) + "</span><span>" + esc(r.time) + "</span></div>";
    }).join("");
    var addrLine = [addr.street, [addr.city, addr.region].filter(Boolean).join(", ") + " " + (addr.postal || "")]
      .filter(function (s) { return s && s.trim(); }).join("<br>");
    return '' +
      '<footer class="site-footer"><div class="footer-grid">' +
        '<div class="footer-brand">' + logoMarkup(true) +
          (S.footerBlurb ? "<p>" + esc(S.footerBlurb) + "</p>" : "") +
          (socials ? '<div class="footer-social">' + socials + "</div>" : "") +
        "</div>" +
        '<div class="footer-col"><h4>Navigate</h4><ul><li><a href="/">Home</a></li>' + navLinks + "</ul></div>" +
        '<div class="footer-col"><h4>Contact</h4>' +
          (S.phone ? '<p><a href="' + telHref(S.phone) + '">' + esc(S.phone) + "</a></p>" : "") +
          (S.fax ? "<p>Fax: " + esc(S.fax) + "</p>" : "") +
          (S.email ? '<p><a href="mailto:' + esc(S.email) + '">' + esc(S.email) + "</a></p>" : "") +
          (addrLine ? '<p style="margin-top:0.75rem">' + addrLine + "</p>" : "") +
        "</div>" +
        (hours ? '<div class="footer-col"><h4>Hours</h4>' + hours + "</div>" : "<div class=\"footer-col\"></div>") +
      "</div>" +
      '<div class="footer-bottom">' +
        "<p>&copy; " + new Date().getFullYear() + " " + esc(S.name || "") + ". All rights reserved.</p>" +
        (addr.city ? "<p>" + esc([addr.city, addr.region].filter(Boolean).join(", ")) + "</p>" : "") +
      "</div></footer>";
  }

  /* ============================================================
     ALERT BANNER
     ============================================================ */
  function renderAlert() {
    var A = S.alert;
    if (!A || !A.enabled) return;
    try { if (sessionStorage.getItem(A.dismissKey || "kit-alert")) return; } catch (e) {}
    var linkHTML = A.link
      ? '<a href="' + esc(A.link.url) + '" class="alert-banner-link"' +
        (A.link.external ? ' target="_blank" rel="noopener"' : "") + ">" + esc(A.link.label) + "</a>"
      : "";
    var banner = document.createElement("div");
    banner.className = "alert-banner alert-banner--" + (A.type || "info");
    banner.setAttribute("role", "region");
    banner.setAttribute("aria-label", "Announcement");
    banner.innerHTML =
      '<div class="alert-banner-inner">' +
        (A.icon ? '<span class="alert-banner-icon" aria-hidden="true">' + A.icon + "</span>" : "") +
        '<p class="alert-banner-msg">' + A.message + (linkHTML ? " " + linkHTML : "") + "</p>" +
      "</div>" +
      '<button class="alert-banner-close" aria-label="Dismiss announcement">' + ICON.close + "</button>";
    var anchor = document.getElementById("topbar-mount") || document.body.firstChild;
    anchor.parentNode.insertBefore(banner, anchor);
    banner.querySelector(".alert-banner-close").addEventListener("click", function () {
      banner.style.maxHeight = banner.scrollHeight + "px";
      requestAnimationFrame(function () { banner.classList.add("alert-banner--dismissed"); });
      banner.addEventListener("transitionend", function () { banner.remove(); }, { once: true });
      try { sessionStorage.setItem(A.dismissKey || "kit-alert", "1"); } catch (e) {}
    });
  }

  /* ============================================================
     MOBILE QUICK-ACTION BAR
     ============================================================ */
  function renderMobileBar() {
    var f = S.flags || {};
    if (f.mobileActionBar === false) return;
    var cta = S.cta || { label: "Contact", href: "/contact" };
    var onCTA = new RegExp(cta.href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(\\.html)?$").test(location.pathname);
    var bar = document.createElement("div");
    bar.className = "mobile-action-bar" + (onCTA ? " mab-single" : "");
    bar.setAttribute("role", "navigation");
    bar.setAttribute("aria-label", "Quick actions");
    var call = S.phone
      ? '<a href="' + telHref(S.phone) + '" class="mab-btn mab-call" data-ga-location="floating_bar">' + ICON.phoneLg + (onCTA ? "Call Now" : "Call Us") + "</a>"
      : "";
    var book = '<a href="' + esc(cta.href) + '" class="mab-btn mab-book" data-ga="book" data-ga-location="floating_bar">' + ICON.calendar + esc(cta.label) + "</a>";
    bar.innerHTML = onCTA ? call : call + book;
    document.body.appendChild(bar);
  }

  /* ============================================================
     NAV BEHAVIOUR
     ============================================================ */
  function wireNav() {
    var path = window.location.pathname.replace(/index\.html$/, "").replace(/\.html$/, "") || "/";
    document.querySelectorAll(".nav-links a:not(.nav-cta)").forEach(function (link) {
      var href = (link.getAttribute("href") || "").replace(/\.html$/, "");
      if (href === "/" ? path === "/" : (href.length > 1 && path.indexOf(href) === 0)) link.classList.add("active");
    });

    var toggle = document.getElementById("nav-toggle");
    var links = document.getElementById("nav-links");
    var close = document.getElementById("nav-close");
    function setOpen(open) {
      links.classList.toggle("open", open);
      toggle.classList.toggle("open", open);
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }
    if (toggle && links) toggle.addEventListener("click", function () { setOpen(!links.classList.contains("open")); });
    if (close) close.addEventListener("click", function () { setOpen(false); });
    document.querySelectorAll(".nav-links a").forEach(function (a) {
      a.addEventListener("click", function () { setOpen(false); });
    });

    document.querySelectorAll(".nav-chevron-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (window.getComputedStyle(toggle).display !== "none") {
          var li = this.closest(".nav-has-dropdown");
          var isOpen = li.classList.toggle("open");
          this.setAttribute("aria-expanded", String(isOpen));
        }
      });
    });

    var header = document.getElementById("site-header");
    if (header) {
      var onScroll = function () { header.classList.toggle("scrolled", window.scrollY > 10); };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }
  }

  /* ============================================================
     SCROLL-REVEAL
     ============================================================ */
  function wireReveal() {
    document.body.classList.add("js-ready");
    if (!("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in-view"); io.unobserve(e.target); }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll(
      ".feature-card, .testimonial-card, .checklist-item, .team-card, .faq-item"
    ).forEach(function (el) { el.classList.add("fade-in"); io.observe(el); });
  }

  /* ============================================================
     CONTACT FORM
     ============================================================ */
  function wireForm() {
    var form = document.getElementById("contact-form");
    if (!form) return;
    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      var original = btn.textContent;
      btn.textContent = "Sending…"; btn.disabled = true;
      var data = Object.fromEntries(new FormData(form));
      try {
        var res = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });
        if (!res.ok) {
          var detail = "";
          try { detail = JSON.stringify(await res.clone().json()); }
          catch (x) { detail = await res.clone().text().catch(function () { return ""; }); }
          console.error("[contact form] submit failed —", res.status, res.statusText, detail);
          throw new Error("Server error");
        }
        track("generate_lead", {
          method: "contact_form",
          service_interest: data.service || "(not specified)",
          coverage: data.coverage || "(not specified)"
        });
        btn.textContent = "Message Sent!";
        btn.style.background = "#2a7a4b"; btn.style.borderColor = "#2a7a4b";
        form.reset();
        setTimeout(function () {
          btn.textContent = original; btn.disabled = false;
          btn.style.background = ""; btn.style.borderColor = "";
        }, 4000);
      } catch (err) {
        btn.textContent = S.phone ? "Error — please call us" : "Couldn't send. Email " + (S.email || "us");
        btn.style.background = "#c0392b"; btn.style.borderColor = "#c0392b";
        setTimeout(function () {
          btn.textContent = original; btn.disabled = false;
          btn.style.background = ""; btn.style.borderColor = "";
        }, 4000);
      }
    });
  }

  /* ============================================================
     PERSON / PROFILE SCHEMA  (personal-brand sites)
     If SITE.person is set, emit ONE consistent Person + ProfilePage
     JSON-LD block into <head> on every page. Brochure/clinic sites
     just omit SITE.person and this is a no-op.
     ============================================================ */
  /* personGraph(pageUrl, isHome) returns the JSON-LD object. It is shared by the
     runtime injection below and by kit/prerender.mjs, which writes the same block
     into each page's <head> so crawlers that don't run JavaScript still see it. */
  function personGraph(pageUrl, isHome) {
    var p = S.person;
    if (!p || !p.name) return null;
    var origin = "https://" + (S.domain || location.hostname);
    var person = {
      "@type": "Person",
      "@id": origin + "/#person",
      "name": p.name,
      "url": p.url || (origin + "/")
    };
    if (p.jobTitle) person.jobTitle = p.jobTitle;
    if (p.worksFor) person.worksFor = { "@type": "Organization", "name": p.worksFor };
    if (p.image) person.image = /^https?:/.test(p.image) ? p.image : origin + p.image;
    if (p.description) person.description = p.description;
    var same = (p.sameAs || []).slice();
    Object.keys(S.socials || {}).forEach(function (k) {
      var u = socialHref(k, S.socials[k]);
      if (u && same.indexOf(u) === -1) same.push(u);
    });
    if (same.length) person.sameAs = same;
    var graph = { "@context": "https://schema.org", "@graph": [person] };
    if (isHome) {
      graph["@graph"].push({
        "@type": "WebSite",
        "@id": origin + "/#website",
        "url": origin + "/",
        "name": S.name || p.name,
        "publisher": { "@id": origin + "/#person" }
      });
    }
    /* person.profilePages: optional list of paths that are "about the person"
       (e.g. ["/", "/about"]). Default: every page gets a ProfilePage node. */
    var path = pageUrl.replace(/^https?:\/\/[^\/]+/, "").replace(/\/$/, "") || "/";
    var onProfile = Array.isArray(p.profilePages) ? p.profilePages.indexOf(path) !== -1 : true;
    if (p.profilePage !== false && onProfile) {
      graph["@graph"].push({
        "@type": "ProfilePage",
        "url": pageUrl,
        "mainEntity": { "@id": origin + "/#person" }
      });
    }
    return graph;
  }

  function injectPersonSchema() {
    if (document.querySelector('script[data-kit-schema="person"]')) return;
    var path = location.pathname.replace(/index\.html$/, "");
    var graph = personGraph(location.href.split("#")[0].split("?")[0], path === "/");
    if (!graph) return;
    var el = document.createElement("script");
    el.type = "application/ld+json";
    el.setAttribute("data-kit-schema", "person");
    el.textContent = JSON.stringify(graph);
    document.head.appendChild(el);
  }

  /* ============================================================
     BLOG — category filter for HAND-WRITTEN static cards.
     If /kit/blog.js is loaded (manifest-driven index) it sets
     window.__kitBlogEngine and this stands down.
     Needs: #blog-grid, .blog-filter-btn[data-filter],
     .blog-card[data-category], optional #blog-empty.
     ============================================================ */
  function wireBlog() {
    if (window.__kitBlogEngine) return;
    var grid = document.getElementById("blog-grid");
    if (!grid) return;
    var btns  = document.querySelectorAll(".blog-filter-btn");
    var cards = grid.querySelectorAll(".blog-card");
    var empty = document.getElementById("blog-empty");
    btns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        btns.forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        var f = btn.getAttribute("data-filter");
        var shown = 0;
        cards.forEach(function (card) {
          var show = f === "all" || card.getAttribute("data-category") === f;
          card.style.display = show ? "" : "none";
          if (show) shown++;
        });
        if (empty) empty.style.display = shown === 0 ? "block" : "none";
      });
    });
  }

  /* ============================================================
     LIGHTBOX — for [data-lightbox] image galleries (no-op elsewhere)
     Each trigger: <a data-lightbox href="full.jpg"
                      data-title="…" data-caption="…" data-meta="…"><img …></a>
     data-full overrides href for the full-size src. title / caption /
     meta are all optional — the caption block hides if none are set.
     ============================================================ */
  function wireLightbox() {
    var triggers = Array.prototype.slice.call(document.querySelectorAll("[data-lightbox]"));
    if (!triggers.length) return;
    var box = document.createElement("div");
    box.className = "kit-lightbox";
    box.setAttribute("aria-hidden", "true");
    box.innerHTML =
      '<button class="kit-lightbox-close" aria-label="Close">' + ICON.close + "</button>" +
      '<button class="kit-lightbox-nav kit-lightbox-prev" aria-label="Previous">‹</button>' +
      '<figure class="kit-lightbox-figure"><img alt="" />' +
        '<figcaption>' +
          '<span class="kit-lightbox-title"></span>' +
          '<span class="kit-lightbox-sub"></span>' +
          '<span class="kit-lightbox-meta"></span>' +
        '</figcaption>' +
      '</figure>' +
      '<button class="kit-lightbox-nav kit-lightbox-next" aria-label="Next">›</button>';
    document.body.appendChild(box);
    var img = box.querySelector("img");
    var cap = box.querySelector("figcaption");
    var titleEl = box.querySelector(".kit-lightbox-title");
    var subEl   = box.querySelector(".kit-lightbox-sub");
    var metaEl  = box.querySelector(".kit-lightbox-meta");
    var i = 0;
    function attr(t, n) { return (t.getAttribute(n) || "").trim(); }
    function srcFor(t) { return t.getAttribute("data-full") || t.getAttribute("href") || (t.querySelector("img") || {}).src; }
    function altFor(t) { return attr(t, "data-title") || attr(t, "data-caption") || (t.querySelector("img") || {}).alt || ""; }
    function setLine(el, text) { el.textContent = text; el.style.display = text ? "" : "none"; }
    function show(n) {
      i = (n + triggers.length) % triggers.length;
      var t = triggers[i];
      img.src = srcFor(t); img.alt = altFor(t);
      var title = attr(t, "data-title"), sub = attr(t, "data-caption"), meta = attr(t, "data-meta");
      setLine(titleEl, title); setLine(subEl, sub); setLine(metaEl, meta);
      cap.style.display = (title || sub || meta) ? "" : "none";
      box.classList.add("open"); box.setAttribute("aria-hidden", "false");
    }
    function close() { box.classList.remove("open"); box.setAttribute("aria-hidden", "true"); img.src = ""; }
    triggers.forEach(function (t, n) {
      t.addEventListener("click", function (e) { e.preventDefault(); show(n); });
    });
    box.querySelector(".kit-lightbox-close").addEventListener("click", close);
    box.querySelector(".kit-lightbox-prev").addEventListener("click", function () { show(i - 1); });
    box.querySelector(".kit-lightbox-next").addEventListener("click", function () { show(i + 1); });
    box.addEventListener("click", function (e) { if (e.target === box) close(); });
    document.addEventListener("keydown", function (e) {
      if (!box.classList.contains("open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(i - 1);
      if (e.key === "ArrowRight") show(i + 1);
    });
  }

  /* ============================================================
     NEWSLETTER  — <form id="newsletter-form"> on blog pages
     Reads SITE.newsletter = { action } (e.g. a Buttondown embed URL).
     No action set → the form renders disabled with a note.
     ============================================================ */
  function wireNewsletter() {
    var form = document.getElementById("newsletter-form");
    if (!form) return;
    var N = S.newsletter || {};
    var btn = form.querySelector('button[type="submit"]');
    var note = form.parentNode.querySelector(".newsletter-note");
    if (!N.action) {
      form.querySelectorAll("input, button").forEach(function (el) { el.disabled = true; });
      if (note) note.textContent = "Email signup is coming soon.";
      return;
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (form.querySelector('[name="hp-email"]') && form.querySelector('[name="hp-email"]').value) return;
      var email = (form.querySelector('input[type="email"]') || {}).value || "";
      if (!email) return;
      var original = btn.textContent;
      btn.disabled = true; btn.textContent = "…";
      fetch(N.action, { method: "POST", mode: "no-cors", body: new FormData(form) })
        .catch(function () {})
        .finally(function () {
          track("newsletter_signup", {});
          form.innerHTML = '<p style="color:#fff;font-weight:600;">Thanks — check your inbox to confirm.</p>';
        });
      // fallback if fetch hangs
      setTimeout(function () {
        if (document.body.contains(btn)) { btn.disabled = false; btn.textContent = original; }
      }, 6000);
    });
  }

  /* ============================================================
     SHARE  — [data-copy-link] buttons copy the current URL
     ============================================================ */
  function wireShare() {
    document.querySelectorAll("[data-copy-link]").forEach(function (b) {
      b.addEventListener("click", function () {
        var url = location.href.split("#")[0];
        var done = function () { var t = b.textContent; b.textContent = "Copied"; setTimeout(function () { b.textContent = t; }, 1600); };
        if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, done);
        else { var i = document.createElement("input"); i.value = url; document.body.appendChild(i); i.select(); try { document.execCommand("copy"); } catch (e) {} i.remove(); done(); }
      });
    });
  }

  /* ============================================================
     HERO SLIDESHOW — slow elegant cross-fade between images
     Markup:  <div class="hero-bg" data-slideshow>
                <div class="hero-slide is-active" style="background-image:url(a.jpg)"></div>
                <div class="hero-slide" data-bg="b.jpg"></div>   ← lazy
                <div class="hero-slide" data-bg="c.jpg"></div> …
              </div>
     Give the FIRST slide an inline background-image so it paints
     immediately; the rest use data-bg and are loaded one ahead of
     the rotation — so a 10-image hero costs ~2 images at first paint.
     Optional: data-interval (ms, default 6500). CSS owns the fade.
     Honours prefers-reduced-motion (stays on slide 1) and pauses
     while the tab is hidden.
     ============================================================ */
  function wireHeroSlideshow() {
    var stage = document.querySelector(".hero-bg[data-slideshow]");
    if (!stage) return;
    var slides = stage.querySelectorAll(".hero-slide");

    function loadBg(n) {
      var s = slides[n];
      if (s && !s.style.backgroundImage && s.getAttribute("data-bg")) {
        s.style.backgroundImage = "url('" + s.getAttribute("data-bg") + "')";
      }
    }
    loadBg(0);
    if (slides.length < 2) return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    var interval = parseInt(stage.getAttribute("data-interval"), 10) || 6500;
    var i = 0, timer = null;
    Array.prototype.forEach.call(slides, function (s, n) { s.classList.toggle("is-active", n === 0); });
    loadBg(1);

    function advance() {
      slides[i].classList.remove("is-active");
      i = (i + 1) % slides.length;
      loadBg(i);
      loadBg((i + 1) % slides.length);
      slides[i].classList.add("is-active");
    }
    function start() { if (!timer) timer = setInterval(advance, interval); }
    function stop() { clearInterval(timer); timer = null; }

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop(); else start();
    });
    start();
  }

  /* ============================================================
     BOOT
     ============================================================ */
  /* Exposed for kit/prerender.mjs (static nav/footer/schema for non-JS crawlers). */
  window.__kitBuild = { topbar: buildTopbar, nav: buildNav, footer: buildFooter, personGraph: personGraph };
  if (window.__KIT_PRERENDER) return;

  ready(function () {
    var topbar = document.getElementById("topbar-mount");
    var header = document.getElementById("header-mount");
    var footer = document.getElementById("footer-mount");
    if (topbar) topbar.innerHTML = buildTopbar();
    if (header) header.innerHTML = buildNav();
    if (footer) footer.innerHTML = buildFooter();

    injectPersonSchema();
    renderAlert();
    renderMobileBar();
    wireNav();
    wireReveal();
    wireForm();
    wireBlog();
    wireNewsletter();
    wireShare();
    wireLightbox();
    wireHeroSlideshow();

    document.documentElement.setAttribute("data-kit", KIT_VERSION);
  });
})();

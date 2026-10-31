/* ============================================================
   SITE CONFIG — mattrae.ca
   The ONLY file with real-world facts in it. Everything the kit
   renders (topbar, nav, footer, mobile bar, analytics, Person
   JSON-LD) reads from this object. Plain browser script, no build.
   Load it BEFORE /kit/kit.js.
   ============================================================ */
window.SITE = {
  /* --- Identity ------------------------------------------- */
  name:   "Matt Rae",
  short:  "Matt Rae",
  domain: "mattrae.ca",

  /* --- Contact ------------------------------------------- */
  phone: "",                       // personal site — no phone
  email: "matt@mattrae.ca",

  /* --- Logo: the "M + maple leaf" mark (from the old site) -- */
  logo: { img: "/assets/logo.svg" },

  /* --- Primary call-to-action --------------------------- */
  cta: { label: "Get in Touch", href: "/contact" },

  /* --- Socials (kit builds the URL from the handle) ------ */
  socials: {
    linkedin:  "mattrae",
    x:         "mattraeca",
    instagram: "heymattrae",
    youtube:   "https://www.youtube.com/@mattraeca",
    medium:    "https://mattrae.medium.com/",
    behance:   "mattrae",
    dribbble:  "mattrae"
  },

  /* --- Navigation -------------------------------------- */
  /* Flat nav. Labels are human; the hrefs keep the old slugs
     (/gallery, /articles, /speaker) so existing search equity carries over. */
  nav: [
    { label: "About",        href: "/about" },
    { label: "Photography",  href: "/gallery" },
    { label: "Speaking",     href: "/speaker" },
    { label: "Writing",      href: "/articles" },
    { label: "Work with me", href: "/work-with-me" }
  ],

  /* Extra links for the footer "Navigate" column only (not the top nav). */
  footerNav: [
    { label: "FAQ",   href: "/faq" },
    { label: "Links", href: "/social" }
  ],

  /* RESTORE AFTER MAX — the full nav, once the blog and Lightroom hub relaunch.
     Swap this in for `nav` above, then unpark the pages and restore the sitemap
     markers (steps in CLAUDE.md under "After MAX").
  nav: [
    { label: "About",   href: "/about" },
    {
      label: "Content", href: "/blog/",
      menu: [
        { label: "Photography", href: "/gallery" },
        { label: "Blog",        href: "/blog/" },
        { label: "Lightroom",   href: "/lightroom" },
        { label: "Writing",     href: "/articles" },
        { label: "Speaking",    href: "/speaker" },
        { label: "Links",       href: "/social" }
      ]
    },
    {
      label: "Work with Me", href: "/work-with-me",
      menu: [
        { label: "Overview",             href: "/work-with-me" },
        { label: "Web design & build",   href: "/work-with-me/web" },
        { label: "Photography",          href: "/work-with-me/photography" },
        { label: "Workshops & training", href: "/work-with-me/workshops" }
      ]
    }
  ],
  */

  /* --- Footer blurb ---------------------------------- */
  footerBlurb: "Designer, photographer, and product manager in Canada. A decade building creative software — currently at Adobe — plus landscape and travel photography, speaking, and design, photo, and workshop work for hire.",

  /* --- Analytics ------------------------------------ */
  analytics: {
    vercel: false,   // GitHub Pages has no /_vercel/insights
    ga4:    ""                      // "G-XXXXXXX" — leave "" to disable
  },

  /* --- Announcement banner -------------------------- */
  alert: { enabled: false, dismissKey: "mr-alert-v1", type: "info", icon: "", message: "", link: null },

  /* --- Feature flags -------------------------------- */
  flags: {
    mobileActionBar: false          // no phone/booking urgency on a personal site
  },

  /* --- Newsletter (blog pages) ---------------------- */
  /* TODO: create a Buttondown account and set this to the embed URL:
     "https://buttondown.com/api/emails/embed-subscribe/<username>"
     Until then the signup form renders disabled ("coming soon"). */
  newsletter: {
    action: ""
  },

  /* --- Structured data hint ------------------------- */
  schema: { type: "Person" },

  /* --- Personal-brand entity ----------------------- */
  /* kit.js injects one consistent Person + ProfilePage JSON-LD
     block into <head> on every page, merging sameAs with socials. */
  person: {
    name:     "Matt Rae",
    jobTitle: "Senior Product Manager, Adobe",
    worksFor: "Adobe",
    url:      "https://mattrae.ca/",
    image:    "/assets/portrait.jpg",
    description: "Designer, photographer, and product manager in Canada. A decade building creative software, currently senior PM at Adobe on Photoshop and Lightroom; landscape and travel photographer; conference speaker; available for web design, photography, and workshops.",
    sameAs: [
      "https://www.linkedin.com/in/mattrae/",
      "https://x.com/mattraeca",
      "https://www.instagram.com/heymattrae/",
      "https://www.youtube.com/@mattraeca",
      "https://mattrae.medium.com/",
      "https://www.behance.net/mattrae",
      "https://dribbble.com/mattrae",
      "https://www.threads.net/@heymattrae"
    ],
    /* ProfilePage schema only on pages that are about Matt; every page still
       carries the Person node (kit/prerender.mjs writes it into the HTML). */
    profilePages: ["/", "/about", "/social"]
  }
};

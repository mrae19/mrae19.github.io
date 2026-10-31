/* ============================================================
   STUDIO KIT — blog.js   (blog engine, opt-in)
   Load AFTER kit.js, ONLY on blog pages:
     <script src="/kit/blog.js"></script>

   Single source of truth: /blog/posts.json
     { "posts": [ {
         "slug", "title", "date" (YYYY-MM-DD), "updated"?,
         "tags": [], "excerpt", "cover"?, "readingTime"? (min),
         "author"? , "draft"? (bool)
     } ] }

   On the index (#blog-grid present):
     - renders .blog-card list from posts.json (newest first)
     - builds tag filter chips (.blog-filters), supports ?tag=<slug>
   On a post page ([data-blog-related] and/or [data-blog-pager] present):
     - fills related posts (shared tags) and prev/next by date

   feed.xml + sitemap blog URLs are regenerated from posts.json by
   `node blog/gen.mjs` — see blog/HOWTO.md.
   ============================================================ */
(function () {
  "use strict";

  window.__kitBlogEngine = true;   // tells kit.js wireBlog() to stand down

  var PREVIEW = /(?:\?|&)preview\b/.test(location.search);

  function esc(v) {
    return String(v == null ? "" : v)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function slugify(s) { return String(s).toLowerCase().trim().replace(/[^\w]+/g, "-").replace(/^-|-$/g, ""); }
  function fmtDate(iso) {
    var d = new Date(iso + (iso.length === 10 ? "T12:00:00" : ""));
    if (isNaN(d)) return iso;
    return d.getDate() + " " + d.toLocaleString("en", { month: "short" }) + " " + d.getFullYear();
  }
  function initials(name) {
    return String(name || "").split(/\s+/).filter(Boolean).slice(0, 2).map(function (w) { return w[0]; }).join("").toUpperCase() || "•";
  }
  var THUMB_SVG = '<div class="blog-card-thumb-placeholder"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>';

  function cardHTML(p) {
    var url = "/blog/posts/" + p.slug + "/";
    var tagsAttr = (p.tags || []).map(slugify).join(" ");
    var primaryTag = (p.tags || [])[0] || "";
    var meta = [];
    if (p.author) meta.push('<span class="blog-card-author-avatar">' + esc(initials(p.author)) + "</span><span>" + esc(p.author) + "</span><span class=\"blog-card-meta-dot\">·</span>");
    meta.push("<span>" + esc(fmtDate(p.date)) + "</span>");
    if (p.readingTime) meta.push('<span class="blog-card-meta-dot">·</span><span>' + p.readingTime + " min</span>");
    return '<a href="' + esc(url) + '" class="blog-card" data-tags="' + esc(tagsAttr) + '">' +
      '<div class="blog-card-thumb">' +
        (p.cover ? '<img src="' + esc(p.cover) + '" alt="" loading="lazy" />' : THUMB_SVG) +
      "</div>" +
      '<div class="blog-card-body">' +
        (primaryTag ? '<span class="blog-card-category">' + esc(primaryTag) + "</span>" : "") +
        '<div class="blog-card-title">' + esc(p.title) + "</div>" +
        (p.excerpt ? '<p class="blog-card-excerpt">' + esc(p.excerpt) + "</p>" : "") +
        '<div class="blog-card-meta">' + meta.join("") + "</div>" +
      "</div></a>";
  }

  function renderIndex(posts) {
    var grid = document.getElementById("blog-grid");
    if (!grid) return;
    grid.innerHTML = posts.map(cardHTML).join("");

    // tag chips
    var tags = [];
    posts.forEach(function (p) {
      (p.tags || []).forEach(function (t) { if (tags.indexOf(t) === -1) tags.push(t); });
    });
    tags.sort();
    var filters = document.querySelector(".blog-filters");
    if (filters) {
      filters.innerHTML =
        '<button class="blog-filter-btn active" data-filter="all">All</button>' +
        tags.map(function (t) {
          return '<button class="blog-filter-btn" data-filter="' + esc(slugify(t)) + '">' + esc(t) + "</button>";
        }).join("");
    }

    var cards = grid.querySelectorAll(".blog-card");
    var empty = document.getElementById("blog-empty");
    function applyFilter(f) {
      var shown = 0;
      cards.forEach(function (card) {
        var show = f === "all" || (" " + card.getAttribute("data-tags") + " ").indexOf(" " + f + " ") !== -1;
        card.style.display = show ? "" : "none";
        if (show) shown++;
      });
      if (empty) empty.style.display = shown ? "none" : "block";
      (filters ? filters.querySelectorAll(".blog-filter-btn") : []).forEach(function (b) {
        b.classList.toggle("active", b.getAttribute("data-filter") === f);
      });
    }
    if (filters) {
      filters.addEventListener("click", function (e) {
        var b = e.target.closest(".blog-filter-btn");
        if (!b) return;
        var f = b.getAttribute("data-filter");
        applyFilter(f);
        var u = new URL(location.href);
        if (f === "all") u.searchParams.delete("tag"); else u.searchParams.set("tag", f);
        history.replaceState(null, "", u);
      });
    }
    var qTag = new URLSearchParams(location.search).get("tag");
    applyFilter(qTag ? slugify(qTag) : "all");
  }

  function renderPostExtras(posts) {
    var relMount = document.querySelector("[data-blog-related]");
    var pagerMount = document.querySelector("[data-blog-pager]");
    if (!relMount && !pagerMount) return;
    var slug = (relMount && relMount.getAttribute("data-slug")) ||
               (pagerMount && pagerMount.getAttribute("data-slug")) || "";
    var idx = posts.findIndex(function (p) { return p.slug === slug; });

    if (relMount) {
      var self = posts[idx] || {};
      var selfTags = (self.tags || []).map(slugify);
      var scored = posts
        .filter(function (p) { return p.slug !== slug; })
        .map(function (p) {
          var shared = (p.tags || []).map(slugify).filter(function (t) { return selfTags.indexOf(t) !== -1; }).length;
          return { p: p, shared: shared };
        })
        .sort(function (a, b) { return b.shared - a.shared || (a.p.date < b.p.date ? 1 : -1); })
        .slice(0, 3)
        .map(function (x) { return x.p; });
      if (scored.length) {
        relMount.innerHTML =
          '<div class="related-articles-inner"><h2>Related</h2><div class="related-grid">' +
          scored.map(cardHTML).join("") + "</div></div>";
        relMount.hidden = false;
      }
    }

    if (pagerMount && idx !== -1) {
      var newer = posts[idx - 1]; // posts sorted newest-first
      var older = posts[idx + 1];
      if (newer || older) {
        pagerMount.innerHTML =
          (older ? '<a class="blog-pager-link blog-pager-prev" href="/blog/posts/' + older.slug + '/"><span>Older</span>' + esc(older.title) + "</a>" : "<span></span>") +
          (newer ? '<a class="blog-pager-link blog-pager-next" href="/blog/posts/' + newer.slug + '/"><span>Newer</span>' + esc(newer.title) + "</a>" : "<span></span>");
        pagerMount.hidden = false;
      }
    }
  }

  function boot() {
    fetch("/blog/posts.json", { cache: "no-cache" })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var posts = (data.posts || [])
          .filter(function (p) { return PREVIEW || !p.draft; })
          .sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; });
        renderIndex(posts);
        renderPostExtras(posts);
      })
      .catch(function (e) { console.error("[studio-kit blog] could not load posts.json —", e); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();

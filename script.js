/* ============================================================
   RENDERING LOGIC
   You shouldn't need to edit this file to add posts or change
   fonts/colors — those live in posts.js and style.css.
   ============================================================ */

(function () {
  "use strict";

  var posts = (typeof POSTS !== "undefined" ? POSTS.slice() : []);
  posts.sort(function (a, b) { return (b.date || "").localeCompare(a.date || ""); });

  function $(id) { return document.getElementById(id); }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function formatDate(iso) {
    try {
      var d = new Date(iso + "T00:00:00");
      return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
    } catch (e) { return iso || ""; }
  }

  /* Posts can hold plain text (old-style "text" field) or rich
     text (new "html" field, written by write.html). This gets a
     plain-text version either way, for the list preview. */
  function plainTextOf(post) {
    if (post.text) return post.text;
    if (post.html) {
      var tmp = document.createElement("div");
      tmp.innerHTML = post.html;
      return tmp.textContent || tmp.innerText || "";
    }
    return "";
  }

  function previewLine(text) {
    var lines = String(text || "").split("\n");
    var line = "";
    for (var i = 0; i < lines.length; i++) {
      if (lines[i].trim().length > 0) { line = lines[i].trim(); break; }
    }
    if (!line) return "(untitled)";
    return line.length > 90 ? line.slice(0, 90) + "…" : line;
  }

  function mediaGlyph() {
    return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="10.5" r="1.5"/><path d="M21 16l-5.5-5.5L3 19"/></svg>';
  }

  /* ---------- embeds (YouTube / SoundCloud) ---------- */

  function youTubeId(url) {
    var m = String(url).match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{6,})/);
    return m ? m[1] : null;
  }

  function embedHtml(e) {
    if (e.type === "youtube") {
      var vid = youTubeId(e.url);
      if (!vid) return "";
      return '<div class="post-embed post-embed-youtube"><iframe src="https://www.youtube.com/embed/' + vid +
        '" title="YouTube video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>';
    }
    if (e.type === "soundcloud") {
      var src = "https://w.soundcloud.com/player/?url=" + encodeURIComponent(e.url) +
        "&color=%234b5d3f&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&visual=false";
      return '<div class="post-embed post-embed-soundcloud"><iframe width="100%" height="166" scrolling="no" frameborder="no" allow="autoplay" src="' + src + '" loading="lazy"></iframe></div>';
    }
    return "";
  }

  /* ---------- routing ---------- */

  function hideAllViews() {
    var views = document.querySelectorAll(".view");
    for (var i = 0; i < views.length; i++) views[i].hidden = true;
  }

  function show(id) { $(id).hidden = false; }

  function route() {
    var hash = location.hash || "#home";
    hideAllViews();
    if (hash === "#thoughts") {
      renderList();
      show("view-list");
    } else if (hash.indexOf("#post/") === 0) {
      var id = decodeURIComponent(hash.slice(6));
      var post = null;
      for (var i = 0; i < posts.length; i++) if (posts[i].id === id) post = posts[i];
      if (post) { renderPost(post); show("view-post"); }
      else { location.hash = "#thoughts"; }
    } else {
      show("view-home");
    }
  }

  /* ---------- rendering ---------- */

  function renderList() {
    var container = $("entries");
    if (posts.length === 0) {
      container.innerHTML = '<p class="empty">Nothing here yet — add a post in posts.js.</p>';
      return;
    }
    var html = "";
    for (var i = 0; i < posts.length; i++) {
      var p = posts[i];
      var hasMedia = (p.media && p.media.length) || (p.embeds && p.embeds.length);
      html += '<a class="entry" href="#post/' + encodeURIComponent(p.id) + '">' +
        '<span class="entry-date">' + formatDate(p.date) + "</span>" +
        '<span class="entry-title">' + escapeHtml(previewLine(plainTextOf(p))) + "</span>" +
        (hasMedia ? '<span class="entry-media-flag">' + mediaGlyph() + "</span>" : "") +
        "</a>";
    }
    container.innerHTML = html;
  }

  function renderPost(post) {
    var mediaHtml = "";
    var media = post.media || [];
    for (var i = 0; i < media.length; i++) {
      var m = media[i];
      var path = encodeURI(m.path);
      if (m.type === "video") {
        mediaHtml += '<video class="post-media" controls preload="metadata" src="' + path + '"></video>';
      } else {
        mediaHtml += '<img class="post-media" src="' + path + '" alt="" loading="lazy">';
      }
    }

    var embeds = post.embeds || [];
    var embedsHtml = embeds.length
      ? '<div class="post-embeds">' + embeds.map(embedHtml).join("") + "</div>"
      : "";

    var bodyHtml = post.html
      ? '<div class="post-rich">' + post.html + "</div>"
      : '<div class="post-text">' + escapeHtml(post.text || "") + "</div>";

    $("post-article").innerHTML =
      '<time class="post-date" datetime="' + escapeHtml(post.date) + '">' + formatDate(post.date) + "</time>" +
      bodyHtml +
      (mediaHtml ? '<div class="post-media-group">' + mediaHtml + "</div>" : "") +
      embedsHtml;
  }

  /* ---------- logo melt (gif swap) ---------- */

  (function () {
    var img = document.getElementById("logo-melt-img");
    var btn = document.getElementById("logo-melt");
    if (!btn || !img) return;

    var STATIC_SRC = "images/inji-kim-logo.png";
    var GIF_SRC = "images/inji-kim-logo.gif";
    var GIF_DURATION = 1550;

    var playing = false;

    btn.addEventListener("click", function () {
      if (playing) return;
      playing = true;
      img.src = GIF_SRC + "?t=" + Date.now();
      setTimeout(function () {
        img.src = STATIC_SRC;
        playing = false;
      }, GIF_DURATION);
    });
  })();

  /* ---------- wiring ---------- */

  $("btn-open-thoughts").addEventListener("click", function () { location.hash = "#thoughts"; });
  window.addEventListener("hashchange", route);

  route();
})();
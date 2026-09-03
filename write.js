/* ============================================================
   WRITE.HTML LOGIC
   Composes a post, then generates the code + downloadable files
   you paste/save into posts.js and media/. Nothing here talks to
   a server — this page just builds text and files for you to
   place by hand.
   ============================================================ */

(function () {
  "use strict";

  var editor = document.getElementById("editor");
  var pendingMedia = [];   // { blob, ext, previewUrl }
  var ytEmbeds = [];       // { url }
  var scEmbeds = [];       // { url }

  try { document.execCommand("defaultParagraphSeparator", false, "div"); } catch (e) {}
  try { document.execCommand("styleWithCSS", false, true); } catch (e) {}

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function showError(msg) {
    var el = document.getElementById("write-error");
    el.textContent = msg;
    el.hidden = false;
  }
  function hideError() {
    document.getElementById("write-error").hidden = true;
  }

  /* ---------- toolbar ---------- */

  document.querySelectorAll(".tb-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      editor.focus();
      document.execCommand(btn.getAttribute("data-cmd"), false, null);
    });
  });

  document.querySelectorAll(".tb-swatch").forEach(function (btn) {
    btn.addEventListener("click", function () {
      editor.focus();
      document.execCommand("foreColor", false, btn.getAttribute("data-color"));
    });
  });

  /* ---------- photos / gifs ---------- */

  var mediaInput = document.getElementById("mediaInput");

  document.getElementById("btn-add-media").addEventListener("click", function () {
    mediaInput.click();
  });

  mediaInput.addEventListener("change", function (e) {
    var files = Array.prototype.slice.call(e.target.files || []);
    e.target.value = "";
    files.reduce(function (chain, file) {
      return chain.then(function () { return addMediaFile(file); });
    }, Promise.resolve());
  });

  function resizeImage(file, maxDim, quality) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        var width = img.naturalWidth, height = img.naturalHeight;
        if (width > maxDim || height > maxDim) {
          if (width > height) { height = Math.round(height * maxDim / width); width = maxDim; }
          else { width = Math.round(width * maxDim / height); height = maxDim; }
        }
        var canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(url);
        canvas.toBlob(function (blob) {
          if (blob) resolve(blob); else reject(new Error("toBlob failed"));
        }, "image/jpeg", quality);
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error("image load failed")); };
      img.src = url;
    });
  }

  function addMediaFile(file) {
    if (file.type === "image/gif") {
      pendingMedia.push({ blob: file, ext: "gif", previewUrl: URL.createObjectURL(file) });
      renderMediaTray();
      return Promise.resolve();
    }
    if (file.type.indexOf("image/") === 0) {
      return resizeImage(file, 1600, 0.82).then(function (blob) {
        pendingMedia.push({ blob: blob, ext: "jpg", previewUrl: URL.createObjectURL(blob) });
        renderMediaTray();
      }).catch(function () {
        showError("Couldn't read that image — try a different file.");
      });
    }
    showError("That file type isn't supported here — try JPG, PNG or GIF.");
    return Promise.resolve();
  }

  function renderMediaTray() {
    var tray = document.getElementById("media-tray");
    if (!pendingMedia.length) { tray.innerHTML = ""; tray.hidden = true; return; }
    tray.hidden = false;
    var html = "";
    for (var i = 0; i < pendingMedia.length; i++) {
      html += '<div class="tray-item"><img src="' + pendingMedia[i].previewUrl + '" alt="">' +
        '<button type="button" class="tray-remove" data-remove="' + i + '" aria-label="Remove">×</button></div>';
    }
    tray.innerHTML = html;
    tray.querySelectorAll("[data-remove]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var idx = Number(btn.getAttribute("data-remove"));
        URL.revokeObjectURL(pendingMedia[idx].previewUrl);
        pendingMedia.splice(idx, 1);
        renderMediaTray();
      });
    });
  }

  /* ---------- youtube / soundcloud ---------- */

  function youTubeId(url) {
    var m = String(url).match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{6,})/);
    return m ? m[1] : null;
  }

  function renderEmbedList(listId, arr) {
    var list = document.getElementById(listId);
    var html = "";
    for (var i = 0; i < arr.length; i++) {
      html += "<li><span>" + escapeHtml(arr[i].url) + '</span><button type="button" data-remove="' + i + '">remove</button></li>';
    }
    list.innerHTML = html;
    list.querySelectorAll("[data-remove]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var idx = Number(btn.getAttribute("data-remove"));
        arr.splice(idx, 1);
        renderEmbedList(listId, arr);
      });
    });
  }

  document.getElementById("btn-add-yt").addEventListener("click", function () {
    var input = document.getElementById("yt-input");
    var url = input.value.trim();
    if (!url) return;
    if (!youTubeId(url)) {
      showError("That doesn't look like a YouTube link — paste the full video URL.");
      return;
    }
    hideError();
    ytEmbeds.push({ url: url });
    input.value = "";
    renderEmbedList("yt-list", ytEmbeds);
  });

  document.getElementById("btn-add-sc").addEventListener("click", function () {
    var input = document.getElementById("sc-input");
    var url = input.value.trim();
    if (!url) return;
    if (!/^https?:\/\/(www\.|m\.)?soundcloud\.com\//.test(url)) {
      showError("That doesn't look like a SoundCloud link.");
      return;
    }
    hideError();
    scEmbeds.push({ url: url });
    input.value = "";
    renderEmbedList("sc-list", scEmbeds);
  });

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

  /* ---------- generate ---------- */

  document.getElementById("btn-generate").addEventListener("click", function () {
    hideError();
    var html = editor.innerHTML.trim();
    if (!html && pendingMedia.length === 0 && ytEmbeds.length === 0 && scEmbeds.length === 0) {
      showError("Write something, or add a photo or link, before generating.");
      return;
    }

    var id = "p_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 7);
    var date = new Date().toISOString().slice(0, 10);

    var media = pendingMedia.map(function (m, i) {
      return { path: "media/" + id + "/" + i + "." + m.ext, type: "image" };
    });

    var embeds = [];
    ytEmbeds.forEach(function (e) { embeds.push({ type: "youtube", url: e.url }); });
    scEmbeds.forEach(function (e) { embeds.push({ type: "soundcloud", url: e.url }); });

    /* code block */
    var lines = [];
    lines.push("  {");
    lines.push("    id: " + JSON.stringify(id) + ",");
    lines.push("    date: " + JSON.stringify(date) + ",");
    lines.push("    html: " + JSON.stringify(html) + ",");
    lines.push("    media: " + JSON.stringify(media) + ",");
    lines.push("    embeds: " + JSON.stringify(embeds));
    lines.push("  },");
    document.getElementById("output-code").value = lines.join("\n");

    /* downloads */
    var dl = document.getElementById("output-downloads");
    if (pendingMedia.length === 0) {
      dl.innerHTML = '<p class="write-hint">No photos in this entry — nothing to save here.</p>';
    } else {
      var dlHtml = "";
      for (var i = 0; i < pendingMedia.length; i++) {
        var url = URL.createObjectURL(pendingMedia[i].blob);
        var filename = i + "." + pendingMedia[i].ext;
        var fullPath = "media/" + id + "/" + filename;
        dlHtml += '<div class="download-row"><span>' + escapeHtml(fullPath) + '</span>' +
          '<a href="' + url + '" download="' + filename + '" class="btn-download">Download</a></div>';
      }
      dl.innerHTML = dlHtml +
        '<p class="write-hint">Create a folder named <code>' + escapeHtml(id) +
        '</code> inside <code>media</code>, and save each download into it with the name shown.</p>';
    }

    /* preview */
    var previewMediaHtml = pendingMedia.map(function (m) {
      return '<img class="post-media" src="' + m.previewUrl + '" alt="">';
    }).join("");
    var embedsHtml = embeds.length
      ? '<div class="post-embeds">' + embeds.map(embedHtml).join("") + "</div>"
      : "";

    document.getElementById("preview-article").innerHTML =
      '<time class="post-date">' + date + "</time>" +
      '<div class="post-rich">' + html + "</div>" +
      (previewMediaHtml ? '<div class="post-media-group">' + previewMediaHtml + "</div>" : "") +
      embedsHtml;

    var output = document.getElementById("output");
    output.hidden = false;
    output.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  document.getElementById("btn-copy").addEventListener("click", function () {
    var ta = document.getElementById("output-code");
    ta.focus();
    ta.select();
    var btn = document.getElementById("btn-copy");
    var original = btn.textContent;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(ta.value).then(function () {
        btn.textContent = "Copied!";
        setTimeout(function () { btn.textContent = original; }, 1500);
      }).catch(function () {
        btn.textContent = "Select all is done — press Ctrl/Cmd+C";
        setTimeout(function () { btn.textContent = original; }, 2500);
      });
    } else {
      btn.textContent = "Select all is done — press Ctrl/Cmd+C";
      setTimeout(function () { btn.textContent = original; }, 2500);
    }
  });
})();

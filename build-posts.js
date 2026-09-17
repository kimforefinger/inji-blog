/* ============================================================
   BUILD STEP
   Runs automatically on every Netlify deploy (see package.json).
   Gathers posts from two places:
     1. content/posts/*.json  — written by the CMS (admin page)
     2. posts.js               — your older, hand-pasted entries
   and combines them into posts.json, which the live site fetches
   and renders. You shouldn't need to run or edit this yourself.
   ============================================================ */

const fs = require("fs");
const path = require("path");

const POSTS_DIR = path.join(__dirname, "content", "posts");
const OUTPUT_FILE = path.join(__dirname, "posts.json");
const LEGACY_FILE = path.join(__dirname, "posts.js");

function youTubeId(url) {
  var m = String(url).match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{6,})/);
  return m ? m[1] : null;
}

function fromCmsEntry(id, data) {
  var media = [];
  (data.photos || []).forEach(function (p) {
    if (p) media.push({ path: p, type: "image" });
  });

  var embeds = [];
  (data.youtube || []).forEach(function (item) {
    var url = item && item.url;
    if (url && youTubeId(url)) embeds.push({ type: "youtube", url: url });
  });
  (data.soundcloud || []).forEach(function (item) {
    var url = item && item.url;
    if (url) embeds.push({ type: "soundcloud", url: url });
  });

  return {
    id: id,
    date: data.date ? String(data.date).slice(0, 10) : "",
    body: data.body || "",
    media: media,
    embeds: embeds
  };
}

function loadCmsPosts() {
  if (!fs.existsSync(POSTS_DIR)) return [];
  var files = fs.readdirSync(POSTS_DIR).filter(function (f) { return f.endsWith(".json"); });
  var posts = [];
  files.forEach(function (file) {
    var id = file.replace(/\.json$/, "");
    var raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
    try {
      var data = JSON.parse(raw);
      posts.push(fromCmsEntry(id, data));
    } catch (e) {
      console.warn("Skipping " + file + " — invalid JSON: " + e.message);
    }
  });
  return posts;
}

function loadLegacyPosts() {
  if (!fs.existsSync(LEGACY_FILE)) return [];
  try {
    delete require.cache[require.resolve(LEGACY_FILE)];
    var mod = require(LEGACY_FILE);
    return Array.isArray(mod) ? mod : [];
  } catch (e) {
    console.warn("Could not read posts.js for legacy posts: " + e.message);
    return [];
  }
}

var cmsPosts = loadCmsPosts();
var legacyPosts = loadLegacyPosts();

// Combine, letting a CMS post win if an id somehow collides with a legacy one.
var byId = {};
legacyPosts.forEach(function (p) { if (p && p.id) byId[p.id] = p; });
cmsPosts.forEach(function (p) { if (p && p.id) byId[p.id] = p; });

var allPosts = Object.keys(byId).map(function (id) { return byId[id]; });
allPosts.sort(function (a, b) { return (b.date || "").localeCompare(a.date || ""); });

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allPosts, null, 2));
console.log(
  "Wrote " + allPosts.length + " posts (" + cmsPosts.length + " from the CMS, " +
  legacyPosts.length + " from posts.js) to posts.json"
);

# Thoughts

A tiny personal blog. One button on the home page ("Thoughts") opens a
list of short entries; each entry can hold text, photos, drawings,
gifs, or videos.

There's no build step and no server required — it's five plain files.

```
index.html   the page structure
style.css    all colors, fonts, layout — edit this to restyle
script.js    renders posts.js onto the page (you shouldn't need to touch this)
posts.js     your actual content — this is the file you edit day to day
media/       your images, gifs and videos live here
```

## Preview it

Just double-click `index.html` — it opens in your browser and works
immediately, no setup needed.

For a nicer workflow in VS Code (auto-refresh whenever you save), install
the **Live Server** extension, then right-click `index.html` → "Open with
Live Server".

## Write a new post

Open `posts.js`. Copy the sample block and change it:

```js
{
  id: "monday-walk",
  date: "2026-08-24",
  text: "Went for a walk and the light was doing that thing again.",
  media: []
}
```

`id` just needs to be unique — no spaces. `date` is `YYYY-MM-DD`. Line
breaks in `text` are preserved on the page.

## Add a drawing, photo, gif or video

1. Drag the file into the `media` folder.
2. Reference it in that post's `media` array:

```js
media: [
  { path: "media/sunday-sketch.jpg", type: "image" },
  { path: "media/clip.mp4",          type: "video" }
]
```

Use `type: "video"` for `.mp4`/`.webm` files, `type: "image"` for
everything else (jpg, png, gif, webp).

Keep an eye on file size, especially for video — very large files make
the page slow to load, particularly on phones. Trimming a clip or
compressing a photo before dropping it in helps.

## Change fonts and colors

Everything lives at the top of `style.css`, under `:root`:

```css
--bg: #edefe7;         /* page background */
--ink: #24261e;        /* main text color */
--accent: #4b5d3f;     /* the "Thoughts" hover, links, etc. */
--font-display: "Newsreader", ...;   /* the "Thoughts" button and titles */
--font-body: "Work Sans", ...;       /* the text of each entry */
```

To use a different Google Font: pick one at [fonts.google.com](https://fonts.google.com),
copy the `<link>` tag it gives you into `index.html` (it already has one
there to replace), then put the font's name into the matching
`--font-...` variable above.

There's also a dark-mode block right below the light colors — it kicks
in automatically for visitors whose system is set to dark mode.

## Put it online

This is a static site, so any free static host works. Two easy options:

**Netlify (no account needed to try it):**
Go to [app.netlify.com/drop](https://app.netlify.com/drop) and drag this
whole folder onto the page. It gives you a live URL immediately.

**GitHub Pages (free, keeps a real history of changes):**
1. Create a new repository on GitHub and push this folder to it.
2. In the repo, go to Settings → Pages, set the source to the `main`
   branch, and save.
3. GitHub gives you a URL like `https://yourname.github.io/reponame`.

Either way, whenever you want to publish a new post: save `posts.js`
(and any new files in `media/`), then push/redeploy — there's no
database, the files themselves are the whole site.

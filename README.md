# Thoughts

A tiny personal blog with two ways to write:

- **The CMS** — go to `/admin` on the live site, log in with GitHub, and
  write a post there. It saves straight to `content/posts/` in this repo.
- **posts.js** — the older, hand-edit way. Still supported; anything in
  here gets merged in alongside your CMS posts.

## How it fits together

```
index.html      page structure
style.css       colors, fonts, layout
script.js       renders posts.json onto the page (don't need to edit this)
posts.js        older hand-written posts (optional)
build-posts.js  runs on every Netlify deploy — combines content/posts/*.json
                and posts.js into posts.json, which the site fetches
admin/          the /admin CMS editor (Decap CMS) and its config.yml
content/posts/  where the CMS saves each post as JSON
media/uploads/  where the CMS saves uploaded photos
images/         your own hand-placed images (logo, buttons, etc.)
```

There's nothing to run locally — Netlify runs `npm run build`
(`node build-posts.js`) automatically on every push to `main`.

## Writing a post

**Via the CMS (recommended):** visit `https://injiiiii.netlify.app/admin`,
log in, click "New Thoughts", write it, add photos/YouTube/SoundCloud
links if you want, and publish. It commits directly to this repo and
Netlify redeploys automatically.

**Via posts.js:** open `posts.js`, copy the sample block, and edit
`id`, `date`, and `text`. Push to `main` and it'll appear on the next
deploy.

## Change fonts and colors

Edit the CSS variables at the top of `style.css` under `:root`. There's
a matching dark-mode block right below it.

## Deploying

Just push to `main` — Netlify is already watching this repo and
redeploys automatically. Nothing else to configure.

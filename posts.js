/* ============================================================
   YOUR POSTS
   ============================================================

   This is the only file you need to touch to add a new thought.
   It's a plain list — newest or oldest first, it doesn't matter,
   the site sorts them by date automatically.

   Each post looks like this:

   {
     id: "a-short-unique-id",     // no spaces, just used internally
     date: "2026-08-24",          // YYYY-MM-DD
     text: "Whatever you want to write. Line breaks are kept, so you\ncan write it just like a normal note.",
     media: []                    // photos, gifs or videos — see below
   }

   TO ADD A DRAWING, PHOTO, GIF OR VIDEO:
   1. Drop the file into the "media" folder next to this one
      (e.g. media/sunset-sketch.jpg).
   2. Add it to that post's "media" array like this:

        media: [
          { path: "media/sunset-sketch.jpg", type: "image" },
          { path: "media/loop.gif",           type: "image" },
          { path: "media/clip.mp4",           type: "video" }
        ]

   Use type: "video" for video files (mp4/webm), and type: "image"
   for everything else (jpg, png, gif, webp all just work).

   Delete the sample post below whenever you're ready, or keep it
   as a template to copy from.
*/

const POSTS = [
  {
    id: "welcome",
    date: "2026-08-24",
    text: "This is the first entry.\n\nOpen posts.js in VS Code, copy this block, and change the text, date and id to write a new one. Drop any drawing, photo, gif or video into the media folder and point to it from the media array above.",
    media: []
  }
];

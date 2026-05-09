# Adams House Senior Mural Painting 2026

A submission portal for the Adams House tunnel mural project. Cinematic looping
video hero with CV-style overlays + a terminal-aesthetic form that pipes to Airtable.

## Quick start

```bash
pnpm install
cp apps/interface/.env.example apps/interface/.env.local   # then fill it in
pnpm dev                                                    # http://localhost:3000
```

## Setting up Airtable

1. **Create a new base** in Airtable (call it whatever — e.g. `Adams Murals 2026`).
2. **Import** `airtable-schema.csv` (at repo root) — this creates the columns.
   Set every field to **Long text** *except* `Sketch`, which should be **Attachment**.
   (Airtable's CSV import defaults to single-line text — bulk-convert to long text
   with cmd-click → "Customize field type" → "Long text".) The
   `Dates Available` field arrives as one string of `; `-joined values.
3. **Generate a personal access token** at <https://airtable.com/create/tokens>
   with these scopes: `data.records:read`, `data.records:write`,
   `data.recordComments:write` (optional), and access to the base you just created.
4. **Find your base ID** — open the base, the URL has the form
   `https://airtable.com/appXXXXXXXXXXXXXX/...` — that's your base ID.
5. **Fill `apps/interface/.env.local`**:

   ```
   AIRTABLE_API_KEY=pat_xxx_yyy
   AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
   AIRTABLE_TABLE_NAME=Submissions
   ```

   `AIRTABLE_TABLE_NAME` is whatever you renamed the imported table to (the CSV
   imports as the filename — `airtable-schema` — so rename it to `Submissions`
   or update the env var to match).

## Video

The hero plays `apps/interface/public/murals.mp4` (already copied in: 18MB, 1080p,
138s loop). To slim further for production:

```bash
# Target ~5MB, 720p, h.264, web-optimized
ffmpeg -i apps/interface/public/murals.mp4 \
  -vf "scale=-2:720" \
  -c:v libx264 -preset slow -crf 28 \
  -movflags +faststart \
  -an \
  apps/interface/public/murals.mp4.tmp \
  && mv apps/interface/public/murals.mp4.tmp apps/interface/public/murals.mp4
```

Or host on Cloudflare R2 / Mux / Cloudinary and update the `src` in
`components/mural/video-hero.tsx`.

## Deploying to Vercel

1. Push to GitHub.
2. Import the repo on Vercel; set the **root directory** to `apps/interface`.
3. Add the three Airtable env vars in Project → Settings → Environment Variables.
4. Deploy. The QR code on the poster should point to the Vercel URL.

The 18MB video is under Vercel's 100MB per-file limit — it ships in `public/` and
is served from the edge.

## Structure

```
apps/interface/
  app/
    page.tsx                     # the landing page
    api/submit/route.ts          # Airtable POST handler
    layout.tsx, globals.css      # fonts (VT323 + JetBrains Mono) + glitch CSS
  components/mural/
    video-hero.tsx               # looping mp4 + frame
    cv-overlay.tsx               # CV bboxes / ROI circles / connector graph / coords / counters
    status-bar.tsx               # sticky top bar + ticker
    form.tsx                     # terminal-style form
    field.tsx                    # numbered field wrapper
    coords.ts                    # helpers (random, jitter, epochs, pigments)
  public/murals.mp4              # the looping video

airtable-schema.csv              # import into Airtable to seed columns
```

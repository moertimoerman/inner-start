# AUDIO ASSET AND GIT FIX REPORT

Date: 2026-03-16
Project: Inner Sleep (`inner-start`)

## 1) Files removed from git tracking (local files kept)
The following were removed from git index using `git rm --cached` (not deleted locally):

- `public/audio/ambience.mp3`
- `public/audio/build/**` (all generated build artifacts: wav/m4a/json/txt)
- `public/audio/standard/sentences/**` (all per-sentence generated clips + manifests)
- `public/audio/standard/female.mp3` (obsolete)
- `public/audio/standard/female-safe1-4-slow075-with-silence4s.m4a` (obsolete)

Why: these generated/oversized assets were causing GitHub push risk and unnecessary repo bloat.

## 2) .gitignore updates
Added/confirmed ignore rules:

- `/public/audio/build/`
- `/public/audio/standard/sentences/`
- `/public/audio/ambience.mp3`
- `/public/audio/standard/*.mp3`
- `/public/audio/standard/*-with-silence*.m4a`
- `/public/audio/**/*.wav`
- `/swarm/`

Result: generated/heavy local audio no longer re-enters tracking.

## 3) Optimized MVP audio strategy
### Runtime assets now used by app
- `public/audio/standard/female.m4a`
- `public/audio/standard/male.m4a`
- `public/audio/ambience.m4a`
- breathing + silence assets in `public/audio/breathing/` and `public/audio/silence*.m4a`

### Optimization details (before/after)
- Ambient layer:
  - Before: `public/audio/ambience.mp3` = **691,200,044 bytes (~659.2 MB)**
  - After: `public/audio/ambience.m4a` = **29,556,815 bytes (~28.2 MB)**
  - Approx reduction: **~95.7%**

- Voice master references moved to stable standard paths:
  - `public/audio/standard/female.m4a` = **4,253,607 bytes (~4.1 MB)**
  - `public/audio/standard/male.m4a` = **2,800,466 bytes (~2.7 MB)**

### Repo tracked-audio footprint impact
- Before cleanup (tracked under `public/audio`): **897,276,459 bytes (~855.7 MB)**
- Intermediate tracked footprint after untracking generated audio: **1,430,238 bytes (~1.36 MB)**
- Final commit will include only required MVP assets (female/male/ambience m4a + lightweight layers), dramatically smaller than pre-fix.

## 4) Code/config consistency updates
Updated app references to production-safe assets:

- `app/lib/standard-audio.ts`
  - female: `/audio/standard/female.m4a`
  - male: `/audio/standard/male.m4a`
- `app/lib/audio-layers.ts`
  - music layer: `/audio/ambience.m4a`
- `components/AudioPlayer.tsx`
  - ambience source: `/audio/ambience.m4a`
- `app/audio-dashboard/page.tsx`
  - ambience source: `/audio/ambience.m4a`

Note: `app/audio-dashboard/page.tsx` still contains optional test-flow references to
`/audio/standard/sentences/.../manifest.json`. Those sentence manifests are now ignored/untracked by design.
This does not block the core MVP app player flow.

## 5) Remaining manual actions
1. Review staged changes:
   - `git status`
2. Commit:
   - `git commit -m "Fix audio asset tracking and optimize MVP audio strategy"`
3. Push:
   - `git push origin main`

## 6) Is repo now safe to push?
Yes, after committing the staged untracking + ignore rules + optimized asset references, the repo is in a push-safe state for GitHub size limits compared to the previous oversized tracked audio set.

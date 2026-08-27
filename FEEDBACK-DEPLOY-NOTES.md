# /feedback 404 — RESOLVED, notes kept for next time

## What it actually was (27 Aug 2026)

Two separate faults, found in this order:

**1. `api/feedback.js` was never built.** The repo has no `package.json`, so
Vercel treats `.js` as CommonJS and the file uses `export default` — ESM. It was
silently skipped: no error, no function, no invocation. Fixed by renaming to
`api/feedback.mjs`, which is unambiguously ESM and needs no `package.json`.

**2. The rewrite did not match the URL the app generates.** The Flutter app
emitted `/feedback/?t=...` with a **trailing slash**. The rewrite sources were
`/feedback` (a different path) and `/feedback/:slug` (`:slug` cannot be empty),
so neither matched and Vercel served its 404. Fixed at both ends — `vercel.json`
now covers `/feedback`, `/feedback/` and `/feedback/:slug*`, and the app emits
the clean path with no trailing slash.

**The lesson for next time:** `curl` the function path directly first. A 200 at
`/api/feedback` with a 404 at `/feedback` isolates the problem to routing in one
command, and is what separated fault 1 from fault 2 here.

---

# Original diagnostic order

Run these in order. Each one eliminates half the problem.

## 1. Is the function deployed at all?

    curl -i https://www.revalidationaicopilot.co.uk/api/feedback

This bypasses the rewrite entirely and hits the function directly.

- **200 + HTML**  -> the function works. The problem is the rewrite (go to 3).
- **404**         -> Vercel never built the function (go to 2).

## 2. The function isn't being built

Most likely cause, now fixed: the file was `api/feedback.js` and the repo has no
`package.json`. Vercel treats `.js` as CommonJS, so `export default` and
`export const config` fail to parse and the function is silently skipped — no
error surfaced, no invocation logged. Renamed to `api/feedback.mjs`, which is
unambiguously ESM.

If it still 404s after that deploy, check in the Vercel dashboard:

- **Deployment -> Source**: does `api/feedback.mjs` appear in the file tree?
  If not, the deployment isn't from the branch you pushed to.
- **Deployment -> Functions**: is `/api/feedback` listed? If the tab is empty,
  Vercel isn't treating this as a functions project.
- **Project Settings -> General -> Root Directory**: must be empty or `.`.
  If it points at a subfolder, `/api` is outside the deployment root.
- **Project Settings -> General -> Build & Output**: Output Directory should be
  empty for a plain static site. If it's set to something like `dist` or
  `public`, Vercel only serves that folder and ignores `/api`.
- **Deployment -> Build Logs**: search for `feedback`. A parse error names it.

## 3. Function works, rewrite doesn't

Static files are matched before rewrites. If anything resolves at `/feedback`
already — a `feedback/` directory, a `feedback.html` — it wins and the rewrite
never runs.

    ls -la | grep -i feedback

Should show only `feedback-form.html`. If there's a `feedback/` folder or a
`feedback.html`, remove or rename it.

## 4. Ship-now fallback

If the function keeps fighting you, the page itself does not depend on it — it
only supplies the sender's name in the link preview card. To go live immediately
with a generic preview, swap the two rewrites in `vercel.json` for:

    { "source": "/feedback", "destination": "/feedback-form.html" }

Everything else works identically: the form resolves the token client-side,
submissions land, the pitch shows. You lose only the name in the WhatsApp card.
Put the function back later — it's an isolated change.

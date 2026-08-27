# /feedback 404 — diagnostic order

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

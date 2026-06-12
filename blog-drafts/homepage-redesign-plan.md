# Revalidation Copilot — Homepage Redesign Strategy

> **Prepared:** June 2026
> **Scope:** Single-page redesign, HTML/CSS only (Vercel free tier)
> **Audience:** UK nurses (ICU, ward, community) — time-poor, shift-working, revalidation-anxious
> **Pricing context:** Free tier + £12.99/yr Pro — not a £50 SaaS, so the design should not feel corporate or expensive

---

## 1. Diagnosis: What's Wrong with the Current Homepage

I reviewed the full HTML source and rendered content of `https://www.revalidationaicopilot.co.uk/`. Here is what I found.

### 1.1 The Good (what works)

- **SEO & structured data** are solid. JSON-LD for SoftwareApplication and FAQPage, OG tags, canonical URL, clean `<title>`. The FAQs are well-written and target real search queries.
- **Copy is strong.** The headline ("Stop dreading your revalidation. Your next reflective account takes 10 minutes, not an afternoon") does real work. The voice is human, not corporate.
- **Section structure is logical.** Hero → Trust points → Problem → How it works → Features → Blog → Screenshots → Testimonials → Privacy → Invite → CTA. All the right building blocks exist.
- **Mobile menu** works. Mobile breakpoint handling at 760px and 1100px is competent.

### 1.2 The Problems (required fixes)

**A. Typography is generic.** The page uses `Inter, ui-sans-serif, system-ui` as the font stack. Inter is one of the most overused fonts in the entire web — it's the default in Next.js, Tailwind, Vercel templates, and 80% of startup landing pages. This immediately signals "template" to anyone who has seen a few SaaS pages. The skill says to **never use Inter**.

**B. The colour palette is safe to the point of being forgettable.** Navy blue (`#1b3a57`) + teal accent (`#0aa37f`) + white surface is the most common healthcare SaaS palette in existence. It looks clinical in the worst way — like a private medical insurance portal, not like a tool for overworked nurses.

**C. No visual identity or design tension.** The page has no memorable visual anchor. The phone mockup with floating cards is a standard "product screenshot" pattern. There is no illustration style, no texture, no unexpected layout choice, no brand mark beyond a gradient logo. Nothing makes you stop scrolling and think "oh, this is different."

**D. Motion is absent.** Zero CSS animations, no transitions on cards, no staggered reveal on scroll. The page loads and everything is there at once. It feels static.

**E. The "trust bar" at the top ("100+ UK nurses") is an announcement bar** — easy to miss and looks like a cookie notice. This social proof needs to be visual, not a text banner.

**F. Inconsistent button styling.** Some CTAs use inline styles with hardcoded `#0aa37f` backgrounds, others use CSS variables. The mobile nav has a "Download App" button that uses inline `style="background:#0aa37f;color:#fff..."` — messy.

**G. Section padding and spacing is uniform.** Every section gets `padding: 5.5rem 0`. There is no rhythm — no breather sections, no contrasting densities. It's one flat wall of content.

**H. The floating cards overlay the phone image in desktop but stack below on mobile.** This works, but the desktop floating cards use the same card component as every other card on the page. They don't feel "floating" — they feel like panels on top of panels.

**I. The hero visual area is 560px min-height on desktop** but the phone image inside is `340px` wide. On a 1440px+ viewport there's a lot of dead space around the phone. The hero lacks visual weight.

**J. The blog section uses emoji as icons.** 🏆 📝 ✅ 🤝 🎓 📚. This works in terms of speed (no icon font loaded) but looks low-rent at scale. Emoji rendering differs across OS and never looks intentional.

**K. No video autoplay or animated mockup.** The YouTube embed is a static placeholder. For a product whose killer feature is "voice note → compliant reflection," a static screenshot cannot communicate the magic.

**L. The "problem" section copy is excellent** but the layout is a standard two-column grid with a checklist. The visual weight is too balanced — the problem (left) and solution (right) compete. One should dominate.

---

## 2. Aesthetic Direction: "Calm, Capable, Not Clinical"

### Tone Selection: **Soft/Editorial** (from the skill's tone menu)

I am picking **editorial/magazine with soft/approachable warmth** — a cross between the layout confidence of a high-end magazine and the tactile warmth of a calm mobile app.

### Why this direction

ICU nurses spend their shifts in a high-stimulus, high-stakes environment. The last thing they need is another clinical-looking interface that feels like work. The design should feel like a relief — warm, spacious, human. Think *Headspace's illustration-driven warmth* crossed with *Monocle's confident typographic hierarchy*. No stock medical imagery, no cold blues.

### Typography Pair

| Role | Font | Rationale |
|------|------|-----------|
| **Display / Headings** | **DM Serif Display** (Google Fonts) | Serif for confidence, warmth, and editorial authority. The thick slab serifs feel trustworthy but not medical. Nothing says "corporate healthcare" like a sans-serif. This says "I am a serious tool but I have personality." |
| **Body / UI text** | **Satoshi** (free on Fontshare) | A refined geometric sans-serif that is *not* Inter. Soft terminals, generous apertures, slightly condensed than Inter so it reads well at body sizes. Pairs beautifully with DM Serif Display. |
| **Monospace / data** | **JetBrains Mono** | For CPD hours, progress numbers, dates — adds a subtle "tool" flavour without overwhelming. |

### Color Palette

```
--bg:        #FDF8F4     (warm off-white, like good paper)
--surface:   #FFFFFF     (clean white cards)
--text:      #1A1A2E     (near-black, soft)
--muted:     #6B6B80     (comfortable grey)
--primary:   #B76E4E     (warm terracotta — memorable, human, non-clinical)
--primary-2: #8F5438     (deeper terracotta for gradients)
--accent:    #2D6A4F     (deep forest green — NMC-compliant, trustworthy)
--accent-2:  #E5F2ED     (light green tint)
--border:    #E8DDD5     (warm grey border)
--shadow:    0 12px 40px rgba(26, 26, 46, 0.06)
--radius:    20px
```

Why terracotta + forest green: terracotta is the most underused "warm accent" in healthcare tech. It signals groundedness, earth, humanity. Forest green is the actual colour of the NHS logo and implies safety and trust. Together they create tension: warm vs grounded, human vs institutional. That's the product's value prop — human + compliant.

### Motion Approach

CSS-only staggered reveals using `@keyframes fadeInUp` with `animation-delay` on section children. On scroll, sections fade in from bottom with a 50-100ms stagger between cards. Hero gets a 3-part cascade: headline (0ms), lead (150ms), CTA buttons (300ms), phone mockup (450ms).

For the phone mockup: a subtle floating animation (translateY loop, 4s, ease-in-out) to suggest "active, not static."

No JavaScript animation library. Pure CSS keeps the Vercel free tier happy.

### Illustration / Visual Approach

Instead of a screenshot of the app in the hero, I recommend:

1. **An abstract hero graphic** — a large, warm, overlapping composition of soft geometric shapes (circles, gentle curves) in the terracotta/green palette, with the phone mockup **overlaid** asymmetrically. This creates depth and warmth before the user even sees the app.

2. **Hand-drawn-style illustration** for the "problem" section — three small vignettes showing the stress of last-minute revalidation (piles of paper, a clock, a nurse looking overwhelmed). These can be CSS-drawn shapes or SVG. No stock photography.

3. **Real app screenshots** kept for the "See it in action" section only — framed with generous white space and soft shadows, treated like Polaroids, not UI specs.

---

## 3. Top-to-Bottom Section Outline

### Section 1: ➕ Social Proof Strip
- Full-width, warm background. Three stats with clean numeric display: "100+ nurses", "50+ reflections generated", "5★ on App Store"
- These replace the generic announcement bar

### Section 2: 🎯 Hero
- **Eyebrow:** "NMC Revalidation — sorted" (keep this, it works)
- **Headline:** DM Serif Display, large (clamp 3.5rem–5.5rem)
- **Subhead:** Satoshi body, warmer tone
- **Two CTA buttons:** Primary (terracotta, "Start your revalidation record — free"), Secondary (outline, "See how it works")
- **Visual:** Large warm abstract shape composition (CSS radial gradients and overlapping blobs) on the right, phone mockup overlaid asymmetrically at a slight tilt
- **Trust points:** Three pills below buttons, each with a small icon

### Section 3: 📊 How It Works in 3 Steps (not 7)
- The current 7-step grid is overwhelming. Condense to 3 high-level steps: **1. Set up → 2. Log as you go → 3. Export when ready**
- Each step has a generous card with a large illustration number, title, and short description
- Arrow connector between cards (CSS pseudo-element)

### Section 4: 🔥 The Problem (dominant, emotional)
- **Layout:** Full-width left column with the problem copy and three "pain point" items
- **Right column:** A simple timeline-style visual showing the revalidation window (24 months → 3 months to go → panic)
- The pain items use a warm red dot indicator instead of a green tick — the section is about *pain*, not *solution*. Save green for the solution.

### Section 5: ✅ The Solution (right column of problem section, or standalone)
- Checklist card on warm bg, showing what the app provides
- Use the forest green accent here to visually separate problem from solution

### Section 6: 🎬 Product Demo (video)
- Keep the YouTube embed but frame it with a warm rounded container and a subtle border
- Add a "2 min watch" pill above it

### Section 7: ✨ Feature Highlights
- 6 features in a 3-column grid
- Feature icons are **custom SVG** (not emoji) — simple line icons in the terracotta accent colour
- Each card has a subtle hover lift (translateY -4px, shadow increase)

### Section 8: 🗣️ Testimonials
- Three testimonials, but **laid out in a staggered masonry** pattern (middle one taller or offset) for visual tension
- Star ratings as inline SVG
- Verified badges from Google Play / App Store

### Section 9: 📰 Blog Preview
- 3 posts in a row (not 6 — too much), with "Read all guides →" link
- Cards use the featured icon/emoji from the current design but rendered at 32px within a coloured circle

### Section 10: 🔐 Privacy & Support
- Keep the current two-column layout
- Privacy list on the left, support card on the right
- Trust badge: "Your data. Your practice. Your revalidation." — tagline in DM Serif Display

### Section 11: 🙋 Referral / Invite
- Simplified. One column with the invite card, secondary column with reward mechanics
- Progress pill at top: "Refer a colleague → earn rewards"

### Section 12: 🏁 CTA / Download
- Full-width dark forest green background (not gradient-heavy — a solid, confident colour)
- Two app store buttons + "Free to start" text
- No illustration here — let the colour + typography command the space

### Footer
- Keep the structure of Brand column + Product + Resources + Legal + Platform
- Lighter weight, smaller text
- Add "Made by Beemal Innovation Ltd, for UK nurses" — human signature

---

## 4. Technical Approach

### Stack
- **Plain HTML + CSS** (single file per page, keeps Vercel free tier happy)
- **Google Fonts** (DM Serif Display via `@import` or `<link>`, Satoshi via CSS `@font-face` from Fontshare CDN)
- **Zero JavaScript frameworks.** Vanilla JS only for:
  - Mobile hamburger menu toggle
  - Scroll-based reveal class toggle (`IntersectionObserver` — lightweight, available everywhere)

### File Structure (proposed)
```
public/
├── index.html          (single HTML file, ~600 lines, all CSS inlined in <style>)
├── assets/
│   ├── dashboard-screen.jpg
│   ├── cpd-main-screen.jpg
│   ├── cpd-add-entry.jpg
│   └── (removed unused images)
├── favicon.ico
├── favicon.svg
└── og-image.png
```

Keep it as a single HTML file. The Vercel deploy is static — no build step.

### CSS Architecture
- CSS custom properties (`:root`) at the top — colours, spacing, typography
- Section-level class naming: `.hero`, `.problem`, `.steps`, `.features`, `.testimonials`, `.blog`, `.cta`
- Mobile-first breakpoints at 480px, 768px, 1024px, 1280px
- Animation classes: `.reveal` (opacity 0 → 1, translateY 30px → 0), toggled by `IntersectionObserver`

### Performance
- Google Fonts: only 2 weights of DM Serif Display (400, 400i) and 2 weights of Satoshi (400, 700)
- Images: convert to WebP if possible, serve JPG as fallback
- No external icon libraries. Use inline SVG for the 3-4 icons needed

### Accessibility
- Keep all existing ARIA labels and semantic HTML (`<article>`, `<section>`, `<nav>`)
- Ensure colour contrast: terracotta on white passes AA at large text, but needs checking for body sizes
- Focus states visible on all interactive elements

---

## 5. Estimated Effort

| Section | Hours | Priority | Notes |
|---------|-------|----------|-------|
| CSS variables + base reset + typography setup | 0.5 | P0 | Foundation — everything depends on this |
| Hero section (layout, abstract shapes, phone mockup, floating animation) | 3 | P0 | Highest visual impact. Needs the most iteration |
| Navigation + announcement strip + mobile menu | 1 | P0 | Must be responsive out of the gate |
| Problem / Solution two-column section | 1.5 | P0 | The emotional heart of the page |
| How It Works (3-step) | 1 | P1 | Clean, minimal |
| Feature cards (6 items, 3-col grid) | 1 | P1 | Mostly copy-paste from current design with new styling |
| Video embed section | 0.5 | P1 | Simple wrapper |
| Testimonials (staggered masonry) | 1 | P1 | CSS grid trick |
| Blog preview (3 cards) | 0.5 | P1 | Straightforward |
| Privacy + Support | 0.5 | P2 | Mostly copy from current design |
| Referral / Invite | 0.5 | P2 | Same |
| CTA section + Footer | 1 | P1 | Requires the dark green background treatment |
| **Total build** | **11 hours** | | |

### Priority Order

1. **Typography + colour system** (0.5h) — everything flows from this
2. **Hero** (3h) — get the first fold right, everything else follows
3. **Navigation** (1h)
4. **Problem + Solution** (1.5h)
5. **Feature cards + How It Works** (2h)
6. **Testimonials + Video** (1.5h)
7. **CTA + Footer** (1h)
8. **Blog + Privacy + Referral** (1.5h)
9. **Polish pass** (1h) — animation timing, cross-browser check, load speed

### What to Remove (no longer needed on the homepage)
- The NMC Code Consultation promo strip (keep as a separate page, not homepage real estate — it's seasonal)
- The duplicate features grid (current HTML has two identical `<section id="features">` — a bug)
- The 7-step grid (replace with 3-step)
- Inline styled buttons (standardise with CSS variables)

---

## 6. Competitor / Peer Design Observations

These informed the direction above:

| Reference | Lesson Taken |
|-----------|-------------|
| **Headspace** (headspace.com) | Warm colour palette + illustration-driven hero converts better than screenshot + CTA. Uses a soft orange/blue palette that is memorable. |
| **Calm** (calm.com) | Typographic confidence. Large, bold headlines with generous whitespace. The product is "for stressed people" — same audience as Revalidation Copilot. |
| **MediBuddy** (medibuddy.co.uk) | The most direct competitor for doctor exam prep. Landing page is too dense and list-heavy. *Anti-pattern*: don't do this. |
| **Nursa** (nursa.com) | Clean utility-focused landing with strong CTA. Minimal, but the brand identity is weak — feels like a generic marketplace. *Anti-pattern*: avoid being generic. |
| **NMC Revalidation** (nmc.org.uk) | Institutional, grey, overwhelming. The exact thing nurses want to escape. *Anti-pattern*: this is the *opposite* of what we want to be. |

---

## 7. Summary of Actionable Next Steps

1. **Get Habeeb's sign-off** on this strategy document before building
2. **Source the fonts**: load DM Serif Display from Google Fonts, Satoshi from Fontshare
3. **Define the abstract hero graphic** — I recommend a CSS gradient composition (blobs with `border-radius: 50%`, layered with `mix-blend-mode`) rather than requiring an illustration asset
4. **Build the new `index.html`** as a single file, test on mobile and desktop
5. **Swap the app screenshots** for new ones if Habeeb has updated the app UI
6. **Run Lighthouse** for performance after build, aim for 90+ on all four axes
7. **Deploy** to Vercel. The existing DNS stays the same — just push the new file to the `leclanche2364/Revalidation-Website` repo

> **One thing someone will remember about this redesign:** The warm terracotta. No other nursing tool uses it. It will stand out in a sea of blue-and-white medical interfaces.

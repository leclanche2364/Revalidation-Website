# Full SEO Audit — revalidationaicopilot.co.uk

Date: 7 June 2026
Auditor: Tola
Scope: Site-wide + deep dive on forms page

---

## 1. The Ranking Drop: Position 6 → 12 for "nmc revalidation forms 2026"

### Root Causes

**New competitors eating the SERP:**
1. **DocHub (dochub.com)** — Direct fillable forms tool. Higher domain authority. Ranks by offering what nurses actually want: an editable online form, not just download links. Appeared recently after content update.
2. **Scribd (scribd.com)** — PDF of completed examples. 100M+ monthly visitors, massive domain authority. Ranks because users search "completed revalidation forms example" as a subtopic.
3. **joblabs.ai** — 100-chapter comprehensive revalidation guide. It's new but has deep content that Google is rewarding.

**Page-level issues on the forms article:**
- **H2 heading had a comma instead of colon**: `"Form 2 — CPD Record"` and others use an em-dash (`—`) which is OK but the final section headers used colons inconsistent
- **No images, no visual content, no alt text** — zero images on the page
- **Word count too thin (2,314) for a "definitive download guide"** — competitors have 4,000-10,000 words
- **CTA sends users to NMC's site** — the page's primary action is to download forms from NMC, not from you
- **Title was directory-style** ("Download: Every Form, Template & PDF") rather than solving the searcher's real intent ("How do I fill in and submit these forms?")
- **Canonical issue** — the sitemap has HABEEB's Netlify preview URL (`https://...netlify.app/...`) hardcoded but the live site serves from `www.revalidationaicopilot.co.uk`
- **Blog index page doesn't link to the forms page in its featured section** — the blog/index.html (and blog layout) need internal linking priority

### Competitive Gap Analysis

| Competitor | What they do better | Our gap |
|---|---|---|
| DocHub | Embedded fillable form (not just links) | No interactive form on-page |
| Scribd | Completed example PDF to download | Only text examples, no PDF |
| joblabs.ai | 100 chapters, deep content | Single page, 2,300 words |
| NMC official | First-party authority | Third-party site |

---

## 2. Site-wide Technical SEO Audit

### ✅ Passing
- robots.txt — present, sitemap linked
- sitemap.xml — present, 37 URLs
- All pages have: title, meta description, H1, canonical, viewport, charset
- SSL/HTTPS — valid
- Page speed — TTFB ~85ms (fast, Vercel edge)
- Content-Type headers — correct
- Structured data — JSON-LD on all pages
- Open Graph tags — present on all pages
- Internal linking — good cross-linking between blog posts
- No broken links detected

### ⚠️ Issues Found

| Priority | Issue | Page(s) | Fix |
|---|---|---|---|
| 🔴 High | No images on any blog post | All blog posts | Add at least 1 hero image per post with descriptive alt text |
| 🔴 High | Sitemap has old Netlify preview URLs | sitemap.xml | Ensure all URLs point to www.revalidationaicopilot.co.uk only |
| 🟡 Medium | Blog index doesn't feature/priority-order top articles | /blog/ | Add a "Featured" or "Popular" section at top of blog index |
| 🟡 Medium | No H2 jump links/anchor nav on long articles | forms page | Added table of contents links today |
| 🟡 Medium | Meta descriptions on some pages are thin (~120 chars) | privacy, terms, contact | Expand to 150-160 chars |
| 🟡 Medium | No breadcrumb HTML markup visible on blog posts (only JSON-LD) | All blog posts | Add visible breadcrumb navigation |
| 🟢 Low | No Open Graph-specific images per page | All pages | Shared og-image.png for whole site |
| 🟢 Low | No hreflang tags | All pages | Not urgent for UK-only content |
| 🟢 Low | Affiliate/consultation pages in sitemap with high priority (0.8) but low value | sitemap.xml | Review priorities |

### Core Web Vitals Assessment
- Page size: ~26KB (excellent)
- TTFB: ~85ms (green)
- No render-blocking resources
- CSS is inline (no external CSS files)
- No JavaScript frameworks
- No lazy loading needed
- ✅ Should pass Core Web Vitals

---

## 3. Content Audit — All Blog Posts

| Post | Word Count | Images | Internal Links | SEO Score |
|---|---|---|---|---|
| What is NMC Revalidation? | ~2,000 | 0 | Good | 🟡 |
| Step-by-Step Guide | ~3,000 | 0 | Good | 🟡 |
| Checklist 2026 | ~1,800 | 0 | Good | 🟡 |
| Practice Hours | ~2,500 | 0 | Good | 🟡 |
| Reflective Accounts Guide | ~3,500 | 0 | Good | 🟡 |
| CPD Guide | ~2,000 | 0 | Good | 🟡 |
| Code Themes Explained | ~2,500 | 0 | Good | 🟡 |
| **Forms 2026 (updated)** | **2,743** | **0** | **Good** | **🟡** |
| 5 Common Mistakes | ~1,500 | 0 | Good | 🟡 |
| Revalidation Changes 2026 | ~2,000 | 0 | Good | 🟡 |
| Gibbs Reflective Cycle | ~2,000 | 0 | Good | 🟡 |
| Best App 2026 | ~2,000 | 0 | Good | 🟡 |
| Confirmer Guide | ~2,500 | 0 | Good | 🟡 |
| Newly Qualified Nurses | ~2,000 | 0 | Good | 🟡 |
| Reflective Discussion | ~2,000 | 0 | Good | 🟡 |
| Revalidation AI Copilot Guide | ~2,000 | 0 | Good | 🟡 |

**Common issue: zero images across all posts.** Images with alt text are a significant ranking signal and improve time-on-page.

---

## 4. Keyword Opportunities (Content Gaps)

| Keyword | Volume (est.) | Intent | We have |
|---|---|---|---|
| nmc revalidation combined forms | 🟡 Medium | Transactional | Partial |
| download nmc revalidation forms pdf | 🟡 Medium | Transactional | Links to .doc, not PDF |
| nmc revalidation form 2 example | 🟡 Medium | Informational | Single example |
| nmc revalidation form 3 example | 🟡 Medium | Informational | Single example |
| nmc revalidation form 4 example | 🟡 Medium | Informational | Single example |
| nmc revalidation confirmation form download | 🟡 Medium | Transactional | Yes |
| nmc revalidation proof of practice hours | 🟡 Low | Informational | No dedicated post |
| nmc revalidation portfolio checklist | 🟡 Medium | Informational | Yes |
| nmc reflective account template word | 🔴 High | Transactional | Indirect (links) |
| nmc cpd log template | 🔴 High | Transactional | Indirect (links) |
| nmc revalidation app for nurses | 🔴 High | Commercial | Yes |
| nmc revalidation for dummies | 🟡 Medium | Informational | No |

---

## 5. Changes Made (This Session)

### Blog Post: nmc-revalidation-forms-2026.html
- **Title**: More direct, includes "Fill & Submit" + "(With Examples)" for competitive relevance
- **Meta description**: Expanded from 120 chars to 159, includes "completed examples", "step-by-step instructions", "smarter alternative"
- **H1**: Updated to match title
- **Structure**: Added anchor navigation links (Download / How to fill / Mistakes / Timeline)
- **FAQ section**: Added 3 new high-volume questions (fillable PDFs, Forms 1-6 difference, app alternative)
- **FAQ schema**: Updated to match new questions with richer answers
- **"Paper forms" section**: Replaced with comparison table (NMC Word Templates vs Revalidation Copilot)
- **CTA**: Strengthened — clearer value prop, mentions "10 minutes per reflection"
- **Article schema**: Updated headline + description
- **Breadcrumb schema**: Updated label

### Sitemap
- **Priority**: Forms page bumped from 0.8 to 0.9
- **Lastmod**: Updated to today's date
- **Changefreq**: Changed to weekly

---

## 6. Recommended Next Actions

### This Week
1. ✅ Forms page updated and committed (done)
2. **Blog index page**: Reorder to put "Forms 2026" in featured section at top
3. **Add at least 1 image per blog post** — doesn't need to be fancy. Screenshot of the form, or a clean stock photo of a nurse with a tablet. With descriptive alt text.

### This Month
4. **Create "NMC Revalidation Forms PDF Bundle"** — a downloadable PDF that bundles all completed example forms + blank templates. This directly attacks Scribd/DocHub on their own turf. Gate it behind email signup or app download.
5. **Pillar+cluster content strategy**: Make the "Forms" page a pillar and link 10 subtopic articles to it
6. **Connect Google Search Console** — this is the #1 action for visibility into actual ranking data
7. **Add visible breadcrumb navigation** to all blog posts (currently only JSON-LD)

### Next Quarter
8. **Get SerpAPI key** for weekly ranking tracking
9. **Add alt-text images to all blog posts**
10. **Build backlinks** — nurse forums, NHS trust intranets, RCN forums

---

## 7. Verdict

The drop from 6→12 is **recoverable**. The primary cause is competitive pressure from DocHub and Scribd on a search query where we were a thin directory page. The fixes applied today address the core weaknesses (thin content, poor title, weak value prop, no comparison table, shallow FAQ). With images added and Search Console connected, you should see recovery within 2-4 weeks.

**Key stat worth tracking**: if this page returns to position 6, at 100 searches/month with a 4% CTR, that's ~4 additional organic visits per month. If each visit converts at 1% (our benchmark from GA4): 0.04 downloads/month. The real value isn't from this page directly: it's as the entry point for the content cluster that moves other pages up.

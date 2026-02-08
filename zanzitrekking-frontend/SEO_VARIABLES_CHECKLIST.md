# SEO Variables Quick Reference Checklist

## 🔴 Critical Variables (Check Weekly)

### 1. BASE_URL Configuration
**File**: `src/config/routes.js` line 6
```javascript
export const BASE_URL = "https://booking.zanzisafaris.com";
```
- [ ] Matches production domain exactly
- [ ] Uses HTTPS
- [ ] No trailing slash

### 2. Title Tags
**File**: `src/config/routes.js` → `metadata.title`
- [ ] Length: 50-60 characters
- [ ] Unique per page
- [ ] Includes brand name
- [ ] Includes primary keyword

**Dynamic Titles** (from API):
- [ ] Trip titles don't exceed 60 chars
- [ ] Blog titles don't exceed 60 chars
- [ ] Job titles don't exceed 60 chars

### 3. Meta Descriptions
**File**: `src/config/routes.js` → `metadata.description`
- [ ] Length: 150-160 characters
- [ ] Unique per page
- [ ] Includes call-to-action
- [ ] Includes primary keyword

**Dynamic Descriptions** (from API):
- [ ] Trip descriptions exist and are quality
- [ ] Blog descriptions exist and are quality
- [ ] Job descriptions exist and are quality

### 4. Image URLs
**File**: `src/components/SEO.jsx` + API responses
- [ ] All images use absolute URLs
- [ ] Images are accessible (no 404s)
- [ ] Recommended size: 1200x630px for OG images
- [ ] File size < 1MB

### 5. Canonical URLs
**File**: `src/components/SEO.jsx` line 486
- [ ] Absolute URLs (not relative)
- [ ] One canonical per page
- [ ] Matches actual URL
- [ ] No duplicate canonicals

### 6. Structured Data (JSON-LD)
**File**: `src/components/SEO.jsx` → `getStructuredData()`
- [ ] Valid JSON syntax
- [ ] Required fields present
- [ ] URLs are absolute
- [ ] Images are absolute URLs
- [ ] Test with Rich Results Test

---

## 🟡 Important Variables (Check Monthly)

### 7. Route Metadata
**File**: `src/config/routes.js`
- [ ] All routes have metadata
- [ ] Priority values set correctly (1.0 = highest)
- [ ] Change frequency set appropriately
- [ ] Robots directive correct (index/noindex)

### 8. Dynamic Content Variables
**From API Responses**:

**Trip Data** (`/trip-get/:tripId`):
- [ ] `trip.title` - exists, unique
- [ ] `trip.description` - exists, quality content
- [ ] `trip.images[0]` - exists, accessible
- [ ] `trip.price` - for structured data (optional)
- [ ] `trip.duration` - for structured data (optional)
- [ ] `trip.location` - for structured data (optional)

**Blog Data** (`/blogPost-get/:blogId`):
- [ ] `blogPost.title` - exists, unique
- [ ] `blogPost.description` - exists, quality
- [ ] `blogPost.image` - exists, accessible
- [ ] `blogPost.createdAt` - for datePublished
- [ ] `blogPost.updatedAt` - for dateModified
- [ ] `blogPost.category` - for articleSection
- [ ] `blogPost.tags` - for keywords

**Job Data** (`/job-get/:jobId`):
- [ ] `job.title` - exists, unique
- [ ] `job.description` - exists, quality
- [ ] `job.createdAt` - for datePosted
- [ ] `job.employmentType` - for structured data
- [ ] `job.salary` - for structured data (optional)

### 9. Performance Metrics
- [ ] First Contentful Paint (FCP): < 1.8s
- [ ] Largest Contentful Paint (LCP): < 2.5s
- [ ] Time to Interactive (TTI): < 3.8s
- [ ] Cumulative Layout Shift (CLS): < 0.1

### 10. Mobile Optimization
- [ ] Mobile-friendly test passes
- [ ] Viewport meta tag present
- [ ] Touch targets > 44x44px
- [ ] Text readable without zooming

---

## 🟢 Recommended Variables (Check Quarterly)

### 11. Content Quality
- [ ] Unique, valuable content
- [ ] Keyword optimization (natural)
- [ ] Regular blog updates
- [ ] Content length: 300+ words minimum

### 12. Image Optimization
- [ ] Alt text on all images
- [ ] Images optimized (WebP preferred)
- [ ] Lazy loading for below-fold images
- [ ] Proper image dimensions

### 13. Sitemap & Robots
- [ ] Sitemap exists and accessible
- [ ] All public pages included
- [ ] Updated regularly
- [ ] Robots.txt allows crawling

---

## Code Variables Reference

### Route Configuration Variables
```javascript
// src/config/routes.js
{
  path: "/",
  priority: 1.0,              // ⚠️ Monitor
  changefreq: "daily",         // ⚠️ Monitor
  metadata: {
    title: "...",              // ⚠️ CRITICAL
    description: "...",        // ⚠️ CRITICAL
    keywords: "...",           // ⚠️ Monitor
    image: "...",             // ⚠️ CRITICAL
    type: "website",           // ✅ Usually correct
    robots: "index, follow"    // ⚠️ Monitor
  }
}
```

### SEO Component Variables
```javascript
// src/components/SEO.jsx
const baseUrl = BASE_URL;                    // ⚠️ CRITICAL
const currentUrl = `${baseUrl}${location.pathname}`; // ⚠️ Monitor
const fullImageUrl = image.startsWith("http") ? image : `${baseUrl}${image}`; // ⚠️ Monitor
```

### Dynamic Metadata Variables
```javascript
// From API responses
metadata = {
  title: `${data.trip.title} | Safari Details | Zanzi Safaris`, // ⚠️ Length check
  description: data.trip.description.substring(0, 160),        // ⚠️ Quality check
  image: data.trip.images?.[0] || "/images/newZanzi.jpg"        // ⚠️ Existence check
}
```

---

## Testing Checklist

### Weekly Tests
- [ ] Google Rich Results Test (sample pages)
- [ ] Check canonical URLs (sample pages)
- [ ] Verify meta tags (sample pages)
- [ ] Check for broken images

### Monthly Tests
- [ ] Google PageSpeed Insights (all key pages)
- [ ] Lighthouse SEO audit (all key pages)
- [ ] Mobile-friendly test (all key pages)
- [ ] Structured data validation (all types)
- [ ] Sitemap accessibility
- [ ] Robots.txt validation

### Quarterly Tests
- [ ] Full site crawl (Screaming Frog or similar)
- [ ] Backlink audit
- [ ] Content quality review
- [ ] Schema.org compliance check

---

## Quick Validation Commands

### Check BASE_URL
```bash
# Verify BASE_URL matches production
grep -r "BASE_URL" src/config/routes.js
```

### Check Title Lengths
```javascript
// In browser console on any page
document.querySelector('title').text.length // Should be 50-60
```

### Check Description Length
```javascript
// In browser console
document.querySelector('meta[name="description"]').content.length // Should be 150-160
```

### Check Canonical URL
```javascript
// In browser console
document.querySelector('link[rel="canonical"]').href // Should be absolute URL
```

### Check Structured Data
```javascript
// In browser console
JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent)
```

---

## Red Flags

🚨 **Immediate Action**:
- BASE_URL doesn't match production
- Missing title or description on any page
- Broken images (404 errors)
- Invalid structured data
- Canonical URL incorrect

⚠️ **Monitor Closely**:
- Title/description too long or too short
- Images not optimized
- Slow page load (> 3s)
- Missing alt text
- Duplicate content

---

## Expected Values

| Variable | Optimal Range | Your Status |
|----------|---------------|-------------|
| Title Length | 50-60 chars | ✅ Monitored |
| Description Length | 150-160 chars | ✅ Monitored |
| Image Size (OG) | 1200x630px | ⚠️ Verify |
| Image File Size | < 1MB | ⚠️ Verify |
| LCP | < 2.5s | ⚠️ Monitor |
| FCP | < 1.8s | ⚠️ Monitor |
| CLS | < 0.1 | ⚠️ Monitor |
| SEO Score | 90-100 | ✅ Expected |

---

## Action Items

### Immediate (This Week)
1. [ ] Verify BASE_URL matches production
2. [ ] Test structured data with Rich Results Test
3. [ ] Check title/description lengths on key pages
4. [ ] Verify all images are accessible

### Short Term (This Month)
1. [ ] Run full Lighthouse audit
2. [ ] Optimize images (WebP, compression)
3. [ ] Add alt text to all images
4. [ ] Generate and submit sitemap
5. [ ] Set up Google Search Console

### Long Term (This Quarter)
1. [ ] Content quality audit
2. [ ] Backlink building strategy
3. [ ] Schema markup expansion
4. [ ] Performance optimization
5. [ ] Regular content updates

---

**Remember**: SEO is ongoing. Monitor these variables regularly to maintain high scores!

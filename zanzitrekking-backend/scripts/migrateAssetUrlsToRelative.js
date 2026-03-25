/**
 * One-time migration: rewrite self-hosted asset fields from absolute http(s) URLs
 * to path-only values like /uploads/file.jpg or /uploads/cv_files/file.pdf
 * (also rewrites legacy /public/uploads/... → /uploads/...)
 *
 * Usage (from zanzitrekking-backend):
 *   DB_URL="your-uri" node scripts/migrateAssetUrlsToRelative.js --dry-run
 *   DB_URL="your-uri" node scripts/migrateAssetUrlsToRelative.js
 *
 * After migrating Atlas, sync local from Atlas (example — adjust DB names if yours differ):
 *
 *   mongodump --uri="mongodb+srv://USER:PASS@cluster/DBNAME" --out=./dump-atlas
 *
 *   # If local DB name differs from Atlas, use namespace mapping:
 *   mongorestore --uri="mongodb://127.0.0.1:27017" \
 *     --nsFrom="AtlasDbName.*" --nsTo="LocalDbName.*" \
 *     --drop ./dump-atlas/AtlasDbName
 *
 * Or same name on both sides:
 *   mongorestore --uri="mongodb://127.0.0.1:27017/LocalDbName" --drop ./dump-atlas/AtlasDbName
 */

require("dotenv").config();
const mongoose = require("mongoose");

const DRY_RUN =
  process.argv.includes("--dry-run") || process.argv.includes("-n");

/** Leave these full URLs unchanged (third-party or non-upload assets). */
function shouldPreserveExternalUrl(url) {
  const patterns = [
    "ui-avatars.com",
    "logo.clearbit.com",
    "wetravel.com",
    "wetravel.to",
    "images.unsplash.com",
    "googleusercontent.com",
    "googleapis.com",
    "graph.facebook.com",
  ];
  return patterns.some((p) => url.includes(p));
}

/**
 * @param {string|null|undefined} value
 * @returns {string|null|undefined}
 */
function toUploadsPath(pathname) {
  if (pathname.startsWith("/public/uploads/")) {
    return pathname.replace(/^\/public\/uploads/, "/uploads");
  }
  return pathname;
}

function normalizeUrl(value) {
  if (value == null || typeof value !== "string") return value;
  const s = value.trim();
  if (s === "") return s;
  if (!/^https?:\/\//i.test(s)) {
    if (s.startsWith("/public/uploads/")) {
      return toUploadsPath(s);
    }
    return s;
  }
  if (shouldPreserveExternalUrl(s)) return s;
  try {
    const pathname = new URL(s).pathname;
    if (pathname.startsWith("/public/uploads/") || pathname.startsWith("/uploads/")) {
      return toUploadsPath(pathname);
    }
    if (pathname.startsWith("/public/")) return pathname;
  } catch {
    return s;
  }
  return s;
}

function applyIfChanged(doc, field, set) {
  const cur = doc.get ? doc.get(field) : doc[field];
  const next = normalizeUrl(cur);
  if (next !== cur) {
    if (doc.set) doc.set(field, next);
    else doc[field] = next;
    return true;
  }
  return false;
}

async function run() {
  const uri = process.env.DB_URL || process.env.MONGODB_URI;
  if (!uri) {
    console.error("Set DB_URL or MONGODB_URI in .env or the environment.");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected.");
  if (DRY_RUN) console.log("DRY RUN — no writes.\n");

  let totalUpdated = 0;

  const Trip = require("../models/trip");
  for await (const doc of Trip.find()) {
    let m = false;
    if (applyIfChanged(doc, "mainImage")) m = true;
    if (applyIfChanged(doc, "mainVideo")) m = true;
    if (doc.days?.length) {
      doc.days.forEach((day, i) => {
        if (day.image) {
          const n = normalizeUrl(day.image);
          if (n !== day.image) {
            doc.days[i].image = n;
            m = true;
          }
        }
      });
      if (m) doc.markModified("days");
    }
    if (m) {
      totalUpdated++;
      if (!DRY_RUN) await doc.save();
    }
  }
  console.log(`Trip: ${totalUpdated} documents ${DRY_RUN ? "would be " : ""}updated`);

  const BlogPost = require("../models/blogPost");
  let blogCount = 0;
  for await (const doc of BlogPost.find()) {
    let m = false;
    if (applyIfChanged(doc, "mainImage")) m = true;
    if (applyIfChanged(doc, "creatorImage")) m = true;
    if (doc.relatedImages) {
      ["image1", "image2"].forEach((k) => {
        if (doc.relatedImages[k]) {
          const n = normalizeUrl(doc.relatedImages[k]);
          if (n !== doc.relatedImages[k]) {
            doc.relatedImages[k] = n;
            m = true;
          }
        }
      });
      if (m) doc.markModified("relatedImages");
    }
    if (m) {
      blogCount++;
      if (!DRY_RUN) await doc.save();
    }
  }
  console.log(`BlogPost: ${blogCount} documents ${DRY_RUN ? "would be " : ""}updated`);

  const Category = require("../models/category");
  let catCount = 0;
  for await (const doc of Category.find()) {
    if (applyIfChanged(doc, "image")) {
      catCount++;
      if (!DRY_RUN) await doc.save();
    }
  }
  console.log(`Category: ${catCount} documents ${DRY_RUN ? "would be " : ""}updated`);

  const Banner = require("../models/banner");
  let banCount = 0;
  for await (const doc of Banner.find()) {
    let m = false;
    if (applyIfChanged(doc, "sharedVideo")) m = true;
    if (doc.banners?.length) {
      doc.banners.forEach((b, i) => {
        if (b.image) {
          const n = normalizeUrl(b.image);
          if (n !== b.image) {
            doc.banners[i].image = n;
            m = true;
          }
        }
      });
      if (m) doc.markModified("banners");
    }
    if (m) {
      banCount++;
      if (!DRY_RUN) await doc.save();
    }
  }
  console.log(`Banner: ${banCount} documents ${DRY_RUN ? "would be " : ""}updated`);

  const Partner = require("../models/partner");
  let pCount = 0;
  for await (const doc of Partner.find()) {
    if (applyIfChanged(doc, "logo")) {
      pCount++;
      if (!DRY_RUN) await doc.save();
    }
  }
  console.log(`Partner: ${pCount} documents ${DRY_RUN ? "would be " : ""}updated`);

  const Client = require("../models/client");
  let clCount = 0;
  for await (const doc of Client.find()) {
    if (doc.logo && normalizeUrl(doc.logo) !== doc.logo) {
      doc.logo = normalizeUrl(doc.logo);
      clCount++;
      if (!DRY_RUN) await doc.save();
    }
  }
  console.log(`Client (logo only): ${clCount} documents ${DRY_RUN ? "would be " : ""}updated`);

  const Achievement = require("../models/achievement");
  let achCount = 0;
  for await (const doc of Achievement.find()) {
    if (doc.image && normalizeUrl(doc.image) !== doc.image) {
      doc.image = normalizeUrl(doc.image);
      achCount++;
      if (!DRY_RUN) await doc.save();
    }
  }
  console.log(`Achievement: ${achCount} documents ${DRY_RUN ? "would be " : ""}updated`);

  const JobApplication = require("../models/jobApplication");
  let jobCount = 0;
  for await (const doc of JobApplication.find()) {
    if (doc.cvFile && normalizeUrl(doc.cvFile) !== doc.cvFile) {
      doc.cvFile = normalizeUrl(doc.cvFile);
      jobCount++;
      if (!DRY_RUN) await doc.save();
    }
  }
  console.log(`JobApplication: ${jobCount} documents ${DRY_RUN ? "would be " : ""}updated`);

  const Admin = require("../models/admin");
  let admCount = 0;
  for await (const doc of Admin.find()) {
    if (doc.image && normalizeUrl(doc.image) !== doc.image) {
      doc.image = normalizeUrl(doc.image);
      admCount++;
      if (!DRY_RUN) await doc.save();
    }
  }
  console.log(`Admin: ${admCount} documents ${DRY_RUN ? "would be " : ""}updated`);

  const Cart = require("../models/cart");
  let cartCount = 0;
  for await (const doc of Cart.find()) {
    if (doc.mainImage && normalizeUrl(doc.mainImage) !== doc.mainImage) {
      doc.mainImage = normalizeUrl(doc.mainImage);
      cartCount++;
      if (!DRY_RUN) await doc.save();
    }
  }
  console.log(`Cart: ${cartCount} documents ${DRY_RUN ? "would be " : ""}updated`);

  const Order = require("../models/order");
  let ordCount = 0;
  for await (const doc of Order.find()) {
    let m = false;
    if (doc.cartItems?.length) {
      doc.cartItems.forEach((item, i) => {
        if (item.mainImage) {
          const n = normalizeUrl(item.mainImage);
          if (n !== item.mainImage) {
            doc.cartItems[i].mainImage = n;
            m = true;
          }
        }
      });
      if (m) doc.markModified("cartItems");
    }
    if (m) {
      ordCount++;
      if (!DRY_RUN) await doc.save();
    }
  }
  console.log(`Order (cartItems.mainImage): ${ordCount} documents ${DRY_RUN ? "would be " : ""}updated`);

  const Accommodation = require("../models/accommodation");
  let accCount = 0;
  for await (const doc of Accommodation.find()) {
    if (!doc.images?.length) continue;
    let m = false;
    doc.images = doc.images.map((img) => {
      const n = normalizeUrl(img);
      if (n !== img) m = true;
      return n;
    });
    if (m) {
      accCount++;
      doc.markModified("images");
      if (!DRY_RUN) await doc.save();
    }
  }
  console.log(`Accommodation: ${accCount} documents ${DRY_RUN ? "would be " : ""}updated`);

  const WhoWeAre = require("../models/whoWeAre");
  let whoCount = 0;
  for await (const doc of WhoWeAre.find()) {
    let m = false;
    ["image1", "image2", "image3"].forEach((f) => {
      if (doc[f] && normalizeUrl(doc[f]) !== doc[f]) {
        doc[f] = normalizeUrl(doc[f]);
        m = true;
      }
    });
    if (m) {
      whoCount++;
      if (!DRY_RUN) await doc.save();
    }
  }
  console.log(`WhoWeAre: ${whoCount} documents ${DRY_RUN ? "would be " : ""}updated`);

  const Wishlist = require("../models/wishlist");
  let wishCount = 0;
  for await (const doc of Wishlist.find()) {
    if (doc.mainImage && normalizeUrl(doc.mainImage) !== doc.mainImage) {
      doc.mainImage = normalizeUrl(doc.mainImage);
      wishCount++;
      if (!DRY_RUN) await doc.save();
    }
  }
  console.log(`Wishlist: ${wishCount} documents ${DRY_RUN ? "would be " : ""}updated`);

  const Review = require("../models/review");
  let revCount = 0;
  for await (const doc of Review.find()) {
    if (!doc.images?.length) continue;
    let m = false;
    doc.images = doc.images.map((img) => {
      const n = normalizeUrl(img);
      if (n !== img) m = true;
      return n;
    });
    if (m) {
      revCount++;
      doc.markModified("images");
      if (!DRY_RUN) await doc.save();
    }
  }
  console.log(`Review (images[]): ${revCount} documents ${DRY_RUN ? "would be " : ""}updated`);

  await mongoose.disconnect();
  console.log("\nDone.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

/**
 * One-time migration: generate unique human-readable slugs for:
 * - Trip (from mainTitle)
 * - BlogPost (from mainTitle)
 * - Job (from title)
 *
 * Usage (from zanzitrekking-backend):
 *   DB_URL="your-uri" node scripts/generateSlugs.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const slugify = require("slugify");

const isMongoObjectId = (value) => /^[a-f\d]{24}$/i.test(String(value || ""));

async function generateUniqueSlug({ model, base, excludeId }) {
  const baseSlug = slugify(base || "", { lower: true, strict: true });
  if (!baseSlug) return "";

  let slug = baseSlug;
  let counter = 2;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const query = { slug };
    if (excludeId && isMongoObjectId(excludeId)) {
      query._id = { $ne: new mongoose.Types.ObjectId(excludeId) };
    }

    const exists = await model.findOne(query).select("_id").lean();
    if (!exists) return slug;

    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }
}

async function backfillSlugsForModel({ label, model, cursorQuery, getBase }) {
  let processed = 0;
  let updated = 0;
  let skippedNoBase = 0;

  for await (const doc of model.find(cursorQuery)) {
    processed += 1;
    try {
      const base = getBase(doc);
      if (!base || String(base).trim() === "") {
        skippedNoBase += 1;
        continue;
      }

      const slug = await generateUniqueSlug({
        model,
        base,
        excludeId: doc._id.toString(),
      });

      if (!slug) {
        skippedNoBase += 1;
        continue;
      }

      doc.slug = slug;
      await doc.save();
      updated += 1;

      if (processed % 100 === 0) {
        console.log(`${label}: processed ${processed}, updated ${updated}`);
      }
    } catch (err) {
      console.error(`${label}: error on _id=${doc?._id}:`, err?.message || err);
    }
  }

  console.log(
    `${label}: done. processed=${processed} updated=${updated} skippedNoBase=${skippedNoBase}`
  );
}

async function run() {
  const uri = process.env.DB_URL || process.env.MONGODB_URI;
  if (!uri) {
    console.error("Set DB_URL or MONGODB_URI in .env or the environment.");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected.");

  const Trip = require("../models/trip");
  const BlogPost = require("../models/blogPost");
  const Job = require("../models/job");

  await backfillSlugsForModel({
    label: "Trip",
    model: Trip,
    cursorQuery: {
      $or: [{ slug: { $exists: false } }, { slug: null }, { slug: "" }],
    },
    getBase: (doc) => doc.mainTitle,
  });

  await backfillSlugsForModel({
    label: "BlogPost",
    model: BlogPost,
    cursorQuery: {
      $or: [{ slug: { $exists: false } }, { slug: null }, { slug: "" }],
    },
    getBase: (doc) => doc.mainTitle,
  });

  await backfillSlugsForModel({
    label: "Job",
    model: Job,
    cursorQuery: {
      $or: [{ slug: { $exists: false } }, { slug: null }, { slug: "" }],
    },
    getBase: (doc) => doc.title,
  });

  await mongoose.disconnect();
  console.log("Disconnected.");
}

run().catch((err) => {
  console.error("Migration failed:", err?.message || err);
  process.exit(1);
});


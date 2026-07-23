/**
 * Migration: Backfill clubId for multi-tenancy
 *
 * Usage:
 *   npx tsx scripts/migrate-add-clubId.ts
 *
 * Prerequisites:
 *   - MONGODB_URI set in .env.local (loaded automatically via dotenv)
 *   - Run ONCE after deploying the new DDD models to `extended-toastmaster` branch
 *
 * What it does:
 *   1. Creates a default Club document for "Nifty Toastmasters Club" (if not already present)
 *   2. Backfills clubId on all existing documents in these 8 collections:
 *      members, events, guests, transactions, tasks, plannerrows, clubdocuments, clubresources
 *   3. Prints a summary of updated document counts per collection
 *
 * Safe to re-run: uses { clubId: { $exists: false } } guard so already-migrated
 * documents are skipped without double-writing.
 */

import * as dotenv from "dotenv";
import * as path from "path";
import mongoose from "mongoose";

// Load .env.local from project root
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("❌  MONGODB_URI not set. Add it to .env.local and retry.");
  process.exit(1);
}

const TENANT_COLLECTIONS = [
  "members",
  "events",
  "guests",
  "transactions",
  "tasks",
  "plannerrows",
  "clubdocuments",
  "clubresources",
] as const;

async function migrate() {
  console.log("🔗  Connecting to MongoDB…");
  await mongoose.connect(MONGODB_URI!);
  const db = mongoose.connection.db!;

  // ── Step 1: Create or find default Club ──────────────────────────────────────
  const clubsCol = db.collection("clubs");
  let club = await clubsCol.findOne({ name: "Nifty Toastmasters Club" });

  if (!club) {
    console.log("🏗   Creating default Club document…");
    const result = await clubsCol.insertOne({
      name:         "Nifty Toastmasters Club",
      clubNumber:   "",
      district:     "District 124",
      division:     "Division B",
      area:         "Area B07",
      address:
        "Nifty Toastmasters Club, Unit 11A, Tropical Noor Tower,\n40 Kazi Nazrul Islam Avenue, Dhaka 1215",
      mapLink:      "https://maps.app.goo.gl/QSYDdKRsGKYSPKaf7",
      mission:
        "We provide a supportive and positive learning experience in which members are empowered to develop communication and leadership skills, resulting in greater self-confidence and personal growth.",
      timezone:     "Asia/Dhaka",
      currency:     "BDT",
      logoUrl:      "",
      logoPublicId: "",
      createdAt:    new Date(),
      updatedAt:    new Date(),
    });
    club = { _id: result.insertedId };
    console.log(`    ✓ Club created with _id: ${result.insertedId}\n`);
  } else {
    console.log(`    ✓ Found existing Club: ${club._id}\n`);
  }

  const clubId = club._id;

  // ── Step 2: Backfill clubId on all tenant collections ────────────────────────
  console.log("📦  Backfilling clubId on tenant collections…");

  let totalUpdated = 0;

  for (const colName of TENANT_COLLECTIONS) {
    const col = db.collection(colName);

    // Count how many docs still need migration
    const pending = await col.countDocuments({ clubId: { $exists: false } });

    if (pending === 0) {
      console.log(`    ⏭   ${colName}: already migrated (0 pending)`);
      continue;
    }

    const result = await col.updateMany(
      { clubId: { $exists: false } },
      { $set: { clubId } },
    );

    totalUpdated += result.modifiedCount;
    console.log(`    ✓ ${colName}: ${result.modifiedCount} / ${pending} documents updated`);
  }

  console.log(`\n✅  Migration complete! Total documents updated: ${totalUpdated}`);
  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error("\n❌  Migration failed:", err);
  process.exit(1);
});

// Cosmetic view-count shown to visitors. Real `views` on Article stays
// accurate in the DB (used for "most read" ranking) - this only controls
// what gets rendered, seeded per-article so it's stable within an hour and
// drifts as time passes, landing in the 10,000-12,000 range every time.

function hashString(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return hash >>> 0;
}

function formatDisplayViews(id) {
  const hourBucket = Math.floor(Date.now() / (1000 * 60 * 60));
  const seed = hashString(`${id}-${hourBucket}`);
  const value = 10000 + (seed % 2001); // 10000-12000 inclusive

  return `${(value / 1000).toFixed(1)}K`;
}

module.exports = { formatDisplayViews };

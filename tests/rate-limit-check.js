// Rate-limit check. Plain Node 18+, no packages.
//
// Usage:
//   node tests/rate-limit-check.js                        -> http://localhost:3000
//   node tests/rate-limit-check.js https://your-app.onrender.com
//
// It sends 30 POSTs to /api/phrases with EMPTY text. The server counts each request toward the
// rate limit BEFORE it checks the text, so you will see 400s and then 429s, but the AI model is
// never called and this costs nothing.
//
// Heads up: it uses up your IP's 20-requests-per-10-minutes allowance on that server, so a real
// request from the same IP will also get a 429 until the window ends (about 10 minutes).

const base = (process.argv[2] || "http://localhost:3000").replace(/\/+$/, "");
const TOTAL = 30;

async function main() {
  console.log("Target: " + base + "/api/phrases  (" + TOTAL + " requests, empty text)\n");
  const counts = {};
  let firstBlocked = null;
  for (let i = 1; i <= TOTAL; i++) {
    let status, note = "";
    try {
      const r = await fetch(base + "/api/phrases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: "" }),
      });
      status = r.status;
      const data = await r.json().catch(() => ({}));
      if (status === 429) note = "  Retry-After: " + r.headers.get("retry-after") + "s  \"" + data.error + "\"";
    } catch (e) {
      console.error("Could not reach " + base + ": " + e.message);
      process.exit(1);
    }
    counts[status] = (counts[status] || 0) + 1;
    if (status === 429 && firstBlocked === null) firstBlocked = i;
    console.log("#" + String(i).padStart(2, "0") + "  " + status + note);
  }
  console.log("\nSummary: " + Object.keys(counts).sort().map((k) => k + " x" + counts[k]).join(", "));
  if (firstBlocked) {
    console.log("PASS: first 429 on request #" + firstBlocked + ".");
  } else {
    console.log("FAIL: no 429 seen. Is the rate limit deployed on this server?");
    process.exit(1);
  }
}

main();

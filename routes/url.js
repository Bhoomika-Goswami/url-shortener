const express = require("express");
const crypto = require("crypto");
const Url = require("../models/Url");

const router = express.Router();

const BASE_URL = (process.env.BASE_URL || "http://localhost:3000").replace(/\/+$/, "");
const ALPHABET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const CODE_REGEX = /^[A-Za-z0-9]{4,10}$/;
const MAX_URL_LENGTH = 2048;

// crypto se random code (Math.random predictable hota hai)
function makeCode(len = 7) {
  let code = "";
  for (let i = 0; i < len; i++) code += ALPHABET[crypto.randomInt(ALPHABET.length)];
  return code;
}

// valid http/https URL? aur apni hi site ka link to nahi (redirect loop)?
function validateUrl(input) {
  if (typeof input !== "string" || input.length > MAX_URL_LENGTH) return null;
  try {
    const parsed = new URL(input.trim());
    if (!["http:", "https:"].includes(parsed.protocol)) return null;
    if (parsed.host === new URL(BASE_URL).host) return null;
    return parsed.href;
  } catch {
    return null;
  }
}

// POST /shorten  ->  long url se short code banao
router.post("/shorten", async (req, res) => {
  const { url } = req.body || {};
  if (!url) return res.status(400).json({ error: "url is required" });

  const clean = validateUrl(url);
  if (!clean) return res.status(400).json({ error: "Enter a valid http/https URL" });

  // code repeat ho jaye to dobara try karo (unique index error 11000 deta hai)
  for (let i = 0; i < 5; i++) {
    try {
      const doc = await Url.create({ code: makeCode(), original: clean });
      return res.status(201).json({ code: doc.code, shortUrl: `${BASE_URL}/${doc.code}` });
    } catch (err) {
      if (err.code !== 11000) {
        console.error(err);
        return res.status(500).json({ error: "Server error" });
      }
    }
  }
  res.status(500).json({ error: "Could not generate a unique code" });
});

// GET /api/stats/:code  ->  clicks aur details (redirect nahi karta, click count nahi badhata)
router.get("/api/stats/:code", async (req, res) => {
  const { code } = req.params;
  if (!CODE_REGEX.test(code)) return res.status(404).json({ error: "Not found" });
  try {
    const doc = await Url.findOne({ code }).lean();
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json({ code: doc.code, original: doc.original, clicks: doc.clicks, createdAt: doc.createdAt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /:code  ->  original site par redirect (ye route sabse last mein rahe)
router.get("/:code", async (req, res) => {
  const { code } = req.params;
  // favicon.ico jaisi requests DB tak na jayein
  if (!CODE_REGEX.test(code)) return res.status(404).send("Not found");
  try {
    const doc = await Url.findOneAndUpdate({ code }, { $inc: { clicks: 1 } });
    if (!doc) return res.status(404).send("Not found");
    res.redirect(doc.original);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
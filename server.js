// server.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const app = express();

// Use environment variable for ADMIN_SECRET
const ADMIN_SECRET = process.env.ADMIN_SECRET;
if (!ADMIN_SECRET) {
    console.error("Error: ADMIN_SECRET environment variable not set!");
    process.exit(1);
}

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-memory database (replace with your DB)
const database = {
    keys: {} // { key: { createdAt, expires } }
};

// Utility: generate unique key
function generateKey() {
    return "ANTARES-" + crypto.randomBytes(4).toString("hex").toUpperCase() + "-" +
        crypto.randomBytes(4).toString("hex").toUpperCase();
}

// Generate key endpoint
app.post("/genkey", (req, res) => {
    const adminSecret = req.headers["x-admin-secret"];

    // 1. Reject if missing header
    if (!adminSecret) {
        return res.status(403).json({ error: "Forbidden - missing x-admin-secret header" });
    }

    // 2. Reject if header doesn't match environment variable
    if (adminSecret !== ADMIN_SECRET) {
        return res.status(403).json({ error: "Forbidden - invalid admin secret" });
    }

    // 3. Generate key
    const key = generateKey();

    // Optional: set expiration in hours from body, default 24h
    const expiresInHours = req.body.expires_in || 24;
    const now = Date.now();
    const expires = now + expiresInHours * 60 * 60 * 1000;

    // 4. Save key in database
    database.keys[key] = {
        createdAt: now,
        expires: expires
    };

    // 5. Respond with the key and expiry
    return res.json({
        key: key,
        expires: expires
    });
});

// Health check
app.get("/", (req, res) => {
    res.send("Antares Key Server running!");
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


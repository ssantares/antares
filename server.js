const express = require("express");
const crypto = require("crypto");

const app = express();
app.use(express.json());

// In-memory storage (test only)
const sessions = new Map();
const keys = new Set();

// Generate random key
function generateKey() {
    return crypto.randomBytes(16).toString("hex").toUpperCase();
}

// Generate session ID
function generateSession() {
    return crypto.randomBytes(12).toString("hex");
}

// Create session
app.post("/session", (req, res) => {
    const session = generateSession();
    sessions.set(session, Date.now() + 5 * 60 * 1000); // 5 min
    res.json({ session });
});

// Generate key (admin/test)
app.post("/genkey", (req, res) => {
    const key = generateKey();
    keys.add(key);
    console.log("Generated key:", key);
    res.json({ key });
});

// Redeem key
app.post("/redeem", (req, res) => {
    const { session, key } = req.body;

    if (!sessions.has(session)) {
        return res.status(403).json({ success: false });
    }

    if (Date.now() > sessions.get(session)) {
        sessions.delete(session);
        return res.status(403).json({ success: false });
    }

    if (!keys.has(key)) {
        return res.status(401).json({ success: false });
    }

    // Redeem
    keys.delete(key);
    sessions.delete(session);

    res.json({ success: true });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Auth server running on port", PORT);
});

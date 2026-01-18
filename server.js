const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

/*
KEY STORAGE FORMAT:
keys = {
  "KEYSTRING": {
     used: false,
     owner: null
  }
}
*/
const keys = {};

// SESSION STORAGE
const sessions = {};

// ===== CREATE A SESSION =====
app.post("/session", (req, res) => {
	const session = Math.random().toString(36).substring(2, 15);
	sessions[session] = { created: Date.now() };
	res.json({ session });
});

// ===== REDEEM KEY =====
app.post("/redeem", (req, res) => {
	const { session, key, playerId } = req.body;

	if (!sessions[session]) {
		return res.json({ success: false, error: "Invalid session" });
	}

	if (!keys[key]) {
		return res.json({ success: false, error: "Invalid key" });
	}

	const entry = keys[key];

	// 🔒 Key already redeemed by someone else
	if (entry.used && entry.owner !== playerId) {
		return res.json({ success: false, error: "Key already used" });
	}

	// 🔒 First redemption
	if (!entry.used) {
		entry.used = true;
		entry.owner = playerId;
		return res.json({ success: true });
	}

	// 🔓 Same player reusing their key
	if (entry.owner === playerId) {
		return res.json({ success: true });
	}

	res.json({ success: false });
});

// ===== GENERATE KEY (YOUR EXISTING PAGE) =====
app.get("/genkey", (req, res) => {
	const key = Math.random().toString(36).substring(2, 14).toUpperCase();
	keys[key] = { used: false, owner: null };
	res.send(key);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Antares server running"));

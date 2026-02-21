
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("MongoDB Error:", err));

// Member Schema
const MemberSchema = new mongoose.Schema({
  telegramId: String,
  username: String,
  expireAt: Date
});

const Member = mongoose.model("Member", MemberSchema);

// Test Route
app.get("/", (req, res) => {
  res.send("Backend is Live 🚀");
});

// Check Member
app.post("/check-member", async (req, res) => {
  const { telegramId } = req.body;

  const member = await Member.findOne({ telegramId });

  if (!member) {
    return res.json({ status: "not_found" });
  }

  const now = new Date();
  const expired = member.expireAt < now;

  res.json({
    status: expired ? "expired" : "active",
    expireAt: member.expireAt
  });
});

// Add or Renew Member
app.post("/add-member", async (req, res) => {
  const { telegramId, username, days } = req.body;

  const expireDate = new Date();
  expireDate.setDate(expireDate.getDate() + days);

  let member = await Member.findOne({ telegramId });

  if (member) {
    member.expireAt = expireDate;
    await member.save();
  } else {
    member = await Member.create({
      telegramId,
      username,
      expireAt: expireDate
    });
  }

  res.json({ status: "success", expireAt: expireDate });
});

// Start Server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});

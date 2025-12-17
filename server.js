const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

const app = express();

/* =======================
   MIDDLEWARE
======================= */
app.use(cors({
  origin: "https://frontend-xi-two-87.vercel.app", // your frontend
  methods: ["GET", "POST"],
  credentials: true
}));
app.use(express.json());

/* =======================
   MONGOOSE SCHEMA
======================= */
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

const Emp = mongoose.model("Employee", userSchema);

/* =======================
   REGISTER API
======================= */
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existUser = await Emp.findOne({ email });
    if (existUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashPassword = await bcrypt.hash(password, 8);

    const emp = new Emp({
      name,
      email,
      password: hashPassword
    });

    await emp.save();

    res.status(201).json({ message: "Registered Successfully!" });

  } catch (error) {
    console.error("REGISTER ERROR:", error);

    if (error.code === 11000) {
      return res.status(409).json({ message: "Email already registered" });
    }

    res.status(500).json({ message: "Internal server error" });
  }
});

/* =======================
   LOGIN API
======================= */
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existUser = await Emp.findOne({ email });
    if (!existUser) {
      return res.status(400).json({ message: "User not exist" });
    }

    const match = await bcrypt.compare(password, existUser.password);
    if (!match) {
      return res.status(400).json({ message: "Password not matched" });
    }

    res.json({ message: "Successfully Login" });

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/* =======================
   CONNECT DB & START SERVER
======================= */
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log("MongoDB Atlas Connected");

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})
.catch(err => {
  console.error("MongoDB connection failed:", err);
});

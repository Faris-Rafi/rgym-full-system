const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../prisma");

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  const { name, email, phone, password } = req.body;

  try {
    const existing = await prisma.member.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const member = await prisma.member.create({
      data: { name, email, phone, passwordHash },
    });

    const token = jwt.sign(
      { id: member.id, email: member.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(201).json({
      message: "Registration successful",
      token,
      member: {
        id: member.id,
        name: member.name,
        email: member.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const member = await prisma.member.findUnique({ where: { email } });
    if (!member) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, member.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: member.id, email: member.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(200).json({
      message: "Login successful",
      token,
      member: {
        id: member.id,
        name: member.name,
        email: member.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get current member
router.get("/me", require("../middleware/auth"), async (req, res) => {
  try {
    const currentMember = await prisma.member.findUnique({
      where: { id: req.member.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isActive: true,
        createdAt: true,
        membership: true,
      },
    });

    res.json(currentMember);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

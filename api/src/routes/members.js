const express = require("express");
const prisma = require("../prisma");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Get all members
router.get("/", authMiddleware, async (req, res) => {
  try {
    const members = await prisma.member.findMany({
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

    res.json(members);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get single member by ID
router.get("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const member = await prisma.member.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isActive: true,
        createdAt: true,
        membership: true,
        checkins: {
          orderBy: { timestamp: "desc" },
          take: 10,
        },
      },
    });

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    res.json(member);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update member
router.put("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { name, phone } = req.body;

  // Members can only update their own profile
  if (req.member.id !== parseInt(id)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  try {
    const updated = await prisma.member.update({
      where: { id: parseInt(id) },
      data: { name, phone },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    });

    res.json({ message: "Profile updated", member: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Deactivate member
router.delete("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  if (req.member.id !== parseInt(id)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  try {
    await prisma.member.update({
      where: { id: parseInt(id) },
      data: { isActive: false },
    });

    res.json({ message: "Account deactivated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

const express = require("express");
const prisma = require("../prisma");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Check-in / Check-out
router.post("/", authMiddleware, async (req, res) => {
  const { type, method } = req.body;

  if (!["entry", "exit"].includes(type)) {
    return res.status(400).json({ message: "Type must be entry or exit" });
  }

  try {
    const checkin = await prisma.checkin.create({
      data: {
        memberId: req.member.id,
        type,
        method: method || "manual",
      },
    });

    res.status(201).json({ message: `${type} recorded`, checkin });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all checkins
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { date } = req.query;

    const where = date
      ? {
          timestamp: {
            gte: new Date(`${date}T00:00:00.000Z`),
            lte: new Date(`${date}T23:59:59.999Z`),
          },
        }
      : {};

    const checkins = await prisma.checkin.findMany({
      where,
      orderBy: { timestamp: "desc" },
      include: {
        member: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.json(checkins);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get checkins for a specific member
router.get("/member/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const checkins = await prisma.checkin.findMany({
      where: { memberId: parseInt(id) },
      orderBy: { timestamp: "desc" },
    });

    res.json(checkins);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get today's stats
router.get("/stats/today", authMiddleware, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [totalEntries, totalExits, uniqueMembers] = await Promise.all([
      prisma.checkin.count({
        where: {
          type: "entry",
          timestamp: { gte: today, lt: tomorrow },
        },
      }),
      prisma.checkin.count({
        where: {
          type: "exit",
          timestamp: { gte: today, lt: tomorrow },
        },
      }),
      prisma.checkin.findMany({
        where: {
          type: "entry",
          timestamp: { gte: today, lt: tomorrow },
        },
        distinct: ["memberId"],
        select: { memberId: true },
      }),
    ]);

    res.json({
      date: today,
      totalEntries,
      totalExits,
      currentlyInside: totalEntries - totalExits,
      uniqueMembers: uniqueMembers.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

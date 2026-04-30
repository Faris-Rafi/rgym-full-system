const express = require("express");
const prisma = require("../prisma");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Create a payment
router.post("/", authMiddleware, async (req, res) => {
  const { amount, method } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: "Valid amount is required" });
  }

  try {
    const payment = await prisma.payment.create({
      data: {
        memberId: req.member.id,
        amount,
        method: method || "cash",
        status: "pending",
      },
    });

    res.status(201).json({ message: "Payment created", payment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Confirm a payment (mark as success)
router.put("/:id/confirm", authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const payment = await prisma.payment.findUnique({
      where: { id: parseInt(id) },
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (payment.status === "success") {
      return res.status(400).json({ message: "Payment already confirmed" });
    }

    const updated = await prisma.payment.update({
      where: { id: parseInt(id) },
      data: {
        status: "success",
        paidAt: new Date(),
      },
    });

    res.json({ message: "Payment confirmed", payment: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Cancel a payment
router.put("/:id/cancel", authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const payment = await prisma.payment.findUnique({
      where: { id: parseInt(id) },
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (payment.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Only pending payments can be cancelled" });
    }

    const updated = await prisma.payment.update({
      where: { id: parseInt(id) },
      data: { status: "failed" },
    });

    res.json({ message: "Payment cancelled", payment: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all payments
router.get("/", authMiddleware, async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { memberId: req.member.id },
      orderBy: { createdAt: "desc" },
    });

    res.json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get single payment by ID
router.get("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const payment = await prisma.payment.findUnique({
      where: { id: parseInt(id) },
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (payment.memberId !== req.member.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.json(payment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get payment stats
router.get("/stats/summary", authMiddleware, async (req, res) => {
  try {
    const totalPaid = await prisma.payment.aggregate({
      where: {
        memberId: req.member.id,
        status: "success",
      },
      _sum: { amount: true },
    });

    const pending = await prisma.payment.count({
      where: {
        memberId: req.member.id,
        status: "pending",
      },
    });

    const lastPayment = await prisma.payment.findFirst({
      where: {
        memberId: req.member.id,
        status: "success",
      },
      orderBy: { paidAt: "desc" },
    });

    res.json({
      totalPaid: totalPaid._sum.amount || 0,
      pendingPayments: pending,
      lastPaymentDate: lastPayment?.paidAt || null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

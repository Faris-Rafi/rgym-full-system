const express = require("express");
const prisma = require("../prisma");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Create a workout
router.post("/", authMiddleware, async (req, res) => {
  const { date, notes, exercises } = req.body;

  if (!exercises || !Array.isArray(exercises) || exercises.length === 0) {
    return res.status(400).json({ message: "Exercises are required" });
  }

  try {
    const workout = await prisma.workout.create({
      data: {
        memberId: req.member.id,
        date: date ? new Date(date) : new Date(),
        notes,
        exercises,
      },
    });

    res.status(201).json({ message: "Workout logged", workout });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all workouts for the logged-in member
router.get("/", authMiddleware, async (req, res) => {
  try {
    const workouts = await prisma.workout.findMany({
      where: { memberId: req.member.id },
      orderBy: { date: "desc" },
    });

    res.json(workouts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get single workout by ID
router.get("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const workout = await prisma.workout.findUnique({
      where: { id: parseInt(id) },
    });

    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }

    if (workout.memberId !== req.member.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.json(workout);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update a workout
router.put("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { notes, exercises } = req.body;

  try {
    const workout = await prisma.workout.findUnique({
      where: { id: parseInt(id) },
    });

    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }

    if (workout.memberId !== req.member.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const updated = await prisma.workout.update({
      where: { id: parseInt(id) },
      data: { notes, exercises },
    });

    res.json({ message: "Workout updated", workout: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete a workout
router.delete("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const workout = await prisma.workout.findUnique({
      where: { id: parseInt(id) },
    });

    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }

    if (workout.memberId !== req.member.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await prisma.workout.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: "Workout deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get workout stats for logged-in member
router.get("/stats/summary", authMiddleware, async (req, res) => {
  try {
    const totalWorkouts = await prisma.workout.count({
      where: { memberId: req.member.id },
    });

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const workoutsThisMonth = await prisma.workout.count({
      where: {
        memberId: req.member.id,
        date: { gte: thisMonth },
      },
    });

    const lastWorkout = await prisma.workout.findFirst({
      where: { memberId: req.member.id },
      orderBy: { date: "desc" },
    });

    res.json({
      totalWorkouts,
      workoutsThisMonth,
      lastWorkout: lastWorkout?.date || null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

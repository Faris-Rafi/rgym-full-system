const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/members", require("./routes/members"));
app.use("/api/checkins", require("./routes/checkins"));
app.use("/api/workouts", require("./routes/workouts"));
app.use("/api/payments", require("./routes/payments"));

app.get("/", (req, res) => {
  res.json({ message: "R-Gym API is running 🏋️" });
});

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});

const express = require("express");
const cookieParser = require("cookie-parser");
const connectToDB = require("./config/db");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8080;
console.log("Running on port:", PORT);

app.use(express.json());
app.use(cookieParser());

// Properly configured CORS for credentials
app.use(
  cors({
    credentials: true,
    origin: function (origin, callback) {
      // Allow requests from these origins
      const allowedOrigins = [
        "http://localhost:5173", // Local development
        "https://kharchez.vercel.app", // Add your production URL here
        process.env.CORS_ORIGIN, // Production frontend URL from env (if applicable)
      ].filter(Boolean); // Remove any undefined entries

      // For non-browser requests or testing
      const originToAllow =
        !origin || allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

      callback(null, originToAllow);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
// Handle preflight requests explicitly
app.options("*", cors());

// Connect to MongoDB
connectToDB();

// Test Route
app.get("/", (req, res) => {
  res.json({ message: "Hello World" });
});

// Routes
const usersRouter = require("./routes/authRoutes");
const expenseRouter = require("./routes/expenseRoutes");
const isUserAuthenticated = require("./middlewares/authMiddleware");

app.use("/api/auth", usersRouter);
app.use("/api/expenses", isUserAuthenticated, expenseRouter);

// Start Server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on PORT: ${PORT}`);
  console.log(
    `Allowed CORS origin(s): ${
      process.env.CORS_ORIGIN || "http://localhost:5173"
    }`
  );
});

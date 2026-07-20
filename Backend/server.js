require("dotenv").config();
const connectDB = require("./config/db");
connectDB();


const express = require("express");
const app = express();
const PORT = 5000;

const mainRoutes = require("./routes/mainRoutes");
const logger = require("./middleware/logger");

app.use(express.json());
app.use(logger);

app.get("/", (req, res) => {
  res.send("Backend is running...");
});

app.use("/", mainRoutes);

app.use((req, res) => {
  res.status(404).send("Route not found");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
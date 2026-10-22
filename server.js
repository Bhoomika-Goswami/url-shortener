require("dotenv").config();
require("node:dns").setServers(["8.8.8.8", "1.1.1.1"]); // Node ke SRV lookup ke liye
const express = require("express");
const connectDB = require("./config/db");
const urlRoutes = require("./routes/url");

const app = express();
app.use(express.json());
app.use(express.static("public")); // public/index.html yahin se serve hoga
app.use("/", urlRoutes);

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
});
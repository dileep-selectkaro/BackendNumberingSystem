const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const cron = require("node-cron");
const userRoute = require("../src/user/routes/route");
const adminRoute = require("./admin/route/adminRoute");
const cors = require("cors");
const app = express();
const cronJob = require("./helper/helper");

require("dotenv").config();

const PORT = process.env.PORT||4000;

app.use(express.json());
app.use(cors());

// Session middleware
app.use(
  session({
    secret: "yourSecretKey",
    resave: false,
    saveUninitialized: false,
  })
);

//const MONGO_URL="mongodb+srv://dileepkm:L3cuCdGwQQWTF3Hs@cluster0.iqkms8u.mongodb.net/AceWeb"

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("successfully Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1);
  });

//...cron Job ....
cronJob();

app.use("/user/api", userRoute);
app.use("/admin/api", adminRoute);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

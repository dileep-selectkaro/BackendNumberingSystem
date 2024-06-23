const express = require("express");
const router = express.Router();
const controller = require("../controllers/auth");
const marketController = require("../controllers/marketDetails");

//==============auth==============
router.post("/signup", controller.signup);
router.post("/login", controller.login);
router.delete("/logout", controller.logout);

//................fetched data..............

router.get("/searchAllData", marketController.searchData);
router.get("/fetchedOne", marketController.fetchedOneData);
router.get("/fetchedfutureTime", marketController.fetchedfutureTime);
// router.get("/search",marketController.search);

module.exports = router;

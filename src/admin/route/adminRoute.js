const express = require("express");
const router = express.Router();
const adminController = require("../controllers/auth");
const controller = require("../controllers/marketDetails");
const marketController = require("../controllers/market");

//===================Auth====================

router.post("/signup", adminController.signup);
router.post("/login", adminController.login);
router.put("/updatePassword",adminController.updatePassword);
router.delete("/logout", adminController.logout);

//================market==============

router.post("/create", marketController.create);
router.get("/getMarketList", marketController.marketList);
router.put("/updateMarket", marketController.updateMarket);
router.delete("/deleteMarket", marketController.deleteMarket);

//================market Details===============


router.get("/get", controller.fetchedData);
router.put("/updateMarketDetails", controller.update);
router.get("/search", controller.search);

module.exports = router;

const marketModel = require("../models/market");

//=================create market=================
const create = async (req, res) => {
  try {
    const data = req.body;

    // market with the same name (case insensitive) already exists
    const existingMarket = await marketModel.findOne({
      market: { $regex: new RegExp("^" + data.market + "$", "i") },
    });

    if (existingMarket) {
      return res.status(400).send({ message: "Market already exists" });
    }

    const savedMarket = await marketModel.create(data);
    res.status(201).send({ message: "Successfully created", savedMarket });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

//=================fetched Market list===========
const marketList = async (req, res) => {
  try {
    const marketList = await marketModel.find({}, { _id: 1, market: 1 }).sort({ market: 1 });;

    res
      .status(200)
      .send({ message: "Market List successfully fetched", marketList });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

//===================update market===================
const updateMarket = async (req, res) => {
  try {
    const { id } = req.query;

    const updateData = req.query;

    const market = await marketModel.findById(id);
    if (!market) {
      return res.status(404).json({ message: "Market not found" });
    }

    const updatedMarket = await marketModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    res
      .status(200)
      .json({ message: "Updated Successfully", data: updatedMarket });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ message: "Error updating Market" });
  }
};

//==================== delete market ===================
const deleteMarket = async (req, res) => {
  try {
    const { id } = req.query;

    const deletedMarket = await marketModel.findByIdAndDelete(id);

    if (!deletedMarket) {
      return res.status(404).json({ message: "Market not found" });
    }

    res
      .status(200)
      .json({ message: "Deleted Successfully", data: deletedMarket });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ message: "Error deleting Market" });
  }
};

module.exports = { create, marketList, updateMarket, deleteMarket };

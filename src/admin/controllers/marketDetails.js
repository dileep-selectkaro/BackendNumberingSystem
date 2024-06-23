const Market = require("../models/market");
const MarketDetails = require("../models/marketDetails");
const cron = require("node-cron");

//=======================fetched  ========================

const fetchedData = async (req, res) => {
  try {
    const data = await MarketDetails.aggregate([
      {
        $project: {
          _id: 1,
          marketName: 1,
          randomNumber: 1,
          time: 1,
          createdAt: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
        },
      },
    ]);

    res.status(200).send({ message: "Data successfully fetched", data });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal server Error" });
  }
};

//=================update by Id ========================
const update = async (req, res) => {
  try {
    const { id } = req.query;
    let { randomNumber } = req.query;
    randomNumber = randomNumber.toString();

    
    if (!/^\d{2}$/.test(randomNumber)) {
      return res.status(400).json({ message: "randomNumber must be a two-digit number" });
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const currentTimeCode = parseInt(`${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`);

   // console.log("ID:", id, "RandomNumber:", randomNumber, "CurrentTimeCode:", currentTimeCode, "StartOfToday:", startOfToday);

    
    const updatedGameDetail = await MarketDetails.findOneAndUpdate(
      { _id: id, createdAt: { $gte: startOfToday }, timeCode: { $gt: currentTimeCode } },
      { $set: { randomNumber: randomNumber } },
      { new: true, runValidators: true, projection: { marketName: 1, randomNumber: 1, time: 1 } }
    );

    if (!updatedGameDetail) {
      return res.status(404).json({ message: "MarketDetail not found or not scheduled for a future time" });
    }

    res.status(200).json({ message: "Updated Successfully", data: updatedGameDetail });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ message: "Error updating GameDetail" });
  }
};



// ============search by date with marketName if date not select search current date automatically  =============

const search = async (req, res) => {
  try {
    let { createdAt, marketName } = req.query;

    if (!createdAt) {
      const now = new Date();
      // Convert to UTC
      createdAt =
        (now.getUTCMonth() + 1).toString().padStart(2, "0") +
        "-" +
        now.getUTCDate().toString().padStart(2, "0") +
        "-" +
        now.getUTCFullYear().toString();
    }

    if (!marketName) {
      return res
        .status(400)
        .json({ message: "Market name is required for search." });
    }

    // Parse the date in a way that's independent of the server's time zone
    const parts = createdAt.split("-");
    const year = parseInt(parts[2], 10);
    const month = parseInt(parts[0], 10) - 1;
    const day = parseInt(parts[1], 10);

    const startOfDay = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));

    const data = await MarketDetails.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startOfDay,
            $lte: endOfDay,
          },
          marketName: { $regex: new RegExp(marketName, "i") }, // Case-insensitive search
        },
      },
      {
        $project: {
          _id: 1,
          marketName: 1,
          randomNumber: 1,
          time: 1,
          createdAt: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
        },
      },
    ]);

    res.status(200).json({ message: "Data successfully fetched", data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { fetchedData, update, search };

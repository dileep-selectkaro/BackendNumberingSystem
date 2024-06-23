const marketModel = require("../../admin/models/marketDetails");

//=============Search previous day to  current day with current time===============

const searchData = async (req, res) => {
  try {
    let { createdAt } = req.query;

    if (!createdAt) {
      const now = new Date();
      createdAt = `${(now.getMonth() + 1).toString().padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}-${now.getFullYear().toString()}`;
    }

    let isToday = false;
    let timeText = "";

    const now = new Date();
    const formattedNow = `${(now.getMonth() + 1).toString().padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}-${now.getFullYear().toString()}`;

    const parts = createdAt.split("-");
    const year = parseInt(parts[2], 10);
    const month = parseInt(parts[0], 10) - 1;
    const day = parseInt(parts[1], 10);
    const startOfDay = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));

    if (createdAt === formattedNow) {
      isToday = true;
      timeText = parseInt(`${now.getHours().toString().padStart(2, "0")}${now.getMinutes().toString().padStart(2, "0")}`);
    } else {
      isToday = false;
      let getH = '23';
      timeText = parseInt(`${getH.toString().padStart(2, "0")}${now.getMinutes().toString().padStart(2, "0")}`);
    }

    const data = await marketModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startOfDay,
            $lte: endOfDay,
          },
          timeCode: {
            $lte: timeText
          }
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


// =============fetched only one Current time Data============

const fetchedOneData = async (req, res) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const tempTimeCode = parseInt(
      `${now.getHours().toString().padStart(2, "0")}${now
        .getMinutes()
        .toString()
        .padStart(2, "0")}`
    );

    const data = await marketModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfToday, $lte: now },
          timeCode: { $lte: tempTimeCode },
        }
      },
      {
        $sort: { marketName: 1 } 
      },
      {
        $sort: { timeCode: -1 } 
      },
      {
        $group: {
          _id: "$marketName",
          latestData: { $first: "$$ROOT" }, 
        },
      },
      {
        $sort: { "_id": 1 } 
      },
      {
        $replaceRoot: { newRoot: "$latestData" }, 
      },
      {
        $project: {
          _id: 1,
          marketName: 1,
          randomNumber: 1,
          time: 1,
          createdAt: {
            $dateToString: { format: "%Y-%m-%d %H:%M:%S", date: "$createdAt" },
          },
        },
      },
    ]);

    if (data.length > 0) {
      res.status(200).send({ message: "Data successfully fetched", data });
    } else {
      res.status(404).send({ message: "No data found for the current criteria" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal server error" });
  }
};
// ============ fetched future time  =================

const fetchedfutureTime = async (req, res) => {
  try {
    const now = new Date();

    // Calculate the start of the next 15-minute interval
    const minutes = now.getMinutes();
    const nextIntervalStartMinutes = minutes + (15 - (minutes % 15));
    const future = new Date(now);
    future.setMinutes(nextIntervalStartMinutes, 0, 0); // Set to the next 15-minute interval

    const startOfToday = new Date(now.setHours(0, 0, 0, 0));
    const futureTimeCode = parseInt(
      `${future.getHours().toString().padStart(2, "0")}${future
        .getMinutes()
        .toString()
        .padStart(2, "0")}`
    );

    const data = await marketModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfToday },
          timeCode: futureTimeCode,
        },
      },
      {
        $sort: { time: 1 }, 
      },
      {
        $limit: 1, 
      },
      {
        $addFields: {
          formattedCreatedAt: {
            $dateToString: { format: "%m-%d-%Y", date: "$createdAt" },
          },
        },
      },
      {
        $project: {
          _id: 0,
          time: 1,
        },
      },
    ]);

    if (data.length > 0) {
      res
        .status(200)
        .send({ message: "Data successfully fetched", data: data[0] });
    } else {
      res
        .status(404)
        .send({ message: "No data found for the current criteria" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal server error" });
  }
};

module.exports = { searchData, fetchedOneData, fetchedfutureTime };

const cron = require("node-cron");
const Market = require("../admin/models/market");
const MarketDetails = require("../admin/models/marketDetails");

const formatTime12 = (hour, minute) => {
  const suffix = hour >= 12 ? "PM" : "AM";
  const formattedHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  const formattedMinute = minute === 0 ? "00" : minute;
  return `${formattedHour}:${formattedMinute} ${suffix}`;
};

// =============time interval  15 minute ================
const createData = async () => {
  console.log("created market Details");
  try {
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      0,
      0,
      0
    );
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23,
      59,
      59
    );

    const markets = await Market.find();
    const savedDatas = [];

    for (const market of markets) {
      // if data already exists for the market today
      const existingMarketData = await MarketDetails.findOne({
        marketName: market.market,
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      });

      if (existingMarketData) {
        console.log(`Data already exists for market: ${market.market}`);
        continue;
      }

      for (let hour = 9; hour <= 21; hour++) {
        const limitMinute = hour === 21 ? 15 : 60;
        for (let minute = 0; minute < limitMinute; minute += 15) {
          const time = formatTime12(hour, minute);
          const randomNum = Math.floor(Math.random() * 100);
          const randomNumber = String(randomNum).padStart(2, "0");
          const timeCode = parseInt(
            `${hour.toString().padStart(2, "0")}${minute
              .toString()
              .padStart(2, "0")}`
          );

          const savedData = await MarketDetails.create({
            market,
            time,
            randomNumber,
            marketName: market.market,
            timeCode,
            createdAt: new Date(),
          });
          savedDatas.push(savedData);
        }
      }
    }
    console.log("Data created successfully for the day");
  } catch (error) {
    console.error("Failed to create data:", error);
  }
};



const cronJob = () => {
  console.log("Cron job started...");
  cron.schedule("30 8 * * *", async () => {
    console.log("Running createData task at 8:30 AM daily");
    await createData();
  });
};

module.exports = cronJob;

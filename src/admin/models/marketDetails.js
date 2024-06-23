const mongoose = require("mongoose");

const marketDetailsSchema = new mongoose.Schema(
  {
    time: String,
    timeCode: Number,
    randomNumber: String,
    marketName: String,
    market: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Market",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("marketDetail", marketDetailsSchema);



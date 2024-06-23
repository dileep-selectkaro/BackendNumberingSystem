const mongoose = require("mongoose");

const marketSchema = new mongoose.Schema(
  {
    market: {
      type: String,
      unique: true,
      required: true,
    },

    status: Boolean,
  },
  { timestamps: true }
);

module.exports = mongoose.model("market", marketSchema);

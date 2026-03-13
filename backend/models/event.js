const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: String,
  description: String,
  date: Date,
  venue: String,      // Event venue/location
  images: [String],   // 🔥 IMAGE PATHS STORED HERE
  club: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Club"
  }
});

module.exports = mongoose.model("Event", eventSchema);
const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true
  },
  name: {
    type: String,
    required: true
  },
  section: {
    type: String,
    required: true
  },
  branch: {
    type: String,
    required: true
  }
}, { timestamps: true });

// Prevent duplicate registrations
registrationSchema.index({ student: 1, event: 1 }, { unique: true });

module.exports = mongoose.model("Registration", registrationSchema);
const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
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
  present: {
    type: Boolean,
    default: true
  },
  markedBy: {
    type: String,
    enum: ["student", "admin"],
    required: true
  },
  markedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Prevent duplicate attendance
attendanceSchema.index({ student: 1, event: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
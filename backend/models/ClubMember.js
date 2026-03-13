const mongoose = require("mongoose");

const clubMemberSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  club: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Club",
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
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
  workFiles: [{
    type: String  // Array of file paths for images/videos
  }],
  requestedAt: {
    type: Date,
    default: Date.now
  },
  approvedAt: {
    type: Date
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
});

// Prevent duplicate join
clubMemberSchema.index({ student: 1, club: 1 }, { unique: true });

module.exports = mongoose.model("ClubMember", clubMemberSchema);
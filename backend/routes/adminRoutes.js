const express = require("express");
const Club = require("../models/Club");
const Event = require("../models/event");
const Registration = require("../models/Registration");
const Attendance = require("../models/Attendance");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

/* =========================
   ADMIN DASHBOARD STATS
========================= */
router.get("/stats", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access only" });
    }

    const totalClubs = await Club.countDocuments();
    const totalEvents = await Event.countDocuments();
    const totalRegistrations = await Registration.countDocuments();
    const totalAttendance = await Attendance.countDocuments();

    res.json({
      totalClubs,
      totalEvents,
      totalRegistrations,
      totalAttendance
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
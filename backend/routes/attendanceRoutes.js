const express = require("express");
const Attendance = require("../models/Attendance");
const Registration = require("../models/Registration");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

/* =========================
   STUDENT MARK ATTENDANCE
========================= */
router.post("/mark/:eventId", auth, async (req, res) => {
  try {
    const eventId = req.params.eventId;

    const registered = await Registration.findOne({
      student: req.user.id,
      event: eventId
    });

    if (!registered) {
      return res.status(400).json({ message: "Not registered for this event" });
    }

    const exists = await Attendance.findOne({
      student: req.user.id,
      event: eventId
    });

    if (exists) {
      return res.status(400).json({ message: "Attendance already marked" });
    }

    const attendance = new Attendance({
      student: req.user.id,
      event: eventId,
      present: true,
      markedBy: "student"
    });

    await attendance.save();

    res.json({ message: "Attendance marked successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   ADMIN MARK ATTENDANCE
========================= */
router.post("/mark-admin/:eventId", auth, async (req, res) => {
  try {
    const { eventId } = req.params;
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({ message: "Student ID is required" });
    }

    // Check if student is registered
    const registered = await Registration.findOne({
      student: studentId,
      event: eventId
    });

    if (!registered) {
      return res.status(400).json({ message: "Student not registered for this event" });
    }

    // Check if attendance already exists
    const exists = await Attendance.findOne({
      student: studentId,
      event: eventId
    });

    if (exists) {
      return res.status(400).json({ message: "Attendance already marked" });
    }

    const attendance = new Attendance({
      student: studentId,
      event: eventId,
      present: true,
      markedBy: "admin"
    });

    await attendance.save();

    res.json({ message: "Attendance marked successfully", attendance });

  } catch (err) {
    console.error("Admin mark attendance error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   DELETE ATTENDANCE (ADMIN)
========================= */
router.delete("/:attendanceId", auth, async (req, res) => {
  try {
    const { attendanceId } = req.params;

    const attendance = await Attendance.findByIdAndDelete(attendanceId);

    if (!attendance) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    res.json({ message: "Attendance removed successfully" });

  } catch (err) {
    console.error("Delete attendance error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   CHECK CERTIFICATE ELIGIBILITY
========================= */
router.get("/check/:eventId", auth, async (req, res) => {
  const attendance = await Attendance.findOne({
    student: req.user.id,
    event: req.params.eventId,
    present: true
  });

  if (!attendance) {
    return res.status(403).json({ message: "Attendance not marked" });
  }

  res.json({ message: "Eligible for certificate" });
});

/* =========================
   GET STUDENT ATTENDANCE FOR A CLUB
========================= */
router.get("/student/:clubId", auth, async (req, res) => {
  try {
    const Event = require("../models/event");
    
    // Get all events for this club
    const events = await Event.find({ club: req.params.clubId });
    const eventIds = events.map(e => e._id);

    // Get attendance records for these events
    const attendanceRecords = await Attendance.find({
      student: req.user.id,
      event: { $in: eventIds }
    }).populate("event", "title date");

    // Map to include status
    const records = attendanceRecords.map(record => ({
      _id: record._id,
      event: record.event,
      status: record.present ? "present" : "absent",
      createdAt: record.createdAt
    }));

    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   GET ATTENDANCE FOR AN EVENT (ADMIN)
========================= */
router.get("/event/:eventId", auth, async (req, res) => {
  try {
    const attendanceRecords = await Attendance.find({ event: req.params.eventId })
      .populate("student", "name email")
      .sort({ createdAt: -1 });

    res.json(attendanceRecords);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
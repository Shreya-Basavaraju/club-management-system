const express = require("express");
const Registration = require("../models/Registration");
const Event = require("../models/event");
const Attendance = require("../models/Attendance");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

/* =========================
   REGISTER FOR EVENT
========================= */
router.post("/register/:eventId", auth, async (req, res) => {
  try {
    const { eventId } = req.params;
    const { name, section, branch } = req.body;

    console.log("Registration attempt:", { eventId, name, section, branch, userId: req.user.id });

    if (!name || !section || !branch) {
      return res.status(400).json({ message: "Name, section, and branch are required" });
    }

    // Check event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check duplicate registration
    const alreadyRegistered = await Registration.findOne({
      student: req.user.id,
      event: eventId
    });

    if (alreadyRegistered) {
      return res.status(400).json({ message: "Already registered for this event" });
    }

    const registration = new Registration({
      student: req.user.id,
      event: eventId,
      name,
      section,
      branch
    });

    await registration.save();

    console.log("Registration successful:", registration);

    res.status(201).json({
      message: "Registered successfully",
      registration
    });

  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   GET MY REGISTRATIONS FOR A CLUB
========================= */
router.get("/my-registrations/:clubId", auth, async (req, res) => {
  try {
    const { clubId } = req.params;

    // Get all events for this club
    const events = await Event.find({ club: clubId });
    const eventIds = events.map(e => e._id);

    // Get registrations for these events
    const registrations = await Registration.find({
      student: req.user.id,
      event: { $in: eventIds }
    }).populate("event", "title date images");

    // Check attendance for each registration
    const registrationsWithAttendance = await Promise.all(
      registrations.map(async (reg) => {
        const attendance = await Attendance.findOne({
          student: req.user.id,
          event: reg.event._id
        });
        
        return {
          _id: reg._id,
          event: reg.event,
          name: reg.name,
          section: reg.section,
          branch: reg.branch,
          attendanceMarked: !!attendance,
          createdAt: reg.createdAt
        };
      })
    );

    res.json(registrationsWithAttendance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   GET REGISTRATIONS FOR AN EVENT (ADMIN)
========================= */
router.get("/event/:eventId", auth, async (req, res) => {
  try {
    const registrations = await Registration.find({ event: req.params.eventId })
      .populate("student", "name email")
      .sort({ createdAt: -1 });

    res.json(registrations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   GET ALL REGISTRATIONS (ADMIN)
========================= */
router.get("/", async (req, res) => {
  try {
    const registrations = await Registration.find()
      .populate("student", "name email")
      .populate("event", "title");

    res.json(registrations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
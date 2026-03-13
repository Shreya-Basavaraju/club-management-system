const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

const Event = require("../models/event");
const Club = require("../models/Club");

/* =========================
   GET EVENTS OF A CLUB
   GET /api/events/club/:clubId
========================= */
router.get("/club/:clubId", async (req, res) => {
  try {
    const club = await Club.findById(req.params.clubId).populate("events");

    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    res.json(club.events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =========================
   GET EVENT DETAILS
   GET /api/events/:eventId
========================= */
router.get("/:eventId", async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =========================
   ADD EVENT TO CLUB
   POST /api/events/:clubId
========================= */
router.post("/:clubId", upload.array("images", 5), async (req, res) => {
  try {
    const { title, description, date, venue } = req.body;
    const { clubId } = req.params;

    if (!title || !date) {
      return res.status(400).json({ message: "Title and date required" });
    }

    const images = req.files
      ? req.files.map(file => file.path)
      : [];

    const event = new Event({
      title,
      description,
      date,
      venue,
      images,
      club: clubId
    });

    const savedEvent = await event.save();

    await Club.findByIdAndUpdate(clubId, {
      $push: { events: savedEvent._id }
    });

    res.status(201).json(savedEvent);

  } catch (err) {
    console.error("Add Event Error:", err);
    res.status(500).json({ message: "Failed to create event" });
  }
});

/* =========================
   DELETE EVENT
   DELETE /api/events/:eventId
========================= */
router.delete("/:eventId", async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    await Club.findByIdAndUpdate(event.club, {
      $pull: { events: event._id },
    });

    await event.deleteOne();

    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =========================
   UPDATE EVENT
   PUT /api/events/:eventId
========================= */
router.put("/:eventId", upload.array("images", 5), async (req, res) => {
  try {
    const { title, description, date, venue } = req.body;
    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    event.title = title || event.title;
    event.description = description || event.description;
    event.date = date || event.date;
    event.venue = venue || event.venue;

    if (req.files && req.files.length > 0) {
      event.images = req.files.map(file => file.path);
    }

    await event.save();
    res.json(event);
  } catch (err) {
    console.error("Update Event Error:", err);
    res.status(500).json({ message: "Failed to update event" });
  }
});

module.exports = router;
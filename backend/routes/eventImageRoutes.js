const express = require("express");
const router = express.Router();
const EventImage = require("../models/EventImage");
const Event = require("../models/event");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const fs = require("fs");
const path = require("path");

// Get all images for an event
router.get("/:eventId", async (req, res) => {
  try {
    const images = await EventImage.find({ event: req.params.eventId }).sort({ uploadedAt: -1 });
    res.json({ images });
  } catch (err) {
    console.error("Error fetching event images:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Upload images for an event (Admin only)
router.post("/:eventId", authMiddleware, upload.array("images", 10), async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    const imagePromises = req.files.map((file) => {
      return EventImage.create({
        event: req.params.eventId,
        path: file.path,
      });
    });

    const images = await Promise.all(imagePromises);
    res.json({ message: "Images uploaded successfully", images });
  } catch (err) {
    console.error("Error uploading event images:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete an image (Admin only)
router.delete("/:eventId/:imageId", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const image = await EventImage.findOne({
      _id: req.params.imageId,
      event: req.params.eventId,
    });

    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }

    // Delete file from filesystem
    const filePath = path.join(__dirname, "..", image.path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await EventImage.findByIdAndDelete(req.params.imageId);
    res.json({ message: "Image deleted successfully" });
  } catch (err) {
    console.error("Error deleting event image:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

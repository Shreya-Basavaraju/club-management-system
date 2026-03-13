const express = require("express");
const router = express.Router();
const Club = require("../models/Club");
const upload = require("../middleware/upload");

/* =========================
   GET ALL CLUBS
========================= */
router.get("/", async (req, res) => {
  try {
    const clubs = await Club.find();
    res.json(clubs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =========================
   🔥 GET SINGLE CLUB (THIS WAS MISSING)
========================= */
router.get("/:id", async (req, res) => {
  try {
    const club = await Club.findById(req.params.id).populate("events");

    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    res.json(club);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =========================
   CREATE CLUB
========================= */
router.post("/", upload.single("logo"), async (req, res) => {
  try {
    const { name, description } = req.body;
    const logo = req.file ? req.file.path : null;

    const club = new Club({
      name,
      description,
      logo,
    });

    await club.save();
    res.status(201).json(club);
  } catch (err) {
    res.status(500).json({ message: "Failed to create club" });
  }
});

/* =========================
   DELETE CLUB
========================= */
router.delete("/:id", async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);

    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    await club.deleteOne();
    res.json({ message: "Club deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =========================
   UPDATE CLUB
========================= */
router.put("/:id", upload.single("logo"), async (req, res) => {
  try {
    const { name, description } = req.body;
    const club = await Club.findById(req.params.id);

    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    club.name = name || club.name;
    club.description = description || club.description;
    
    if (req.file) {
      club.logo = req.file.path;
    }

    await club.save();
    res.json(club);
  } catch (err) {
    res.status(500).json({ message: "Failed to update club" });
  }
});

module.exports = router;
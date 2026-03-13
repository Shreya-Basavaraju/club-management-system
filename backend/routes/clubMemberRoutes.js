const express = require("express");
const ClubMember = require("../models/ClubMember");
const Club = require("../models/Club");
const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const router = express.Router();

/* =========================
   Student requests to join a club with work files
========================= */
router.post("/join/:clubId", auth, upload.array("workFiles", 5), async (req, res) => {
  try {
    const clubId = req.params.clubId;
    const { name, section, branch, description } = req.body;

    console.log("Join club request:", { 
      clubId, 
      name, 
      section, 
      branch,
      description: description?.substring(0, 50) + "...",
      userId: req.user.id,
      files: req.files?.length || 0
    });

    // Validate required fields
    if (!name || !section || !branch || !description) {
      return res.status(400).json({ 
        message: "Name, section, branch, and description are required"
      });
    }

    // Validate files uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        message: "Please upload at least one image or video of your work"
      });
    }

    const clubExists = await Club.findById(clubId);
    if (!clubExists) {
      return res.status(404).json({ message: "Club not found" });
    }

    // Check if already has a request or membership
    const existingMember = await ClubMember.findOne({
      student: req.user.id,
      club: clubId
    });

    if (existingMember) {
      if (existingMember.status === "pending") {
        return res.status(400).json({ message: "You already have a pending request for this club" });
      } else if (existingMember.status === "approved") {
        return res.status(400).json({ message: "You are already a member of this club" });
      }
    }

    // Get file paths
    const workFiles = req.files.map(file => file.path);

    const membership = new ClubMember({
      student: req.user.id,
      club: clubId,
      name: name.trim(),
      section: section.trim(),
      branch: branch.trim(),
      description: description.trim(),
      status: "pending",
      workFiles: workFiles,
      requestedAt: new Date()
    });

    await membership.save();

    res.status(201).json({ 
      message: "Join request submitted successfully. Waiting for admin approval.",
      membership: {
        _id: membership._id,
        status: membership.status,
        requestedAt: membership.requestedAt
      }
    });
  } catch (error) {
    console.error("Join club error:", error);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: "You already have a request for this club"
      });
    }
    
    res.status(500).json({ 
      message: "Failed to submit join request",
      error: error.message
    });
  }
});

/* =========================
   Get ALL join requests for a club (Admin only) - pending, approved, rejected
========================= */
router.get("/club/:clubId/requests", auth, async (req, res) => {
  try {
    const requests = await ClubMember.find({ 
      club: req.params.clubId
    })
      .populate("student", "name email")
      .sort({ requestedAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error("Error fetching join requests:", error);
    res.status(500).json({ error: error.message });
  }
});

/* =========================
   Approve join request (Admin only)
========================= */
router.put("/approve/:requestId", auth, async (req, res) => {
  try {
    const request = await ClubMember.findById(req.params.requestId);
    
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    request.status = "approved";
    request.approvedAt = new Date();
    await request.save();

    res.json({ 
      message: "Join request approved successfully",
      membership: request
    });
  } catch (error) {
    console.error("Error approving request:", error);
    res.status(500).json({ error: error.message });
  }
});

/* =========================
   Reject join request (Admin only)
========================= */
router.put("/reject/:requestId", auth, async (req, res) => {
  try {
    const request = await ClubMember.findById(req.params.requestId);
    
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    request.status = "rejected";
    await request.save();

    res.json({ 
      message: "Join request rejected",
      membership: request
    });
  } catch (error) {
    console.error("Error rejecting request:", error);
    res.status(500).json({ error: error.message });
  }
});

/* =========================
   Delete join request (Admin only)
========================= */
router.delete("/request/:requestId", auth, async (req, res) => {
  try {
    const request = await ClubMember.findById(req.params.requestId);
    
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    await ClubMember.findByIdAndDelete(req.params.requestId);

    res.json({ 
      message: "Request deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting request:", error);
    res.status(500).json({ error: error.message });
  }
});

/* =========================
   Check student's membership status
========================= */
router.get("/status/:clubId", auth, async (req, res) => {
  try {
    const membership = await ClubMember.findOne({
      student: req.user.id,
      club: req.params.clubId
    });

    if (!membership) {
      return res.json({ status: "none" });
    }

    res.json({ 
      status: membership.status,
      requestedAt: membership.requestedAt,
      approvedAt: membership.approvedAt
    });
  } catch (error) {
    console.error("Error checking status:", error);
    res.status(500).json({ error: error.message });
  }
});

/* =========================
   Student leaves a club
========================= */
router.delete("/leave/:clubId", auth, async (req, res) => {
  try {
    await ClubMember.findOneAndDelete({
      student: req.user.id,
      club: req.params.clubId
    });

    res.json({ message: "Left club successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =========================
   Admin removes a member from club
========================= */
router.delete("/remove/:memberId", auth, async (req, res) => {
  try {
    const member = await ClubMember.findById(req.params.memberId);
    
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    await ClubMember.findByIdAndDelete(req.params.memberId);

    res.json({ message: "Member removed successfully" });
  } catch (error) {
    console.error("Error removing member:", error);
    res.status(500).json({ error: error.message });
  }
});

/* =========================
   Get approved members of a club
========================= */
router.get("/club/:clubId", auth, async (req, res) => {
  try {
    const members = await ClubMember.find({ 
      club: req.params.clubId,
      status: "approved"
    })
      .populate("student", "name email")
      .lean();

    const sanitizedMembers = members.map(member => ({
      _id: member._id,
      student: member.student,
      club: member.club,
      name: member.name || "",
      section: member.section || "",
      branch: member.branch || "",
      joinedAt: member.approvedAt || member.joinedAt
    }));

    res.json({
      count: sanitizedMembers.length,
      members: sanitizedMembers
    });
  } catch (error) {
    console.error("Error fetching club members:", error);
    res.status(500).json({ 
      error: error.message,
      members: []
    });
  }
});

module.exports = router;
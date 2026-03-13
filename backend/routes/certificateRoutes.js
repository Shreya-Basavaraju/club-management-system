const express = require("express");
const PDFDocument = require("pdfkit");
const Attendance = require("../models/Attendance");
const Event = require("../models/event");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

/* =========================
   GENERATE CERTIFICATE
========================= */
router.get("/generate/:eventId", auth, async (req, res) => {
  try {
    const eventId = req.params.eventId;

    // Check attendance
    const attendance = await Attendance.findOne({
      student: req.user.id,
      event: eventId,
      present: true
    });

    if (!attendance) {
      return res.status(403).json({
        message: "Not eligible for certificate. Please mark attendance first."
      });
    }

    // Get registration details
    const Registration = require("../models/Registration");
    const registration = await Registration.findOne({
      student: req.user.id,
      event: eventId
    });

    const student = await User.findById(req.user.id);
    const event = await Event.findById(eventId).populate('club');

    const studentName = registration?.name || student.name;
    const section = registration?.section || "";
    const branch = registration?.branch || "";
    const club = event.club;

    // Create PDF with landscape orientation
    const doc = new PDFDocument({ 
      size: 'A4', 
      layout: 'landscape',
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${event.title}_certificate.pdf`
    );

    doc.pipe(res);

    // Background color
    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#FDF6EC');

    // Add club logo if available
    if (club && club.logo) {
      try {
        const logoPath = `uploads/${club.logo}`;
        const fs = require('fs');
        if (fs.existsSync(logoPath)) {
          doc.image(logoPath, 60, 50, { width: 80, height: 80, fit: [80, 80], align: 'center' });
        }
      } catch (err) {
        console.log('Logo not found, skipping...');
      }
    }

    // Outer golden border
    doc.rect(25, 25, doc.page.width - 50, doc.page.height - 50)
       .lineWidth(4)
       .strokeColor('#C4A484')
       .stroke();

    // Inner border
    doc.rect(35, 35, doc.page.width - 70, doc.page.height - 70)
       .lineWidth(1)
       .strokeColor('#E5D4C1')
       .stroke();

    // Certificate header
    doc.moveDown(2);
    doc.fontSize(48)
       .font('Helvetica-Bold')
       .fillColor('#5C4033')
       .text("CERTIFICATE", { align: "center" });

    doc.moveDown(0.3);
    doc.fontSize(22)
       .font('Helvetica')
       .fillColor('#7A6655')
       .text("OF PARTICIPATION", { align: "center" });

    // Decorative line
    const lineY = doc.y + 20;
    doc.moveTo(200, lineY)
       .lineTo(doc.page.width - 200, lineY)
       .lineWidth(1)
       .strokeColor('#C4A484')
       .stroke();

    doc.moveDown(2);
    doc.fontSize(16)
       .font('Helvetica')
       .fillColor('#5C4033')
       .text("This certificate is proudly presented to", { align: "center" });

    // Student name in elegant script-like style
    doc.moveDown(1);
    doc.fontSize(40)
       .font('Helvetica-BoldOblique')
       .fillColor('#C4A484')
       .text(studentName, { align: "center" });

    // Underline for name
    const nameUnderlineY = doc.y + 5;
    doc.moveTo(150, nameUnderlineY)
       .lineTo(doc.page.width - 150, nameUnderlineY)
       .lineWidth(2)
       .strokeColor('#5C4033')
       .stroke();

    doc.moveDown(1.5);
    doc.fontSize(15)
       .font('Helvetica')
       .fillColor('#5C4033')
       .text(`For participating in the ${event.title}`, { align: "center" });

    doc.moveDown(0.5);
    doc.fontSize(14)
       .font('Helvetica')
       .fillColor('#7A6655')
       .text(
         `held on ${new Date(event.date).toLocaleDateString('en-US', { 
           day: 'numeric',
           month: 'long', 
           year: 'numeric'
         })}`,
         { align: "center" }
       );

    // Footer section
    doc.moveDown(3);
    const footerY = doc.page.height - 120;
    
    // Club name if available
    if (club && club.name) {
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .fillColor('#5C4033')
         .text(club.name.toUpperCase(), 50, footerY, { align: "center", width: doc.page.width - 100 });
      
      doc.fontSize(12)
         .font('Helvetica')
         .fillColor('#7A6655')
         .text("Club Connect", 50, footerY + 20, { align: "center", width: doc.page.width - 100 });
    } else {
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .fillColor('#5C4033')
         .text("CLUB CONNECT", 50, footerY, { align: "center", width: doc.page.width - 100 });

      doc.fontSize(12)
         .font('Helvetica')
         .fillColor('#7A6655')
         .text("Certificate Authority", 50, footerY + 20, { align: "center", width: doc.page.width - 100 });
    }

    // Certificate ID at bottom
    doc.fontSize(10)
       .font('Helvetica-Oblique')
       .fillColor('#9E9E9E')
       .text(
         `Certificate ID: ${attendance._id}`,
         50,
         doc.page.height - 60,
         { align: "center", width: doc.page.width - 100 }
       );

    doc.end();

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =========================
   GET STUDENT CERTIFICATES FOR A CLUB
========================= */
router.get("/student/:clubId", auth, async (req, res) => {
  try {
    // Get all events for this club where student has attendance
    const events = await Event.find({ club: req.params.clubId });
    const eventIds = events.map(e => e._id);

    const attendanceRecords = await Attendance.find({
      student: req.user.id,
      event: { $in: eventIds },
      present: true
    }).populate("event", "title date");

    // Map to certificate format
    const certificates = attendanceRecords.map(record => ({
      _id: record._id,
      event: record.event,
      issuedDate: record.createdAt,
      description: `Certificate of participation for ${record.event?.title}`,
      createdAt: record.createdAt
    }));

    res.json(certificates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =========================
   DOWNLOAD CERTIFICATE
========================= */
router.get("/download/:certificateId", auth, async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.certificateId)
      .populate("event");

    if (!attendance || attendance.student.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const student = await User.findById(req.user.id);
    const event = attendance.event;

    // Create PDF
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape' });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${event.title}_certificate.pdf`
    );

    doc.pipe(res);

    // Add border
    doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60).stroke();

    doc.moveDown(3);
    doc.fontSize(36).font('Helvetica-Bold').text("Certificate of Participation", {
      align: "center"
    });

    doc.moveDown(2);
    doc.fontSize(20).font('Helvetica').text(`This is to certify that`, {
      align: "center"
    });

    doc.moveDown();
    doc.fontSize(28).font('Helvetica-Bold').text(student.name, {
      align: "center",
      underline: true
    });

    doc.moveDown();
    doc.fontSize(18).font('Helvetica').text(
      `has successfully participated in`,
      { align: "center" }
    );

    doc.moveDown();
    doc.fontSize(24).font('Helvetica-Bold').text(event.title, {
      align: "center"
    });

    doc.moveDown(2);
    doc.fontSize(16).font('Helvetica').text(
      `Date: ${new Date(event.date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}`,
      { align: "center" }
    );

    doc.end();

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
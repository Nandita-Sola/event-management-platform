const express = require("express");
const Event = require("../models/Event");
const authenticateUser = require("../middleware/authMiddleware");

const router = express.Router();

const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Admins only." });
  }
  next();
};

// Create a new event (Protected)
router.post("/events", authenticateUser, async (req, res) => {
  try {
    const { name, description, date, location, category } = req.body;
    if (!req.user) {
      return res.status(403).json({ error: "Unauthorized: You must be logged in." });
    }
    if (!category) {
      return res.status(400).json({ error: "Category is required." });
    }
    const event = new Event({ name, description, date, location, category });
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all events (Public)
router.get("/events", async (req, res) => {
  try {
    let { category, date } = req.query;
    let filter = {};

    if (category) filter.category = category;

    if (date) {
      const formattedDate = date.split("/").reverse().join("-");
      filter.date = { $eq: new Date(formattedDate) };
    }

    const events = await Event.find(filter);
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single event by ID (Protected)
router.get("/events/:id", authenticateUser, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update an event by ID (Protected)
router.put("/events/:id", authenticateUser, async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete an event by ID (Protected)
router.delete("/events/:id", authenticateUser, async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Register an attendee for an event (Protected & Real-Time)
router.post("/events/:id/register", authenticateUser, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });

    if (event.attendees.includes(req.user.userId)) {
      return res.status(400).json({ error: "User already registered for this event." });
    }

    event.attendees.push(req.user.userId);
    await event.save();

    req.app.get("io").emit("newAttendee", event._id);

    res.json({ message: "Attendee registered successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

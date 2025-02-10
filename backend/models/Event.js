 const mongoose = require('mongoose');

// Event Schema
const eventSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    category: { type: String, enum: ["Conference", "Workshop", "Meetup", "Webinar"], required: true }
});

module.exports = mongoose.model('Event', eventSchema);

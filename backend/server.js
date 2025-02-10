const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const http = require("http");
const socketIo = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
      origin: "http://localhost:5173", // ✅ Allow frontend connection (Update port if needed)
      methods: ["GET", "POST"]
    }
  });

app.use(cors());
app.use(express.json());

io.on("connection", (socket) => {
    console.log("🔌 A client connected");
    socket.on("newAttendee", (eventId) => {
      console.log(`New attendee registered for event ${eventId}`);
      io.emit("updateAttendees", eventId);
    });
    socket.on("disconnect", () => {
      console.log("A client disconnected");
    });
  });

  const PORT = process.env.PORT || 8250;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const mongoURI = 'mongodb://127.0.0.1:27017/event-management';
mongoose.connect(mongoURI)
.then(() => console.log('MongoDB Connected Successfully'))
.catch(err => console.error('MongoDB Connection Failed:', err));

//const PORT = 5000;

const eventRoutes = require('./routes/eventRoutes');
app.use('/api', eventRoutes);

app.get('/', (req, res) => {
    res.send('Event Management Platform Backend is Running!');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

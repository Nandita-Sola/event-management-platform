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
      origin: "https://event-management-frontend-sepia.vercel.app/", //Allow frontend connection
      methods: ["GET", "POST"]
    }
  });

app.use(cors());
app.use(express.json());

io.on("connection", (socket) => {
    console.log("A client connected");
    socket.on("newAttendee", (eventId) => {
      console.log(`New attendee registered for event ${eventId}`);
      io.emit("updateAttendees", eventId);
    });
    socket.on("disconnect", () => {
      console.log("A client disconnected");
    });
  });

  const mongoURI = process.env.MONGO_URI;

  mongoose.connect(mongoURI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch(err => console.error("MongoDB Connection Failed:", err));
  
  const authRoutes = require("./routes/authRoutes");
  const eventRoutes = require('./routes/eventRoutes');
  
  app.use("/api/auth", authRoutes);
  app.use('/api', eventRoutes);
  
  app.get('/', (req, res) => {
      res.send('Event Management Platform Backend is Running!');
  });

  const PORT = process.env.PORT || 8080;
  server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
  });

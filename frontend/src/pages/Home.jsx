import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { parseISO } from "date-fns";
import { io } from "socket.io-client";

const socket = io("https://event-management-platform-backend-pfzw.onrender.com");

function Home({ role }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [editingEvent, setEditingEvent] = useState(null);
  const [updatedData, setUpdatedData] = useState({ name: "", description: "", date: "", location: "" });

  useEffect(() => {
    fetchEvents();
    socket.on("updateAttendees", (eventId) => {
      console.log(`Event updated: ${eventId}`);
      fetchEvents();
    });
    return () => socket.off("updateAttendees");
  }, [category, startDate, events]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      let url = "https://event-management-platform-backend-pfzw.onrender.com/api/events?";
      if (category) url += `category=${category}&`;
      if (startDate) url += `date=${startDate}&`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvents(response.data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
    finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
  
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`https://event-management-platform-backend-pfzw.onrender.com/api/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Event deleted successfully!");
      fetchEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event.");
    }
  };

  const handleEditClick = (event) => {
    setEditingEvent(event._id);
    setUpdatedData({
      name: event.name,
      description: event.description,
      date: event.date.split("T")[0],
      location: event.location,
    });
  };

  const handleUpdate = async (id) => {
    if (!window.confirm("Are you sure you want to update this event?")) return;
  
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(`https://event-management-platform-backend-pfzw.onrender.com/api/events/${id}`, updatedData, { headers: { Authorization: `Bearer ${token}` } });
      console.log("Update Successful! Exiting edit mode..."); 
      toast.success("Event updated successfully!");
      setEditingEvent(null);
      fetchEvents();
    } catch (error) {
      console.error("Error updating event:", error);
      toast.error("Failed to update event.");
    }
  };

  const registerForEvent = async (eventId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`https://event-management-platform-backend-pfzw.onrender.com/api/events/${eventId}/register`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Successfully registered for event");
    } catch (error) {
      console.error("Error registering:", error);
    }
  };

  return (
    <div>
      <h1>Home Page</h1>
      <p>Welcome to the Event Management Platform!</p>
      <h2>Event Dashboard</h2>

      <div className="filters">
        <label>Category:</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All</option>
          <option value="Conference">Conference</option>
          <option value="Workshop">Workshop</option>
          <option value="Meetup">Meetup</option>
          <option value="Webinar">Webinar</option>
        </select>

        <label>Date:</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <button onClick={() => { setCategory(""); setStartDate(""); }}>Reset</button>
      </div>

      {loading ? (
        <p>Loading events...</p>
      ) : events.length === 0 ? (
        <p>No events available.</p>
      ) : (
        <ul>
          {events.map((event) => (
            <li key={event._id}>
              {editingEvent === event._id ? (
                  <div className="edit-form">
                    <label>Event Name:</label>
                    <input type="text" value={updatedData.name} onChange={(e) => setUpdatedData({ ...updatedData, name: e.target.value })} />

                    <label>Description:</label>
                    <textarea value={updatedData.description} onChange={(e) => setUpdatedData({ ...updatedData, description: e.target.value })} />

                    <label>Date:</label>
                    <input type="date" value={updatedData.date} onChange={(e) => setUpdatedData({ ...updatedData, date: e.target.value })} />

                    <label>Location:</label>
                    <input type="text" value={updatedData.location} onChange={(e) => setUpdatedData({ ...updatedData, location: e.target.value })} />

                    <div className="edit-buttons">
                      <button onClick={() => handleUpdate(event._id)} className="save-button">Save</button>
                      <button onClick={() => setEditingEvent(null)} className="cancel-button">Cancel</button>
                    </div>
                  </div>
              ) : (
                <div>
                  <strong>{event.name}</strong> - {format(parseISO(event.date), "MM/dd/yyyy")}
                  <p>{event.description}</p>
                  <p>📍 {event.location}</p>
                  {role !== "guest" && (

                    <div>
                    <button onClick={() => handleEditClick(event)}>Edit</button>
                    <button onClick={() => handleDelete(event._id)}>Delete</button>
                    </div>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Home;

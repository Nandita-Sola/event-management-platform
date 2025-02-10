import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function CreateEvent() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!category) {
      setSuccessMessage("Please select a category.");
      setTimeout(() => setSuccessMessage(""), 3000);
      //toast.error("Please select a category.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setSuccessMessage("❌ No authentication token found. Please log in again.");
        setTimeout(() => setSuccessMessage(""), 3000);
        return;
      }
      const response = await axios.post("http://localhost:5500/api/events", 
        { name, description, date, location, category },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccessMessage("Event created successfully!");
      //const alertBox = alert("Event created successfully!");
      setTimeout(() => {
        navigate("/");
      }, 1000);
      /*setName("");
      setDescription("");
      setDate("");
      setLocation("");
      setCategory("");*/
    } catch (error) {
      toast.error("Error creating event.");
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <h1>Create Event</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Event Name" value={name} onChange={(e) => setName(e.target.value)} required className="styled-input" />
        <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required className="styled-input" />
        <input 
          type="date" placeholder="Date (MM/DD/YYYY)" value={date} onChange={(e) => setDate(e.target.value)} required 
          className="styled-input"/>
        <input type="text" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} required className="styled-input" />
        <select 
          value={category} 
          onChange={(e) => setCategory(e.target.value)} 
          required
          className="styled-input"
        >
          <option value="" disabled>Select Category</option>
          <option value="Conference">Conference</option>
          <option value="Workshop">Workshop</option>
          <option value="Meetup">Meetup</option>
          <option value="Webinar">Webinar</option>
        </select>

        <button type="submit">Create Event</button>
      </form>
      {successMessage && <p style={{ color: "green",
        fontSize: "35px",
        fontWeight: "bold", 
        textAlign: "center",
        padding: "10px", 
        backgroundColor: "#eaffea",
        borderRadius: "5px"
      }}>{successMessage}</p>}
    </div>
  );
}

export default CreateEvent;

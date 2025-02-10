import React, { useState } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import CreateEvent from "./pages/CreateEvent";
import Login from "./pages/Login";
import "./styles/App.css";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [role, setRole] = useState(localStorage.getItem("role") || "guest");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setToken("");
    setRole("guest");
    navigate("/login");
  };

  return (
    <div>
      <nav>
      <Link to="/">Home</Link>
      {role !== "guest" && <Link to="/create"> | Create Event</Link>}
        {token ? (
          <> | <button onClick={handleLogout}>Logout</button> </>
        ) : (
          <> | <Link to="/login">Login</Link> </>
        )}
      </nav>
      <Routes>
        <Route path="/" element={<Home role={role} />} /> {/* Pass role */}
        {role === "admin" && <Route path="/create" element={<CreateEvent />} />}
        <Route path="/create" element={<CreateEvent />} />
        <Route path="/login" element={<Login setToken={setToken} setRole={setRole} />} /> {/* Pass setToken correctly */}
      </Routes>
    </div>
  );
}

export default App;

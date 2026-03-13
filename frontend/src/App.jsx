import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Hero from "./pages/Hero";
import Clubs from "./pages/Clubs";
import ClubDashboard from "./pages/club-dashboard/ClubDashboard";
import EventDetails from "./pages/EventDetails";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AddClub from "./pages/admin/AddClub";
import AddEvent from "./pages/admin/AddEvent";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* LANDING PAGE (PUBLIC) */}
        <Route path="/" element={<Landing />} />

        {/* AUTH */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* HERO/HOME (AFTER LOGIN) */}
        <Route path="/home" element={<Hero />} />

        {/* CLUBS */}
        <Route path="/clubs" element={<Clubs />} />
        <Route path="/clubs/:id" element={<ClubDashboard />} />

        

        {/* EVENT DETAILS */}
        <Route path="/events/:id" element={<EventDetails />} />

        {/* ADMIN */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/add-club" element={<AddClub />} />
        <Route path="/admin/add-event" element={<AddEvent />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
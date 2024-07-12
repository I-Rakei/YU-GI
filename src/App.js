import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Homepage from "./components/HomePage";
import Footer from "./components/Footer";
import Login from "./authtentication/Login";
import SignUp from "./authtentication/SignUp";
import UserDashboard from "./user/UserDashboard";
import AllPosts from "./MainPost/AllPosts"; // Import the new component

const App = () => {
  return (
    <Router>
      <div>
        <Navbar />
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/all-posts" element={<AllPosts />} />{" "}
          {/* New route for AllPosts */}
        </Routes>
        <Footer />
      </div>
    </Router>
  );
};

export default App;

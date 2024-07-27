import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Homepage from "./components/HomePage";
import Footer from "./components/Footer";
import Login from "./authtentication/Login";
import SignUp from "./authtentication/SignUp";
import UserDashboard from "./user/UserDashboard";
import AllPostsWithSearch from "./MainPost/AllPostsWithSearch"; // Import the new combined component
import UserProfile from "./components/UserProfile";
import SingupCo from "./authtentication/SignUpCo";
import ProfileComponentCo from "./user/ProfileComponentCo";
import LoginCo from "./authtentication/LoginCo";
import ShowUsers from "./BrowsBase/ShowUsers";
import ShowCompanies from "./BrowsBase/ShowCompanies";
import CompanyProfile from "./components/CompanyProfile";
const App = () => {
  return (
    <Router>
      <div>
        <Navbar />
        <Routes>
          <Route path="/estagiarios" element={<ShowUsers />} />
          <Route path="/empresas" element={<ShowCompanies />} />
          <Route path="/dashboard/co" element={<ProfileComponentCo />} />
          <Route path="/" element={<Homepage />} />
          <Route path="/login/co" element={<LoginCo />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signup/co" element={<SingupCo />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/all-posts" element={<AllPostsWithSearch />} />
          <Route path="/profile/:userId" element={<UserProfile />} />
          <Route path="/company/:companyId" element={<CompanyProfile />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
};

export default App;

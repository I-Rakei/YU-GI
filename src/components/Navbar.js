import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { ref, getDownloadURL } from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";
import { storage, auth } from "../firebase";

const Navbar = () => {
  const [profilePicture, setProfilePicture] = useState(null);
  const navigate = useNavigate();

  const loadProfilePicture = async (uid) => {
    try {
      const url = await getDownloadURL(ref(storage, `profile_pictures/${uid}`));
      setProfilePicture(url);
    } catch (error) {
      console.error("Error loading profile picture: ", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        loadProfilePicture(currentUser.uid);
      } else {
        navigate("/login");
      }
    });
    return () => {
      unsubscribe();
    };
  }, [navigate]);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
      <div className="container">
        <img
          src={`${process.env.PUBLIC_URL}/logo.png`}
          alt="Logo"
          className="d-inline-block align-text-top"
        />
        <h1 style={{ color: "white", marginLeft: "14px" }}>YU-GI</h1>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/all-posts">
                Posts Gerais
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/dashboard">
                Prefil
              </Link>
            </li>
          </ul>
        </div>
        {profilePicture ? (
          <img
            src={profilePicture}
            alt="Profile"
            className="img-thumbnail bg-dark"
            style={{
              width: "30px",
              height: "30px",
              objectFit: "cover",
            }}
          />
        ) : (
          "No profile picture"
        )}
      </div>
    </nav>
  );
};

export default Navbar;

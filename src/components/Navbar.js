import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { ref, get, child } from "firebase/database";
import { database } from "../firebase";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

const Navbar = () => {
  const [userType, setUserType] = useState(null); // 'user', 'company', or null
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    const checkUserType = async (user) => {
      const dbRef = ref(database);
      try {
        const userSnapshot = await get(child(dbRef, `users/${user.uid}`));
        if (userSnapshot.exists()) {
          setUserType("user");
        } else {
          const companySnapshot = await get(
            child(dbRef, `Companies/${user.uid}`)
          );
          if (companySnapshot.exists()) {
            setUserType("company");
          } else {
            setUserType(null);
          }
        }
      } catch (error) {
        console.error("Error checking user type:", error);
        setUserType(null);
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        checkUserType(user);
      } else {
        setUserType(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  if (loading) {
    return null; // Render nothing while loading
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <h1 style={{ color: "white", marginLeft: "14px" }}>YU-GI</h1>
        </Link>
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
            {userType === "user" && (
              <li className="nav-item">
                <Link className="nav-link" to="/dashboard">
                  Perfil
                </Link>
              </li>
            )}
            {userType === "company" && (
              <li className="nav-item">
                <Link className="nav-link" to="/dashboard/co">
                  Perfil
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

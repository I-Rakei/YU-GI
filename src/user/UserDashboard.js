import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";
import "bootstrap/dist/css/bootstrap.min.css";

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();
  const timeoutRef = useRef(null);

  useEffect(() => {
    const handleAuthStateChanged = (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        navigate("/login");
      }
    };

    const unsubscribe = onAuthStateChanged(auth, handleAuthStateChanged);

    window.addEventListener("popstate", handleLogout);
    resetTimeout();

    document.addEventListener("click", resetTimeout);
    document.addEventListener("keydown", resetTimeout);

    return () => {
      unsubscribe();
      window.removeEventListener("popstate", handleLogout);
      clearTimeout(timeoutRef.current);
      document.removeEventListener("click", resetTimeout);
      document.removeEventListener("keydown", resetTimeout);
    };
  }, [navigate]);

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      handleLogout();
    }, 10 * 60 * 1000); // 10 minutes
  };

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        setUser(null);
        navigate("/login");
      })
      .catch((error) => {
        console.error("Error signing out: ", error);
      });
  };

  const handleShowLogoutConfirm = () => {
    setShowLogoutConfirm(true);
  };

  const handleCloseLogoutConfirm = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <div className="container my-5">
      <h1>Bem vindo ao Yugi {user ? user.email : "Guest"}</h1>
      {user && (
        <>
          <button
            className="btn btn-danger mt-3"
            onClick={handleShowLogoutConfirm}
          >
            Logout
          </button>

          {showLogoutConfirm && (
            <div
              className="modal show"
              style={{ display: "block" }}
              tabIndex="-1"
            >
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Confirm Logout</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={handleCloseLogoutConfirm}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <p>Are you sure you want to log out?</p>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCloseLogoutConfirm}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UserDashboard;

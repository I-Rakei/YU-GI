import React, { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { auth, storage } from "../firebase";
import "bootstrap/dist/css/bootstrap.min.css";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDoneModal, setShowDoneModal] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [file, setFile] = useState(null);
  const navigate = useNavigate();
  const timeoutRef = useRef(null);

  useEffect(() => {
    const handleAuthStateChanged = (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        loadProfilePicture(currentUser.uid);
      } else {
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

  const loadProfilePicture = async (uid) => {
    try {
      const url = await getDownloadURL(ref(storage, `profile_pictures/${uid}`));
      setProfilePicture(url);
    } catch (error) {
      console.error("Error loading profile picture: ", error);
    }
  };

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

  const handleShowUploadModal = () => {
    setShowUploadModal(true);
  };

  const handleCloseUploadModal = () => {
    setShowUploadModal(false);
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (file && user) {
      setUploading(true);
      setUploadProgress(0);
      const storageRef = ref(storage, `profile_pictures/${user.uid}`);
      try {
        if (profilePicture) {
          await deleteObject(ref(storage, `profile_pictures/${user.uid}`));
        }
        const uploadTask = uploadBytesResumable(storageRef, file);
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
          },
          (error) => {
            console.error("Error uploading file: ", error);
            setUploading(false);
          },
          async () => {
            const url = await getDownloadURL(storageRef);
            setProfilePicture(url);
            setUploading(false);
            setShowUploadModal(false);
            setShowDoneModal(true);
            setTimeout(() => {
              setShowDoneModal(false);
              window.location.reload();
            }, 2000); // Display "Done" modal for 2 seconds before refreshing
          }
        );
      } catch (error) {
        console.error("Error uploading file: ", error);
        setUploading(false);
      }
    }
  };
  const email = user?.email;
  const prefix = email ? email.split("@")[0] : "";
  const welcomeMessage = `Bem vindo ${prefix}`;

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container-fluid">
          <h1
            style={{
              fontWeight: "bold",
              fontFamily:
                "'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif",
            }}
          >{`${welcomeMessage}`}</h1>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              {user && (
                <>
                  <li className="nav-item dropdown">
                    <button
                      className="btn nav-link dropdown-toggle"
                      id="navbarDropdown"
                      role="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      {profilePicture ? (
                        <img
                          src={profilePicture}
                          alt="Profile"
                          className="img-thumbnail"
                          style={{
                            width: "50px",
                            height: "50px",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <p>No profile picture</p>
                      )}
                    </button>
                    <ul
                      className="dropdown-menu dropdown-menu-end"
                      aria-labelledby="navbarDropdown"
                    >
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={handleShowUploadModal}
                        >
                          Upload Picture
                        </button>
                      </li>
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={handleShowLogoutConfirm}
                        >
                          Logout
                        </button>
                      </li>
                    </ul>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>

      {showLogoutConfirm && (
        <div className="modal show" style={{ display: "block" }} tabIndex="-1">
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

      {showUploadModal && (
        <div className="modal show" style={{ display: "block" }} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Upload Profile Picture</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseUploadModal}
                ></button>
              </div>
              <div className="modal-body">
                <input
                  type="file"
                  className="form-control mb-3"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
                {uploading && (
                  <div className="progress">
                    <div
                      className="progress-bar"
                      role="progressbar"
                      style={{ width: `${uploadProgress}%` }}
                      aria-valuenow={uploadProgress}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    >
                      {uploadProgress}%
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseUploadModal}
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleUpload}
                  disabled={uploading || !file}
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDoneModal && (
        <div className="modal show" style={{ display: "block" }} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-body">
                <h1>Done</h1>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;

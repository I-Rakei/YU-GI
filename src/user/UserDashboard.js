import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const [profilePicture, setProfilePicture] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        loadProfilePicture(currentUser.uid);
      } else {
        navigate("/login");
      }
    });

    return unsubscribe;
  }, [navigate]);

  const loadProfilePicture = async (uid) => {
    try {
      const url = await getDownloadURL(ref(storage, `profile_pictures/${uid}`));
      setProfilePicture(url);
    } catch (error) {
      console.error("Error loading profile picture: ", error);
    }
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
            window.location.reload();
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
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <h1 className="navbar-brand">{welcomeMessage}</h1>
        {user && (
          <div className="dropdown">
            <button
              className="btn dropdown-toggle"
              type="button"
              id="dropdownMenuButton"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt="Profile"
                  className="img-thumbnail"
                  style={{ width: "50px", height: "50px", objectFit: "cover" }}
                />
              ) : (
                "No profile picture"
              )}
            </button>
            <ul
              className="dropdown-menu dropdown-menu-end"
              aria-labelledby="dropdownMenuButton"
            >
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => setShowUploadModal(true)}
                >
                  Upload Picture
                </button>
              </li>
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => setShowLogoutConfirm(true)}
                >
                  Logout
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="modal show" style={{ display: "block" }} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Logout</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowLogoutConfirm(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to log out?</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowLogoutConfirm(false)}
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

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal show" style={{ display: "block" }} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Upload Profile Picture</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowUploadModal(false)}
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
                  onClick={() => setShowUploadModal(false)}
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
    </nav>
  );
};

export default Navbar;

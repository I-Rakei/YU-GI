import React, { useEffect, useState, useRef } from "react";
import { ref, get, update } from "firebase/database";
import { database, storage } from "../firebase";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import PostCreationComponent from "./PostCreationComponent";

const ProfileComponentCo = () => {
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [currentImageType, setCurrentImageType] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    companyName: "",
    companyAddress: "",
    email: "",
    foundationDate: "",
  });
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const companyRef = ref(database, `Companies/${user.uid}`);
          const snapshot = await get(companyRef);
          if (snapshot.exists()) {
            const data = snapshot.val();
            setCompanyData(data);
            setProfileData({
              companyName: data.companyName,
              companyAddress: data.companyAddress,
              email: data.email,
              foundationDate: data.foundationDate,
            });
          } else {
            setError("No company data available");
          }
        } catch (err) {
          setError("Error fetching company data");
          console.error(err);
        }
      } else {
        setError("No user logged in");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleImageUpload = async () => {
    if (selectedFile) {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) return;

      const fileRef = storageRef(
        storage,
        `${currentImageType}/${user.uid}/${selectedFile.name}`
      );

      // Get the current image URL
      const currentImageUrl = companyData[currentImageType];

      // Delete the old image if it exists
      if (currentImageUrl) {
        const oldImageRef = storageRef(storage, currentImageUrl);
        try {
          await deleteObject(oldImageRef);
        } catch (error) {
          console.error("Error deleting old image:", error);
        }
      }

      const uploadTask = uploadBytesResumable(fileRef, selectedFile);

      setUploading(true);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          setError("Error uploading image");
          console.error(error);
          setUploading(false);
        },
        async () => {
          const imageUrl = await getDownloadURL(uploadTask.snapshot.ref);

          if (user) {
            const companyRef = ref(database, `Companies/${user.uid}`);
            await update(companyRef, { [currentImageType]: imageUrl });
            setCompanyData((prevData) => ({
              ...prevData,
              [currentImageType]: imageUrl,
            }));
          }
          setUploading(false);
          setShowPopup(false);
          setSelectedFile(null);
          setUploadProgress(0);
        }
      );
    }
  };

  const handleClick = (type) => {
    setCurrentImageType(type);
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setSelectedFile(null);
    setUploadProgress(0);
    setUploading(false);
  };

  const toggleDropdown = () => {
    dropdownRef.current.classList.toggle("show");
  };

  const handleLogout = async () => {
    const auth = getAuth();
    await signOut(auth);
    navigate("/login");
  };

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      setError("No user logged in");
      return;
    }

    try {
      const companyRef = ref(database, `Companies/${user.uid}`);
      await update(companyRef, profileData);
      setCompanyData((prevData) => ({
        ...prevData,
        ...profileData,
      }));
      setIsEditing(false);
    } catch (err) {
      setError("Error updating profile");
      console.error(err);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!companyData) {
    return <div>No company data available</div>;
  }

  return (
    <div className="container mt-5">
      <div className="card">
        <div
          className="card-header header-image-container"
          onClick={() => handleClick("headerImage")}
          style={{ cursor: "pointer" }}
        >
          <img
            src={
              companyData.headerImage || "https://via.placeholder.com/800x200"
            }
            alt="Header"
            className="img-fluid header-image"
          />
        </div>
        <div className="card-body bg-info bg-gradient">
          <div className="d-flex">
            <div
              className="profile-picture-container position-relative"
              onClick={() => handleClick("profileImage")}
              style={{ cursor: "pointer" }}
            >
              <img
                src={
                  companyData.profileImage || "https://via.placeholder.com/100"
                }
                alt="Profile"
                className="profile-image"
                width="100px"
                style={{ borderRadius: "5px" }}
              />
            </div>
            <div className="profile-info ms-3">
              <h2>{companyData.companyName}</h2>
              <p>{companyData.companyAddress}</p>
              <p>Email: {companyData.email}</p>
              <p>
                Foundation Date:{" "}
                {new Date(companyData.foundationDate).toLocaleDateString()}
              </p>
            </div>
            <div className="ms-auto">
              <button className="btn btn-primary" onClick={handleEditProfile}>
                Edit Profile
              </button>
              <button className="btn btn-secondary ms-2" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
        <div className="card-footer bg-secondary bg-gradient">
          <p>Created At: {new Date(companyData.createdAt).toLocaleString()}</p>
        </div>
      </div>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <button onClick={handleClosePopup} className="close-popup">
              X
            </button>
            <input
              type="file"
              onChange={handleFileChange}
              className="form-control mt-2"
            />
            {uploading && (
              <div className="progress mt-3">
                <div
                  className="progress-bar"
                  role="progressbar"
                  style={{ width: `${uploadProgress}%` }}
                  aria-valuenow={uploadProgress}
                  aria-valuemin="0"
                  aria-valuemax="100"
                >
                  {uploadProgress.toFixed(0)}%
                </div>
              </div>
            )}
            <div className="d-flex justify-content-end mt-3">
              <button
                onClick={handleClosePopup}
                className="btn btn-secondary me-2"
              >
                Cancel
              </button>
              <button
                onClick={handleImageUpload}
                className="btn btn-primary"
                disabled={uploading}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditing && (
        <div className="mt-4">
          <h2>Edit Profile</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="companyName" className="form-label">
                Company Name
              </label>
              <input
                type="text"
                className="form-control"
                id="companyName"
                name="companyName"
                value={profileData.companyName}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="companyAddress" className="form-label">
                Company Address
              </label>
              <input
                type="text"
                className="form-control"
                id="companyAddress"
                name="companyAddress"
                value={profileData.companyAddress}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
                className="form-control"
                id="email"
                name="email"
                value={profileData.email}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="foundationDate" className="form-label">
                Foundation Date
              </label>
              <input
                type="date"
                className="form-control"
                id="foundationDate"
                name="foundationDate"
                value={profileData.foundationDate}
                onChange={handleChange}
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Save
            </button>
            <button
              type="button"
              className="btn btn-secondary ms-2"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      <div className="mt-4">
        <PostCreationComponent
          showPostModal={showPostModal}
          setShowPostModal={setShowPostModal}
        />
      </div>

      <style jsx>{`
        .header-image-container {
          max-width: 800px;
          margin: 0 auto;
        }
        .header-image {
          max-width: 100%;
          height: auto;
        }
        .profile-picture-container {
          max-width: 100px;
          margin-right: 10px;
          position: relative;
        }
        .profile-image {
          max-width: 100%;
          height: auto;
        }
        .dropdown-menu.show {
          display: block;
        }
        .popup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .popup {
          background: white;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          max-width: 400px;
          width: 100%;
          position: relative;
        }
        .close-popup {
          background: transparent;
          border: none;
          font-size: 20px;
          cursor: pointer;
          position: absolute;
          top: 10px;
          right: 10px;
        }
        .progress {
          height: 20px;
        }
        .progress-bar {
          transition: width 0.4s ease;
        }
      `}</style>
    </div>
  );
};

export default ProfileComponentCo;

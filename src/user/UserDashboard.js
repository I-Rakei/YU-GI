import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { ref as dbRef, push, set, onValue, remove } from "firebase/database";
import { auth, storage, database } from "../firebase";
import "bootstrap/dist/css/bootstrap.min.css";

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  // Post image functionality
  const [postFile, setPostFile] = useState(null);
  const [postPreview, setPostPreview] = useState(null);
  const [postDescription, setPostDescription] = useState("");
  const [showPostModal, setShowPostModal] = useState(false);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        loadProfilePicture(currentUser.uid);
        loadUserPosts(currentUser.uid);
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

  const loadUserPosts = (uid) => {
    const userPostsRef = dbRef(database, `posts/${uid}`);
    onValue(userPostsRef, (snapshot) => {
      const postsData = snapshot.val();
      if (postsData) {
        const postsArray = Object.entries(postsData).map(([key, value]) => ({
          id: key,
          ...value,
        }));
        setPosts(postsArray);
      } else {
        setPosts([]);
      }
    });
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

  const handlePostFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setPostFile(selectedFile);

    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPostPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPostPreview(null);
    }
  };

  const handlePostUpload = async () => {
    if (postFile && postDescription && user) {
      setUploading(true);
      const storageRef = ref(
        storage,
        `post_images/${user.uid}/${Date.now()}_${postFile.name}`
      );

      try {
        const uploadTask = uploadBytesResumable(storageRef, postFile);
        uploadTask.on("state_changed", null, null, async () => {
          const downloadURL = await getDownloadURL(storageRef);
          const newPostRef = push(dbRef(database, `posts/${user.uid}`));
          await set(newPostRef, {
            imageUrl: downloadURL,
            description: postDescription,
            timestamp: Date.now(),
            userEmail: user.email,
          });
          setUploading(false);
          setPostFile(null);
          setPostPreview(null);
          setPostDescription("");
          setShowPostModal(false);
        });
      } catch (error) {
        console.error("Error uploading post: ", error);
        setUploading(false);
      }
    }
  };

  const handleDeletePost = async (postId, imageUrl) => {
    if (user) {
      try {
        // Delete the image from storage
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);

        // Delete the post data from the database
        await remove(dbRef(database, `posts/${user.uid}/${postId}`));

        // Update the local state
        setPosts(posts.filter((post) => post.id !== postId));
      } catch (error) {
        console.error("Error deleting post: ", error);
      }
    }
  };

  const email = user?.email;
  const prefix = email ? email.split("@")[0] : "";
  const welcomeMessage = `Welcome ${prefix}`;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>{welcomeMessage}</h1>
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
                  Change Profile Picture
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

      {user && (
        <div className="card">
          <div className="card-body">
            <h2>Your Posts</h2>
            <button
              className="btn btn-success mb-3"
              onClick={() => setShowPostModal(true)}
            >
              Create New Post
            </button>
            <div className="row">
              {posts.map((post) => (
                <div key={post.id} className="col-md-4 mb-3">
                  <div className="card">
                    <img
                      src={post.imageUrl}
                      alt={post.description}
                      className="card-img-top"
                    />
                    <div className="card-body">
                      <p className="card-text">{post.description}</p>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDeletePost(post.id, post.imageUrl)}
                      >
                        Delete Post
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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

      {/* Profile Picture Upload Modal */}
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

      {/* Post Image Modal */}
      {showPostModal && (
        <div className="modal show" style={{ display: "block" }} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create New Post</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowPostModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <input
                  type="file"
                  className="form-control mb-3"
                  onChange={handlePostFileChange}
                  accept="image/*"
                  disabled={uploading}
                />
                {postPreview && (
                  <img
                    src={postPreview}
                    alt="Preview"
                    className="img-thumbnail mb-3"
                    style={{ maxWidth: "100%", height: "auto" }}
                  />
                )}
                <textarea
                  className="form-control mb-3"
                  value={postDescription}
                  onChange={(e) => setPostDescription(e.target.value)}
                  placeholder="Enter image description"
                  disabled={uploading}
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowPostModal(false)}
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handlePostUpload}
                  disabled={uploading || !postFile || !postDescription}
                >
                  {uploading ? "Uploading..." : "Post"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;

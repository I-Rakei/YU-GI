import React, { useState, useEffect, useCallback } from "react";
import { ref as databaseRef, push, set, get, remove } from "firebase/database";
import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage, database } from "../firebase";
import { getAuth } from "firebase/auth";
import "bootstrap/dist/css/bootstrap.min.css";

const PostCreationComponent = ({ showPostModal, setShowPostModal }) => {
  const [postFile, setPostFile] = useState(null);
  const [postPreview, setPostPreview] = useState(null);
  const [postDescription, setPostDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [posts, setPosts] = useState([]);
  const [companyName, setCompanyName] = useState("");

  const auth = getAuth();
  const user = auth.currentUser;

  const fetchPosts = useCallback(async () => {
    try {
      const postsRef = databaseRef(database, `posts/${user.uid}`);
      const snapshot = await get(postsRef);
      if (snapshot.exists()) {
        const postsData = snapshot.val();
        const postsArray = Object.keys(postsData).map((key) => ({
          id: key,
          ...postsData[key],
        }));
        setPosts(postsArray);
      }
    } catch (error) {
      console.error("Error fetching posts: ", error);
    }
  }, [user]);

  const fetchCompanyName = useCallback(async () => {
    try {
      const companyRef = databaseRef(database, `Companies/${user.uid}`);
      const snapshot = await get(companyRef);
      if (snapshot.exists()) {
        const companyData = snapshot.val();
        setCompanyName(companyData.companyName);
      }
    } catch (error) {
      console.error("Error fetching company name: ", error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchPosts();
      fetchCompanyName();
    }
  }, [user, fetchPosts, fetchCompanyName]);

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
      const fileRef = storageRef(
        storage,
        `post_images/${user.uid}/${Date.now()}_${postFile.name}`
      );

      try {
        const uploadTask = uploadBytesResumable(fileRef, postFile);
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
          },
          (error) => {
            console.error("Error uploading post: ", error);
            setUploading(false);
          },
          async () => {
            const downloadURL = await getDownloadURL(fileRef);
            const newPostRef = push(databaseRef(database, `posts/${user.uid}`));
            await set(newPostRef, {
              imageUrl: downloadURL,
              description: postDescription,
              timestamp: Date.now(),
              userEmail: user.email,
            });
            fetchPosts(); // Refresh the posts list
            setUploading(false);
            setPostFile(null);
            setPostPreview(null);
            setPostDescription("");
            setShowPostModal(false);
          }
        );
      } catch (error) {
        console.error("Error uploading post: ", error);
        setUploading(false);
      }
    }
  };

  const handlePostDelete = async (postId, imageUrl) => {
    try {
      const postRef = databaseRef(database, `posts/${user.uid}/${postId}`);
      await remove(postRef);

      const imageRef = storageRef(storage, imageUrl);
      await deleteObject(imageRef);

      fetchPosts(); // Refresh the posts list
    } catch (error) {
      console.error("Error deleting post: ", error);
    }
  };

  return (
    <div className="post-creation-component">
      <button
        className="btn btn-success mb-3"
        onClick={() => setShowPostModal(true)}
      >
        Create New Post
      </button>

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
                    style={{ maxWidth: "100%", height: "400px" }}
                  />
                )}
                <textarea
                  className="form-control mb-3"
                  value={postDescription}
                  onChange={(e) => setPostDescription(e.target.value)}
                  placeholder="Enter image description"
                  disabled={uploading}
                />
                {uploading && (
                  <div className="progress mb-3">
                    <div
                      className="progress-bar"
                      role="progressbar"
                      style={{ width: `${uploadProgress}%` }}
                      aria-valuenow={uploadProgress}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    >
                      {Math.round(uploadProgress)}%
                    </div>
                  </div>
                )}
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

      <div className="posts-list mt-4">
        <h3>Posts</h3>
        {companyName && <p>Company: {companyName}</p>}
        <div className="row">
          {posts.length > 0 ? (
            posts.map((post) => (
              <div key={post.id} className="col-md-4 mb-3">
                <div className="custom-card">
                  <img
                    src={post.imageUrl}
                    className="custom-card-img-top"
                    alt={post.description}
                    style={{ maxHeight: "400px" }}
                  />
                  <div className="custom-card-body">
                    <p className="custom-card-text">{post.description}</p>
                    <button
                      className="btn btn-danger"
                      onClick={() => handlePostDelete(post.id, post.imageUrl)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No posts available</p>
          )}
        </div>
      </div>

      <style jsx>{`
        .modal.show {
          display: block;
        }
        .img-thumbnail {
          max-width: 100%;
          height: auto;
        }
        .modal-footer .btn {
          margin-right: 0.5rem;
        }
        .custom-card {
          max-width: 400px;
        }
        .custom-card-img-top {
          max-height: 400px;
        }
      `}</style>
    </div>
  );
};

export default PostCreationComponent;

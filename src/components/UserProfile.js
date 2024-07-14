import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ref, onValue, off } from "firebase/database";
import { database } from "../firebase";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faEnvelope,
  faBriefcase,
  faImage,
} from "@fortawesome/free-solid-svg-icons";

const UserProfile = () => {
  const { userId } = useParams();
  const [userProfile, setUserProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userRef = ref(database, `users/${userId}`);
    const userPostsRef = ref(database, `posts/${userId}`);

    const fetchData = () => {
      setLoading(true);
      setError(null);

      const userListener = onValue(
        userRef,
        (snapshot) => {
          const userData = snapshot.val();
          if (userData) {
            setUserProfile({
              username: userData.username,
              profession: userData.profession,
              email: userData.email,
            });
          } else {
            setError("User not found");
          }
          setLoading(false);
        },
        (error) => {
          setError("Error fetching user data");
          setLoading(false);
        }
      );

      const postsListener = onValue(
        userPostsRef,
        (snapshot) => {
          const postsData = snapshot.val();
          if (postsData) {
            const postsArray = Object.entries(postsData)
              .map(([key, value]) => ({
                id: key,
                ...value,
              }))
              .sort((a, b) => b.timestamp - a.timestamp);
            setUserPosts(postsArray);
          } else {
            setUserPosts([]);
          }
        },
        (error) => {
          console.error("Error fetching posts: ", error);
        }
      );

      return () => {
        off(userRef, userListener);
        off(userPostsRef, postsListener);
      };
    };

    fetchData();
  }, [userId]);

  if (loading) {
    return (
      <div
        className="container mt-4 d-flex justify-content-center align-items-center"
        style={{ minHeight: "50vh" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="container mt-4 alert alert-danger">{error}</div>;
  }

  if (!userProfile) {
    return (
      <div className="container mt-4 alert alert-warning">
        User profile not found.
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-4 mb-4">
          <div className="card shadow">
            <div className="card-body">
              <h2 className="card-title">
                <FontAwesomeIcon icon={faUser} className="me-2" />
                {userProfile.username}
              </h2>
              <p className="card-text">
                <FontAwesomeIcon icon={faBriefcase} className="me-2" />
                <strong>Profession:</strong> {userProfile.profession}
              </p>
              <p className="card-text">
                <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                <strong>Email:</strong> {userProfile.email}
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-8">
          <h3 className="mb-4">{userProfile.username}'s Posts</h3>
          {userPosts.length === 0 ? (
            <p className="alert alert-info">No posts available.</p>
          ) : (
            <div className="row row-cols-1 row-cols-md-2 g-4">
              {userPosts.map((post) => (
                <div key={post.id} className="col">
                  <div className="card h-100 shadow-sm">
                    {post.imageUrl ? (
                      <img
                        src={post.imageUrl}
                        alt={post.description}
                        className="card-img-top"
                        style={{ height: "200px", objectFit: "cover" }}
                      />
                    ) : (
                      <div
                        className="card-img-top bg-light d-flex justify-content-center align-items-center"
                        style={{ height: "200px" }}
                      >
                        <FontAwesomeIcon
                          icon={faImage}
                          size="3x"
                          className="text-secondary"
                        />
                      </div>
                    )}
                    <div className="card-body">
                      <p className="card-text">{post.description}</p>
                    </div>
                    <div className="card-footer bg-light">
                      <small className="text-muted">
                        Posted on: {new Date(post.timestamp).toLocaleString()}
                      </small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

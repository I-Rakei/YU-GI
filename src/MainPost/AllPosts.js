import React, { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "../firebase";
import "bootstrap/dist/css/bootstrap.min.css";

const AllPosts = () => {
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const postsRef = ref(database, "posts");

    const unsubscribe = onValue(postsRef, (snapshot) => {
      const postsData = snapshot.val();
      if (postsData) {
        const postsArray = Object.entries(postsData).flatMap(
          ([userId, userPosts]) =>
            Object.entries(userPosts).map(([postId, post]) => ({
              id: postId,
              userId,
              ...post,
            }))
        );
        // Sort posts by timestamp, most recent first
        postsArray.sort((a, b) => b.timestamp - a.timestamp);
        setAllPosts(postsArray);
      } else {
        setAllPosts([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="container mt-4">Loading posts...</div>;
  }

  return (
    <div className="container mt-4">
      <h1 className="mb-4">All Posts</h1>
      {allPosts.length === 0 ? (
        <p>No posts available.</p>
      ) : (
        <div className="row">
          {allPosts.map((post) => (
            <div key={post.id} className="col-md-4 mb-4">
              <div className="card">
                <img
                  src={post.imageUrl}
                  alt={post.description}
                  className="card-img-top"
                />
                <div className="card-body">
                  <p className="card-text">{post.description}</p>
                  <p className="card-text">
                    <small className="text-muted">
                      Posted by: {post.userId}
                      <br />
                      Date: {new Date(post.timestamp).toLocaleString()}
                    </small>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllPosts;

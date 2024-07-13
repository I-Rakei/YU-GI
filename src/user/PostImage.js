import React, { useState, useEffect } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { ref as dbRef, push, set, onValue } from "firebase/database";
import { storage, database, auth } from "../firebase";

const PostImage = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const userPostsRef = dbRef(database, `posts/${auth.currentUser.email}`);
    const unsubscribe = onValue(userPostsRef, (snapshot) => {
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

    return () => unsubscribe();
  }, []);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);

    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleUpload = async () => {
    if (file && description) {
      setUploading(true);
      const storageRef = ref(
        storage,
        `post_images/${auth.currentUser.email}/${Date.now()}_${file.name}`
      );

      try {
        const uploadTask = uploadBytesResumable(storageRef, file);
        uploadTask.on("state_changed", null, null, async () => {
          const downloadURL = await getDownloadURL(storageRef);
          const newPostRef = push(
            dbRef(database, `posts/${auth.currentUser.email}`)
          );
          await set(newPostRef, {
            imageUrl: downloadURL,
            description: description,
            timestamp: Date.now(),
            userEmail: auth.currentUser.email,
          });
          setUploading(false);
          setFile(null);
          setPreview(null);
          setDescription("");
        });
      } catch (error) {
        console.error("Error uploading file: ", error);
        setUploading(false);
      }
    }
  };

  return (
    <div>
      <h2>Post an Image</h2>
      <input type="file" onChange={handleFileChange} accept="image/*" />
      {preview && (
        <div>
          <img
            src={preview}
            alt="Preview"
            style={{ maxWidth: "200px", maxHeight: "200px" }}
          />
        </div>
      )}
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Enter image description"
      />
      <button
        onClick={handleUpload}
        disabled={!file || !description || uploading}
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>

      <h2>Your Posts</h2>
      <div className="posts">
        {posts.map((post) => (
          <div key={post.id} className="post">
            <img
              src={post.imageUrl}
              alt={post.description}
              style={{ maxWidth: "200px", maxHeight: "200px" }}
            />
            <p>{post.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostImage;

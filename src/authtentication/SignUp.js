import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database";
import { auth, database } from "../firebase";

const SignUp = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [profession, setProfession] = useState("");
  const [error, setError] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Add user to the Realtime Database
      const userRef = ref(database, "users/" + user.uid);
      await set(userRef, {
        email: user.email,
        uid: user.uid,
        username: username.toLowerCase(),
        profession: profession.toLowerCase(), // Store profession in lowercase
        createdAt: new Date().toISOString(),
      });

      console.log(user);
      navigate("/login");
    } catch (error) {
      const errorCode = error.code;
      const errorMessage = error.message;
      setError(errorMessage);
      console.log(errorCode, errorMessage);
    }
  };

  return (
    <main className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <section
        className="card p-4 shadow-sm w-100"
        style={{ maxWidth: "400px" }}
      >
        <div>
          <h1 className="text-center mb-4">Sign Up</h1>
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          <form onSubmit={onSubmit}>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">
                Username
              </label>
              <input
                type="text"
                id="username"
                className="form-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Username"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="email-address" className="form-label">
                Email address
              </label>
              <input
                type="email"
                id="email-address"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Email address"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                id="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Password"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="profession" className="form-label">
                Profession
              </label>
              <input
                type="text"
                id="profession"
                className="form-control"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                required
                placeholder="Profession"
              />
            </div>
            <button type="submit" className="btn btn-primary w-100">
              Sign up
            </button>
          </form>
          <p className="mt-3 text-center">
            Already have an account?{" "}
            <NavLink to="/login" className="text-primary">
              Sign in
            </NavLink>
          </p>
        </div>
      </section>
    </main>
  );
};

export default SignUp;

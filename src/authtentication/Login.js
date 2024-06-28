import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { NavLink, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const onLogin = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      console.log(user);
      navigate("/UserDashboard");
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
          <h1 className="text-center mb-4">Login</h1>
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          <form onSubmit={onLogin}>
            <div className="mb-3">
              <label htmlFor="email-address" className="form-label">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                className="form-control"
                required
                placeholder="Email address"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className="form-control"
                required
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="d-grid">
              <button type="submit" className="btn btn-primary">
                Login
              </button>
            </div>
          </form>

          <p className="mt-3 text-center">
            No account yet?{" "}
            <NavLink to="/signup" className="text-primary">
              Sign up
            </NavLink>
          </p>
        </div>
      </section>
    </main>
  );
};

export default Login;

import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import "bootstrap/dist/css/bootstrap.min.css";
import "./auth.css";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import UserDashboard from "../user/UserDashboard";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {};

  return (
    <div className="container my-5">
      <br />
      <br />
      <br />
      <br />
      <br />
      <div className="card mt-10 mb-10 login-card">
        <h1 className="card-header bg-grey text-center">Login</h1>
        <div className="row g-0 d-flex align-items-center">
          <div className="col-md-12">
            <div className="card-body">
              <form onSubmit={handleLogin}>
                <div className="mb-4">
                  <label htmlFor="loginEmail" className="form-label">
                    Email address
                  </label>
                  <input
                    type="email"
                    id="loginEmail"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="loginPassword" className="form-label">
                    Password
                  </label>
                  <input
                    type="password"
                    id="loginPassword"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn btn-primary mb-4 w-100">
                  Login
                </button>
                {error && <p className="text-danger">{error}</p>}
              </form>
            </div>
          </div>
        </div>
      </div>
      <br />
      <br />
      <br />
      <br />
      <br />
    </div>
  );
};

export default Login;

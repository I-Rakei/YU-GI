import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database";
import { auth, database } from "../firebase";

const SignUp = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState(null); // null, 'user', or 'company'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [profession, setProfession] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [foundationDate, setFoundationDate] = useState("");
  const [error, setError] = useState(null);

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      if (userType === "user") {
        const userRef = ref(database, "users/" + user.uid);
        await set(userRef, {
          email: user.email,
          uid: user.uid,
          username: username.toLowerCase(),
          profession: profession.toLowerCase(),
          createdAt: new Date().toISOString(),
        });
        navigate("/login");
      } else if (userType === "company") {
        const userRef = ref(database, "Companies/" + user.uid);
        await set(userRef, {
          email: user.email,
          uid: user.uid,
          companyName: companyName,
          companyAddress: companyAddress,
          foundationDate: foundationDate,
          createdAt: new Date().toISOString(),
        });
        navigate("/login");
      }
    } catch (error) {
      const errorCode = error.code;
      const errorMessage = error.message;
      setError(errorMessage);
      console.log(errorCode, errorMessage);
    }
  };

  if (userType === null) {
    return (
      <main className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
        <section
          className="card p-4 shadow-sm w-100"
          style={{ maxWidth: "400px" }}
        >
          <div>
            <h1 className="text-center mb-4">Sign Up</h1>
            <div className="d-grid gap-2">
              <button
                className="btn btn-primary"
                onClick={() => setUserType("user")}
              >
                Sign Up as User
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setUserType("company")}
              >
                Sign Up as Company
              </button>
            </div>
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
  }

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
          <form onSubmit={handleSignUp}>
            {userType === "user" ? (
              <>
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
              </>
            ) : (
              <>
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
                  <label htmlFor="company-name" className="form-label">
                    Company Name
                  </label>
                  <input
                    type="text"
                    id="company-name"
                    className="form-control"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    placeholder="Company Name"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="company-address" className="form-label">
                    Company Address
                  </label>
                  <input
                    type="text"
                    id="company-address"
                    className="form-control"
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                    required
                    placeholder="Company Address"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="foundation-date" className="form-label">
                    Foundation Date
                  </label>
                  <input
                    type="date"
                    id="foundation-date"
                    className="form-control"
                    value={foundationDate}
                    onChange={(e) => setFoundationDate(e.target.value)}
                    required
                    placeholder="Foundation Date"
                  />
                </div>
              </>
            )}
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

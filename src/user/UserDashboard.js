import React from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { user } from "../firebase";
import "bootstrap/dist/css/bootstrap.min.css";

const UserDashboard = () => {
  return (
    <div className="container my-5">
      <h1>Welcome to your Dashboard! {user}</h1>
      <p>You are now logged in.</p>
    </div>
  );
};

export default UserDashboard;

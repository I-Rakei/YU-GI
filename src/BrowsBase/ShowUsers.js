import React, { useState, useEffect } from "react";
import { database } from "../firebase";
import { ref, get } from "firebase/database";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";
import "bootstrap/dist/css/bootstrap.min.css";

const UserList = styled.div`
  max-width: 600px;
  margin: 0 auto;
`;

const UserItem = styled(Link)`
  display: flex;
  align-items: center;
  padding: 1rem;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  margin-bottom: 1rem;
  text-decoration: none;
  color: #212529;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f8f9fa;
  }
`;

const UserIcon = styled(FontAwesomeIcon)`
  font-size: 1.5rem;
  margin-right: 1rem;
  color: #6c757d;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const Username = styled.div`
  font-weight: bold;
`;

const UserDetails = styled.div`
  font-size: 0.875rem;
  color: #6c757d;
`;

const ShowUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRef = ref(database, "users");
        const snapshot = await get(usersRef);

        if (snapshot.exists()) {
          const usersData = snapshot.val();
          const usersArray = Object.entries(usersData).map(([id, user]) => ({
            id,
            ...user,
          }));
          setUsers(usersArray);
        } else {
          setUsers([]);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching users:", error);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div
        className="container mt-4 d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh" }}
      >
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Estagiários</h1>
      <UserList>
        {users.length === 0 ? (
          <p>No users available.</p>
        ) : (
          users.map((user) => (
            <UserItem key={user.id} to={`/profile/${user.id}`}>
              <UserIcon icon={faUser} />
              <UserInfo>
                <Username>{user.username}</Username>
                <UserDetails>{user.profession}</UserDetails>
                <UserDetails>{user.email}</UserDetails>
              </UserInfo>
            </UserItem>
          ))
        )}
      </UserList>
    </div>
  );
};

export default ShowUsers;

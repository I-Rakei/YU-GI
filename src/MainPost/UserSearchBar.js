import React, { useState, useEffect, useRef } from "react";
import { database } from "../firebase"; // Adjust the import path as necessary
import {
  ref,
  query,
  orderByChild,
  startAt,
  endAt,
  onValue,
} from "firebase/database";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faUser } from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";
import "bootstrap/dist/css/bootstrap.min.css";

const SearchWrapper = styled.div`
  position: relative;
`;

const SearchDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: white;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
`;

const SearchItem = styled(Link)`
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  text-decoration: none;
  color: #212529;

  &:hover {
    background-color: #f8f9fa;
  }
`;

const UserIcon = styled(FontAwesomeIcon)`
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

const UserSearchBar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchTerm.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        const usersRef = ref(database, "users");

        const userNameQuery = query(
          usersRef,
          orderByChild("username"),
          startAt(lowerCaseSearchTerm),
          endAt(lowerCaseSearchTerm + "\uf8ff")
        );

        const emailQuery = query(
          usersRef,
          orderByChild("email"),
          startAt(lowerCaseSearchTerm),
          endAt(lowerCaseSearchTerm + "\uf8ff")
        );

        const professionQuery = query(
          usersRef,
          orderByChild("profession"),
          startAt(lowerCaseSearchTerm),
          endAt(lowerCaseSearchTerm + "\uf8ff")
        );

        const handleSnapshot = (snapshot) => {
          const matches = [];
          snapshot.forEach((childSnapshot) => {
            const userData = childSnapshot.val();
            matches.push({
              id: childSnapshot.key,
              username: userData.username,
              profession: userData.profession,
              email: userData.email,
            });
          });
          return matches;
        };

        const [userNameSnapshot, emailSnapshot, professionSnapshot] =
          await Promise.all([
            new Promise((resolve) => onValue(userNameQuery, resolve)),
            new Promise((resolve) => onValue(emailQuery, resolve)),
            new Promise((resolve) => onValue(professionQuery, resolve)),
          ]);

        const userNameMatches = handleSnapshot(userNameSnapshot);
        const emailMatches = handleSnapshot(emailSnapshot);
        const professionMatches = handleSnapshot(professionSnapshot);

        const combinedMatches = [
          ...new Map(
            [...userNameMatches, ...emailMatches, ...professionMatches].map(
              (item) => [item.id, item]
            )
          ).values(),
        ];

        setSuggestions(combinedMatches);
        setIsOpen(true);
      } catch (error) {
        setError("Error fetching user data: " + error.message);
      }
    };

    fetchSuggestions();
  }, [searchTerm]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  return (
    <SearchWrapper className="container mt-4" ref={wrapperRef}>
      <div className="input-group mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search by username, email, or profession"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsOpen(true)}
        />
        <button
          className="btn btn-outline-secondary"
          type="button"
          onClick={() => {
            setSearchTerm("");
            setIsOpen(false);
          }}
        >
          Clear
        </button>
        <button
          className="btn btn-outline-secondary"
          type="button"
          disabled={searchTerm.length < 2}
        >
          <FontAwesomeIcon icon={faSearch} />
        </button>
      </div>

      {error && <p className="text-danger">{error}</p>}

      {isOpen && suggestions.length > 0 && (
        <SearchDropdown>
          {suggestions.map((suggestion) => (
            <SearchItem
              key={suggestion.id}
              to={`/profile/${suggestion.id}`}
              onClick={() => setIsOpen(false)}
            >
              <UserIcon icon={faUser} />
              <UserInfo>
                <Username>{suggestion.username}</Username>
                <UserDetails>{suggestion.profession}</UserDetails>
                <UserDetails>{suggestion.email}</UserDetails>
              </UserInfo>
            </SearchItem>
          ))}
        </SearchDropdown>
      )}
    </SearchWrapper>
  );
};

export default UserSearchBar;

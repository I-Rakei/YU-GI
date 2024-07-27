import React, { useState, useEffect, useRef } from "react";
import { database } from "../firebase";
import {
  ref,
  query,
  orderByChild,
  startAt,
  endAt,
  onValue,
  get,
} from "firebase/database";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faUser,
  faUsersBetweenLines,
  faBuilding,
} from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";
import "bootstrap/dist/css/bootstrap.min.css";
import "./AllPosts.css";

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

const MainContainer = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
`;

const IconsContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  margin-bottom: 1rem;

  .icon-link {
    display: flex;
    align-items: center;
    text-decoration: none;
    color: #000;
    margin-bottom: 1rem;
  }

  .icon-link:hover {
    text-decoration: underline;
  }

  .icon-size {
    font-size: 1.5rem;
    margin-right: 0.5rem;
  }

  @media (min-width: 768px) {
    width: 20%;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
  }
`;

const PostsContainer = styled.div`
  width: 100%;
  height: 800px;
  overflow-y: auto;

  @media (min-width: 768px) {
    width: 75%;
  }
`;

const AllPostsWithSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const postsRef = ref(database, "posts");
    const usersRef = ref(database, "users");

    const fetchPosts = async () => {
      try {
        const snapshot = await get(postsRef);
        const usersSnapshot = await get(usersRef);
        const usersData = usersSnapshot.val();

        if (snapshot.exists()) {
          const postsData = snapshot.val();
          const postsArray = Object.entries(postsData).flatMap(
            ([userId, userPosts]) =>
              Object.entries(userPosts).map(([postId, post]) => ({
                id: postId,
                userId,
                ...post,
                username: usersData[userId]?.username || "Unknown User",
              }))
          );

          // Sort posts by timestamp, most recent first
          postsArray.sort((a, b) => b.timestamp - a.timestamp);
          setAllPosts(postsArray);
        } else {
          setAllPosts([]);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching posts:", error);
        setLoading(false);
      }
    };

    fetchPosts();

    // Set up real-time listener for updates
    const unsubscribe = onValue(postsRef, fetchPosts);

    return () => unsubscribe();
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
      <SearchWrapper ref={wrapperRef}>
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

      <h1 className="mb-4">All Posts</h1>
      <MainContainer>
        <IconsContainer>
          <Link to="/estagiarios" className="icon-link icon-size">
            <FontAwesomeIcon icon={faUsersBetweenLines} />
            <span> Estagiários</span>
          </Link>
          <Link to="/empresas" className="icon-link icon-size">
            <FontAwesomeIcon icon={faBuilding} />
            <span> Empresas</span>
          </Link>
        </IconsContainer>

        <PostsContainer className="bg-light posts-border">
          {allPosts.length === 0 ? (
            <p>No posts available.</p>
          ) : (
            <div className="post-list">
              {allPosts.map((post) => (
                <div
                  key={post.id}
                  className="mb-4"
                  style={{ maxWidth: "500px", margin: "0 auto" }}
                >
                  <div className="card" style={{ width: "100%" }}>
                    <img
                      src={post.imageUrl}
                      alt={post.description}
                      className="card-img-top post-image"
                      style={{ height: "200px", objectFit: "cover" }}
                    />
                    <div className="card-body">
                      <p className="card-text">{post.description}</p>
                      <p className="card-text">
                        <small className="text-muted">
                          Posted by: {post.username}
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
        </PostsContainer>
      </MainContainer>
    </div>
  );
};

export default AllPostsWithSearch;

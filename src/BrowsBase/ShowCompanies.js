import React, { useState, useEffect } from "react";
import { database } from "../firebase";
import { ref, get } from "firebase/database";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBuilding } from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";
import "bootstrap/dist/css/bootstrap.min.css";

const CompanyList = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const CompanyItem = styled(Link)`
  display: flex;
  align-items: center;
  padding: 1rem;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  margin-bottom: 1rem;
  text-decoration: none;
  color: #212529;
  transition: background-color 0.2s;
  width: 100%;
  height: 120px;
  box-sizing: border-box;
  overflow: hidden;

  &:hover {
    background-color: #f8f9fa;
  }
`;

const CompanyIcon = styled(FontAwesomeIcon)`
  font-size: 2rem;
  margin-right: 1rem;
  color: #6c757d;
`;

const CompanyInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
`;

const CompanyName = styled.div`
  font-weight: bold;
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
`;

const CompanyDetails = styled.div`
  font-size: 0.875rem;
  color: #6c757d;
`;

const ShowCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const companiesRef = ref(database, "Companies");
        const snapshot = await get(companiesRef);

        if (snapshot.exists()) {
          const companiesData = snapshot.val();
          const companiesArray = Object.entries(companiesData).map(
            ([id, company]) => ({
              id,
              ...company,
            })
          );
          setCompanies(companiesArray);
        } else {
          setCompanies([]);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching companies:", error);
        setLoading(false);
      }
    };

    fetchCompanies();
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
    <div className="container mt-4 mb-4">
      <h1 className="mb-4">Companies</h1>
      <CompanyList>
        {companies.length === 0 ? (
          <p>No companies available.</p>
        ) : (
          companies.map((company) => (
            <CompanyItem
              key={company.id}
              to={`/company/${company.id}`}
              className="d-flex align-items-center p-3 border rounded mb-5 text-decoration-none text-dark"
            >
              <CompanyIcon icon={faBuilding} />
              <CompanyInfo>
                <CompanyName>{company.name}</CompanyName>
                <CompanyDetails>{company.email}</CompanyDetails>
                <CompanyDetails>{company.industry}</CompanyDetails>
              </CompanyInfo>
            </CompanyItem>
          ))
        )}
      </CompanyList>
    </div>
  );
};

export default ShowCompanies;

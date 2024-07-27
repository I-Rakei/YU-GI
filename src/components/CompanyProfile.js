import React, { useEffect, useState } from "react";
import { ref, get } from "firebase/database";
import { database } from "../firebase";
import { useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const CompanyProfile = () => {
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { companyId } = useParams();

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const companyRef = ref(database, `Companies/${companyId}`);
        const snapshot = await get(companyRef);
        if (snapshot.exists()) {
          setCompanyData(snapshot.val());
        } else {
          setError("No company data available");
        }
      } catch (err) {
        setError("Error fetching company data");
        console.error(err);
      }
      setLoading(false);
    };

    fetchCompanyData();
  }, [companyId]);

  if (loading) {
    return (
      <div className="container mt-5 d-flex justify-content-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="container mt-5 alert alert-danger">{error}</div>;
  }

  if (!companyData) {
    return (
      <div className="container mt-5 alert alert-warning">
        No company data available
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="card">
        <div className="card-header header-image-container">
          <img
            src={
              companyData.headerImage || "https://via.placeholder.com/800x200"
            }
            alt="Header"
            className="img-fluid header-image"
          />
        </div>
        <div className="card-body bg-info bg-gradient">
          <div className="d-flex">
            <div className="profile-picture-container">
              <img
                src={
                  companyData.profileImage || "https://via.placeholder.com/100"
                }
                alt="Profile"
                className="profile-image"
                width="100px"
                style={{ borderRadius: "5px" }}
              />
            </div>
            <div className="profile-info ms-3">
              <h2>{companyData.companyName}</h2>
              <p>{companyData.companyAddress}</p>
              <p>Email: {companyData.email}</p>
              <p>
                Foundation Date:{" "}
                {new Date(companyData.foundationDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
        <div className="card-footer bg-secondary bg-gradient">
          <p>Created At: {new Date(companyData.createdAt).toLocaleString()}</p>
        </div>
      </div>

      <style jsx>{`
        .header-image-container {
          max-width: 800px;
          margin: 0 auto;
        }
        .header-image {
          max-width: 100%;
          height: auto;
        }
        .profile-picture-container {
          max-width: 100px;
          margin-right: 10px;
        }
        .profile-image {
          max-width: 100%;
          height: auto;
        }
      `}</style>
    </div>
  );
};

export default CompanyProfile;

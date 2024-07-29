import React from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Homepage.css";

const Homepage = () => {
  return (
    <div className="container mt-5">
      <div className="jumbotron text-center">
        <h1 className="display-4">Bem vindo ao Yugi</h1>
        <p className="lead">
          O teu último destino para encontrar o estágio é aqui no Yugi
        </p>
        <hr className="my-4" />
        <p>O que pretendes fazer?</p>
        <Link to="/all-posts" className="btn btn-primary mb-1">
          Ver o YU-GI
        </Link>
      </div>
      <div className="row justify-content-center">
        <div className="col-md-6 d-flex align-items-stretch">
          <div className="card mb-4 card-hover shadow-sm">
            <div className="card-body d-flex flex-column">
              <h5 className="card-title">Procurar ou Fornecer Estágio</h5>
              <p className="card-text flex-grow-1">
                Quer seja um estudante à procura de estágio ou uma empresa a
                oferecer estágios, estás no sítio certo.
              </p>
              <Link to="login" className="btn btn-primary mb-1">
                Ver Estágios
              </Link>
              <img src="02.png" alt="" className="img-fluid mt-2" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;

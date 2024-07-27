import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link } from "react-router-dom";
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
        <div className="col-md-4 d-flex align-items-stretch">
          <div className="card mb-4 card-hover shadow-sm">
            <div className="card-body d-flex flex-column">
              <h5 className="card-title">Procurar Estágio</h5>
              <p className="card-text flex-grow-1">
                Es um estudante que quer encontrar o estágio
              </p>
              <Link to="login" className="btn btn-primary mb-1">
                Ver Estágio
              </Link>
              <img src="02.png" alt="" className="img-fluid mt-2" />
            </div>
          </div>
        </div>
        <div className="col-md-4 d-flex align-items-stretch">
          <div className="card mb-4 card-hover shadow-sm">
            <div className="card-body d-flex flex-column">
              <h5 className="card-title">Fornecer estágio</h5>
              <p className="card-text flex-grow-1">
                Uma empresa que procura oferecer estágio a estudantes que estão
                à procura
              </p>
              <Link to="login/co" className="btn btn-primary mb-1">
                Ver estudantes
              </Link>
              <img src="01.png" alt="" className="img-fluid mt-2" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;

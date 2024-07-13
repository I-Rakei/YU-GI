import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./Homepage.css";

const Footer = () => {
  return (
    <footer className="text-center text-lg-start bg-dark text-light mt-5">
      {/* Section: Social media */}
      <section className="d-flex justify-content-center justify-content-lg-between p-4 border-bottom">
        {/* Left */}
        <div className="me-5 d-none d-lg-block"></div>
        {/* Left */}

        {/* Right */}
        <div>
          <a href="#" className="me-4 text-reset">
            <i className="fab fa-facebook-f"></i>
          </a>
          <a href="#" className="me-4 text-reset">
            <i className="fab fa-twitter"></i>
          </a>
          <a href="#" className="me-4 text-reset">
            <i className="fab fa-google"></i>
          </a>
          <a href="#" className="me-4 text-reset">
            <i className="fab fa-instagram"></i>
          </a>
          <a href="#" className="me-4 text-reset">
            <i className="fab fa-linkedin"></i>
          </a>
          <a href="#" className="me-4 text-reset">
            <i className="fab fa-github"></i>
          </a>
        </div>
        {/* Right */}
      </section>
      {/* Section: Social media */}

      {/* Section: Links  */}
      <section>
        <div className="container text-center text-md-start mt-5">
          {/* Grid row */}
          <div className="row mt-3">
            {/* Grid column */}
            <div className="col-md-3 col-lg-4 col-xl-3 mx-auto mb-4">
              {/* Content */}
              <h6 className="text-uppercase fw-bold mb-4">
                <i className="fas fa-gem me-3"></i>YU-GI inc.
              </h6>
              <p>
                YU-GI econtra o teu caminho para o estágio e eleva a tua
                capacidade de aprender e te torna um profissioanl melhor
              </p>
            </div>
            {/* Grid column */}

            {/* Grid column */}
            <div className="col-md-2 col-lg-2 col-xl-2 mx-auto mb-4">
              {/* Links */}
              <h6 className="text-uppercase fw-bold mb-4">Sobre-nos</h6>
              <p>
                <a href="#" className="text-reset">
                  A missao do Yu-Gi
                </a>
              </p>
              <p>
                <a href="#" className="text-reset">
                  Quem criou?
                </a>
              </p>
            </div>
            {/* Grid column */}

            {/* Grid column */}
            <div className="col-md-3 col-lg-2 col-xl-2 mx-auto mb-4">
              {/* Links */}
              <h6 className="text-uppercase fw-bold mb-4">Q&A</h6>
              <p>
                <a href="#" className="text-reset">
                  Ajuda
                </a>
              </p>
            </div>
            {/* Grid column */}

            {/* Grid column */}
            <div className="col-md-4 col-lg-3 col-xl-3 mx-auto mb-md-0 mb-4">
              {/* Links */}
              <h6 className="text-uppercase fw-bold mb-4">Contacto</h6>
              <p>
                <i className="fas fa-home me-3"></i> Maputo, Mocambique
              </p>
              <p>
                <i className="fas fa-envelope me-3"></i>
                yugi.info@gmail.com
              </p>
              <p>
                <i className="fas fa-phone me-3"></i> + 258 234 567 88
              </p>
              <p>
                <i className="fas fa-print me-3"></i> + 258 234 567 89
              </p>
            </div>
            {/* Grid column */}
          </div>
          {/* Grid row */}
        </div>
      </section>
      {/* Section: Links  */}

      {/* Copyright */}
      <div
        className="text-center p-4"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.2)" }}
      >
        © 2021 Copyright: Yu-GI
      </div>
      {/* Copyright */}
    </footer>
  );
};

export default Footer;

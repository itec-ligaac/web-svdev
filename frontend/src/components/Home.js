import React from "react";
import {Link} from "react-router-dom";
import background from "../hero.jpg";
import '../styles/Home.css';

function Home() {
  return (
        <div className="wrapper">
            <div className="hero" style={{ backgroundImage: `url(${background})` }}>
                <div className="hero-heading">
                    <h1>Travel safe, cheap, whitout hassle</h1>
                    <Link className="hero-button" to="/destinations">Choose your destination</Link>
                </div>
            </div>
        </div>
  );
}

export default Home;
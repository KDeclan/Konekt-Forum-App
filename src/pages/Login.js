import React from "react";
import "../styles/Login.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";

const logoUrlGreen = "/images/colorkit.svg";

function Login() {
  const handleDiscordClick = () => {
    alert("Discord button pressed!");
    //Handle authentication for discord
    //look into handling auth independent of specific platform
    //use passport.js so will come from another file
    //post to server with info then check with auth
  };

  return (
    <div
      className="login-container d-flex justify-content-center align-items-center"
      style={{
        backgroundImage: `url("/images/login-bg.png")`,
        backgroundSize: "cover",
        height: "100vh",
      }}
    >
      <div className="login-window p-4 shadow-lg rounded bg-dark text-light col-12 col-md-6 col-lg-4">
        <img id="login-logo" src={logoUrlGreen} alt="Konekt logo" />
        <h1>Konekt</h1>
        <h2>Welcome back!</h2>
        <hr />
        <p>Continue with</p>
        <div className="logos">
          <div className="logo" onClick={handleDiscordClick}>
            <FontAwesomeIcon icon={faDiscord} size="2x" color="#191b1b" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;

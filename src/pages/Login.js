import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Login.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";

const logoUrlGreen = "/images/colorkit.svg";

function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await axios.get("http://localhost:3000/auth/status", {
          withCredentials: true, // Ensure cookies are sent with the request
        });

        if (response.status === 200 && response.data.authenticated) {
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
      }
    };

    checkAuthStatus();
  }, [navigate]);

  const handleDiscordClick = () => {
    window.location.href = "http://localhost:3000/auth/discord";
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

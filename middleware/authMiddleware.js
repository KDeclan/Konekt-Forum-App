const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  // Extract the token from the cookies
  const token = req.cookies.token;

  if (!token) {
    return res.sendStatus(401); // Unauthorized if no token is found
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403); // Forbidden if token verification fails
    }
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;

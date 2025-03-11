const jwt = require("jsonwebtoken");

const isUserAuthenticated = (req, res, next) => {
  const authToken = req.cookies.expenseAuth;
  console.log(authToken)
  if (!authToken) {
    return res.status(401).json({ error: "Authorization Token is Required" });
  }

  try {
    const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
    console.log(decoded)
    req.user = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token." });
  }
};

module.exports = isUserAuthenticated;

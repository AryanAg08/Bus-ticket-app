const jwt = require("jsonwebtoken");
const User = require("../models/user");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.id);
    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = user; 
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

const isOrganiser = (req, res, next) => {
  if (req.user.role !== "organiser") {
    return res.status(403).json({ message: "Access denied: Organisers only" });
  }
  next();
};

const isUser = (req, res, next) => {
    if (req.user.role !== "user") {
        return res.status(403).json({ message: "Access denied: Users only" });
    }
    next();
}

module.exports = {authMiddleware, isOrganiser, isUser};

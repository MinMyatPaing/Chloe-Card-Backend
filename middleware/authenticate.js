import { verifyToken } from "../utils/auth.js";

/**
 * Express middleware to authenticate requests
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
function authenticate(req, res, next) {
  // Get the token from the authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authorization header required" });
  }
  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
  
  req.user = decoded;
  next();
}

export default authenticate;

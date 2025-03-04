import jwt from "jsonwebtoken";

import UserType from "../constants/usertype.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";

/**
 * Generate a JWT token for a user
 * @param {Object} user - User object
 * @returns {string} JWT token
 */
export function generateToken(user) {
  const payload = {
    userId: user.UserID,
    email: user.Email,
    role: user.Role,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify a JWT token
 * @param {string} token - JWT token
 * @returns {Object|null} Decoded token payload or null
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    console.error("Token verification failed:", err.message);
    return null;
  }
}

/**
 * Determine user type based on age
 * @param {number} age - Age
 * @returns {string} User Type or Error
 */
export function determineUserType(age) {
  try {
    switch (true) {
      case age >= 0 && age <= 18:
        return UserType.CHILDREN;
      case age > 18 && age <= 35:
        return UserType.YOUNG_ADULT;
      case age > 35 && age <= 55:
        return UserType.MIDDLE_AGE;
      case age > 55:
        return UserType.ELDERLY;
      default:
        throw Error("Invalid Age");
    }
  } catch (error) {
    console.log("Invalid Age and error:", error.message);
    throw error;
  }
}

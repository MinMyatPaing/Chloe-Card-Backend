import bcrypt from "bcryptjs";

import { executeQuery } from "../config/db.js";
import { generateToken } from "../utils/auth.js";

const register = async (req, res) => {
  try {
    const { email, password, age } = req.body;

    if (!email || !password || !age) {
      return res
        .status(400)
        .json({ error: "Email and password and age are required" });
    }

    const user = await registerUser(email, password, age);
    res
      .status(201)
      .json({ message: "User registered successfully", userId: user.UserID });
  } catch (err) {
    console.error(err);
    if (err.message === "User already exists") {
      return res.status(409).json({ error: err.message });
    }
    res
      .status(500)
      .json({ error: "Registration failed", message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const result = await loginUser(email, password);
    res.json(result);
  } catch (err) {
    console.error(err);
    if (err.message === "Invalid email or password") {
      return res.status(401).json({ error: err.message });
    }
    res.status(500).json({ error: "Login failed", message: err.message });
  }
};

/**
 * Register a new user
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} role - User role2
 * @returns {Promise<Object>} Registered user object
 */
async function registerUser(email, password, age) {
  // Hash the password
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Check if user already exists
  const checkQuery = "SELECT COUNT(*) AS count FROM Users WHERE Email = @email";
  const checkResult = await executeQuery(checkQuery, { email });

  if (checkResult.recordset[0].count > 0) {
    throw new Error("User already exists");
  }

  // Insert new user
  const insertQuery = `
    INSERT INTO Users (Email, Password, Age, CreatedAt)
    OUTPUT INSERTED.*
    VALUES (@email, @password, @age, GETDATE())
  `;

  const result = await executeQuery(insertQuery, {
    email,
    password: hashedPassword,
    age,
  });

  return result.recordset[0];
}

/**
 * Login a user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} Login result with token
 */
async function loginUser(email, password) {
  const query = "SELECT * FROM Users WHERE Email = @email";
  const result = await executeQuery(query, { email });

  if (result.recordset.length === 0) {
    throw new Error("Invalid email or password");
  }

  const user = result.recordset[0];
  const passwordMatch = await bcrypt.compare(password, user.Password);

  if (!passwordMatch) {
    throw new Error("Invalid email or password");
  }

  // Generate token
  const token = generateToken(user);

  // Return user info (without password) and token
  const { Password, ...userWithoutPassword } = user;
  return {
    user: userWithoutPassword,
    token,
  };
}

export { register, login };

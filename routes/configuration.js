import express from "express";
import { getApiKey } from "../controllers/configuration.js";

import authenticate from "../middleware/authenticate.js";

const router = express.Router();

router.get("/:key", authenticate, getApiKey);

export default router;

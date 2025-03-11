import express from "express";
import { summarizeText } from "../controllers/openAi.js";

import authenticate from "../middleware/authenticate.js";

const router = express.Router();

router.post("/summarize", authenticate, summarizeText);

export default router;

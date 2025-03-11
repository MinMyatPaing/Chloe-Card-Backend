import axios from "axios";

import { throwError } from "../utils/error.js";

export const summarizeText = async (req, res, next) => {
  try {
    const { text } = req.body;

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `Analyze conversations for health-related content and return JSON in this exact format:
              {
                "isHealthRelated": boolean,
                "hasEnoughInfo": boolean,
                "errorMessage": string | null,
                "analysis": {
                  "background": string | null,
                  "concerns": string | null,
                  "keyQuestions": string | null
                }
              }
              
              Rules:
              - Set isHealthRelated to true only if the text contains discussions about physical health, mental health, medical conditions, or healthcare
              - Set hasEnoughInfo to true only if there's sufficient context to provide meaningful analysis in all three categories
              - If not health-related, provide appropriate errorMessage and set analysis fields to null
              - If insufficient info, provide appropriate errorMessage and set analysis fields to null`,
          },
          {
            role: "user",
            content: `Analyze this text: ${text}`,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_KEY}`,
        },
      }
    );

    let content = response.data?.choices?.[0]?.message?.content?.trim();

    if (!content) {
      throwError(500, "Error from openai server. No content returned");
    }

    // Extract and sanitize JSON
    const jsonStart = content.indexOf("{");
    const jsonEnd = content.lastIndexOf("}");
    if (jsonStart === -1 || jsonEnd === -1) {
      throwError(500, "Response does not contain valid JSON");
    }

    content = content.substring(jsonStart, jsonEnd + 1);

    try {
      JSON.parse(content);
    } catch (jsonError) {
      content = content.replace(/(\r\n|\n|\r)/gm, "");
      content = content.replace(/,\s*}/g, "}");
      content = content.replace(/,\s*]/g, "]");
    }

    const transformedContent = JSON.parse(content);
    res.status(200).json({
      message: "Text successfully summerized",
      content: transformedContent,
    });
  } catch (error) {
    next(error);
  }
};

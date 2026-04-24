const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");

const HF_API_URL =
  "https://api-inference.huggingface.co/models/facebook/bart-large-cnn";
const huggingFaceApiKey = defineSecret("HUGGING_FACE_API_KEY");

const buildHeaders = (apiKey) => {
  if (!apiKey) {
    throw new HttpsError(
      "failed-precondition",
      "Missing HUGGING_FACE_API_KEY in Firebase Functions environment."
    );
  }

  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json"
  };
};

const callHuggingFace = async (prompt) => {
  const response = await fetch(HF_API_URL, {
    method: "POST",
    headers: buildHeaders(huggingFaceApiKey.value()),
    body: JSON.stringify({
      inputs: prompt
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new HttpsError("internal", `Hugging Face request failed: ${text}`);
  }

  const data = await response.json();
  if (Array.isArray(data) && data[0]?.summary_text) {
    return data[0].summary_text;
  }

  return JSON.stringify(data);
};

exports.summarizeStudyText = onCall({ secrets: [huggingFaceApiKey] }, async (request) => {
  const text = request.data?.text;
  if (!text) {
    throw new HttpsError("invalid-argument", "Text is required.");
  }

  const prompt = `Summarize this study content into concise student notes:\n${text}`;
  const summary = await callHuggingFace(prompt);
  return { summary };
});

exports.analyzeQuestionPaper = onCall({ secrets: [huggingFaceApiKey] }, async (request) => {
  const text = request.data?.text;
  if (!text) {
    throw new HttpsError("invalid-argument", "Question paper text is required.");
  }

  const prompt = `Read the following question paper content and list recurring topics, chapter names, and likely important areas for study:\n${text}`;
  const analysis = await callHuggingFace(prompt);
  return { analysis };
});

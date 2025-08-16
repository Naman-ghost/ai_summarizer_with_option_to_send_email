import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// --- Static frontend ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public"))); // serves public/index.html

// --- File upload (for .txt transcripts) ---
const upload = multer({ storage: multer.memoryStorage() });

// --- Hugging Face (free model) ---
const HF_API_URL = "https://api-inference.huggingface.co/models/facebook/bart-large-cnn";
const HF_API_KEY = process.env.HF_API_KEY;

// Helper: call HF Inference API to generate summary
async function generateSummary(text, instruction = "Summarize this text") {
  if (!text || !text.trim()) return "No input text provided.";

  if (!HF_API_KEY) {
    return "Error: HF_API_KEY missing in server. Add it to your .env.";
  }

  try {
    const resp = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: `${instruction}\n\n${text}`,
        parameters: { max_length: 220, min_length: 60 },
      }),
    });

    const data = await resp.json();

    // HF can return loading/error payloads; handle them clearly
    if (Array.isArray(data) && data[0]?.summary_text) {
      return data[0].summary_text;
    }
    if (data?.error) {
      // e.g., "Model facebook/bart-large-cnn is currently loading"
      return `HF Error: ${data.error}`;
    }

    return "No summary generated (unexpected response).";
  } catch (err) {
    console.error("HF request failed:", err);
    return "No summary generated (network/request failed).";
  }
}

/* ============================
   Summarization Endpoints
   ============================ */

// 1) Summarize a file upload (frontend posts FormData with "file")
app.post("/summarize", upload.single("file"), async (req, res) => {
  try {
    const transcript = req.file ? req.file.buffer.toString("utf-8") : "";
    const summary = await generateSummary(transcript);
    res.json({ summary });
  } catch (err) {
    console.error("Summarize file error:", err);
    res.status(500).json({ error: "Summarization failed" });
  }
});

// 2) Summarize manually typed text (frontend posts JSON { text })
app.post("/summarize-text", async (req, res) => {
  try {
    const { text, instruction } = req.body || {};
    if (!text) return res.status(400).json({ error: "No text provided" });

    const summary = await generateSummary(text, instruction || "Summarize this text");
    res.json({ summary });
  } catch (err) {
    console.error("Summarize text error:", err);
    res.status(500).json({ error: "Failed to summarize text" });
  }
});

/* ============================
   Email (Brevo API) Endpoints
   ============================ */

// Use Brevo Transactional Email API (requires verified sender in Brevo)
const BREVO_API_KEY = process.env.BREVO_API_KEY; // xkeysib-...
const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL; // must be verified in Brevo
const BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME || "AI Notes Summarizer";

// Helper to send via Brevo REST API
async function sendViaBrevo({ toList, subject, text }) {
  if (!BREVO_API_KEY) throw new Error("BREVO_API_KEY missing");
  if (!BREVO_SENDER_EMAIL) throw new Error("BREVO_SENDER_EMAIL missing (must be a verified sender in Brevo)");

  const payload = {
    sender: { name: BREVO_SENDER_NAME, email: BREVO_SENDER_EMAIL },
    to: toList.map((email) => ({ email })),
    subject: subject || "Meeting Summary",
    textContent: text || "",
  };

  const resp = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": BREVO_API_KEY,
    },
    body: JSON.stringify(payload),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Brevo API error: ${resp.status} ${errText}`);
  }

  return await resp.json(); // contains messageId, etc.
}

// 3) Your existing frontend uses /share with { recipients, content }
app.post("/share", async (req, res) => {
  try {
    let { recipients, content } = req.body || {};
    if (!recipients) return res.status(400).json({ error: "No recipients provided" });

    // Allow comma-separated string or array
    if (typeof recipients === "string") {
      recipients = recipients.split(",").map((s) => s.trim()).filter(Boolean);
    }
    if (!Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ error: "Recipients must be a non-empty list" });
    }

    const result = await sendViaBrevo({
      toList: recipients,
      subject: "Meeting Summary",
      text: content || "",
    });

    console.log("Brevo sent:", result);
    res.json({ message: "✅ Email sent successfully", brevo: result });
  } catch (err) {
    console.error("Email /share error:", err);
    res.status(500).json({ error: "Email failed", details: err.message });
  }
});

// 4) Optional compatibility route if you later post { to, subject, text }
app.post("/send-email", async (req, res) => {
  const { to, subject, text } = req.body;

  try {
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    const sendSmtpEmail = {
      sender: { 
        email: process.env.BREVO_SENDER_EMAIL,   // ✅ now from .env
        name: "SmartRetail Assistant"
      },
      to: [{ email: to }],
      subject: subject,
      textContent: text,
    };

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("Email sent ✅", result);
    res.json({ message: "✅ Email sent successfully" });
  } catch (error) {
    console.error("❌ Email error:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
});


// Fallback to index.html for any other GET (keeps simple routing)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));

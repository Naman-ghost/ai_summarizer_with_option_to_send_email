# 📚 AI Notes Summarizer with Email Sharing

> Summarize your notes (typed or uploaded) and send them via email using Brevo SMTP. Built with Node.js + Express + Hugging Face BART Large CNN.

![Node.js](https://img.shields.io/badge/Backend-Node.js-green) ![Express](https://img.shields.io/badge/Framework-Express-blue) ![HTML](https://img.shields.io/badge/Frontend-HTML/CSS-yellow) ![Hugging Face](https://img.shields.io/badge/AI-HuggingFace-orange) ![Vercel](https://img.shields.io/badge/Deployment-Vercel-purple)

---

## 🚀 Overview

AI Notes Summarizer allows users to:  
- Enter notes manually or upload `.txt` files.  
- Generate automatic summaries using Hugging Face BART Large CNN.  
- Edit the summary if needed before sending.  
- Share the summary via email using Brevo SMTP.  
- Access a minimal, clean frontend with HTML + JS.

🔗 **Live Demo:** [AI Notes Summarizer](https://ai-notes-summarizer-ivbt4tww1-naman-singhs-projects-e343687b.vercel.app/)

---

## 🗂️ Project Structure

```
ai_summarizer_with_option_to_send_email/
├── server.js                 # Node.js + Express backend
├── public/
│   └── index.html            # Frontend HTML + JS
├── package.json              # Dependencies
├── package-lock.json
├── README.md                 # This file
└── .env.example              # Example env template (no secrets)
```

---

## 🔧 Setup Instructions

### 1. Clone the repo

```bash
git clone https://github.com/Naman-ghost/ai_summarizer_with_option_to_send_email.git
cd ai_summarizer_with_option_to_send_email
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create a `.env` file in the root

```env
HF_API_KEY=your_huggingface_token
BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=your_verified_email
PORT=5000
```

> **Note:** Never commit your real `.env` file. Use `.env.example` as a reference.

### 4. Run locally

```bash
npm start
```

Visit [http://localhost:5000](http://localhost:5000) in your browser.

---

## ▶️ Deployment

The backend and frontend are deployed together on **Vercel**:  
[Live Demo](https://ai-notes-summarizer-ivbt4tww1-naman-singhs-projects-e343687b.vercel.app/)

---

## 📤 Supported File Types

- `.txt` (plain text)  

Uploaded files are converted to text and summarized automatically.

---

## 🌐 API Endpoints

| Route             | Method | Description                                 |
|------------------|--------|---------------------------------------------|
| `/summarize`      | POST   | Upload a `.txt` file to summarize           |
| `/summarize-text` | POST   | Send text manually for summarization        |
| `/send-email`     | POST   | Send the generated summary via Brevo SMTP   |

---

## 🖼️ Frontend Preview

Minimal, clean interface to:  
- Type notes  
- Upload `.txt` files  
- Edit summaries  
- Send via email  

Built with plain **HTML + CSS + JS** (no React).

---

## ✅ Example Usage

- Type meeting notes and click "Summarize".  
- Upload lecture notes `.txt` and get an automatic summary.  
- Edit the summary and send to your verified email.

---

## ✨ Credits

- **Summarization Model:** [Hugging Face BART Large CNN](https://huggingface.co/facebook/bart-large-cnn)  
- **Email Service:** [Brevo (Sendinblue)](https://www.brevo.com/)  
- **Built by:** [@Naman-ghost](https://github.com/Naman-ghost)  

---

## 📌 To Do

- [ ] Support `.pdf` and `.docx` uploads  
- [ ] Add multi-language support  
- [ ] Add download summary option

---

## 📜 License

MIT

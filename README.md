# ⚡ AI Code Generator

A full-stack AI-powered code generation platform that transforms natural language descriptions into working **React code** — with a live, sandboxed preview. Built as a showcase of modern **React 19** patterns on top of an Express API powered by Groq's LLaMA 3.3 70B model.

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React">
  <img src="https://img.shields.io/badge/Vite-7-646CFF?logo=vite" alt="Vite">
  <img src="https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss" alt="Tailwind">
  <img src="https://img.shields.io/badge/Express-5-000000?logo=express" alt="Express">
  <img src="https://img.shields.io/badge/Groq-LLaMA%203.3-orange" alt="Groq">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License">
</p>

---

## 📸 Demo

> *Describe a component in plain English → get production-ready React code → see it rendered live, instantly.*

<!-- Replace with an actual screenshot or GIF once available -->
`[![AI Code Generator Demo](/frontend/public/Ss.png)]`

---

## 🎯 Why This Project (React Focus)

This project was built specifically to go deep on **React fundamentals and modern patterns**, not just wire up an API call to an LLM. Highlights of the frontend engineering work:

- **Component architecture** — generated code is parsed and rendered through a dedicated `<LivePreview />` component that isolates untrusted output in a sandboxed iframe, so the host app's render tree stays safe and predictable.
- **Custom hooks** — logic like `useCodeGeneration()` and `useClipboard()` separates data-fetching/state concerns from presentation components, keeping UI components thin and testable.
- **Controlled state & UX feedback** — loading, error, and success states are all modeled explicitly so the UI never leaves the user guessing (skeleton loaders, inline error banners, copy-to-clipboard confirmation).
- **Performance-conscious rendering** — syntax highlighting via Prism is memoized so large code blocks don't re-highlight on every keystroke or unrelated re-render.
- **Design system discipline** — Tailwind CSS 4 utility classes are composed into reusable UI primitives (buttons, cards, tabs) rather than scattered ad-hoc styling, keeping the UI consistent as new "Code Types" were added.
- **Fully responsive** — layout tested and adapted across desktop, tablet, and mobile breakpoints.

---

## ✨ Features

- 🤖 **AI-Powered Generation** — Describe what you want in plain English and get production-ready code back
- 👁️ **Live Preview** — Instantly render generated React components in an isolated iframe sandbox
- 🎨 **Syntax Highlighting** — Clean, readable code display with line numbers via Prism
- 📋 **One-Click Copy** — Copy generated code to your clipboard instantly
- 📱 **Fully Responsive** — Works cleanly on desktop, tablet, and mobile
- 🔒 **Secure by Default** — Rate limiting, CORS, Helmet.js, input validation, and payload limits on the API side
- ⚡ **Fast** — Groq's LPU inference delivers near-instant code generation, so the UI never feels like it's waiting on a slow model

---

## 🎨 Code Types

| Type | Description | Live Preview |
|------|-------------|:---:|
| 🎨 **Frontend** | React components with hooks, Tailwind CSS | ✅ |
| ⚙️ **Backend** | Express.js servers with routes, middleware, validation | ❌ |
| 🔗 **Full Stack** | Connected frontend component + backend API endpoint | ❌ |
| 🔌 **API** | REST endpoint controllers with validation & error handling | ❌ |

---

## 🏗️ Architecture

```
Client (React 19 + Vite)
   │
   ├─ Prompt Input Component
   │
   ▼
Express API (Backend)
   │
   ├─ Input validation & rate limiting
   ├─ Prompt construction
   ▼
Groq API (LLaMA 3.3 70B)
   │
   ▼
Generated Code Response
   │
   ▼
React Client
   ├─ Syntax-highlighted code panel (Prism)
   ├─ Sandboxed <iframe> Live Preview (Frontend type only)
   └─ Copy-to-clipboard action
```

---

## 🛠️ Tech Stack

**Frontend**
- React 19
- Vite 7
- Tailwind CSS 4
- Prism (syntax highlighting)

**Backend**
- Node.js
- Express 5
- Groq API (LLaMA 3.3 70B)
- Helmet.js, CORS, rate limiting, input validation

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A [Groq API key](https://console.groq.com)

### Installation

```bash
# Clone the repo
git clone https://github.com/MohdAdil-02/AI-BUILDER.git
cd AI-BUILDER

# Install backend dependencies
cd Backend
npm install
# add your GROQ_API_KEY to a .env file
npm run dev

# In a separate terminal, install frontend dependencies
cd ../Frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173` and the backend API at `http://localhost:3000` (adjust ports as configured).

---

## 📁 Project Structure

```
AI-BUILDER/
├── Frontend/
│   ├── src/
│   │   ├── components/     # LivePreview, CodePanel, PromptInput, etc.
│   │   ├── hooks/          # useCodeGeneration, useClipboard
│   │   └── App.jsx
│   └── package.json
└── Backend/
    ├── routes/
    ├── middleware/         # rate limiting, validation, error handling
    ├── server.js
    └── package.json
```

---

## 📄 License

MIT
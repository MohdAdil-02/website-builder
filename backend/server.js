import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

// Express app ko initialize karein
const app = express();
const PORT = process.env.PORT || 3001;

// --- SECURITY MIDDLEWARE ---
// Security headers set karein
app.use(helmet());

// CORS configuration (production mein specific origins allow karein)
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. curl, Postman, server-to-server)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['POST', 'GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Rate limiting - abuse se bachne ke liye
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // TEMPORARY: raised for testing — lower this back down before production
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing with size limit (DDOS protection)
app.use(express.json({ limit: '10kb' }));

// --- ENVIRONMENT VALIDATION ---
if (!process.env.GROQ_API_KEY) {
  console.error("❌ FATAL ERROR: GROQ_API_KEY .env file mein nahin mil rahi hai.");
  process.exit(1);
}

// Groq client ko initialize karein
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Utility: Markdown code blocks hataane ke liye
const cleanCodeResponse = (text) => {
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```(jsx|js|javascript|typescript|ts|html|css|json)?\n/i, '');
  cleaned = cleaned.replace(/^```(jsx|js|javascript|typescript|ts|html|css|json)?/i, '');
  cleaned = cleaned.replace(/```$/g, '');
  return cleaned.trim();
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'AI Code Generator API'
  });
});

// Main API endpoint
app.post('/api/generate', async (req, res) => {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[${requestId}] Request received for type:`, req.body.type);

  try {
    const { prompt, type } = req.body;

    // --- VALIDATION ---
    if (!prompt || !type) {
      console.error(`[${requestId}] Validation Error: Missing fields`);
      return res.status(400).json({
        error: 'Prompt and type are required.',
        requestId
      });
    }

    if (typeof prompt !== 'string' || typeof type !== 'string') {
      return res.status(400).json({
        error: 'Invalid data types. Prompt and type must be strings.',
        requestId
      });
    }

    if (prompt.length > 10000) {
      return res.status(400).json({
        error: 'Prompt is too long. Maximum 1000 characters allowed.',
        requestId
      });
    }

    if (prompt.length < 5) {
      return res.status(400).json({
        error: 'Prompt is too short. Please provide more details.',
        requestId
      });
    }

    const validTypes = ['frontend', 'backend', 'fullstack', 'api'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        error: `Invalid type. Allowed types: ${validTypes.join(', ')}`,
        requestId
      });
    }

    // --- PROMPT CONSTRUCTION ---
    const systemInstructions = {
  frontend: `You are an expert React developer generating code for a LIVE PREVIEW SANDBOX with strict constraints. Follow every rule exactly.

OUTPUT FORMAT (critical):
- Return ONLY raw JavaScript/JSX source code. No markdown code fences (no \`\`\`), no explanations before or after, no commentary.
- The very first character of your response must be code (e.g. "function" or "const"), not a backtick or any text.

SANDBOX CONSTRAINTS (the code will NOT run in a normal app — read carefully):
- Do NOT include any import statements. React, useState, and useEffect are already available in scope — use them directly (e.g. "useState(...)", not "React.useState(...)" or "import { useState } from 'react'").
- Do NOT use any library other than plain React (no axios, react-router, icons packages, chart libraries, etc.). If the UI needs an icon, use an inline SVG or a Unicode symbol instead.
- Do NOT make real network requests (no fetch/axios calls to external or placeholder URLs) and do NOT use localStorage/sessionStorage — the sandbox has no backend and no persistent storage. Simulate data with local component state instead.
- Define exactly ONE top-level component using a NAMED function declaration, e.g. "function LoginForm() { ... }". Do not use an anonymous arrow function as the export, and do not use "export default" — a naming convention is required so the component can be mounted programmatically.

CODE QUALITY:
1. Use Tailwind utility classes for all styling — modern spacing, responsive breakpoints (sm/md/lg), and a coherent visual hierarchy.
2. Use React hooks (useState/useEffect) where the feature genuinely needs interactivity or state — don't add hooks that aren't used.
3. Include realistic placeholder content and working interactivity (e.g. a form should update state on input and show a real validation or submit state), not empty stubs or "// TODO" comments.
4. Use semantic HTML elements (form, label, button, nav, etc.) and basic accessibility attributes (aria-label, alt text) where relevant.
5. The component must be complete and self-contained — no undefined variables, no references to components or data that don't exist in the file.`,

  backend: `You are an expert Node.js developer generating a complete Express.js API server.

OUTPUT FORMAT (critical):
- Return ONLY raw JavaScript source code. No markdown code fences (no \`\`\`), no explanations before or after, no commentary.
- The very first character of your response must be code, not a backtick or any text.

CODE QUALITY:
1. Include all necessary require/import statements (express, cors, etc.) at the top.
2. Include input validation and error-handling middleware appropriate to the feature described.
3. Use proper async/await patterns for any asynchronous logic.
4. Export the app (module.exports = app) or start the server with app.listen, matching what a typical Express project needs.
5. Add brief comments ONLY where the logic is non-obvious (e.g. a regex, a security check, a non-trivial algorithm). Do not comment obvious lines like variable declarations or straightforward route definitions.
6. Do not include placeholder logic like "// TODO: implement this" — implement the actual feature described in the prompt as completely as possible.`,

  fullstack: `Generate both a frontend React component and a backend Express API endpoint for the described feature, clearly connected to each other.

OUTPUT FORMAT (critical):
- Return ONLY raw code, split into two clearly separated blocks using exactly these markers on their own lines: "// --- FRONTEND ---" and "// --- BACKEND ---".
- No markdown code fences, no explanations outside the code.

RULES:
1. The frontend component should call the backend endpoint you define (matching route path and HTTP method) using fetch, with realistic request/response handling (loading and error states).
2. The backend should validate input and return a JSON response shape that the frontend actually consumes.
3. Keep both pieces minimal but complete and internally consistent — no mismatched field names between the two.`,

  api: `Generate a single REST API endpoint's controller logic for the described feature.

OUTPUT FORMAT (critical):
- Return ONLY raw JavaScript source code. No markdown code fences, no explanations before or after.

RULES:
1. Focus on the controller/handler function(s) only — assume Express routing is already wired up elsewhere.
2. Include input validation with clear, specific error messages (not generic "invalid input").
3. Include proper error handling (try/catch, appropriate HTTP status codes).
4. Do not include unrelated boilerplate (no server setup, no app.listen).`
};

    // --- AI GENERATION WITH TIMEOUT ---
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('AI_GENERATION_TIMEOUT')), 30000)
    );

    const generationPromise = groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        { role: "system", content: systemInstructions[type] },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 4096
    });

    const result = await Promise.race([generationPromise, timeoutPromise]);

    const rawCode = result?.choices?.[0]?.message?.content;

    if (!rawCode || rawCode.trim().length === 0) {
      throw new Error('EMPTY_RESPONSE');
    }

    const code = cleanCodeResponse(rawCode);

    console.log(`[${requestId}] Generation successful. Code length: ${code.length}`);

    res.json({
      code,
      requestId,
      type,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error(`[${requestId}] Error:`, error.message);

    let statusCode = 500;
    let errorMessage = 'Failed to generate code. Please try again.';

    if (error.message === 'AI_GENERATION_TIMEOUT') {
      statusCode = 504;
      errorMessage = 'AI generation timed out. Please try a simpler prompt.';
    } else if (error.message === 'EMPTY_RESPONSE') {
      statusCode = 500;
      errorMessage = 'AI returned empty response.';
    } else if (error.status === 401 || error.message?.toLowerCase().includes('invalid api key')) {
      statusCode = 500;
      errorMessage = 'Server configuration error. Please contact support.';
      console.error('Invalid Groq API Key detected!');
    } else if (error.status === 429) {
      statusCode = 429;
      errorMessage = 'Rate limit exceeded on AI service. Please try again later.';
    }

    res.status(statusCode).json({
      error: errorMessage,
      requestId,
      timestamp: new Date().toISOString()
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found. Use POST /api/generate or GET /health' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    requestId: req.requestId || 'unknown'
  });
});

// Server start
const server = app.listen(PORT, () => {
  console.log(`✅ Server is listening on http://localhost:${PORT}`);
  console.log(`🔒 Rate limiting enabled: ${limiter.max || 'custom'} requests per 15 minutes`);
  console.log(`🏥 Health check available at: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

export default app;
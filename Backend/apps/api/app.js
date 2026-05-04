const express = require('express');
const multer = require('multer');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const upload = multer({ limits: { fileSize: 20 * 1024 * 1024 } });

const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
}));
app.use(express.json({ limit: '10mb' }));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_VISION_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
const GEMINI_PRO_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.PGSSLMODE === 'disable' ? false : { rejectUnauthorized: false },
    })
  : null;

let dbReadyPromise;

async function ensureDb() {
  if (!pool) {
    throw new Error('DATABASE_URL is not configured');
  }

  if (!dbReadyPromise) {
    dbReadyPromise = pool.query(`
      CREATE EXTENSION IF NOT EXISTS pgcrypto;

      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
  }

  return dbReadyPromise;
}

function requireConfig() {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.created_at,
  };
}

function signToken(user) {
  requireConfig();
  return jwt.sign(
    { sub: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

async function authRequired(req, res, next) {
  try {
    requireConfig();
    await ensureDb();

    const header = req.get('authorization') || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';

    if (!token) {
      return res.status(401).json({ error: 'Login required' });
    }

    const payload = jwt.verify(token, JWT_SECRET);
    const result = await pool.query(
      'SELECT id, name, email, created_at FROM users WHERE id = $1',
      [payload.sub]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ error: 'Invalid session' });
    }

    req.user = result.rows[0];
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
    next(err);
  }
}

app.get('/api/health', async (req, res) => {
  const dbConfigured = Boolean(pool);
  let db = 'not_configured';

  if (dbConfigured) {
    try {
      await ensureDb();
      db = 'ok';
    } catch {
      db = 'error';
    }
  }

  res.json({ status: 'ok', db, timestamp: new Date().toISOString() });
});

app.post('/api/auth/signup', async (req, res, next) => {
  try {
    requireConfig();
    await ensureDb();

    const name = String(req.body.name || '').trim();
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');

    if (name.length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 characters.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Enter a valid email address.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at`,
      [name, email, passwordHash]
    );
    const user = result.rows[0];

    res.status(201).json({ token: signToken(user), user: publicUser(user) });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }
    next(err);
  }
});

app.post('/api/auth/login', async (req, res, next) => {
  try {
    requireConfig();
    await ensureDb();

    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');

    const result = await pool.query(
      'SELECT id, name, email, password_hash, created_at FROM users WHERE email = $1',
      [email]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = result.rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    res.json({ token: signToken(user), user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

app.get('/api/auth/me', authRequired, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ ok: true });
});

app.post('/api/analyse', authRequired, upload.single('file'), async (req, res, next) => {
  try {
    const { testType, patientAge, patientSex, symptoms } = req.body;
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    const base64Data = file.buffer.toString('base64');
    const mimeType = file.mimetype;

    const prompt = `You are an expert radiologist. Analyze this medical scan and provide a detailed structured report.
Test Type: ${testType || 'Unknown'}
Patient Age: ${patientAge || 'Unknown'}
Patient Sex: ${patientSex || 'Unknown'}
Symptoms/Notes: ${symptoms || 'None provided'}

Provide your response in this exact JSON format:
{
  "reportTitle": "string",
  "urgency": "routine|urgent|emergency",
  "scanQuality": "string",
  "findings": [{"region": "string", "observation": "string", "severity": "normal|mild|moderate|severe"}],
  "impression": "string",
  "differentialDiagnosis": ["string"],
  "recommendedFollowUp": "string",
  "limitations": "string"
}`;

    const response = await fetch(GEMINI_VISION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: mimeType, data: base64Data } }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 4096, responseMimeType: 'application/json' },
      }),
    });

    if (!response.ok) throw new Error(`Gemini API error: ${await response.text()}`);

    const data = await response.json();
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textContent) throw new Error('No content received');

    let report;
    try { report = JSON.parse(textContent); }
    catch { report = { reportTitle: 'Medical Imaging Report', urgency: 'routine', scanQuality: 'Assessed', findings: [{ region: 'General', observation: textContent, severity: 'normal' }], impression: textContent, differentialDiagnosis: [], recommendedFollowUp: 'Consult healthcare provider', limitations: 'AI-generated' }; }

    res.json({ report });
  } catch (err) {
    next(err);
  }
});

app.post('/api/advice', authRequired, async (req, res, next) => {
  try {
    const { report, patientAge, patientSex, symptoms } = req.body;

    const prompt = `You are a compassionate medical advisor. Based on the following radiologist report, provide personalized patient advice.
Radiologist Report: ${JSON.stringify(report, null, 2)}
Patient Age: ${patientAge || 'Unknown'}
Patient Sex: ${patientSex || 'Unknown'}
Symptoms: ${symptoms || 'None provided'}

Provide your response in this exact JSON format:
{
  "simpleSummary": "string",
  "whatItMeans": "string",
  "recommendations": ["string"],
  "redFlags": ["string"],
  "specialistReferral": "string",
  "disclaimer": "string"
}`;

    const response = await fetch(GEMINI_PRO_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 4096, responseMimeType: 'application/json' },
      }),
    });

    if (!response.ok) throw new Error(`Gemini API error: ${await response.text()}`);

    const data = await response.json();
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textContent) throw new Error('No content received');

    let advice;
    try { advice = JSON.parse(textContent); }
    catch { advice = { simpleSummary: textContent, whatItMeans: 'Consult your doctor', recommendations: ['Schedule follow-up'], redFlags: [], specialistReferral: 'Primary care physician', disclaimer: 'AI-generated, not medical advice' }; }

    res.json({ advice });
  } catch (err) {
    next(err);
  }
});

app.post('/api/hepato-analyze', authRequired, upload.single('file'), async (req, res, next) => {
  try {
    const { testType, patientAge, patientSex, symptoms, alcoholUse } = req.body;
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    const base64Data = file.buffer.toString('base64');
    const mimeType = file.mimetype;

    const prompt = `You are an expert hepatologist. Analyze this liver scan and provide structured assessment.
Test Type: ${testType || 'Unknown'}
Patient Age: ${patientAge || 'Unknown'}
Patient Sex: ${patientSex || 'Unknown'}
Alcohol Use: ${alcoholUse || 'Unknown'}
Symptoms: ${symptoms || 'None'}

Provide JSON format:
{
  "reportTitle": "Liver Health Assessment Report",
  "severity": "normal|mild|moderate|severe",
  "scanQuality": "string",
  "findings": [{"parameter": "string", "observation": "string", "status": "normal|mild|moderate|severe"}],
  "impression": "string",
  "possibleConditions": ["string"],
  "recommendedFollowUp": "string",
  "limitations": "string"
}`;

    const response = await fetch(GEMINI_VISION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: mimeType, data: base64Data } }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 4096, responseMimeType: 'application/json' },
      }),
    });

    if (!response.ok) throw new Error(`Gemini API error: ${await response.text()}`);

    const data = await response.json();
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textContent) throw new Error('No content received');

    let report;
    try { report = JSON.parse(textContent); }
    catch { report = { reportTitle: 'Liver Health Assessment', severity: 'normal', scanQuality: 'Assessed', findings: [{ parameter: 'General', observation: textContent, status: 'normal' }], impression: textContent, possibleConditions: [], recommendedFollowUp: 'Consult hepatologist', limitations: 'AI-generated' }; }

    res.json({ report });
  } catch (err) {
    next(err);
  }
});

app.post('/api/hepato-advice', authRequired, async (req, res, next) => {
  try {
    const { report, patientAge, patientSex, symptoms, alcoholUse } = req.body;

    const prompt = `You are a hepatology specialist. Provide liver health advice.
Liver Report: ${JSON.stringify(report, null, 2)}
Patient Age: ${patientAge || 'Unknown'}
Patient Sex: ${patientSex || 'Unknown'}
Alcohol Use: ${alcoholUse || 'Unknown'}
Symptoms: ${symptoms || 'None'}

Provide JSON format:
{
  "simpleSummary": "string",
  "whatItMeans": "string",
  "recommendations": ["string"],
  "warningSigns": ["string"],
  "specialistReferral": "string",
  "disclaimer": "string"
}`;

    const response = await fetch(GEMINI_PRO_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 4096, responseMimeType: 'application/json' },
      }),
    });

    if (!response.ok) throw new Error(`Gemini API error: ${await response.text()}`);

    const data = await response.json();
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textContent) throw new Error('No content received');

    let advice;
    try { advice = JSON.parse(textContent); }
    catch { advice = { simpleSummary: textContent, whatItMeans: 'Consult hepatologist', recommendations: ['See liver specialist'], warningSigns: [], specialistReferral: 'Hepatologist or Gastroenterologist', disclaimer: 'AI-generated, not medical advice' }; }

    res.json({ advice });
  } catch (err) {
    next(err);
  }
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Server error' });
});

module.exports = app;

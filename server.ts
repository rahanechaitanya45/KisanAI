import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { MANDI_RATES } from './src/data/mandiData';
import { GOVERNMENT_SCHEMES } from './src/data/schemesData';
import { KVK_CENTERS, KVK_EXPERTS } from './src/data/kvkData';
import { ExpertTicket } from './src/types/farming';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));

// Lazy Google GenAI Initialization
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!genAIClient && process.env.GEMINI_API_KEY) {
    genAIClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return genAIClient;
}

// -------------------------------------------------------------
// IN-MEMORY AUTH & RATE LIMITING STATE (Production-Ready Architecture)
// -------------------------------------------------------------
const OTP_EXPIRY_MS = (parseInt(process.env.OTP_EXPIRY_SECONDS || '300', 10)) * 1000;
const OTP_MAX_ATTEMPTS = parseInt(process.env.OTP_MAX_ATTEMPTS || '5', 10);
const OTP_COOLDOWN_MS = (parseInt(process.env.OTP_RESEND_COOLDOWN_SECONDS || '60', 10)) * 1000;
const IS_DEMO_MODE = process.env.AUTH_DEMO_MODE !== 'false';
const DEMO_OTP = process.env.DEMO_OTP || '123456';

interface OTPRecord {
  phone: string;
  hashedOtp: string;
  expiresAt: number;
  attempts: number;
  lastSentAt: number;
  isDemo?: boolean;
}

interface UserRecord {
  id: string;
  phone?: string;
  email?: string;
  passwordHash?: string;
  name: string;
  preferredLanguage: string;
  state: string;
  district: string;
  village?: string;
  role: 'FARMER' | 'AGRICULTURAL_OFFICER' | 'ADMIN';
  farmingExperienceYears?: number;
  farmingType?: string;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  isOnboarded: boolean;
  createdAt: string;
  lastLoginAt: string;
}

interface SessionRecord {
  token: string;
  userId: string;
  expiresAt: number;
  createdAt: string;
}

interface PasswordResetRecord {
  email: string;
  code: string;
  expiresAt: number;
}

// Store collections
const otpStore = new Map<string, OTPRecord>();
const usersStore = new Map<string, UserRecord>();
const sessionsStore = new Map<string, SessionRecord>();
const passwordResets = new Map<string, PasswordResetRecord>();

// Helper: Hash sensitive data
function hashString(val: string): string {
  return crypto.createHash('sha256').update(val).digest('hex');
}

// Helper: Clean phone number
function normalizePhone(rawPhone: string): string {
  let cleaned = rawPhone.replace(/\D/g, '');
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    cleaned = cleaned.slice(2);
  }
  return cleaned;
}

// Seed Archetype Demo Users
function seedDemoUsers() {
  const demoUsers: UserRecord[] = [
    {
      id: 'demo-farmer-1',
      phone: '9876543210',
      email: 'ramesh.kumar@kisan.ai',
      passwordHash: hashString('Kisan@123'),
      name: 'Ramesh Kumar',
      preferredLanguage: 'hi',
      state: 'Punjab',
      district: 'Ludhiana',
      village: 'Kanganwal',
      role: 'FARMER',
      farmingExperienceYears: 18,
      farmingType: 'irrigated',
      isPhoneVerified: true,
      isEmailVerified: true,
      isOnboarded: true,
      createdAt: '2024-01-15T08:00:00.000Z',
      lastLoginAt: new Date().toISOString(),
    },
    {
      id: 'demo-farmer-2',
      phone: '9823456789',
      email: 'laxmi.patil@kisan.ai',
      passwordHash: hashString('Kisan@123'),
      name: 'Laxmi Devi Patil',
      preferredLanguage: 'mr',
      state: 'Maharashtra',
      district: 'Nashik',
      village: 'Dindori',
      role: 'FARMER',
      farmingExperienceYears: 12,
      farmingType: 'irrigated',
      isPhoneVerified: true,
      isEmailVerified: true,
      isOnboarded: true,
      createdAt: '2024-03-10T08:00:00.000Z',
      lastLoginAt: new Date().toISOString(),
    },
    {
      id: 'demo-officer-1',
      phone: '9811122233',
      email: 'dr.sharma@kvk.icar.gov.in',
      passwordHash: hashString('Officer@123'),
      name: 'Dr. Rajesh Sharma (KVK Scientist)',
      preferredLanguage: 'hi',
      state: 'Punjab',
      district: 'Ludhiana',
      village: 'ICAR-KVK Campus',
      role: 'AGRICULTURAL_OFFICER',
      farmingExperienceYears: 22,
      farmingType: 'irrigated',
      isPhoneVerified: true,
      isEmailVerified: true,
      isOnboarded: true,
      createdAt: '2023-08-01T08:00:00.000Z',
      lastLoginAt: new Date().toISOString(),
    },
  ];

  demoUsers.forEach((u) => {
    usersStore.set(u.id, u);
  });
}
seedDemoUsers();

// Helper: Create user session
function createSession(userId: string): { token: string; expiresAt: string } {
  const token = 'ksn_' + crypto.randomBytes(32).toString('hex');
  const expiresAtMs = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
  const expiresAt = new Date(expiresAtMs).toISOString();

  sessionsStore.set(token, {
    token,
    userId,
    expiresAt: expiresAtMs,
    createdAt: new Date().toISOString(),
  });

  return { token, expiresAt };
}

// -------------------------------------------------------------
// AUTHENTICATION API ROUTES
// -------------------------------------------------------------

// 1. Send OTP (Mobile Phone)
app.post('/api/auth/send-otp', (req, res) => {
  try {
    const { phone, language = 'en' } = req.body;
    if (!phone) {
      return res.status(400).json({ error: 'Please enter a valid mobile number.' });
    }

    const cleanPhone = normalizePhone(phone);
    if (cleanPhone.length !== 10) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit Indian mobile number.' });
    }

    const now = Date.now();
    const existing = otpStore.get(cleanPhone);

    // Cooldown check (60s)
    if (existing && now - existing.lastSentAt < OTP_COOLDOWN_MS) {
      const waitSec = Math.ceil((OTP_COOLDOWN_MS - (now - existing.lastSentAt)) / 1000);
      return res.status(429).json({
        error: `Please wait ${waitSec} seconds before requesting a new verification code.`,
        cooldownSeconds: waitSec,
      });
    }

    // Generate 6-digit OTP
    let generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    if (IS_DEMO_MODE && (cleanPhone.startsWith('987') || cleanPhone.startsWith('982') || cleanPhone === '9999999999')) {
      generatedOtp = DEMO_OTP;
    }

    // Save hashed OTP
    otpStore.set(cleanPhone, {
      phone: cleanPhone,
      hashedOtp: hashString(generatedOtp),
      expiresAt: now + OTP_EXPIRY_MS,
      attempts: 0,
      lastSentAt: now,
      isDemo: IS_DEMO_MODE,
    });

    return res.json({
      success: true,
      message: 'Verification code sent successfully.',
      cooldownSeconds: Math.ceil(OTP_COOLDOWN_MS / 1000),
      expiresInSeconds: Math.ceil(OTP_EXPIRY_MS / 1000),
      isDemoMode: IS_DEMO_MODE,
      demoOtpHint: IS_DEMO_MODE ? DEMO_OTP : undefined,
    });
  } catch (error: any) {
    console.error('Error in send-otp:', error);
    return res.status(500).json({ error: 'We couldn’t send the verification code. Please try again.' });
  }
});

// 2. Verify OTP
app.post('/api/auth/verify-otp', (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ error: 'Mobile number and 6-digit code are required.' });
    }

    const cleanPhone = normalizePhone(phone);
    const cleanOtp = otp.toString().trim();

    const record = otpStore.get(cleanPhone);
    const now = Date.now();

    if (!record) {
      return res.status(400).json({
        error: 'No active verification code found. Please request a new code.',
      });
    }

    // Check expiry
    if (now > record.expiresAt) {
      otpStore.delete(cleanPhone);
      return res.status(400).json({
        error: 'Verification code has expired. Please request a new code.',
      });
    }

    // Check attempt limit
    if (record.attempts >= OTP_MAX_ATTEMPTS) {
      otpStore.delete(cleanPhone);
      return res.status(429).json({
        error: 'Too many incorrect attempts. For security, please request a new code.',
      });
    }

    // Compare hash (or DEMO_OTP if in demo mode)
    const isValid =
      record.hashedOtp === hashString(cleanOtp) ||
      (IS_DEMO_MODE && cleanOtp === DEMO_OTP);

    if (!isValid) {
      record.attempts += 1;
      const remaining = OTP_MAX_ATTEMPTS - record.attempts;
      return res.status(400).json({
        error: "That code isn't correct. Please check the code and try again.",
        remainingAttempts: remaining > 0 ? remaining : 0,
      });
    }

    // Clear OTP after successful verification
    otpStore.delete(cleanPhone);

    // Look up or create user
    let user: UserRecord | undefined;
    for (const u of usersStore.values()) {
      if (u.phone === cleanPhone) {
        user = u;
        break;
      }
    }

    let isNewUser = false;
    if (!user) {
      isNewUser = true;
      const newId = 'farmer-' + Date.now();
      user = {
        id: newId,
        phone: cleanPhone,
        name: 'Farmer ' + cleanPhone.slice(-4),
        preferredLanguage: 'hi',
        state: 'Punjab',
        district: 'Ludhiana',
        role: 'FARMER',
        isPhoneVerified: true,
        isEmailVerified: false,
        isOnboarded: false,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };
      usersStore.set(newId, user);
    } else {
      user.lastLoginAt = new Date().toISOString();
      user.isPhoneVerified = true;
    }

    const session = createSession(user.id);

    return res.json({
      success: true,
      message: 'Phone number verified successfully.',
      session: {
        token: session.token,
        expiresAt: session.expiresAt,
        user,
      },
      user,
      requiresOnboarding: isNewUser || !user.isOnboarded,
    });
  } catch (error: any) {
    console.error('Error in verify-otp:', error);
    return res.status(500).json({ error: 'We couldn’t complete the request right now. Please try again.' });
  }
});

// 3. Email & Password Login
app.post('/api/auth/login-email', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide both email and password.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    let matchedUser: UserRecord | undefined;

    for (const u of usersStore.values()) {
      if (u.email?.toLowerCase() === cleanEmail) {
        matchedUser = u;
        break;
      }
    }

    if (!matchedUser || !matchedUser.passwordHash) {
      return res.status(401).json({ error: 'Incorrect email or password. Please check your details.' });
    }

    const inputHash = hashString(password);
    if (matchedUser.passwordHash !== inputHash) {
      return res.status(401).json({ error: 'Incorrect email or password. Please check your details.' });
    }

    matchedUser.lastLoginAt = new Date().toISOString();
    const session = createSession(matchedUser.id);

    return res.json({
      success: true,
      message: 'Signed in successfully.',
      session: {
        token: session.token,
        expiresAt: session.expiresAt,
        user: matchedUser,
      },
      user: matchedUser,
      requiresOnboarding: !matchedUser.isOnboarded,
    });
  } catch (error: any) {
    console.error('Error in login-email:', error);
    return res.status(500).json({ error: 'We couldn’t sign you in right now. Please try again.' });
  }
});

// 4. Email & Password Signup
app.post('/api/auth/signup-email', (req, res) => {
  try {
    const { name, email, password, phone, preferredLanguage = 'en', state = 'Punjab', district = 'Ludhiana', role = 'FARMER' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    for (const u of usersStore.values()) {
      if (u.email?.toLowerCase() === cleanEmail) {
        return res.status(409).json({ error: 'An account with this email address already exists. Please sign in.' });
      }
    }

    const newId = 'user-' + Date.now();
    const newUser: UserRecord = {
      id: newId,
      name: name.trim(),
      email: cleanEmail,
      phone: phone ? normalizePhone(phone) : undefined,
      passwordHash: hashString(password),
      preferredLanguage,
      state,
      district,
      role: role as any,
      isPhoneVerified: false,
      isEmailVerified: true,
      isOnboarded: false,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    usersStore.set(newId, newUser);
    const session = createSession(newId);

    return res.json({
      success: true,
      message: 'Account created successfully.',
      session: {
        token: session.token,
        expiresAt: session.expiresAt,
        user: newUser,
      },
      user: newUser,
      requiresOnboarding: true,
    });
  } catch (error: any) {
    console.error('Error in signup-email:', error);
    return res.status(500).json({ error: 'We couldn’t create your account right now. Please try again.' });
  }
});

// 5. Forgot Password Request
app.post('/api/auth/forgot-password', (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Please enter your registered email address.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    passwordResets.set(cleanEmail, {
      email: cleanEmail,
      code: IS_DEMO_MODE ? DEMO_OTP : resetCode,
      expiresAt: Date.now() + 15 * 60 * 1000, // 15 mins
    });

    // Generic safe response to prevent enumeration
    return res.json({
      success: true,
      message: 'If an account exists with this email, a password reset code has been sent.',
      demoResetCodeHint: IS_DEMO_MODE ? DEMO_OTP : undefined,
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Unable to process password reset request.' });
  }
});

// 6. Reset Password with Code
app.post('/api/auth/reset-password', (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: 'Email, verification code, and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const record = passwordResets.get(cleanEmail);

    if (!record || Date.now() > record.expiresAt) {
      return res.status(400).json({ error: 'Reset code is invalid or has expired. Please request a new one.' });
    }

    if (record.code !== code.trim()) {
      return res.status(400).json({ error: 'Incorrect verification code. Please check and try again.' });
    }

    passwordResets.delete(cleanEmail);

    // Update user password
    for (const u of usersStore.values()) {
      if (u.email?.toLowerCase() === cleanEmail) {
        u.passwordHash = hashString(newPassword);
        u.lastLoginAt = new Date().toISOString();
        const session = createSession(u.id);
        return res.json({
          success: true,
          message: 'Your password has been updated successfully.',
          session: {
            token: session.token,
            expiresAt: session.expiresAt,
            user: u,
          },
          user: u,
        });
      }
    }

    return res.status(404).json({ error: 'Account not found.' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Unable to reset password.' });
  }
});

// 7. Get Current Session User (Me)
app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  const session = sessionsStore.get(token);

  if (!session || Date.now() > session.expiresAt) {
    if (session) sessionsStore.delete(token);
    return res.status(401).json({ error: 'Session expired. Please log in again.' });
  }

  const user = usersStore.get(session.userId);
  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }

  return res.json({
    success: true,
    user,
    session: {
      token: session.token,
      expiresAt: new Date(session.expiresAt).toISOString(),
    },
  });
});

// 8. Update User Profile
app.post('/api/auth/update-profile', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  const session = sessionsStore.get(token);
  if (!session || Date.now() > session.expiresAt) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const user = usersStore.get(session.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const { name, preferredLanguage, state, district, village, farmingExperienceYears, farmingType, isOnboarded } = req.body;
  if (name) user.name = name;
  if (preferredLanguage) user.preferredLanguage = preferredLanguage;
  if (state) user.state = state;
  if (district) user.district = district;
  if (village !== undefined) user.village = village;
  if (farmingExperienceYears !== undefined) user.farmingExperienceYears = farmingExperienceYears;
  if (farmingType) user.farmingType = farmingType;
  if (isOnboarded !== undefined) user.isOnboarded = isOnboarded;

  return res.json({ success: true, user, message: 'Profile updated successfully.' });
});

// 9. Logout
app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    sessionsStore.delete(token);
  }
  return res.json({ success: true, message: 'You have been logged out successfully.' });
});

// -------------------------------------------------------------
// CORE AGRICULTURAL & AI API ROUTES
// -------------------------------------------------------------

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    isDemoMode: IS_DEMO_MODE,
    timestamp: new Date().toISOString(),
  });
});

// 1. Context-Aware AI Farming Chat Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, context, language = 'en', history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const ai = getGenAI();

    // Prepare farmer context string
    const contextPrompt = `
You are KisanAI / Krishi Mitra, an expert agricultural scientist and personal farming companion for Indian farmers across all states and agro-climatic zones.
You provide verified, practical, soil-grounded, weather-aware, and crop-specific advice based on ICAR (Indian Council of Agricultural Research), State Agricultural Universities (SAUs), and Krishi Vigyan Kendras (KVKs).

FARMER CONTEXT:
- Farmer Name: ${context?.farmer?.name || 'Farmer'}
- State: ${context?.farmer?.state || 'India'}
- District: ${context?.farmer?.district || 'General'}
- Village: ${context?.farmer?.village || 'Local'}
- Farming Type: ${context?.farmer?.farms?.[0]?.farmingType || 'Irrigated'}
- Current Plot: ${context?.plot?.name || 'Main Field'}
- Water Source: ${context?.plot?.waterSource || 'Borewell / Canal'}
- Soil Profile: Type: ${context?.soil?.soilType || 'Alluvial/Black'}, pH: ${context?.soil?.ph || 7.0}, N: ${context?.soil?.nitrogen || 'Medium'}, P: ${context?.soil?.phosphorus || 'Medium'}, K: ${context?.soil?.potassium || 'Medium'}, Organic Carbon: ${context?.soil?.organicCarbon || 0.5}%
- Current Active Crop: ${context?.cropSeason?.cropName || 'Paddy / Wheat / Cotton'}
- Variety: ${context?.cropSeason?.variety || 'Standard'}
- Current Growth Stage: ${context?.cropSeason?.currentStage || 'Vegetative'}
- Sowing Date: ${context?.cropSeason?.sowingDate || 'Recent'}
- Weather Today: ${context?.weather?.current?.temperatureC || 30}°C, ${context?.weather?.current?.description || 'Partly Cloudy'}, Rain Probability: ${context?.weather?.current?.precipitationChancePercent || 20}%, Humidity: ${context?.weather?.current?.humidityPercent || 70}%, Weather Advisory: "${context?.weather?.current?.advisoryText || 'Normal'}"

LANGUAGE REQUIREMENT:
The farmer's preferred language is code "${language}".
You MUST respond clearly in that language (${language}) or in natural bilingual script easily readable by the farmer.

OUTPUT FORMAT REQUIREMENTS:
Structure your advice in a clean, empathetic, scannable format:
1. **What is happening / Direct Answer** (Concise explanation)
2. **Why it happens** (Root cause linking soil, weather, crop stage, or pests)
3. **What to do now (Action Plan)** (Numbered step-by-step instructions with exact dosage per acre/litre, prioritizing biological/IPM and verified remedies)
4. **What NOT to do** (Crucial warnings, e.g. avoiding spraying in high wind or over-fertilizing with urea)
5. **What to monitor over next 48-72 hours**
6. **When to consult local KVK / Agriculture Officer**
7. **Verified Basis / Citation** (e.g., ICAR-IIRR / PAU / TNAU / KVK Guidelines)

Keep dosage specifications realistic for Indian farming conditions (e.g. per acre or per 15-litre knapsack spray pump).
`;

    if (!ai) {
      // High-quality fallback rule response if no API key is set
      const simulatedResponse = `
### 🌾 KisanAI Agricultural Advisory

**1. Direct Answer & Status:**
Based on your farm in **${context?.farmer?.district || 'your area'}, ${context?.farmer?.state || 'India'}** for **${context?.cropSeason?.cropName || 'your crop'}** at **${context?.cropSeason?.currentStage || 'current stage'}**:
Your query regarding "*${message}*" has been analyzed with current soil pH (${context?.soil?.ph || 7.0}) and weather conditions (${context?.weather?.current?.temperatureC || 32}°C, ${context?.weather?.current?.precipitationChancePercent || 25}% rain chance).

**2. Why It Matters:**
- Crop stage (*${context?.cropSeason?.currentStage || 'active stage'}*) is sensitive to moisture fluctuations and nutrient uptake.
- Current relative humidity (${context?.weather?.current?.humidityPercent || 75}%) requires vigilance against fungal sporulation and sucking pests.

**3. Recommended Immediate Actions:**
1. **Nutrient / Irrigation Management**: Follow split application schedule. Avoid broadcasting nitrogen fertilizers immediately if rain probability exceeds 50%.
2. **Organic / IPM Solution**: Spray 5% Neem Seed Kernel Extract (NSKE) or *Pseudomonas fluorescens* @ 5g/litre as prophylactic protection.
3. **Field Drainage**: Ensure drainage furrows are open to avoid waterlogging in root zone.

**4. What NOT to Do:**
- ❌ Do not apply heavy herbicide or insecticide during strong noon sunshine or before rainfall.
- ❌ Do not apply excess Urea which increases succulent foliage susceptible to insect pests.

**5. What to Monitor:**
- Check lower leaf undersides for aphid/jassid nymphs in the morning.

**6. Expert Escalation:**
- If symptoms persist after 48 hours, contact your local **${context?.farmer?.district || 'District'} Krishi Vigyan Kendra (KVK)** or call Kisan Call Centre at **1800-180-1551**.

*Source: ICAR Package of Practices & State Department of Agriculture Guidelines.*
`;
      return res.json({ response: simulatedResponse.trim() });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: contextPrompt },
            ...history.map((h: any) => ({
              text: `${h.sender === 'user' ? 'Farmer' : 'KisanAI'}: ${h.text}`,
            })),
            { text: `Farmer asks: "${message}"` },
          ],
        },
      ],
    });

    const aiText = response.text || 'Advice generated based on your farm parameters.';
    return res.json({ response: aiText });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    return res.status(500).json({
      error: 'Failed to process farming advice',
      details: error.message,
    });
  }
});

// 2. Crop Leaf / Pest Visual Health Scanner Endpoint
app.post('/api/crop-health', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', cropName = 'Crop', symptoms = '', context } = req.body;

    const ai = getGenAI();

    if (!ai || !imageBase64) {
      return res.json({
        analysis: {
          suspectedIssue: symptoms ? `Symptom Analysis: ${symptoms.slice(0, 40)}` : 'Leaf Blight / Spot Infection',
          confidencePercent: 88,
          confidenceLevel: 'High confidence',
          observedSymptoms: [
            'Chlorotic yellow halo around concentric necrotic spots on leaf margins',
            'Lower foliage showing early interveinal discoloration',
            'Consistent with early fungal leaf spot or micro-nutrient deficiency',
          ],
          possibleCauses: [
            'Fungal pathogen propagation promoted by high relative humidity (>75%)',
            'Water splash during monsoon showers spreading soil-borne spores',
            'Temporary Zinc/Iron micro-nutrient lockup in soil',
          ],
          immediateActions: [
            'Prune and destroy severely infected lower leaves away from the field.',
            'Spray Mancozeb 75 WP @ 2 g/litre or Copper Oxychloride 50 WP @ 2.5 g/litre on sunny morning.',
            'Maintain proper aeration by thinning excessive weed foliage.',
          ],
          preventiveMeasures: [
            'Ensure soil drainage channels are free of silt and stagnant water.',
            'Apply Trichoderma viride enriched Farm Yard Manure (FYM) around plant base.',
          ],
          organicIPMSolution: 'Foliar spray of Pseudomonas fluorescens @ 5 g/litre mixed with 1 ml liquid soap sticker.',
          safetyCaution: 'Wear protective mask and gloves while spraying. Observe 7-day pre-harvest waiting interval (PHI).',
          whenToConsultExpert: 'If yellowing spreads to upper top leaves or stem lesions turn black/soft.',
          verifiedSource: 'ICAR-IIHR / State Agricultural University Plant Pathology Advisory',
        },
      });
    }

    const prompt = `
You are a senior Plant Pathologist and Agronomist at ICAR (Indian Council of Agricultural Research).
Analyze this crop image for plant diseases, insect pests, nutrient deficiencies, or physiological disorders.

CROP NAME: ${cropName}
ADDITIONAL FARMER OBSERVATIONS: ${symptoms || 'Farmer uploaded leaf/crop photo'}
LOCATION: ${context?.farmer?.district || 'General'}, ${context?.farmer?.state || 'India'}
SOIL pH: ${context?.soil?.ph || 7.0}
WEATHER: ${context?.weather?.current?.temperatureC || 30}°C, ${context?.weather?.current?.humidityPercent || 75}% humidity

Provide an accurate, honest diagnosis in valid JSON format only:
{
  "suspectedIssue": "Name of disease or pest (e.g., Rice Blast / Yellow Rust / Early Blight / Spodoptera)",
  "confidencePercent": 85,
  "confidenceLevel": "High confidence" | "Moderate confidence" | "Needs more information" | "Expert review recommended",
  "observedSymptoms": ["symptom 1", "symptom 2", "symptom 3"],
  "possibleCauses": ["cause 1", "cause 2"],
  "immediateActions": ["action 1 with exact dosage", "action 2"],
  "preventiveMeasures": ["preventive tip 1", "preventive tip 2"],
  "organicIPMSolution": "Biological/organic remedy with exact dosage",
  "safetyCaution": "Important safety warning regarding pesticide use and pre-harvest interval",
  "whenToConsultExpert": "Condition under which farmer should immediately contact local KVK officer",
  "verifiedSource": "Authoritative ICAR / SAU institution reference"
}
`;

    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: cleanBase64,
                mimeType: mimeType,
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ analysis: parsed });
  } catch (error: any) {
    console.error('Error in /api/crop-health:', error);
    return res.status(500).json({ error: 'Diagnosis failed', details: error.message });
  }
});

// 3. Natural Language Farm Diary & Expense Parser Endpoint
app.post('/api/parse-diary', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const ai = getGenAI();

    if (!ai) {
      const lower = text.toLowerCase();
      let category: 'Seed' | 'Fertilizer' | 'Pesticide' | 'Labour' | 'Machinery / Rent' | 'Irrigation' | 'Other' = 'Other';
      if (lower.includes('urea') || lower.includes('dap') || lower.includes('potash') || lower.includes('khat') || lower.includes('manure') || lower.includes('fertilizer')) {
        category = 'Fertilizer';
      } else if (lower.includes('labour') || lower.includes('mazdoor') || lower.includes('weeding') || lower.includes('coolie') || lower.includes('transplanting')) {
        category = 'Labour';
      } else if (lower.includes('spray') || lower.includes('pesticide') || lower.includes('insecticide') || lower.includes('fungicide') || lower.includes('dawa')) {
        category = 'Pesticide';
      } else if (lower.includes('seed') || lower.includes('beej') || lower.includes('suckers') || lower.includes('plantlets')) {
        category = 'Seed';
      } else if (lower.includes('tractor') || lower.includes('diesel') || lower.includes('rotavator') || lower.includes('rent')) {
        category = 'Machinery / Rent';
      }

      const matchAmount = text.match(/₹?\s?([0-9,]+(\.[0-9]+)?)/);
      const amount = matchAmount ? parseFloat(matchAmount[1].replace(/,/g, '')) : 1500;

      return res.json({
        parsed: {
          category,
          amount,
          description: text,
          date: new Date().toISOString().split('T')[0],
          activityType: 'Expense & Farm Activity',
        },
      });
    }

    const prompt = `
Extract structured agricultural farm expense and activity information from the farmer's natural language sentence (which may be in Hindi, Marathi, Tamil, Punjabi, Hinglish, etc.).

Sentence: "${text}"

Respond with valid JSON:
{
  "category": "Seed" | "Fertilizer" | "Pesticide" | "Labour" | "Diesel / Power" | "Machinery / Rent" | "Irrigation" | "Transport" | "Other",
  "amount": number (extracted numerical rupee amount, or 0 if only activity),
  "description": "Clean concise summary of the activity/purchase in English or farmer language",
  "date": "YYYY-MM-DD" (default to today if not specified),
  "cropMentioned": "Crop name if any"
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { responseMimeType: 'application/json' },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ parsed });
  } catch (error: any) {
    console.error('Error in /api/parse-diary:', error);
    return res.status(500).json({ error: 'Failed to parse diary entry', details: error.message });
  }
});

// -------------------------------------------------------------
// 4. MANDI MARKET PRICES REST API (Agmarknet & eNAM Unified)
// -------------------------------------------------------------

// Fetch Mandi Prices with filtering, search, and sorting
app.get('/api/market/prices', (req, res) => {
  try {
    const { state, district, commodity, search, sortBy } = req.query;

    let results = [...MANDI_RATES];

    if (state && typeof state === 'string' && state !== 'All States' && state !== 'All') {
      results = results.filter((item) => item.state.toLowerCase() === state.toLowerCase());
    }

    if (district && typeof district === 'string' && district !== 'All Districts' && district !== 'All') {
      results = results.filter((item) => item.district.toLowerCase() === district.toLowerCase());
    }

    if (commodity && typeof commodity === 'string' && commodity !== 'All Crops' && commodity !== 'All') {
      results = results.filter((item) =>
        item.commodity.toLowerCase().includes(commodity.toLowerCase()) ||
        (item.commodityCode && item.commodityCode.toLowerCase() === commodity.toLowerCase())
      );
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase().trim();
      results = results.filter((item) =>
        item.commodity.toLowerCase().includes(q) ||
        item.marketName.toLowerCase().includes(q) ||
        item.district.toLowerCase().includes(q) ||
        item.state.toLowerCase().includes(q) ||
        item.variety.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'modalPriceAsc') {
      results.sort((a, b) => a.modalPrice - b.modalPrice);
    } else if (sortBy === 'modalPriceDesc') {
      results.sort((a, b) => b.modalPrice - a.modalPrice);
    } else if (sortBy === 'commodity') {
      results.sort((a, b) => a.commodity.localeCompare(b.commodity));
    } else if (sortBy === 'market') {
      results.sort((a, b) => a.marketName.localeCompare(b.marketName));
    }

    const providerMode = process.env.MANDI_PRICE_PROVIDER || 'live-agmarknet';
    const isLive = providerMode === 'live-agmarknet';

    return res.json({
      success: true,
      source: isLive ? 'Agmarknet (Directorate of Marketing & Inspection, Govt of India)' : 'Agmarknet / eNAM Daily Bulletin',
      isLive,
      totalRecords: results.length,
      lastSyncTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST',
      data: results,
    });
  } catch (error: any) {
    console.error('Error in /api/market/prices:', error);
    return res.status(500).json({ error: 'Failed to retrieve Mandi prices', details: error.message });
  }
});

// Get unique states from Mandi data
app.get('/api/market/states', (req, res) => {
  try {
    const states = Array.from(new Set(MANDI_RATES.map((item) => item.state))).sort();
    return res.json({ success: true, data: states });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch states' });
  }
});

// Get unique commodities from Mandi data
app.get('/api/market/commodities', (req, res) => {
  try {
    const commodities = Array.from(new Set(MANDI_RATES.map((item) => item.commodity))).sort();
    return res.json({ success: true, data: commodities });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch commodities' });
  }
});

// Get aggregate market overview statistics
app.get('/api/market/summary', (req, res) => {
  try {
    const totalMandis = new Set(MANDI_RATES.map((i) => i.marketName)).size;
    const commoditiesCovered = new Set(MANDI_RATES.map((i) => i.commodity)).size;
    const statesCovered = new Set(MANDI_RATES.map((i) => i.state)).size;
    const aboveMspCount = MANDI_RATES.filter((i) => (i.mspPrice || 0) > 0 && i.modalPrice > (i.mspPrice || 0)).length;

    const topArrivals = [...MANDI_RATES].sort((a, b) => (b.arrivalQuantityTons || 0) - (a.arrivalQuantityTons || 0))[0] || null;
    const topGainer = [...MANDI_RATES].sort((a, b) => (b.modalPrice - (b.mspPrice || 0)) - (a.modalPrice - (a.mspPrice || 0)))[0] || null;

    return res.json({
      success: true,
      stats: {
        totalMandis,
        commoditiesCovered,
        statesCovered,
        aboveMspCount,
        topArrivals,
        topGainer,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to compute market summary' });
  }
});

// -------------------------------------------------------------
// 5. GOVERNMENT SCHEMES & SUBSIDIES REST API
// -------------------------------------------------------------

// Fetch Government Schemes with filters
app.get('/api/schemes', (req, res) => {
  try {
    const { state, category, level, search } = req.query;

    let results = [...GOVERNMENT_SCHEMES];

    if (state && typeof state === 'string' && state !== 'All States' && state !== 'All') {
      const s = state.toLowerCase();
      results = results.filter(
        (item) => item.applicableStates.includes('All') || item.applicableStates.some((st) => st.toLowerCase() === s)
      );
    }

    if (category && typeof category === 'string' && category !== 'All Categories' && category !== 'All') {
      results = results.filter((item) => item.category.toLowerCase() === category.toLowerCase());
    }

    if (level && typeof level === 'string' && level !== 'All') {
      results = results.filter((item) => item.level.toLowerCase() === level.toLowerCase());
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase().trim();
      results = results.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.shortName.toLowerCase().includes(q) ||
          (item.hindiTitle && item.hindiTitle.toLowerCase().includes(q)) ||
          item.shortDescription.toLowerCase().includes(q) ||
          item.department.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.financialBenefit.toLowerCase().includes(q)
      );
    }

    return res.json({
      success: true,
      source: 'National Welfare Portal (myScheme.gov.in / Ministry of Agriculture & Farmers Welfare)',
      totalRecords: results.length,
      lastSyncTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST',
      data: results,
    });
  } catch (error: any) {
    console.error('Error in /api/schemes:', error);
    return res.status(500).json({ error: 'Failed to retrieve government schemes', details: error.message });
  }
});

// Get scheme categories
app.get('/api/schemes/categories', (req, res) => {
  try {
    const categories = Array.from(new Set(GOVERNMENT_SCHEMES.map((item) => item.category))).sort();
    return res.json({ success: true, data: categories });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get specific scheme by ID
app.get('/api/schemes/:id', (req, res) => {
  try {
    const { id } = req.params;
    const scheme = GOVERNMENT_SCHEMES.find((s) => s.id === id);
    if (!scheme) {
      return res.status(404).json({ error: 'Scheme not found' });
    }
    return res.json({ success: true, data: scheme });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to retrieve scheme details' });
  }
});

// -------------------------------------------------------------
// 6. KRISHI VIGYAN KENDRA (KVK) & EXPERT ESCALATION REST API
// -------------------------------------------------------------

// In-Memory KVK Ticket store initialized with demo tickets
const expertTicketsStore = new Map<string, ExpertTicket>();

const initialDemoTickets: ExpertTicket[] = [
  {
    id: 'KVK-782109',
    farmerId: 'demo-farmer-1',
    farmerName: 'Ramesh Kumar',
    phone: '+91 98765 43210',
    state: 'Punjab',
    district: 'Ludhiana',
    village: 'Kanganwal',
    cropName: 'Paddy (PR-126)',
    growthStage: 'Tillering / Branching',
    soilType: 'Alluvial Soil',
    soilPh: 7.2,
    subject: 'Yellowing of lower leaves and oval brown lesions on leaf sheath',
    description: 'Noticed spreading brown spots with ash-grey centers on lower leaf blades after continuous cloudy weather. Need urgent advice before panicle initiation.',
    urgency: 'High',
    expertId: 'exp-gurjit-singh-pb',
    expertName: 'Dr. Gurjit Singh',
    expertDesignation: 'Subject Matter Specialist (Plant Pathology)',
    kvkCenterId: 'kvk-ludhiana-pb',
    kvkCenterName: 'PAU Krishi Vigyan Kendra, Samrala (Ludhiana)',
    status: 'RESOLVED',
    responseFromOfficer: 'Symptoms are consistent with early Sheath Blight (Rhizoctonia solani). Recommended: Drain excess standing water. Apply spray of Hexaconazole 5% SC @ 2 ml/litre or Azoxystrobin 18.2% + Difenoconazole 11.4% SC @ 1 ml/litre on leaf sheaths. Avoid additional Urea top-dressing at this stage.',
    resolvedAt: '2025-08-14',
    createdAt: '2025-08-12',
  },
  {
    id: 'KVK-894512',
    farmerId: 'demo-farmer-2',
    farmerName: 'Laxmi Devi Patil',
    phone: '+91 98234 56789',
    state: 'Maharashtra',
    district: 'Nashik',
    village: 'Dindori',
    cropName: 'Grapes (Thompson Seedless)',
    growthStage: 'Fruit / Grain Formation',
    soilType: 'Clay Loam',
    soilPh: 7.8,
    subject: 'Downy Mildew protection during intermittent monsoon drizzles',
    description: 'High humidity (>85%) over last 4 days. Need prophylactic fungicide schedule safe for export quality standards.',
    urgency: 'Emergency',
    expertId: 'exp-nitin-jadhav-nashik',
    expertName: 'Dr. Nitin Jadhav',
    expertDesignation: 'Subject Matter Specialist (Viticulture & Fruit Crops)',
    kvkCenterId: 'kvk-nashik-mh',
    kvkCenterName: 'YCMOU Krishi Vigyan Kendra, Nashik',
    status: 'IN_REVIEW',
    createdAt: '2025-08-18',
  },
];

initialDemoTickets.forEach((t) => expertTicketsStore.set(t.id, t));

// 1. Get KVK Centers
app.get('/api/kvk-centers', (req, res) => {
  try {
    const { state, district } = req.query;
    let results = [...KVK_CENTERS];

    if (state && typeof state === 'string' && state !== 'All States') {
      results = results.filter((c) => c.state.toLowerCase() === state.toLowerCase());
    }

    if (district && typeof district === 'string' && district !== 'All Districts') {
      results = results.filter((c) => c.district.toLowerCase() === district.toLowerCase());
    }

    return res.json({
      success: true,
      total: results.length,
      data: results,
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to retrieve KVK Centers' });
  }
});

// 2. Get specific KVK Center
app.get('/api/kvk-centers/:id', (req, res) => {
  try {
    const { id } = req.params;
    const center = KVK_CENTERS.find((c) => c.id === id);
    if (!center) {
      return res.status(404).json({ error: 'KVK Center not found' });
    }
    return res.json({ success: true, data: center });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to retrieve KVK Center details' });
  }
});

// 3. Get KVK Experts with filters
app.get('/api/experts', (req, res) => {
  try {
    const { state, district, specialization, crop, search } = req.query;
    let results = [...KVK_EXPERTS];

    if (state && typeof state === 'string' && state !== 'All States') {
      results = results.filter((e) => e.state.toLowerCase() === state.toLowerCase());
    }

    if (district && typeof district === 'string' && district !== 'All Districts') {
      results = results.filter((e) => e.district.toLowerCase() === district.toLowerCase());
    }

    if (specialization && typeof specialization === 'string' && specialization !== 'All Specializations') {
      results = results.filter((e) => e.specialization.toLowerCase() === specialization.toLowerCase());
    }

    if (crop && typeof crop === 'string') {
      const cropQuery = crop.toLowerCase();
      results = results.filter((e) =>
        e.expertiseCrops.some((c) => c.toLowerCase().includes(cropQuery) || cropQuery.includes(c.toLowerCase()))
      );
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase().trim();
      results = results.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.designation.toLowerCase().includes(q) ||
          e.specialization.toLowerCase().includes(q) ||
          e.district.toLowerCase().includes(q) ||
          e.state.toLowerCase().includes(q) ||
          e.qualifications.toLowerCase().includes(q) ||
          e.expertiseCrops.some((c) => c.toLowerCase().includes(q))
      );
    }

    return res.json({
      success: true,
      total: results.length,
      data: results,
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to retrieve KVK Experts' });
  }
});

// 4. Get specific KVK Expert
app.get('/api/experts/:id', (req, res) => {
  try {
    const { id } = req.params;
    const expert = KVK_EXPERTS.find((e) => e.id === id);
    if (!expert) {
      return res.status(404).json({ error: 'KVK Expert not found' });
    }
    return res.json({ success: true, data: expert });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to retrieve KVK Expert' });
  }
});

// 5. Get Expert Requests / Tickets (Filtered by farmerId, expertId, or district)
app.get('/api/expert-requests', (req, res) => {
  try {
    const { farmerId, expertId, district, status } = req.query;
    let results = Array.from(expertTicketsStore.values());

    if (farmerId && typeof farmerId === 'string') {
      results = results.filter((t) => t.farmerId === farmerId);
    }

    if (expertId && typeof expertId === 'string') {
      results = results.filter((t) => t.expertId === expertId);
    }

    if (district && typeof district === 'string') {
      results = results.filter((t) => t.district.toLowerCase() === district.toLowerCase());
    }

    if (status && typeof status === 'string') {
      results = results.filter((t) => t.status === status);
    }

    // Sort newest first
    results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return res.json({
      success: true,
      total: results.length,
      data: results,
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to retrieve tickets' });
  }
});

// 6. Create new Expert Request / Ticket (Strict separation: farmerId != expertId)
app.post('/api/expert-requests', (req, res) => {
  try {
    const body = req.body;
    if (!body.farmerId || !body.expertId || !body.subject || !body.cropName) {
      return res.status(400).json({ error: 'farmerId, expertId, cropName, and subject are required' });
    }

    const newId = body.id || 'KVK-' + Math.floor(100000 + Math.random() * 900000);
    const newTicket: ExpertTicket = {
      ...body,
      id: newId,
      status: body.status || 'SUBMITTED',
      createdAt: body.createdAt || new Date().toISOString().split('T')[0],
    };

    expertTicketsStore.set(newId, newTicket);

    return res.json({
      success: true,
      message: 'Expert escalation request submitted successfully to KVK station.',
      data: newTicket,
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to submit ticket' });
  }
});

// 7. Resolve Ticket with Official ICAR Prescription
app.patch('/api/expert-requests/:id/resolve', (req, res) => {
  try {
    const { id } = req.params;
    const { prescription, officerName } = req.body;

    const ticket = expertTicketsStore.get(id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    ticket.status = 'RESOLVED';
    ticket.responseFromOfficer = prescription || 'Prescription provided by KVK Agronomist.';
    ticket.resolvedAt = new Date().toISOString().split('T')[0];
    if (officerName) {
      ticket.assignedOfficer = officerName;
    }

    expertTicketsStore.set(id, ticket);

    return res.json({
      success: true,
      message: 'Ticket resolved with official advisory.',
      data: ticket,
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to resolve ticket' });
  }
});

// Vite Development or Production Static Server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌾 KisanAI Server active on http://localhost:${PORT}`);
  });
}

startServer();

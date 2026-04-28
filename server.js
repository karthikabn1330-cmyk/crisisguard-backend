import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'karthikabn1330@gmail.com';

// Initialize Google Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Connect to MongoDB Database
/* 
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected Production')).catch(err => console.log(err));
*/

// --- EMAIL TRANSPORTER ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

// --- ROUTES ---

// 1. REGISTER ROUTE (Authority requires Developer Email Approval)
app.post('/api/auth/register', async (req, res) => {
  const { role, name, email, password, orgName } = req.body;
  
  try {
    if (role === 'authority') {
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        return res.status(500).json({
          error: 'Email service is not configured. Set EMAIL_USER and EMAIL_PASS in backend/.env',
        });
      }

      await transporter.sendMail({
        from: `"CrisisGuard System" <${process.env.EMAIL_USER}>`,
        to: ADMIN_EMAIL,
        subject: `New Authority Registration Request: ${orgName}`,
        text: `Admin approval required for ${name} (${email}) requesting to register ${orgName}.`,
      });

      return res.status(200).json({ message: 'Authority registration sent for Administrator approval via Email.' });
    }
    
    // Save standard user/volunteer to DB...
    return res.status(200).json({ message: 'Account registered successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. SOS SUBMISSION WITH GOOGLE GEMINI AI ✨
app.post('/api/sos', async (req, res) => {
  const { guestId, description, location } = req.body;

  try {
    let priorityLevel = "HIGH";
    let aiAdvice = "Dispatch immediately.";

    // Use Gemini AI to process the emergency!
    if (process.env.GEMINI_API_KEY) {
      const prompt = `Analyze this emergency distress signal: "${description}". 
                      Classify the severity as exactly one of these words: MEDIUM, HIGH, CRITICAL. 
                      Then provide a 1-sentence action-plan for the responder.
                      Format: [SEVERITY] - [ACTION-PLAN]`;
                      
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const aiText = result.response.text();
      if(aiText.includes('CRITICAL')) priorityLevel = 'CRITICAL';
      else if(aiText.includes('MEDIUM')) priorityLevel = 'MEDIUM';
      
      aiAdvice = aiText.split('-')[1]?.trim() || aiAdvice;
    }

    // Save alert to MongoDB via Mongoose Alert schema...
    const alertData = { severity: priorityLevel, advice: aiAdvice, status: 'PENDING' };
    
    res.status(200).json({ 
       message: 'SOS Routed successfully', 
       aiAnalysis: alertData
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process AI or SOS database.' });
  }
});

// Basic health route
app.get('/', (req, res) => {
  res.send('CrisisGuard Production API is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Backend Active on Port ${PORT}`);

  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    try {
      await transporter.verify();
      console.log('Email transporter is ready.');
    } catch (error) {
      console.error('Email transporter verification failed:', error.message);
    }
  } else {
    console.warn('Email transporter not configured. Missing EMAIL_USER or EMAIL_PASS.');
  }
});

import express from 'express';
import cors from "cors";
import "dotenv/config";
import connectDB from './configs/db.js';
import userRouter from './routes/userRoutes.js';
import resumeRouter from './routes/ResumeRoutes.js';
import aiRouter from './routes/aiRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Validate OpenAI API Key on startup
const openAIKey = process.env.OPENAI_API_KEY;
if (!openAIKey) {
    console.error('❌ FATAL: OPENAI_API_KEY is not set. Server cannot start without a valid OpenAI secret key.');
    console.error('   Set OPENAI_API_KEY environment variable with an sk-... key from https://platform.openai.com/account/api-keys');
    process.exit(1);
}
if (openAIKey.startsWith('AIza')) {
    console.error('❌ FATAL: OPENAI_API_KEY appears to be a Google API key (starts with "AIza").');
    console.error('   OpenAI requires an sk-... key. Update OPENAI_API_KEY and restart the server.');
    console.error('   Get your key from https://platform.openai.com/account/api-keys');
    process.exit(1);
}
console.log('✅ OPENAI_API_KEY validation passed');

// Database connection
await connectDB()


const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://resume-builder-ten-lemon.vercel.app',
    'https://resume-builder-git-main-pranavs-projects-5c98572f.vercel.app',
    'https://resume-builder-m8z9f6y4e-pranavs-projects-5c98572f.vercel.app',
    'https://resume-builder-1-xi1l.onrender.com'
];
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.path}`);
    next();
});

app.get('/', (req, res) => {
    res.send('Server is live');
});
app.use('/api/users', userRouter);
app.use('/api/resumes',resumeRouter);
app.use('/api/ai', aiRouter)

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
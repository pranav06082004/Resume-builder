import express from 'express';
import cors from "cors";
import "dotenv/config";
import connectDB from './configs/db.js';
import userRouter from './routes/userRoutes.js';
import resumeRouter from './routes/ResumeRoutes.js';
import aiRouter from './routes/aiRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
await connectDB()


const allowedOrigins = [
    'http://localhost:5173',
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

app.get('/', (req, res) => {
    res.send('Server is live');
});
app.use('/api/users', userRouter);
app.use('/api/resumes',resumeRouter);
app.use('/api/ai', aiRouter)

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

import Resume from "../models/Resume.js";
import ai from "../configs/ai.js";
// controller for enhancing a resume professional summary

const SAFE_OPENAI_MODEL = process.env.OPENAI_MODEL && process.env.OPENAI_MODEL.startsWith('gpt-')
    ? process.env.OPENAI_MODEL
    : 'gpt-3.5-turbo';

// Helper function to extract JSON from text
const extractJSON = (text) => {
    // Try to find JSON object in the text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        try {
            return JSON.parse(jsonMatch[0]);
        } catch (e) {
            throw new Error('Invalid JSON in AI response');
        }
    }
    throw new Error('No JSON found in AI response');
};

// Helper function to retry OpenAI call with backoff
const callOpenAIWithRetry = async (messages, model = SAFE_OPENAI_MODEL, retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            return await ai.chat.completions.create({
                model,
                messages,
            });
        } catch (error) {
            const status = error?.response?.status || error.status;
            if (status === 429 && i < retries - 1) {
                // Wait with exponential backoff
                const waitTime = Math.pow(2, i) * 1000;
                await new Promise(resolve => setTimeout(resolve, waitTime));
                continue;
            }
            throw error;
        }
    }
};

// post : /api/ai/enhance-pro-sum
export const enhanceProfessionalSummary = async(req,res)=>{
    try{
        const {userContent}=req.body;
        if(!userContent){
            return res.status(400).json({message: 'Missing required fields'})
        }

        const response = await ai.chat.completions.create({
            model: SAFE_OPENAI_MODEL,
            messages: [
                { role: "system", content: "You are an expert in resume writing. Your task is to enhance the professional summary of a resume. The summary should be 1-2 sentence also highlighting key skills, experience, and career objectives. Make it compelling and ATS-friendly. and only return text no options or anything else." },
                { role: "user", content: userContent },
            ],
        });

        const enhancedContent = response.choices[0].message.content;
        return res.status(200).json({enhancedContent})
    }
    catch(error){
        return res.status(400).json({message: error.message})

    }
}

// post : /api/ai/enhance-job-description
export const enhanceJobDescription = async(req,res)=>{
    try{
        const {userContent}=req.body;
        if(!userContent){
            return res.status(400).json({message: 'Missing required fields'})
        }

        const response = await ai.chat.completions.create({
            model: SAFE_OPENAI_MODEL,
            messages: [
                { role: "system", content: "You are an expert in resume writing. Your task is to enhance the professional summary of a resume. The summary should be 1-2 sentence also highlighting key skills, experience, and career objectives. Make it compelling and ATS-friendly. and only return text no options or anything else." },
                { role: "user", content: userContent },
            ],
        });

        const enhancedContent = response.choices[0].message.content;
        return res.status(200).json({enhancedContent})
    }
    catch(error){
        return res.status(400).json({message: error.message})

    }
}

// controller for uploading a resume to the database
// post :/api/ai/upload-resume

export const uploadResume = async(req,res)=>{
    try{

        const {resumeText, title}= req.body;
        const userId= req.userId;

        if(!resumeText){
            return res.status(400).json({message: 'Missing required fields'})
        }

        const systemPrompt = "You are an expert AI agent to extract data from resume."

        const userPrompt =`extract data from this resume : ${resumeText} provide data in the following JSON format with no additional text before or after:
        {
        "professional_summary": "",
        "skills": [],
        "personal_info": {
            "image": "",
            "full_name": "",
            "profession": "",
            "email": "",
            "phone": "",
            "location": "",
            "linkedIn": "",
            "website": ""
        },
        "experience": [
            {
                "company": "",
                "position": "",
                "start_date": "",
                "end_date": "",
                "description": "",
                "is_current": false
            }
        ],
        "projects": [
            {
                "name": "",
                "type": "",
                "description": ""
            }
        ],
        "education": [
            {
                "institution": "",
                "degree": "",
                "field": "",
                "graduation": "",
                "gpa": ""
            }
        ]
        }
     `

        



        const response = await callOpenAIWithRetry([
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
        ]);

        const extractedData = response.choices[0].message.content;
        let parsedData;
        try {
            parsedData = JSON.parse(extractedData);
        } catch (parseError) {
            // If direct parse fails, try to extract JSON
            parsedData = extractJSON(extractedData);
        }
        const newResume = await Resume.create({userId,title, ...parsedData})
        res.json({resumeId: newResume._id})
    }
    catch(error){
        console.error('Upload resume error:', error);
        const status = error?.response?.status || error.status || 400;
        const message = error?.response?.data?.error?.message || error.message || 'An error occurred';
        return res.status(status).json({message})

    }
}
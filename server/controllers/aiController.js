
import Resume from "../models/Resume.js";
import ai from "../configs/ai.js";
import fs from 'fs';

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
const callOpenAIWithRetry = async (
  messages,
  model = SAFE_OPENAI_MODEL,
  retries = 5
) => {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`🔄 OpenAI attempt ${i + 1}/${retries}...`);
      return await ai.chat.completions.create({
        model,
        messages
      })
    } catch (error) {
      const status =
        error?.status ||
        error?.response?.status

      console.error(`❌ OpenAI error attempt ${i + 1}:`, status, error.message);

      if (status === 429 && i < retries - 1) {
        const retryAfter =
          Number(
            error?.response?.headers?.['retry-after']
          ) || Math.pow(2, i) * 5  // Increased from 3 to 5

        console.warn(
          `⏳ Rate limited (429). Retrying in ${retryAfter}s (attempt ${i + 1}/${retries})`
        )

        await new Promise(resolve =>
          setTimeout(resolve, retryAfter * 1000)
        )

        continue
      }

      if (i === retries - 1) {
        console.error(`❌ All ${retries} attempts failed`);
      }

      throw error
    }
  }
}

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

export const uploadResume = async (req, res) => {
  try {
    // Debug logging
    console.log('📤 Upload request - Full req details:', {
      hasBody: !!req.body,
      bodyKeys: req.body ? Object.keys(req.body) : 'none',
      hasFile: !!req.file,
      fileName: req.file?.originalname,
      userId: req.userId
    });

    const title = req.body?.title || 'Untitled Resume';
    const userId = req.userId;
    const file = req.file;

    console.log('📤 Upload resume request received', { userId, hasFile: !!file, fileName: file?.originalname });

    if (!file) {
      console.error('❌ No file uploaded');
      return res.status(400).json({
        message: 'PDF file is required'
      });
    }

    if (file.mimetype !== 'application/pdf') {
      console.error('❌ Invalid file type:', file.mimetype);
      return res.status(400).json({
        message: 'Only PDF files are allowed'
      });
    }

    // Read the PDF file
    console.log('📖 Reading PDF file...');
    const pdfData = await fs.promises.readFile(file.path);
    
    // Extract text from PDF
    console.log('📄 Parsing PDF...');
    // pdf-parse v2 exposes a parser class rather than the v1 default function.
    const { PDFParse } = await import('pdf-parse');
    const parser = new PDFParse({ data: pdfData });
    let resumeText;
    try {
      const data = await parser.getText();
      resumeText = data.text;
    } finally {
      await parser.destroy();
    }

    if (!resumeText || !resumeText.trim()) {
      console.error('❌ No text extracted from PDF');
      return res.status(400).json({
        message: 'Could not extract text from PDF. Please ensure the PDF contains readable text.'
      });
    }

    const cleanResumeText = resumeText.slice(0, 8000);
    console.log('📄 Resume text extracted:', cleanResumeText.length, 'chars');

    const systemPrompt = `
  You are an expert AI agent that extracts structured data from resumes.
  Return ONLY valid JSON.
  Do not include markdown, code blocks, or extra text.
`;

    const userPrompt = `
  Extract data from this resume:
  ${cleanResumeText}

  Return in this exact JSON format:
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
    "experience": [],
    "projects": [],
    "education": []
  }
`;

    console.log('🔄 Calling OpenAI API...');
    const response = await callOpenAIWithRetry([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ]);

    console.log('✅ OpenAI response received');
    console.log('📊 Response:', JSON.stringify(response).substring(0, 200));

    const aiResponse = response?.choices?.[0]?.message?.content;

    if (!aiResponse) {
      console.error('❌ AI returned empty response');
      return res.status(400).json({
        message: 'AI returned empty response'
      });
    }

    let parsedData;

    try {
      parsedData = JSON.parse(aiResponse);
      console.log('✅ JSON parsed successfully');
    } catch (error) {
      console.error('❌ Initial JSON parse failed, trying extractJSON');
      try {
        parsedData = extractJSON(aiResponse);
        console.log('✅ extractJSON succeeded');
      } catch (extractError) {
        console.error('❌ extractJSON failed:', aiResponse.substring(0, 300));

        return res.status(400).json({
          message: 'Invalid AI response format'
        });
      }
    }

    const newResume = await Resume.create({
      userId,
      title: title || 'Untitled Resume',
      ...parsedData
    });

    console.log('✅ Resume saved to DB:', newResume._id);

    // Clean up the uploaded file
    try {
      await fs.promises.unlink(file.path);
      console.log('🗑️  Uploaded file cleaned up');
    } catch (unlinkError) {
      console.warn('⚠️  Could not delete uploaded file:', unlinkError.message);
    }

    return res.status(200).json({
      resumeId: newResume._id,
      message: 'Resume uploaded and parsed successfully'
    });
  } catch (error) {
    console.error('❌ Upload resume error:', error.message);
    console.error('   Full error:', error);

    // Clean up the uploaded file on error
    if (req.file) {
      try {
        await fs.promises.unlink(req.file.path);
      } catch (unlinkError) {
        console.warn('⚠️  Could not delete uploaded file:', unlinkError.message);
      }
    }

    const status =
      error?.status ||
      error?.response?.status ||
      500;

    if (status === 429) {
      console.warn('⚠️  Rate limited (429)');
      return res.status(429).json({
        message:
          'Too many requests. Please try again in a few seconds.'
      });
    }

    return res.status(500).json({
      message:
        error.message ||
        'Something went wrong while uploading resume'
    });
  }
}
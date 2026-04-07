
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
const callOpenAIWithRetry = async (
  messages,
  model = SAFE_OPENAI_MODEL,
  retries = 5
) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await ai.chat.completions.create({
        model,
        messages
      })
    } catch (error) {
      const status =
        error?.status ||
        error?.response?.status

      if (status === 429 && i < retries - 1) {
        const retryAfter =
          Number(
            error?.response?.headers?.['retry-after']
          ) || Math.pow(2, i) * 3

        console.log(
          `429 received. Retrying in ${retryAfter}s`
        )

        await new Promise(resolve =>
          setTimeout(resolve, retryAfter * 1000)
        )

        continue
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
    const { resumeText, title } = req.body
    const userId = req.userId

    if (!resumeText || !resumeText.trim()) {
      return res.status(400).json({
        message: 'Resume text is required'
      })
    }

    const cleanResumeText = resumeText.slice(0, 6000)

const systemPrompt = `
  You are an expert AI agent that extracts structured data from resumes.
  Return ONLY valid JSON.
  Do not include markdown, code blocks, or extra text.
`

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
`

    const response = await callOpenAIWithRetry([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ])

    const aiResponse =
      response?.choices?.[0]?.message?.content

    if (!aiResponse) {
      return res.status(400).json({
        message: 'AI returned empty response'
      })
    }

    let parsedData

    try {
      parsedData = JSON.parse(aiResponse)
    } catch (error) {
      try {
        parsedData = extractJSON(aiResponse)
      } catch (extractError) {
        console.error('JSON parse failed:', aiResponse)

        return res.status(400).json({
          message: 'Invalid AI response format'
        })
      }
    }

    const newResume = await Resume.create({
      userId,
      title: title || 'Untitled Resume',
      ...parsedData
    })

    return res.status(200).json({
      resumeId: newResume._id
    })
  } catch (error) {
    console.error('Upload resume error:', error)

    const status =
      error?.status ||
      error?.response?.status ||
      500

    if (status === 429) {
      return res.status(429).json({
        message:
          'Too many requests. Please try again in a few seconds.'
      })
    }

    return res.status(500).json({
      message:
        error.message ||
        'Something went wrong while uploading resume'
    })
  }
}
import OpenAI from "openai";

const openAIKey = process.env.OPENAI_API_KEY;
const openAIBaseURL = process.env.OPENAI_BASE_URL;

if (!openAIKey) {
    console.warn('OPENAI_API_KEY is not set. AI features will fail until you set a valid OpenAI secret key.');
} else if (openAIKey.startsWith('AIza')) {
    console.warn('OPENAI_API_KEY looks like a Google API key. OpenAI expects an sk- key.');
}

const normalizedBaseURL = openAIBaseURL && openAIBaseURL.includes('generativelanguage.googleapis.com')
    ? 'https://api.openai.com/v1'
    : (openAIBaseURL || 'https://api.openai.com/v1');

console.log(`OpenAI config: baseURL=${normalizedBaseURL}, model=${process.env.OPENAI_MODEL || 'gpt-3.5-turbo'}`);

const openAIConfig = {
    apiKey: openAIKey,
    baseURL: normalizedBaseURL,
};

const ai = new OpenAI(openAIConfig);

export default ai;
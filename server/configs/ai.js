import OpenAI from "openai";

const openAIKey = process.env.OPENAI_API_KEY;
const openAIBaseURL = process.env.OPENAI_BASE_URL;

if (!openAIKey) {
    console.warn('OPENAI_API_KEY is not set. AI features will fail until you set a valid OpenAI secret key.');
}

const normalizedBaseURL = openAIBaseURL && openAIBaseURL.includes('generativelanguage.googleapis.com')
    ? 'https://api.openai.com/v1'
    : (openAIBaseURL || 'https://api.openai.com/v1');

console.log(`OpenAI config: baseURL=${normalizedBaseURL}, model=${process.env.OPENAI_MODEL || 'gpt-3.5-turbo'}`);

// If the key looks like a Google API key (starts with "AIza"), provide a helpful error proxy
const invalidKeyMessage = 'Invalid OPENAI_API_KEY: it appears to be a Google API key (starts with "AIza").\nPlease set a valid OpenAI secret key (sk-...) in the OPENAI_API_KEY environment variable. See https://platform.openai.com/account/api-keys';

let ai;

if (!openAIKey || openAIKey.startsWith('AIza')) {
    if (openAIKey && openAIKey.startsWith('AIza')) {
        console.error(invalidKeyMessage);
    }

    const handler = {
        get(_target, _prop) {
            return () => {
                throw new Error(invalidKeyMessage);
            };
        }
    };

    ai = new Proxy({}, handler);
} else {
    const openAIConfig = {
        apiKey: openAIKey,
        baseURL: normalizedBaseURL,
    };

    ai = new OpenAI(openAIConfig);
}

export default ai;
import dotenv from 'dotenv';
dotenv.config();
import OpenAI from "openai";

const openAIKey = process.env.OPENAI_API_KEY;
const openAIBaseURL = process.env.OPENAI_BASE_URL;

console.log('Key exists:', !!openAIKey);
console.log('Base URL:', openAIBaseURL);

if (!openAIKey) {
    console.error('No key found in env!');
    process.exit(1);
}

const openai = new OpenAI({
    apiKey: openAIKey,
    baseURL: openAIBaseURL
});

async function main() {
    try {
        console.log('Sending chat completion request...');
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: "Say hello" }]
        });
        console.log('Success:', response.choices[0].message.content);
    } catch (error) {
        console.error('Error during call:', error.message);
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', error.response.data);
        } else {
            console.error('Error object:', error);
        }
    }
}

main();

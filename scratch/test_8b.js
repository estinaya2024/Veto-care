import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function test() {
  try {
    console.log('Testing gemini-1.5-flash-8b...');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-8b' });
    const result = await model.generateContent('Hello');
    console.log('Success:', (await result.response).text());
  } catch (error) {
    console.error('Failed:', error.message);
  }
}

test();

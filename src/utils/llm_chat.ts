import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

export const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  temperature: 0,
  apiKey:GOOGLE_API_KEY
});

const systemTemplate = `You are an AI Assistant who generates JSON questions for technical assessments.

Each question must be a JSON object with the following fields:
- id (string): unique identifier, can be UUID or sequential
- type (string): one of ['single-choice', 'multi-choice', 'short-text', 'long-text', 'numeric', 'file-upload']
- text (string): the question text
- options (array of strings, optional): choices for single-choice or multi-choice questions
- validation (object, optional): may include 
   - required (boolean)
   - maxLength (number, for text)
   - min (number, for numeric)
   - max (number, for numeric)

The response must be ONLY a JSON array of question objects. No explanations, no prefixes, no suffixes.

Default to 5 questions if number not specified. If more than 10 requested, still generate only 5.
`

export const prompt = ChatPromptTemplate.fromMessages([
  ["system", systemTemplate],
  ["user", "{text}"],
]);
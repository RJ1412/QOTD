import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateEditorialFromGemini = async (problemStatement) => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
You're a competitive programming assistant.
Generate an editorial and clean C++ solution (with comments) for the following problem:

${problemStatement}

Format:
### Editorial
<Explain the problem in detail, break it down, explain edge cases>

### C++ Solution
<Code with comments>
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
};

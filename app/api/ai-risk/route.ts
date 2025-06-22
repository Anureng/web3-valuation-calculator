// app/api/ai-risk/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.NEXT_PUBLIC_GROQ_AI });

export async function POST(req: NextRequest) {
  const payload = await req.json();
  const prompt = `
You are a Web3 risk auditor. Analyze this project:
${JSON.stringify(payload, null, 2)}

Return JSON with:
{
  redFlags: [ "flag1", ... ],
  riskScore: 0-100,
  explanation: "..."
}
`;

  try {
    const chat = await groq.chat.completions.create({
      model: 'llama3-70b-8192',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
    });
    return NextResponse.json({ result: chat.choices[0].message.content });
  } catch {
    return NextResponse.json({ error: 'AI error' }, { status: 500 });
  }
}

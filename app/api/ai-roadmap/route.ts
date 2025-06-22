// app/api/ai-roadmap/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: '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'
});

type RoadmapMilestone = {
  date: string;
  name: string;
  description: string;
};

export async function POST(req: NextRequest) {
  const { roadmapMilestones } = await req.json();

  const prompt = `
You are a Web3 product strategy AI. Given the roadmap milestones:
${(roadmapMilestones as RoadmapMilestone[]).map((m: RoadmapMilestone) => `- ${m.date}: ${m.name} - ${m.description}`).join('\n')}

Return JSON:
{
  invalidTimeline: [milestoneName],
  missingDependencies: [ "token launch before audit", ... ],
  suggestions: [ "X", ... ]
}
`;

  console.log("Sending prompt to Groq:\n", prompt);

  try {
    const chat = await groq.chat.completions.create({
      model: 'llama3-70b-8192',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.6,
    });

    return NextResponse.json({ result: chat.choices[0].message.content });
  } catch (error) {
    console.error("Groq AI Error:", error);
    return NextResponse.json({ error: 'AI error', details: error }, { status: 500 });
  }
}

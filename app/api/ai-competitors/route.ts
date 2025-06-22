import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: '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',
})

export async function POST(req: NextRequest) {
  const { vertical, projectName, keyFeatures } = await req.json()

  const prompt = `
You are a Web3 market analyst. Given a project with:
- Name: ${projectName}
- Vertical: ${vertical}
- Key features: ${keyFeatures.join(', ')}

Return JSON with:
{
  competitors: [{ name, stage, valuation, keyDiff }],
  summaryParagraph: string
}
`

  try {
    const chat = await groq.chat.completions.create({
      model: 'llama3-70b-8192', // ✅ Updated model
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.6,
    })

    return NextResponse.json({ result: chat.choices[0].message.content })
  } catch (e) {
    console.error('Groq Error:', e)
    return NextResponse.json({ error: 'AI error', details: e }, { status: 500 })
  }
}

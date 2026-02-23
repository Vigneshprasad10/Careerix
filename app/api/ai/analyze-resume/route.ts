import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { groq, GROQ_MODEL } from '@/lib/groq'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { resumeText } = await request.json()
    if (!resumeText || resumeText.trim().length < 50) {
      return NextResponse.json({ error: 'Resume text is too short' }, { status: 400 })
    }

    const prompt = `You are an expert ATS (Applicant Tracking System) and resume review specialist. Analyze the following resume and provide a comprehensive assessment.

RESUME:
${resumeText.slice(0, 8000)}

Respond ONLY with a valid JSON object in this exact format (no markdown, no extra text):
{
  "ats_score": <number 0-100>,
  "summary": "<2-3 sentence overall assessment>",
  "strengths": [
    "<strength 1>",
    "<strength 2>",
    "<strength 3>",
    "<strength 4>"
  ],
  "weaknesses": [
    "<weakness 1>",
    "<weakness 2>",
    "<weakness 3>"
  ],
  "tips": [
    "<actionable tip 1>",
    "<actionable tip 2>",
    "<actionable tip 3>",
    "<actionable tip 4>",
    "<actionable tip 5>"
  ]
}`

    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    })

    const jsonText = completion.choices[0].message.content?.trim() || '{}'
    const result = JSON.parse(jsonText)

    return NextResponse.json({ result })
  } catch (error) {
    console.error('Analyze resume error:', error)
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { groq, GROQ_MODEL } from '@/lib/groq'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { resumeText, jobDescription } = await request.json()
    if (!resumeText || !jobDescription) {
      return NextResponse.json({ error: 'Resume text and job description are required' }, { status: 400 })
    }

    const prompt = `You are an expert recruiter and job match specialist. Compare the following resume to the job description and provide a detailed match analysis.

RESUME:
${resumeText.slice(0, 5000)}

JOB DESCRIPTION:
${jobDescription.slice(0, 3000)}

Respond ONLY with a valid JSON object in this exact format (no markdown, no extra text):
{
  "match_percent": <number 0-100>,
  "verdict": "<one sentence summary of the match quality>",
  "matched_skills": [
    "<matched skill or qualification 1>",
    "<matched skill or qualification 2>",
    "<matched skill or qualification 3>",
    "<matched skill or qualification 4>",
    "<matched skill or qualification 5>"
  ],
  "gaps": [
    "<missing skill or requirement 1>",
    "<missing skill or requirement 2>",
    "<missing skill or requirement 3>"
  ],
  "recommendations": [
    "<specific recommendation to improve match 1>",
    "<specific recommendation to improve match 2>",
    "<specific recommendation to improve match 3>"
  ]
}`

    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    })

    const result = JSON.parse(completion.choices[0].message.content?.trim() || '{}')
    return NextResponse.json({ result })
  } catch (error) {
    console.error('Job match error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

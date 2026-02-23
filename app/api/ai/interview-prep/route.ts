import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { groq, GROQ_MODEL } from '@/lib/groq'

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { jobDescription, resumeText } = await request.json()
        if (!jobDescription) {
            return NextResponse.json({ error: 'Job description is required' }, { status: 400 })
        }

        const prompt = `You are an expert interview coach. Generate 10 highly relevant interview questions with ideal answers for the following job position.

JOB DESCRIPTION:
${jobDescription.slice(0, 3000)}

${resumeText ? `CANDIDATE RESUME (use to personalize some questions):\n${resumeText.slice(0, 2000)}` : ''}

Generate a mix of: behavioral (STAR format), technical/role-specific, situational, and culture-fit questions.

Respond ONLY with a valid JSON array in this exact format (no markdown, no extra text):
[
  {
    "question": "<interview question>",
    "answer": "<ideal answer with specific, detailed guidance — 2-4 sentences>",
    "type": "<Behavioral|Technical|Situational|Culture Fit>"
  }
]

Return exactly 10 items.`

        const completion = await groq.chat.completions.create({
            model: GROQ_MODEL,
            max_tokens: 3000,
            messages: [{ role: 'user', content: prompt }],
        })

        const raw = completion.choices[0].message.content?.trim() || '[]'
        // Extract JSON array even if wrapped in markdown
        const jsonMatch = raw.match(/\[[\s\S]*\]/)
        const questions = JSON.parse(jsonMatch ? jsonMatch[0] : raw)
        return NextResponse.json({ questions })
    } catch (error) {
        console.error('Interview prep error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

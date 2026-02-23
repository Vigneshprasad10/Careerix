import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { groq, GROQ_MODEL } from '@/lib/groq'

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { resumeText, jobDescription, companyName, applicantName } = await request.json()
        if (!resumeText || !jobDescription) {
            return NextResponse.json({ error: 'Resume text and job description are required' }, { status: 400 })
        }

        const prompt = `You are a professional career coach and expert cover letter writer. Write a compelling, tailored cover letter based on the resume and job description below.

${applicantName ? `Applicant Name: ${applicantName}` : ''}
${companyName ? `Company Name: ${companyName}` : ''}

RESUME:
${resumeText.slice(0, 5000)}

JOB DESCRIPTION:
${jobDescription.slice(0, 3000)}

Write a professional cover letter that:
- Opens with a strong, personalized hook
- Highlights 2-3 specific achievements from the resume that directly match the job requirements
- Shows genuine enthusiasm for the role/company  
- Ends with a clear call to action
- Is 3-4 paragraphs, approximately 300-400 words
- Uses a professional but warm tone
- Avoids generic phrases like "I am writing to apply for..."

Return ONLY the cover letter text, no commentary, no subject line, no date. Start directly with the salutation.`

        const completion = await groq.chat.completions.create({
            model: GROQ_MODEL,
            max_tokens: 1000,
            messages: [{ role: 'user', content: prompt }],
        })

        const coverLetter = completion.choices[0].message.content?.trim() || ''
        return NextResponse.json({ coverLetter })
    } catch (error) {
        console.error('Cover letter error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

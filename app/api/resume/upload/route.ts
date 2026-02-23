import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'

// Extract text from PDF using pdfjs-dist (Mozilla PDF.js)
// Externalized in next.config.ts so it runs via native Node.js require
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfjs = require('pdfjs-dist/legacy/build/pdf.js')
    // Disable the worker in Node.js - it doesn't use a web worker here
    pdfjs.GlobalWorkerOptions.workerSrc = ''

    const uint8Array = new Uint8Array(buffer)
    const loadingTask = pdfjs.getDocument({ data: uint8Array, useWorkerFetch: false, isEvalSupported: false, useSystemFonts: true })
    const pdfDoc = await loadingTask.promise

    let fullText = ''
    for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i)
        const textContent = await page.getTextContent()
        const pageText = textContent.items
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((item: any) => item.str || '')
            .join(' ')
        fullText += pageText + '\n'
    }

    return fullText.trim()
}

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get('file') as File
        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        if (file.type !== 'application/pdf') {
            return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 })
        }

        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json({ error: 'File size must be under 10MB' }, { status: 400 })
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Extract text from PDF using pdfjs-dist
        let parsedText = ''
        try {
            parsedText = await extractTextFromPDF(buffer)
            console.log('PDF extracted via pdfjs-dist, length:', parsedText.length)
        } catch (e) {
            console.error('PDF extraction failed:', e)
            parsedText = '[Could not extract text from this PDF]'
        }

        // Upload to Supabase Storage
        const timestamp = Date.now()
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
        const storagePath = `${userId}/${timestamp}_${safeName}`

        const { error: storageError } = await supabaseAdmin.storage
            .from('resumes')
            .upload(storagePath, buffer, {
                contentType: 'application/pdf',
                upsert: false,
            })

        if (storageError) {
            console.error('Storage error:', storageError)
        }

        // Save record to database
        const { data: resume, error: dbError } = await supabaseAdmin
            .from('resumes')
            .insert({
                user_id: userId,
                file_name: file.name,
                storage_path: storagePath,
                parsed_text: parsedText,
            })
            .select()
            .single()

        if (dbError) {
            console.error('DB error:', dbError)
            return NextResponse.json({ error: 'Failed to save resume record' }, { status: 500 })
        }

        return NextResponse.json({ success: true, resume })
    } catch (error) {
        console.error('Upload error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function GET() {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: resumes, error } = await supabaseAdmin
            .from('resumes')
            .select('id, file_name, parsed_text, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ resumes })
    } catch (error) {
        console.error('Get resumes error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

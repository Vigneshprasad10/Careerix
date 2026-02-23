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

// Export configuration for App Router
export const maxDuration = 60; // 60 seconds (for Pro/Team plans, Hobby is 10s but this helps on some platforms)
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    console.log('[Upload API] Request received');
    try {
        const { userId } = await auth()
        if (!userId) {
            console.error('[Upload API] Unauthorized attempt');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        console.log('[Upload API] Auth successful for:', userId);

        let formData;
        try {
            formData = await request.formData()
            console.log('[Upload API] FormData parsed successfully');
        } catch (formDataError) {
            console.error('[Upload API] Error parsing FormData:', formDataError)
            return NextResponse.json({
                error: 'Could not parse upload data. Ensure you are using a stable connection.',
                details: formDataError instanceof Error ? formDataError.message : 'Unknown error'
            }, { status: 400 })
        }

        const file = formData.get('file') as File
        if (!file) {
            console.error('[Upload API] No file in FormData');
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }
        console.log('[Upload API] File received:', file.name, file.size, file.type);

        if (file.type !== 'application/pdf') {
            return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 })
        }

        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json({ error: 'File size must be under 10MB' }, { status: 400 })
        }

        console.log('[Upload API] Reading arrayBuffer...');
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        console.log('[Upload API] ArrayBuffer read, buffer length:', buffer.length);

        // Extract text from PDF using pdfjs-dist
        let parsedText = ''
        try {
            console.log('[Upload API] Starting PDF extraction...');
            parsedText = await extractTextFromPDF(buffer)
            console.log('[Upload API] PDF extracted via pdfjs-dist, length:', parsedText.length)
        } catch (e) {
            console.error('[Upload API] PDF extraction failed:', e)
            parsedText = '[Could not extract text from this PDF]'
        }

        // Upload to Supabase Storage
        const timestamp = Date.now()
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
        const storagePath = `${userId}/${timestamp}_${safeName}`

        console.log('[Upload API] Uploading to Supabase:', storagePath);
        const { error: storageError } = await supabaseAdmin.storage
            .from('resumes')
            .upload(storagePath, buffer, {
                contentType: 'application/pdf',
                upsert: false,
            })

        if (storageError) {
            console.error('[Upload API] Storage error:', storageError)
        } else {
            console.log('[Upload API] Supabase storage upload success');
        }

        // Save record to database
        console.log('[Upload API] Saving DB record...');
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
            console.error('[Upload API] DB error:', dbError)
            return NextResponse.json({ error: 'Failed to save resume record' }, { status: 500 })
        }

        console.log('[Upload API] Success!');
        return NextResponse.json({ success: true, resume })
    } catch (error) {
        console.error('[Upload API] Global catch error:', error)
        return NextResponse.json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 })
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

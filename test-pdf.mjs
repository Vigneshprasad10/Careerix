// Quick test to debug Claude PDF extraction
// Run: node test-pdf.mjs <path-to-pdf>
import fs from 'fs'
import Anthropic from '@anthropic-ai/sdk'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '.env.local') })

const pdfPath = process.argv[2]
if (!pdfPath) {
    console.error('Usage: node test-pdf.mjs <path-to.pdf>')
    process.exit(1)
}

const buffer = fs.readFileSync(pdfPath)
const base64 = buffer.toString('base64')
console.log('PDF size:', buffer.length, 'bytes, base64 length:', base64.length)

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

try {
    console.log('Sending to Claude...')
    const message = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 2000,
        messages: [{
            role: 'user',
            content: [
                {
                    type: 'document',
                    source: {
                        type: 'base64',
                        media_type: 'application/pdf',
                        data: base64,
                    },
                },
                { type: 'text', text: 'Extract all text from this resume PDF. Return only the raw text.' },
            ],
        }],
    })

    const text = message.content[0]
    if (text.type === 'text') {
        console.log('\n✅ SUCCESS! Extracted text length:', text.text.length)
        console.log('\nFirst 500 chars:\n', text.text.slice(0, 500))
    }
} catch (err) {
    console.error('\n❌ ERROR:', err.message)
    console.error('Full error:', JSON.stringify(err, null, 2))
}

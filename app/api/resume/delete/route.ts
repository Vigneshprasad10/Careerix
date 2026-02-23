import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function DELETE(request: NextRequest) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')
        if (!id) {
            return NextResponse.json({ error: 'Resume ID required' }, { status: 400 })
        }

        // Get storage path first
        const { data: resume } = await supabaseAdmin
            .from('resumes')
            .select('storage_path')
            .eq('id', id)
            .eq('user_id', userId)
            .single()

        if (resume?.storage_path) {
            await supabaseAdmin.storage.from('resumes').remove([resume.storage_path])
        }

        const { error } = await supabaseAdmin
            .from('resumes')
            .delete()
            .eq('id', id)
            .eq('user_id', userId)

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Delete resume error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

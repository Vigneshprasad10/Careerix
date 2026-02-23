import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
    try {
        const { userId } = await auth()
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { data: jobs, error } = await supabaseAdmin
            .from('jobs')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        return NextResponse.json({ jobs })
    } catch (error) {
        console.error('Get jobs error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth()
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const body = await request.json()
        const { company, title, status = 'Saved', job_description, url, notes, salary, location } = body

        if (!company || !title) {
            return NextResponse.json({ error: 'Company and title are required' }, { status: 400 })
        }

        const { data: job, error } = await supabaseAdmin
            .from('jobs')
            .insert({ user_id: userId, company, title, status, job_description, url, notes, salary, location })
            .select()
            .single()

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        return NextResponse.json({ job })
    } catch (error) {
        console.error('Create job error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

type LoginState = {
    error?: string
}

    export async function login(
    prevState: LoginState,
    formData: FormData
    ): Promise<LoginState> {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const cookieStore = await cookies()

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
        cookies: {
            get(name) {
            return cookieStore.get(name)?.value
            },
            set(name, value, options) {
            cookieStore.set({ name, value, ...options })
            },
            remove(name, options) {
            cookieStore.set({ name, value: '', ...options })
            },
        },
        }
    )

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
        return { error: error.message }
    }

    // Check user role before redirecting
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role === 'admin') {
            redirect('/admin/dashboard')
        } else {
            // Non-admin users should not access admin routes
            redirect('/')
        }
    } else {
        return { error: 'Failed to get user information' }
    }
}

'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import {
    checkLoginRateLimit,
    recordFailedLoginAttempt,
    resetLoginAttempts,
} from '@/utils/security/loginRateLimiter'

type LoginState = {
    error?: string
}

export async function login(
    prevState: LoginState,
    formData: FormData
): Promise<LoginState> {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const headersList = await headers()
    const ip =
        headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ??
        headersList.get('x-real-ip') ??
        'unknown'
    const identifier = `${ip}:${email}`

    const rateLimitStatus = checkLoginRateLimit(identifier)
    if (!rateLimitStatus.allowed) {
        return {
            error: `Too many login attempts. Try again in ${rateLimitStatus.retryAfterSeconds} seconds.`,
        }
    }

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
        recordFailedLoginAttempt(identifier)
        return { error: error.message }
    }

    resetLoginAttempts(identifier)

    // Check user role before redirecting
    const {
        data: { user },
    } = await supabase.auth.getUser()

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

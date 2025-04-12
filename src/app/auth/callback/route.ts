import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(`${requestUrl.origin}/auth-error`)
  }

  try {
    // Create a new Supabase client with the cookie store
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Exchange the code for a session
    const { error: authError } = await supabase.auth.exchangeCodeForSession(code)
    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.redirect(`${requestUrl.origin}/auth-error`)
    }

    // Get the user after successful authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error('User error:', userError)
      return NextResponse.redirect(`${requestUrl.origin}/auth-error`)
    }

    // Check if user exists in the users table
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single()

    if (fetchError && fetchError.code === 'PGRST116') {
      // User doesn't exist, create a new record
      const { error: insertError } = await supabase
        .from('users')
        .insert([
          {
            id: user.id,
            email: user.email,
            created_at: new Date().toISOString(),
          }
        ])

      if (insertError) {
        console.error('Error creating user record:', insertError)
        return NextResponse.redirect(`${requestUrl.origin}/auth-error`)
      }
    }

    // Successful authentication
    return NextResponse.redirect(requestUrl.origin)
  } catch (error) {
    console.error('Auth callback error:', error)
    return NextResponse.redirect(`${requestUrl.origin}/auth-error`)
  }
} 
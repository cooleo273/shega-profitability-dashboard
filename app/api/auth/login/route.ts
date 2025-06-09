import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Sign in with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Get user data from our database
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      )
    }

    // Check if this is first login by checking user metadata
    const isFirstLogin = !authData.user.user_metadata.hasChangedPassword

    // Return user data and session
    return NextResponse.json({
      session: authData.session,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isFirstLogin,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    )
  }
} 
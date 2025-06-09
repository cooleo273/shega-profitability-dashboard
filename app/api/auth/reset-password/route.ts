import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const { password, session } = await req.json()

    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      )
    }

    if (!session?.access_token) {
      return NextResponse.json(
        { error: "Invalid session" },
        { status: 401 }
      )
    }

    // Set the auth token for this request
    supabase.auth.setSession(session)

    // Update password in Supabase
    const { data: userData, error: updateError } = await supabase.auth.updateUser({
      password: password,
      data: {
        hasChangedPassword: true
      }
    })

    if (updateError) {
      console.error("Password update error:", updateError)
      return NextResponse.json(
        { error: "Failed to update password" },
        { status: 400 }
      )
    }

    // Get the user from the session
    const { data: { user: authUser }, error: userError } = await supabase.auth.getUser()
    if (userError || !authUser) {
      return NextResponse.json(
        { error: "Invalid session" },
        { status: 401 }
      )
    }

    // Get user data from our database
    const user = await prisma.user.findUnique({
      where: { email: authUser.email! },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      )
    }

    // Get the updated session
    const { data: { session: updatedSession } } = await supabase.auth.getSession()

    // Return updated session and user data
    return NextResponse.json({
      message: "Password reset successful",
      session: updatedSession,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Password reset error:", error)
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    )
  }
} 
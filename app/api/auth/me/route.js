import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { requireOwner } from '@/lib/auth'

export async function GET(request) {
  try {
    await connectDB()
    const auth = await requireOwner(request)
    if (auth.response) return auth.response
    const { user } = auth
    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { requireOwner } from '@/lib/auth'
import { getDashboardStats } from '@/lib/member-service'

export async function GET(request) {
  try {
    await connectDB()
    const auth = await requireOwner(request)
    if (auth.response) return auth.response

    const stats = await getDashboardStats()
    return NextResponse.json(stats)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

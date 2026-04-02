import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Member } from '@/lib/models/Member'
import { requireOwner } from '@/lib/auth'
import { listMembers } from '@/lib/member-service'
import { validateMemberCreate } from '@/lib/member-validation'

export async function GET(request) {
  try {
    await connectDB()
    const auth = await requireOwner(request)
    if (auth.response) return auth.response

    const { searchParams } = new URL(request.url)
    const result = await listMembers(searchParams)
    return NextResponse.json(result)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    await connectDB()
    const auth = await requireOwner(request)
    if (auth.response) return auth.response

    const body = await request.json().catch(() => ({}))
    const { errors, body: sanitized } = validateMemberCreate(body)
    if (errors.length) {
      return NextResponse.json({ message: 'Validation failed', errors }, { status: 400 })
    }

    const member = await Member.create(sanitized)
    return NextResponse.json(member, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

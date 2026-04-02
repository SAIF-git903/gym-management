import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Member } from '@/lib/models/Member'
import { requireOwner } from '@/lib/auth'
import { validateMemberUpdate, isValidMongoId } from '@/lib/member-validation'

export async function GET(request, { params }) {
  try {
    await connectDB()
    const auth = await requireOwner(request)
    if (auth.response) return auth.response

    const { id } = await params
    if (!isValidMongoId(id)) {
      return NextResponse.json({ message: 'Invalid member id' }, { status: 400 })
    }

    const member = await Member.findById(id).lean()
    if (!member) {
      return NextResponse.json({ message: 'Member not found' }, { status: 404 })
    }
    return NextResponse.json(member)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB()
    const auth = await requireOwner(request)
    if (auth.response) return auth.response

    const { id } = await params
    if (!isValidMongoId(id)) {
      return NextResponse.json({ message: 'Invalid member id' }, { status: 400 })
    }

    const body = await request.json().catch(() => ({}))
    const { errors, patch } = validateMemberUpdate(body)
    if (errors.length) {
      return NextResponse.json({ message: 'Validation failed', errors }, { status: 400 })
    }

    const member = await Member.findByIdAndUpdate(id, patch, {
      new: true,
      runValidators: true,
    })
    if (!member) {
      return NextResponse.json({ message: 'Member not found' }, { status: 404 })
    }
    return NextResponse.json(member)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB()
    const auth = await requireOwner(request)
    if (auth.response) return auth.response

    const { id } = await params
    if (!isValidMongoId(id)) {
      return NextResponse.json({ message: 'Invalid member id' }, { status: 400 })
    }

    const member = await Member.findByIdAndDelete(id)
    if (!member) {
      return NextResponse.json({ message: 'Member not found' }, { status: 404 })
    }
    return NextResponse.json({ message: 'Member removed' })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

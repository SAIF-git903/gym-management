import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/lib/models/User'
import { generateToken } from '@/lib/auth'

export async function POST(request) {
  try {
    await connectDB()
    const body = await request.json().catch(() => ({}))
    const email = String(body.email || '')
      .trim()
      .toLowerCase()
    const password = body.password

    const errors = []
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push({ msg: 'Valid email required', path: 'email' })
    }
    if (!password) errors.push({ msg: 'Password is required', path: 'password' })
    if (errors.length) {
      return NextResponse.json({ message: 'Validation failed', errors }, { status: 400 })
    }

    const user = await User.findOne({ email }).select('+password')
    if (!user || !(await user.comparePassword(password))) {
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 })
    }

    const token = generateToken(user._id)
    return NextResponse.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
